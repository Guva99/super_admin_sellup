import type { NewTaskInput, Task, TaskAttachment, TaskComment, TaskPriority, TaskStatus, TaskType } from "../model/types";
import type { TaskCommentDto, TaskDto, TaskFileDto } from "./dto";

/**
 * DTO бэкенда ↔ модель приложения. Единственное место, знающее, что бэкенд
 * пишет перечисления в UPPER_CASE, а файлы называет `files`.
 */

const TYPE: Record<TaskDto["type"], TaskType> = {
  CALL: "call",
  TASK: "task",
  UPDATE: "update",
  INTEGRATION: "integration",
  SUPPORT: "support",
  ONBOARDING: "onboarding",
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
  title: dto.title,
  description: dto.description || undefined,
  clientId: dto.clientId,
  type: TYPE[dto.type],
  priority: PRIORITY[dto.priority],
  status: STATUS[dto.status],
  dueDate: dto.dueDate,
  assigneeId: dto.assigneeId,
  assigneeName: dto.assigneeName ?? "",
  createdAt: dto.createdAt,
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
  priority: reverse(PRIORITY, input.priority),
  dueDate: input.dueDate,
  assigneeId: input.assigneeId,
});

export const toStatusDto = (status: TaskStatus): TaskDto["status"] => reverse(STATUS, status);
