import { ExternalLink } from "lucide-react";
import type { Client } from "@/entities/client";
import { isTaskOverdue, useTasks, type Task } from "@/entities/task";
import { useChangeTaskAssignee } from "@/features/change-task-assignee";
import { useChangeTaskDates } from "@/features/change-task-dates";
import { useChangeTaskLabels } from "@/features/change-task-labels";
import { useChangeTaskStatus } from "@/features/change-task-status";
import { UserAvatar } from "@/shared/ui";
import { TaskFieldRow, TaskFields } from "./TaskFields";

interface DetailsSidebarProps {
  task: Task;
  client: Client | null;
  onOpenClient: (id: string) => void;
}

/**
 * Секция «Детали» сохранённой задачи: те же поля, что и в форме новой
 * (`TaskFields`), но каждое изменение сразу уходит на сервер. Бизнес здесь
 * только показан — перенос задачи в другой бизнес сменил бы её ключ и номер,
 * этого бэкенд не делает. Родитель, команда, Development и Automation
 * появятся с бэкендом (этапы 2–3) — заглушек здесь нет.
 */
export function DetailsSidebar({ task, client, onOpenClient }: DetailsSidebarProps) {
  const { updateTask } = useTasks();
  const { change } = useChangeTaskStatus();
  const { assign } = useChangeTaskAssignee();
  const { setLabels } = useChangeTaskLabels();
  const { setDueDate, setStartDate } = useChangeTaskDates();

  return (
    <TaskFields
      value={{
        status: task.status,
        assignee: task.assignee,
        dueDate: task.dueDate,
        startDate: task.startDate,
        labels: task.labels,
        priority: task.priority,
        kind: task.kind,
        type: task.type,
      }}
      on={{
        status: (status) => change(task.id, status),
        assignee: (user) => assign(task, user),
        dueDate: (date) => setDueDate(task, date ?? ""),
        startDate: (date) => setStartDate(task, date ?? ""),
        labels: (labels) => setLabels(task, labels),
        priority: (priority) => updateTask(task.id, { priority }),
        kind: (kind) => updateTask(task.id, { kind }),
        type: (type) => updateTask(task.id, { type }),
      }}
      overdue={isTaskOverdue(task)}
    >
      {client && (
        <TaskFieldRow label="Бизнес">
          <button type="button" onClick={() => onOpenClient(client.id)} className="flex items-center gap-1.5 text-xs text-slate-800 hover:text-brand-600 group">
            <span className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: client.color }}>
              {client.initials[0]}
            </span>
            <span className="truncate">{client.name}</span>
            <ExternalLink size={10} className="text-slate-300 group-hover:text-brand-400" />
          </button>
        </TaskFieldRow>
      )}
      <TaskFieldRow label="Ключ задач">
        <span
          className="text-xs font-mono font-medium text-slate-800 px-1.5 -mx-1.5"
          title={client ? "Ключ задаётся у бизнеса: в его карточке меняет владелец" : "Задачи без бизнеса нумеруются как SC-1, SC-2"}
        >
          {task.key.slice(0, task.key.lastIndexOf("-"))}
        </span>
      </TaskFieldRow>
      <TaskFieldRow label="Автор">
        <div className="flex items-center gap-2">
          <UserAvatar name={task.reporter.name} size="sm" />
          <span className="text-xs text-slate-800">{task.reporter.name}</span>
        </div>
      </TaskFieldRow>
    </TaskFields>
  );
}
