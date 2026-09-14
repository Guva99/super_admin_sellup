import type { Task } from "@/entities/task";
import { InlineEditable } from "@/shared/ui";
import { useEditTaskTitle } from "../model/useEditTaskTitle";

/** Заголовок карточки: клик — правка на месте, Enter/уход фокуса — сохранение. */
export function TaskTitle({ task }: { task: Task }) {
  const { save } = useEditTaskTitle();
  return (
    <InlineEditable value={task.title} onSave={(title) => save(task, title)} required inputClassName="text-xl font-semibold text-slate-900 px-1.5 py-0.5">
      <h1 className={`text-xl font-semibold leading-snug ${task.status === "done" ? "text-slate-400 line-through" : "text-slate-900"}`}>{task.title}</h1>
    </InlineEditable>
  );
}
