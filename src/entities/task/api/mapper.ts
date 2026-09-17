import type {
  NewTaskInput,
  Task,
  TaskAttachment,
  TaskComment,
  TaskKind,
  TaskPatch,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "../model/types";
import type { TaskCommentDto, TaskDto, TaskFileDto } from "./dto";

/**
 * DTO бэкенда ↔ модель приложения. Единственное место, знающее, что бэкенд
 * пишет перечисления в UPPER_CASE, файлы называет `files`, а «очистить дату
 * или исполнителя» — это пустая строка в PATCH.
 */

const TYPE: Record<TaskDto["type"], TaskType> = {
  CALL: "call",
  TASK: "task",
  UPDATE: "update",
  INTEGRATION: "integration",
  SUPPORT: "support",
  ONBOARDING: "onboarding",
};

const KIND: Record<TaskDto["kind"], TaskKind> = {
  TASK: "task",
  BUG: "bug",
};

const PRIORITY: Record<TaskDto["priority"], TaskPriority> = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const STATUS: Record<TaskDto["status"], TaskStatus> = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
};

const reverse = <K extends string, V extends string>(map: Record<K, V>, value: V): K =>
  (Object.keys(map) as K[]).find((key) => map[key] === value)!;

export const toAttachment = (dto: TaskFileDto): TaskAttachment => ({
  id: dto.id,
  name: dto.name,
  size: dto.size,
  type: dto.contentType,
  isInline: dto.isInline ?? false,
});

export const toComment = (dto: TaskCommentDto): TaskComment => ({
  id: dto.id,
  authorId: dto.authorId,
  authorName: dto.authorName,
  text: dto.text,
  createdAt: dto.createdAt,
  editedAt: dto.editedAt ?? undefined,
  attachments: dto.files.map(toAttachment),
});

export const toTask = (dto: TaskDto): Task => ({
  id: dto.id,
  number: dto.number,
  key: dto.key,
  title: dto.title,
  description: dto.description || undefined,
  clientId: dto.clientId,
  type: TYPE[dto.type],
  kind: KIND[dto.kind],
  priority: PRIORITY[dto.priority],
  status: STATUS[dto.status],
  labels: dto.labels,
  dueDate: dto.dueDate,
  startDate: dto.startDate,
  assignee: dto.assigneeId ? { id: dto.assigneeId, name: dto.assigneeName ?? "" } : null,
  reporter: { id: dto.createdBy, name: dto.createdByName },
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
  onboardingStepId: dto.onboardingStepId ?? undefined,
  attachments: dto.files.map(toAttachment),
  comments: dto.comments.map(toComment),
});

export const toCreateTaskBody = (input: NewTaskInput) => ({
  title: input.title,
  description: input.description,
  clientId: input.clientId,
  onboardingStepId: input.onboardingStepId ?? null,
  type: reverse(TYPE, input.type),
  kind: reverse(KIND, input.kind),
  priority: reverse(PRIORITY, input.priority),
  labels: input.labels ?? [],
  dueDate: input.dueDate,
  startDate: input.startDate ?? null,
  assigneeId: input.assigneeId,
  attachmentIds: input.attachmentIds ?? [],
});

/** Только присланные поля; null → "" — так бэкенд понимает «очистить». */
export const toPatchBody = (patch: TaskPatch) => ({
  title: patch.title,
  description: patch.description,
  type: patch.type && reverse(TYPE, patch.type),
  kind: patch.kind && reverse(KIND, patch.kind),
  priority: patch.priority && reverse(PRIORITY, patch.priority),
  status: patch.status && reverse(STATUS, patch.status),
  labels: patch.labels,
  dueDate: patch.dueDate === null ? "" : patch.dueDate,
  startDate: patch.startDate === null ? "" : patch.startDate,
  assigneeId: patch.assigneeId === null ? "" : patch.assigneeId,
});

/** Подписи значений из истории: бэкенд хранит их в своих обозначениях. */
export const statusFromDto = (value: string): TaskStatus | undefined => STATUS[value as TaskDto["status"]];
export const kindFromDto = (value: string): TaskKind | undefined => KIND[value as TaskDto["kind"]];
export const priorityFromDto = (value: string): TaskPriority | undefined => PRIORITY[value as TaskDto["priority"]];
export const typeFromDto = (value: string): TaskType | undefined => TYPE[value as TaskDto["type"]];
