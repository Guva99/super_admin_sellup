import { useState } from "react";
import { X } from "lucide-react";

interface LabelsFieldProps {
  value: string[];
  onChange: (labels: string[]) => void;
}

/**
 * Чипы меток и поле ввода: Enter добавляет, Backspace в пустом поле убирает
 * последнюю. Управляемое: в карточке сохраняет на сервер, в форме новой
 * задачи меняет черновик.
 */
export function LabelsField({ value, onChange }: LabelsFieldProps) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const clean = draft.trim();
    setDraft("");
    if (!clean || value.includes(clean)) return;
    onChange([...value, clean]);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 -mx-1.5 px-1.5">
      {value.map((label) => (
        <span key={label} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[11px] text-slate-700 font-medium">
          {label}
          <button
            type="button"
            onClick={() => onChange(value.filter((l) => l !== label))}
            aria-label={`Убрать метку ${label}`}
            className="text-slate-400 hover:text-red-500"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            e.preventDefault();
            add();
          }
          if (e.key === "Backspace" && draft === "" && value.length > 0) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length === 0 ? "Добавить метки" : "+"}
        maxLength={50}
        className="min-w-[90px] flex-1 px-1 py-0.5 text-xs bg-transparent outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-100 rounded"
      />
    </div>
  );
}
