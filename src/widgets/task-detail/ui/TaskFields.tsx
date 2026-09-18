import type { ReactNode } from "react";
import {
  TASK_KIND_LABEL,
  TASK_KINDS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABEL,
  TASK_TYPE_OPTION_LABEL,
  TaskKindIcon,
  TaskPriorityIcon,
  type TaskKind,
  type TaskPerson,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from "@/entities/task";
import type { User } from "@/entities/user";
import { AssigneePicker } from "@/features/change-task-assignee";
import { DateField } from "@/features/change-task-dates";
import { LabelsField } from "@/features/change-task-labels";
import { StatusDropdown } from "@/features/change-task-status";
import { Collapsible } from "@/shared/ui";

/** Поля задачи, одинаковые у новой и у сохранённой. */
export interface TaskFieldValues {
  status: TaskStatus;
  assignee: TaskPerson | null;
  dueDate: string | null;
  startDate: string | null;
  labels: string[];
  priority: TaskPriority;
  kind: TaskKind;
  type: TaskType;
}

/** Что делать с новым значением: сохранить на сервер или записать в черновик. */
export interface TaskFieldHandlers {
  status: (status: TaskStatus) => void;
  assignee: (user: User | null) => void;
  dueDate: (date: string | null) => void;
  startDate: (date: string | null) => void;
  labels: (labels: string[]) => void;
  priority: (priority: TaskPriority) => void;
  kind: (kind: TaskKind) => void;
  type: (type: TaskType) => void;
}

interface TaskFieldsProps {
  value: TaskFieldValues;
  on: TaskFieldHandlers;
  /** Подсветить срок красным. */
  overdue?: boolean;
  /** Что идёт после общих строк: бизнес и автор — они у новой и сохранённой разные. */
  children?: ReactNode;
}

const TYPES = Object.keys(TASK_TYPE_OPTION_LABEL) as TaskType[];
const SELECT_CLASS =
  "text-xs font-medium text-slate-800 bg-transparent -mx-1.5 px-1.5 py-1 rounded-md hover:bg-slate-100 outline-none cursor-pointer max-w-full";

/**
 * Правая колонка карточки задачи — одна и та же при создании и при правке:
 * набор полей, их порядок и вид не должны зависеть от того, сохранена задача
 * или ещё нет.
 */
export function TaskFields({ value, on, overdue = false, children }: TaskFieldsProps) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-slate-100">
        <StatusDropdown value={value.status} onChange={on.status} />
      </div>
      <Collapsible title="Детали" headerClassName="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        <dl className="px-4 py-2">
          <TaskFieldRow label="Исполнитель">
            <AssigneePicker value={value.assignee} onChange={on.assignee} />
          </TaskFieldRow>
          <TaskFieldRow label="Срок">
            <DateField value={value.dueDate} onChange={(date) => on.dueDate(date || null)} placeholder="Добавить срок" alert={overdue} />
          </TaskFieldRow>
          <TaskFieldRow label="Дата начала">
            <DateField value={value.startDate} onChange={(date) => on.startDate(date || null)} placeholder="Добавить дату" />
          </TaskFieldRow>
          <TaskFieldRow label="Метки">
            <LabelsField value={value.labels} onChange={on.labels} />
          </TaskFieldRow>
          <TaskFieldRow label="Приоритет">
            <div className="flex items-center gap-1.5 -mx-1.5">
              <TaskPriorityIcon priority={value.priority} className="ml-1.5" />
              <select aria-label="Приоритет" value={value.priority} onChange={(e) => on.priority(e.target.value as TaskPriority)} className={`${SELECT_CLASS} mx-0`}>
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{TASK_PRIORITY_LABEL[p]}</option>
                ))}
              </select>
            </div>
          </TaskFieldRow>
          <TaskFieldRow label="Тип">
            <div className="flex items-center gap-1.5 -mx-1.5">
              <TaskKindIcon kind={value.kind} size={13} className="ml-1.5" />
              <select aria-label="Тип" value={value.kind} onChange={(e) => on.kind(e.target.value as TaskKind)} className={`${SELECT_CLASS} mx-0`}>
                {TASK_KINDS.map((k) => (
                  <option key={k} value={k}>{TASK_KIND_LABEL[k]}</option>
                ))}
              </select>
            </div>
          </TaskFieldRow>
          <TaskFieldRow label="Категория">
            <select aria-label="Категория" value={value.type} onChange={(e) => on.type(e.target.value as TaskType)} className={SELECT_CLASS}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{TASK_TYPE_OPTION_LABEL[t]}</option>
              ))}
            </select>
          </TaskFieldRow>
          {children}
        </dl>
      </Collapsible>
    </div>
  );
}

export function TaskFieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] items-center gap-2 py-1.5 min-h-[34px]">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
