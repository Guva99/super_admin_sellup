import type { Task } from "@/entities/task";

const formatStamp = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** «Создано … / Обновлено …» под сайдбаром. */
export function MetaFooter({ task }: { task: Task }) {
  return (
    <div className="text-[11px] text-slate-400 space-y-0.5 px-1">
      <p>Создано {formatStamp(task.createdAt)}</p>
      {task.updatedAt !== task.createdAt && <p>Обновлено {formatStamp(task.updatedAt)}</p>}
    </div>
  );
}
