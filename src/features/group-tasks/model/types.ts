import type { Task, TaskPerson } from "@/entities/task";

/** Как разбить доску на секции. Точка расширения: по статусу, по бизнесу. */
export type GroupMode = "assignee" | "none";

export const GROUP_MODE_LABEL: Record<GroupMode, string> = {
  assignee: "Исполнитель",
  none: "Без группировки",
};

export interface TaskGroup {
  id: string;
  title: string;
  /** Есть только при группировке по исполнителю; у «Не назначено» — null. */
  assignee: TaskPerson | null;
  tasks: Task[];
}
