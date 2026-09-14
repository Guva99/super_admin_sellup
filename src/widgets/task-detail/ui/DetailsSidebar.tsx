import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { Client } from "@/entities/client";
import { isTaskOverdue, TASK_KIND_LABEL, TASK_KINDS, TASK_PRIORITY_LABEL, TASK_TYPE_LABEL, TaskKindIcon, useTasks, type Task, type TaskKind, type TaskPriority } from "@/entities/task";
import { AssigneePicker } from "@/features/change-task-assignee";
import { DateField, useChangeTaskDates } from "@/features/change-task-dates";
import { LabelsField } from "@/features/change-task-labels";
import { StatusDropdown } from "@/features/change-task-status";
import { Collapsible, UserAvatar } from "@/shared/ui";

interface DetailsSidebarProps {
  task: Task;
  client: Client | null;
  onOpenClient: (id: string) => void;
}

const PRIORITIES = Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[];

/**
 * Секция «Детали». Родитель, команда, Development и Automation появятся с
 * бэкендом (этапы 2–3) — заглушек, которые ничего не делают, здесь нет.
 */
export function DetailsSidebar({ task, client, onOpenClient }: DetailsSidebarProps) {
  const { setDueDate, setStartDate } = useChangeTaskDates();
  const { updateTask } = useTasks();
  const selectClass = "text-xs font-medium text-slate-800 bg-transparent -mx-1.5 px-1.5 py-1 rounded-md hover:bg-slate-100 outline-none cursor-pointer";

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-slate-100">
        <StatusDropdown task={task} />
      </div>
      <Collapsible title="Детали" headerClassName="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        <dl className="px-4 py-2">
          <Row label="Исполнитель">
            <AssigneePicker task={task} />
          </Row>
          <Row label="Срок">
            <DateField value={task.dueDate} onChange={(date) => setDueDate(task, date)} placeholder="Добавить срок" alert={isTaskOverdue(task)} />
          </Row>
          <Row label="Дата начала">
            <DateField value={task.startDate} onChange={(date) => setStartDate(task, date)} placeholder="Добавить дату" />
          </Row>
          <Row label="Метки">
            <LabelsField task={task} />
          </Row>
          <Row label="Приоритет">
            <select value={task.priority} onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })} className={selectClass}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{TASK_PRIORITY_LABEL[p]}</option>
              ))}
            </select>
          </Row>
          <Row label="Тип">
            <div className="flex items-center gap-1.5 -mx-1.5">
              <TaskKindIcon kind={task.kind} size={13} className="ml-1.5" />
              <select value={task.kind} onChange={(e) => updateTask(task.id, { kind: e.target.value as TaskKind })} className={`${selectClass} mx-0`}>
                {TASK_KINDS.map((k) => (
                  <option key={k} value={k}>{TASK_KIND_LABEL[k]}</option>
                ))}
              </select>
            </div>
          </Row>
          <Row label="Категория">
            <span className="text-xs text-slate-700">{TASK_TYPE_LABEL[task.type]}</span>
          </Row>
          {client && (
            <Row label="Бизнес">
              <button type="button" onClick={() => onOpenClient(client.id)} className="flex items-center gap-1.5 text-xs text-slate-800 hover:text-brand-600 group">
                <span className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: client.color }}>
                  {client.initials[0]}
                </span>
                <span className="truncate">{client.name}</span>
                <ExternalLink size={10} className="text-slate-300 group-hover:text-brand-400" />
              </button>
            </Row>
          )}
          <Row label="Автор">
            <div className="flex items-center gap-2">
              <UserAvatar name={task.reporter.name} size="sm" />
              <span className="text-xs text-slate-800">{task.reporter.name}</span>
            </div>
          </Row>
        </dl>
      </Collapsible>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] items-center gap-2 py-1.5 min-h-[34px]">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
