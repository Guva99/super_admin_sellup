import { useCallback, useEffect, useRef } from "react";
import { useEditor, type Editor, type JSONContent } from "@tiptap/react";
import { Fragment, Slice, type Node as PMNode } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { attachmentKey, attachmentRef, isImageType, pastedFile } from "@/shared/lib";
import { buildExtensions } from "./extensions";
import type { EditorVariant, ImageRefs, ImageResolver, ImageUploader } from "./types";

const TASK_IMAGE_REFS: ImageRefs = { ref: attachmentRef, key: attachmentKey };

/**
 * tiptap-markdown не объявляет своё хранилище в типах редактора. У уже
 * уничтоженного экземпляра (StrictMode монтирует дважды) хранилища нет —
 * тогда null, и вызывающий ничего не делает.
 */
const markdownOf = (editor: Editor): string | null => {
  if (editor.isDestroyed) return null;
  const storage = (editor.storage as unknown as { markdown?: { getMarkdown(): string } }).markdown;
  return storage ? storage.getMarkdown() : null;
};

/** Картинки, которые ещё грузятся, ссылки не имеют — в сохраняемый документ они не идут. */
const withoutPendingImages = (node: JSONContent, refs: ImageRefs): JSONContent =>
  node.content
    ? {
        ...node,
        content: node.content
          .filter((child) => child.type !== "image" || refs.key(String(child.attrs?.src ?? "")) !== null)
          .map((child) => withoutPendingImages(child, refs)),
      }
    : node;

/** Вставленный кусок без чужих картинок; сколько выброшено — в counter. */
function withoutForeignImages(fragment: Fragment, refs: ImageRefs, counter: { dropped: number }): Fragment {
  const nodes: PMNode[] = [];
  fragment.forEach((child) => {
    if (child.type.name === "image" && refs.key(String(child.attrs.src ?? "")) === null) {
      counter.dropped += 1;
      return;
    }
    nodes.push(child.isLeaf ? child : child.copy(withoutForeignImages(child.content, refs, counter)));
  });
  return Fragment.fromArray(nodes);
}

/** Документ статьи строкой JSON — так его удобно сравнивать и хранить в черновике. */
const documentOf = (editor: Editor, refs: ImageRefs): string | null =>
  editor.isDestroyed ? null : JSON.stringify(withoutPendingImages(editor.getJSON(), refs));

/** Пустая строка — пустой документ; битый JSON тоже: редактор не должен падать. */
const parseDocument = (value: string): JSONContent | string => {
  if (!value) return "";
  try {
    return JSON.parse(value) as JSONContent;
  } catch {
    return "";
  }
};

export interface RichTextEditorOptions {
  /** Markdown у задачи; у статьи — документ строкой JSON. */
  value: string;
  onChange?: (value: string) => void;
  editable: boolean;
  placeholder?: string;
  /** null — вставка и перетаскивание файлов выключены (режим чтения). */
  uploader: ImageUploader | null;
  resolver: ImageResolver;
  /** По умолчанию — задача: markdown, чек-листы, картинки attach:<id>. */
  variant?: EditorVariant;
  /** Как картинка записана в тексте; по умолчанию — вложения задачи. */
  imageRefs?: ImageRefs;
  /**
   * Статья: во вставленном тексте были картинки по чужим ссылкам (Google Docs, сайты) —
   * они выброшены, сайт показывает только загруженные. Сколько — для подсказки.
   */
  onForeignImages?: (count: number) => void;
}

export interface RichTextEditorController {
  editor: Editor | null;
  /** Вставить файлы в текущую позицию: картинки — в текст, остальное — только во вложения. */
  insertFiles: (files: File[]) => void;
}

/**
 * Tiptap с сериализацией в markdown. Файл из буфера или перетащенный встаёт
 * в текст картинкой сразу — с локальным превью и статусом «загрузка»; по
 * ответу сервера превью подменяется ссылкой `attach:<id>`. Упавшая загрузка
 * помечается ошибкой с «Повторить», набранный текст при этом не теряется.
 */
export function useRichTextEditor({
  value,
  onChange,
  editable,
  placeholder = "",
  uploader,
  resolver,
  variant = "task",
  imageRefs = TASK_IMAGE_REFS,
  onForeignImages,
}: RichTextEditorOptions): RichTextEditorController {
  // Колбэки и загрузчик меняются на каждом рендере родителя, а редактор
  // создаётся один раз — читаем их через ref.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const uploaderRef = useRef(uploader);
  uploaderRef.current = uploader;
  const onForeignImagesRef = useRef(onForeignImages);
  onForeignImagesRef.current = onForeignImages;
  const editorRef = useRef<Editor | null>(null);
  // Вариант и ссылки на картинки задаются при создании и не меняются.
  const refs = useRef(imageRefs).current;
  const article = variant === "article";
  const valueOf = useCallback((editor: Editor) => (article ? documentOf(editor, refs) : markdownOf(editor)), [article, refs]);

  const setUploadAttrs = useCallback((uploadId: string, attrs: Record<string, unknown>) => {
    const editor = editorRef.current;
    if (!editor) return;
    let done = false;
    editor.state.doc.descendants((node, pos) => {
      if (done || node.type.name !== "image" || node.attrs.uploadId !== uploadId) return true;
      editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs }));
      done = true;
      return false;
    });
  }, []);

  const track = useCallback(
    (uploadId: string, done: Promise<{ ok: boolean; data?: { id: string } }>) => {
      done.then((result) => {
        if (result.ok && result.data) setUploadAttrs(uploadId, { src: refs.ref(result.data.id), status: null });
        else setUploadAttrs(uploadId, { status: "error" });
      });
    },
    [setUploadAttrs, refs],
  );

  const insertFilesAt = useCallback(
    (files: File[], view: EditorView, pos: number | null): boolean => {
      const current = uploaderRef.current;
      if (!current || files.length === 0) return false;
      let tr = view.state.tr;
      let insertAt = pos ?? view.state.selection.to;
      for (const raw of files) {
        const file = pastedFile(raw);
        const image = isImageType(file.type);
        // У статьи вложений нет — в неё идут только картинки.
        if (!image && article) continue;
        const started = current.start(file);
        // Не-картинка уходит во вложения, в тексте ей места нет.
        if (!image) continue;
        const node = view.state.schema.nodes.image.create({
          src: "",
          // У статьи подпись видна на сайте: «Снимок экрана….png» под картинкой ни к чему.
          alt: article ? "" : raw.name,
          previewUrl: started.previewUrl,
          uploadId: started.id,
          status: "uploading",
        });
        tr = tr.insert(insertAt, node);
        insertAt += node.nodeSize;
        track(started.id, started.done);
      }
      view.dispatch(tr);
      return true;
    },
    [track, article],
  );

  const editor = useEditor(
    {
      extensions: buildExtensions({
        placeholder,
        variant,
        image: {
          resolver,
          uploader,
          refs,
          onRetry: (uploadId) => {
            const current = uploaderRef.current;
            if (!current) return;
            setUploadAttrs(uploadId, { status: "uploading" });
            track(uploadId, current.retry(uploadId));
          },
        },
      }),
      content: article ? parseDocument(value) : value,
      editable,
      editorProps: {
        attributes: { class: "rte-content" },
        transformPasted: (slice) => {
          if (!article) return slice;
          const counter = { dropped: 0 };
          const content = withoutForeignImages(slice.content, refs, counter);
          if (counter.dropped === 0) return slice;
          onForeignImagesRef.current?.(counter.dropped);
          return new Slice(content, slice.openStart, slice.openEnd);
        },
        handlePaste: (view, event) => {
          const files = Array.from(event.clipboardData?.files ?? []);
          if (files.length === 0) return false;
          event.preventDefault();
          return insertFilesAt(files, view, null);
        },
        handleDrop: (view, event) => {
          const files = Array.from(event.dataTransfer?.files ?? []);
          if (files.length === 0) return false;
          event.preventDefault();
          const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
          return insertFilesAt(files, view, at?.pos ?? null);
        },
      },
      onUpdate: ({ editor }) => {
        const next = valueOf(editor);
        if (next !== null) onChangeRef.current?.(next);
      },
    },
    [],
  );
  editorRef.current = editor;

  useEffect(() => {
    // Второй аргумент: setEditable по умолчанию шлёт update, а это не правка текста.
    if (editor && !editor.isDestroyed) editor.setEditable(editable, false);
  }, [editor, editable]);

  // Значение сменили снаружи (другая задача, откат) — переписываем документ,
  // но не под руками у печатающего.
  useEffect(() => {
    if (!editor || editor.isDestroyed || editor.isFocused) return;
    const current = valueOf(editor);
    if (current !== null && current !== value) editor.commands.setContent(article ? parseDocument(value) : value, { emitUpdate: false });
  }, [editor, value, valueOf, article]);

  const insertFiles = useCallback(
    (files: File[]) => {
      if (editor) insertFilesAt(files, editor.view, null);
    },
    [editor, insertFilesAt],
  );

  return { editor, insertFiles };
}
