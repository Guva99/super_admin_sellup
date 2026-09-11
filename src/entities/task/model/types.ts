export type TaskType = "call" | "task" | "update" | "integration" | "support" | "onboarding";
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export interface TaskAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  editedAt?: string;
  attachments?: TaskAttachment[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId: string | null;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  assignee: string;
  createdAt: string;
  /** id этапа онбординга, если задача выведена из него */
  onboardingStepId?: string;
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
}

/** Просрочена ли задача на сегодняшний день. */
export function isTaskOverdue(task: Task, now: Date = new Date()): boolean {
  if (!task.dueDate || task.status === "done") return false;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
}

/**
 * Минимум данных о клиенте, нужный карточке задачи.
 * Структурный тип вместо импорта из entities/client:
 * кросс-импорты между слайсами одного слоя запрещены.
 */
export interface TaskCardClient {
  id: string;
  name: string;
  initials: string;
  color: string;
}
