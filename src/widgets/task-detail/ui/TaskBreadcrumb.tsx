import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { TaskKey, TaskKindIcon, type Task } from "@/entities/task";

interface TaskBreadcrumbProps {
  task: Task;
  /** Название бизнеса, к которому относится задача; без него — «Задачи». */
  parentLabel: string;
  onParentClick?: () => void;
}

/** «Бизнес / SC-4»: клик по ключу копирует ссылку на карточку. */
export function TaskBreadcrumb({ task, parentLabel, onParentClick }: TaskBreadcrumbProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Буфер обмена недоступен (не https) — ссылка и так в адресной строке.
    }
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500">
      {onParentClick ? (
        <button type="button" onClick={onParentClick} className="hover:text-brand-600 hover:underline">
          {parentLabel}
        </button>
      ) : (
        <span>{parentLabel}</span>
      )}
      <span className="text-slate-300">/</span>
      <button type="button" onClick={copyLink} title="Скопировать ссылку" className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-slate-100">
        <TaskKindIcon kind={task.kind} size={13} />
        <TaskKey value={task.key} className="text-slate-700" />
        {copied ? <Check size={11} className="text-emerald-500" /> : <Link2 size={11} className="text-slate-300" />}
      </button>
    </nav>
  );
}
