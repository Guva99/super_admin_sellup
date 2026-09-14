import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Task } from "@/entities/task";
import { InlineEditable, Markdown } from "@/shared/ui";
import { checklistProgress } from "@/shared/lib";
import { useEditTaskDescription } from "../model/useEditTaskDescription";

/**
 * Описание: в режиме чтения — разметка с кликабельными чек-листами, по
 * клику на текст или «Изменить» — поле ввода. Подсказка про `- [ ]` под полем.
 */
export function DescriptionEditor({ task }: { task: Task }) {
  const { save, toggleChecklist } = useEditTaskDescription();
  const [editing, setEditing] = useState(false);
  const text = task.description ?? "";
  const progress = checklistProgress(text);

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Описание</h2>
        {progress.total > 0 && (
          <span className="text-[11px] text-slate-400">
            {progress.done}/{progress.total} пунктов
          </span>
        )}
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-500">
            <Pencil size={11} />
            Изменить
          </button>
        )}
      </div>
      <InlineEditable
        value={text}
        onSave={(next) => save(task, next)}
        multiline
        editing={editing}
        onEditingChange={setEditing}
        placeholder={"Опишите задачу…\n\nЧек-лист: строки вида «- [ ] пункт»"}
        inputClassName="text-sm text-slate-700 px-3 py-2 leading-relaxed"
      >
        {text ? (
          <Markdown text={text} onToggleChecklist={(line) => toggleChecklist(task, line)} />
        ) : (
          <p className="text-sm text-slate-400">Добавить описание…</p>
        )}
      </InlineEditable>
      {editing && <p className="mt-1 text-[11px] text-slate-400">Списки: «- пункт», чек-листы: «- [ ] пункт». ⌘↵ — сохранить, Esc — отмена.</p>}
    </section>
  );
}
