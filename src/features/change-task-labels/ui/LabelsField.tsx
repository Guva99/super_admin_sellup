import { useState } from "react";
import { X } from "lucide-react";
import type { Task } from "@/entities/task";
import { useChangeTaskLabels } from "../model/useChangeTaskLabels";

/** Чипы меток и поле ввода: Enter добавляет, Backspace в пустом поле убирает последнюю. */
export function LabelsField({ task }: { task: Task }) {
  const { add, remove } = useChangeTaskLabels();
  const [draft, setDraft] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-1 -mx-1.5 px-1.5">
      {task.labels.map((label) => (
        <span key={label} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[11px] text-slate-700 font-medium">
          {label}
          <button type="button" onClick={() => remove(task, label)} aria-label={`Убрать метку ${label}`} className="text-slate-400 hover:text-red-500">
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
            add(task, draft);
            setDraft("");
          }
          if (e.key === "Backspace" && draft === "" && task.labels.length > 0) remove(task, task.labels[task.labels.length - 1]);
        }}
        onBlur={() => {
          if (draft.trim()) {
            add(task, draft);
            setDraft("");
          }
        }}
        placeholder={task.labels.length === 0 ? "Добавить метки" : "+"}
        maxLength={50}
        className="min-w-[90px] flex-1 px-1 py-0.5 text-xs bg-transparent outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-100 rounded"
      />
    </div>
  );
}
