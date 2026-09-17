import { useRef } from "react";
import { Bold, CheckSquare, Code, Heading2, Image as ImageIcon, Italic, Link2, List, ListOrdered, Quote, Strikethrough, Table as TableIcon } from "lucide-react";
import { EditorContent, useEditorState, type Editor } from "@tiptap/react";
import { ATTACHMENT_ACCEPT } from "@/shared/lib";
import "./editor.css";

interface RichTextEditorProps {
  editor: Editor | null;
  /** Из `useRichTextEditor` — кнопка «Картинка» вставляет выбранные файлы. */
  insertFiles?: (files: File[]) => void;
  className?: string;
}

/** Поле редактора; панель показывается только когда можно править. */
export function RichTextEditor({ editor, insertFiles, className = "" }: RichTextEditorProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            editable: editor.isEditable,
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            strike: editor.isActive("strike"),
            heading: editor.isActive("heading", { level: 2 }),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            task: editor.isActive("taskList"),
            quote: editor.isActive("blockquote"),
            code: editor.isActive("codeBlock"),
            link: editor.isActive("link"),
          }
        : null,
  });

  if (!editor) return null;
  const chain = () => editor.chain().focus();

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Ссылка", previous ?? "https://");
    if (href === null) return;
    if (href.trim() === "") chain().unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  return (
    <div className={`rte ${className}`}>
      {state?.editable && (
        <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-slate-100 bg-slate-50/60 rounded-t-lg">
          <ToolButton title="Жирный (⌘B)" active={state.bold} onClick={() => chain().toggleBold().run()}><Bold size={13} /></ToolButton>
          <ToolButton title="Курсив (⌘I)" active={state.italic} onClick={() => chain().toggleItalic().run()}><Italic size={13} /></ToolButton>
          <ToolButton title="Зачёркнутый" active={state.strike} onClick={() => chain().toggleStrike().run()}><Strikethrough size={13} /></ToolButton>
          <Divider />
          <ToolButton title="Заголовок" active={state.heading} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 size={13} /></ToolButton>
          <ToolButton title="Список" active={state.bullet} onClick={() => chain().toggleBulletList().run()}><List size={13} /></ToolButton>
          <ToolButton title="Нумерованный список" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}><ListOrdered size={13} /></ToolButton>
          <ToolButton title="Чек-лист" active={state.task} onClick={() => chain().toggleTaskList().run()}><CheckSquare size={13} /></ToolButton>
          <Divider />
          <ToolButton title="Цитата" active={state.quote} onClick={() => chain().toggleBlockquote().run()}><Quote size={13} /></ToolButton>
          <ToolButton title="Код" active={state.code} onClick={() => chain().toggleCodeBlock().run()}><Code size={13} /></ToolButton>
          <ToolButton title="Ссылка" active={state.link} onClick={setLink}><Link2 size={13} /></ToolButton>
          <ToolButton title="Таблица 3×3" onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={13} /></ToolButton>
          {insertFiles && (
            <>
              <Divider />
              <ToolButton title="Картинка или файл" onClick={() => fileInput.current?.click()}><ImageIcon size={13} /></ToolButton>
              <input
                ref={fileInput}
                type="file"
                multiple
                accept={ATTACHMENT_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  insertFiles(Array.from(e.target.files ?? []));
                  e.target.value = "";
                }}
              />
            </>
          )}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolButton({ title, active = false, onClick, children }: { title: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${active ? "bg-brand-100 text-brand-600" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="w-px h-4 bg-slate-200 mx-1" />;
