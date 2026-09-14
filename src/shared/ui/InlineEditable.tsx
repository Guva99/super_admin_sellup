import { useEffect, useRef, useState, type ReactNode } from "react";

interface InlineEditableProps {
  value: string;
  onSave: (value: string) => void;
  /** Как показать значение вне режима правки. */
  children: ReactNode;
  multiline?: boolean;
  placeholder?: string;
  /** Пустое значение сохранять нельзя (например, название). */
  required?: boolean;
  /** Классы поля ввода — чтобы оно совпало по размеру со статичным текстом. */
  inputClassName?: string;
  /** Внешнее управление: открыть редактор кнопкой снаружи. */
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

/**
 * Клик по тексту → поле ввода на том же месте. Enter (для многострочного —
 * ⌘/Ctrl+Enter) и уход фокуса сохраняют, Escape отменяет. Сохраняется только
 * изменившееся значение — иначе лишний запрос и лишняя строка в истории.
 */
export function InlineEditable({
  value,
  onSave,
  children,
  multiline = false,
  placeholder,
  required = false,
  inputClassName = "",
  editing: controlledEditing,
  onEditingChange,
}: InlineEditableProps) {
  const [ownEditing, setOwnEditing] = useState(false);
  const editing = controlledEditing ?? ownEditing;
  const setEditing = (next: boolean) => {
    setOwnEditing(next);
    onEditingChange?.(next);
  };
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing, value]);

  const commit = () => {
    const next = draft.trim();
    if (required && next === "") {
      setEditing(false);
      return;
    }
    if (next !== value) onSave(next);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div onClick={() => setEditing(true)} className="cursor-text rounded-md -mx-1.5 px-1.5 py-0.5 hover:bg-slate-100 transition-colors">
        {children}
      </div>
    );
  }

  const common = {
    ref: inputRef,
    value: draft,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        // Отмена правки не должна закрывать модалку вокруг.
        e.stopPropagation();
        setDraft(value);
        setEditing(false);
      }
      if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commit();
      }
    },
    className: `w-full bg-white border border-brand-300 rounded-md outline-none focus:ring-2 focus:ring-brand-50 ${inputClassName}`,
  };

  return multiline ? <textarea {...common} rows={Math.max(4, draft.split("\n").length + 1)} /> : <input type="text" {...common} />;
}
