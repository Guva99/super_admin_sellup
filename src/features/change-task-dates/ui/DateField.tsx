import { useRef } from "react";
import { X } from "lucide-react";

interface DateFieldProps {
  value: string | null;
  onChange: (date: string) => void;
  /** Подпись-приглашение, когда даты нет: «Добавить срок». */
  placeholder: string;
  /** Подсветить красным (просрочено). */
  alert?: boolean;
}

/**
 * Дата в сайдбаре. Без значения видна только ссылка «Добавить…» — нативное
 * поле спрятано, но остаётся в разметке, чтобы по клику открыть его календарь.
 * С датой — обычное поле и крестик «убрать».
 */
export function DateField({ value, onChange, placeholder, alert = false }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    // showPicker есть не во всех браузерах; фокус хотя бы покажет поле.
    if (typeof input.showPicker === "function") input.showPicker();
    else input.focus();
  };

  return (
    <div className="relative flex items-center gap-1 -mx-1.5">
      <input
        ref={inputRef}
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
        className={
          value
            ? `px-1.5 py-1 rounded-md text-xs font-medium bg-transparent hover:bg-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-brand-100 cursor-pointer ${alert ? "text-red-600" : "text-slate-800"}`
            : "absolute left-0 top-0 w-px h-px opacity-0 pointer-events-none"
        }
      />
      {!value && (
        <button type="button" onClick={openPicker} className="px-1.5 py-1 rounded-md text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          {placeholder}
        </button>
      )}
      {value && (
        <button type="button" onClick={() => onChange("")} title="Убрать дату" className="p-0.5 text-slate-300 hover:text-slate-500">
          <X size={11} />
        </button>
      )}
    </div>
  );
}
