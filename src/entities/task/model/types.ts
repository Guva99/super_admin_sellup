/** Категория обращения клиента — метка клиентской доски (звонок, поддержка…). */
export type TaskType = "call" | "task" | "update" | "integration" | "support" | "onboarding";
/** Вид работы на доске разработки. Точка расширения: story, epic. */
export type TaskKind = "task" | "bug";
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

/** Сотрудник в роли исполнителя или автора задачи. */
export interface TaskPerson {
  id: string;
  name: string;
}

/** Файл, сохранённый на сервере. Содержимое скачивается отдельно — `downloadFile` стора. */
export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  editedAt?: string;
  attachments: TaskAttachment[];
}

/** Запись о потраченном времени. В бэкенде пока нет — тип на этап 3. */
export interface TaskWorklog {
  id: string;
  author: TaskPerson;
  minutes: number;
  note: string;
  at: string;
}

export interface Task {
  id: string;
  /** Порядковый номер; ключ `SC-<number>` не меняется после создания. */
  number: number;
  key: string;
  title: string;
  description?: string;
  clientId: string | null;
  type: TaskType;
  kind: TaskKind;
  priority: TaskPriority;
  status: TaskStatus;
  labels: string[];
  /** Календарные даты YYYY-MM-DD. */
  dueDate: string | null;
  startDate: string | null;
  assignee: TaskPerson | null;
  /** Кто создал задачу; только для чтения. */
  reporter: TaskPerson;
  createdAt: string;
  updatedAt: string;
  /** id этапа онбординга, если задача выведена из него */
  onboardingStepId?: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
}

/** Данные для создания задачи. */
export interface NewTaskInput {
  title: string;
  description: string;
  clientId: string | null;
  type: TaskType;
  kind: TaskKind;
  priority: TaskPriority;
  labels?: string[];
  dueDate: string | null;
  startDate?: string | null;
  assigneeId: string | null;
  onboardingStepId?: string;
}

/**
 * Что изменить в задаче; отсутствующее поле не трогается. `null` в дате или
 * исполнителе — очистить. Любое изменение бэкенд пишет в историю сам.
 */
export interface TaskPatch {
  title?: string;
  description?: string;
  kind?: TaskKind;
  priority?: TaskPriority;
  status?: TaskStatus;
  labels?: string[];
  dueDate?: string | null;
  startDate?: string | null;
  assigneeId?: string | null;
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
