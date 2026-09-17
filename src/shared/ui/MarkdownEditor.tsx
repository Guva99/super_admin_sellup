import type { ClipboardEvent, KeyboardEvent } from "react";
import { imageMarkdown } from "../lib/markdown";

/** Чем файл станет в тексте; null — файл принят, но вставлять его нечем. */
export interface PastedFile {
  src: string;
  alt: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  /**
   * Принять файл, вставленный из буфера (⌘V со скриншотом или файлом), и
   * сказать, какой ссылкой он будет в тексте. Ссылку нужно вернуть **сразу**,
   * а саму загрузку вести в фоне: иначе за время ответа сервера набранный
   * текст успевает измениться и вставка встаёт не туда.
   * Без обработчика вставка файлов не поддерживается.
   */
  uploadPaste?: (file: File) => PastedFile | null;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
  /** ⌘↵ / Ctrl+↵ */
  onSubmit?: () => void;
  /** Esc; событие не всплывает — модалка вокруг не закроется. */
  onCancel?: () => void;
  onBlur?: () => void;
  className?: string;
}

/**
 * Поле лёгкой разметки. Отличается от обычной textarea одним: вставленный из
 * буфера файл не теряется — он уходит на сервер, а на его месте в тексте
 * сразу появляется картинка.
 */
export function MarkdownEditor({
  value,
  onChange,
  uploadPaste,
  placeholder,
  rows = 4,
  autoFocus = false,
  onSubmit,
  onCancel,
  onBlur,
  className = "",
}: MarkdownEditorProps) {
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files);
    if (!uploadPaste || files.length === 0) return;
    e.preventDefault();

    const inserted = files.map(uploadPaste).filter((file): file is PastedFile => file !== null);
    if (inserted.length === 0) return;

    // Картинки встают на место курсора, каждая на своей строке.
    const block = `${inserted.map((file) => imageMarkdown(file.alt, file.src)).join("\n")}\n`;
    const before = value.slice(0, e.currentTarget.selectionStart);
    const separator = before === "" || before.endsWith("\n") ? "" : "\n";
    onChange(before + separator + block + value.slice(e.currentTarget.selectionEnd));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === "Escape" && onCancel) {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <textarea
      autoFocus={autoFocus}
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      className={`w-full bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-50 resize-y placeholder:text-slate-300 transition-colors ${className}`}
    />
  );
}

/** Подсказка под полем — одна на все места, где правится разметка. */
export function MarkdownHint({ canPaste = true }: { canPaste?: boolean }) {
  return (
    <p className="text-[11px] text-slate-400">
      Списки: «- пункт», чек-листы: «- [ ] пункт»{canPaste && ", картинку можно вставить из буфера (⌘V)"}. ⌘↵ — сохранить, Esc — отмена.
    </p>
  );
}
