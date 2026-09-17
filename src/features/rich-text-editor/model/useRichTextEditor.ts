import { useCallback, useEffect, useRef } from "react";
import { useEditor, type Editor } from "@tiptap/react";
import type { EditorView } from "@tiptap/pm/view";
import { attachmentRef, isImageType, pastedFile } from "@/shared/lib";
import { buildExtensions } from "./extensions";
import type { ImageResolver, ImageUploader } from "./types";

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

export interface RichTextEditorOptions {
  /** Markdown. */
  value: string;
  onChange?: (markdown: string) => void;
  editable: boolean;
  placeholder?: string;
  /** null — вставка и перетаскивание файлов выключены (режим чтения). */
  uploader: ImageUploader | null;
  resolver: ImageResolver;
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
export function useRichTextEditor({ value, onChange, editable, placeholder = "", uploader, resolver }: RichTextEditorOptions): RichTextEditorController {
  // Колбэки и загрузчик меняются на каждом рендере родителя, а редактор
  // создаётся один раз — читаем их через ref.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const uploaderRef = useRef(uploader);
  uploaderRef.current = uploader;
  const editorRef = useRef<Editor | null>(null);

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
        if (result.ok && result.data) setUploadAttrs(uploadId, { src: attachmentRef(result.data.id), status: null });
        else setUploadAttrs(uploadId, { status: "error" });
      });
    },
    [setUploadAttrs],
  );

  const insertFilesAt = useCallback(
    (files: File[], view: EditorView, pos: number | null): boolean => {
      const current = uploaderRef.current;
      if (!current || files.length === 0) return false;
      let tr = view.state.tr;
      let insertAt = pos ?? view.state.selection.to;
      for (const raw of files) {
        const file = pastedFile(raw);
        const started = current.start(file);
        // Не-картинка уходит во вложения, в тексте ей места нет.
        if (!isImageType(file.type)) continue;
        const node = view.state.schema.nodes.image.create({
          src: "",
          alt: raw.name,
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
    [track],
  );

  const editor = useEditor(
    {
      extensions: buildExtensions({
        placeholder,
        image: {
          resolver,
          uploader,
          onRetry: (uploadId) => {
            const current = uploaderRef.current;
            if (!current) return;
            setUploadAttrs(uploadId, { status: "uploading" });
            track(uploadId, current.retry(uploadId));
          },
        },
      }),
      content: value,
      editable,
      editorProps: {
        attributes: { class: "rte-content" },
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
        const markdown = markdownOf(editor);
        if (markdown !== null) onChangeRef.current?.(markdown);
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
    const current = markdownOf(editor);
    if (current !== null && current !== value) editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const insertFiles = useCallback(
    (files: File[]) => {
      if (editor) insertFilesAt(files, editor.view, null);
    },
    [editor, insertFilesAt],
  );

  return { editor, insertFiles };
}
