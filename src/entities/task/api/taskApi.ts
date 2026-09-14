import { apiFetch, ok, type Result } from "@/shared/api";
import type { NewTaskInput, Task, TaskAttachment, TaskComment, TaskStatus } from "../model/types";
import type { TaskCommentDto, TaskDto, TaskFileDto } from "./dto";
import { toAttachment, toComment, toCreateTaskBody, toStatusDto, toTask } from "./mapper";

const mapResult = <D, T>(result: Result<D>, map: (dto: D) => T): Result<T> =>
  result.ok ? ok(map(result.data)) : result;

const filesForm = (files: File[], text?: string): FormData => {
  const form = new FormData();
  if (text !== undefined) form.append("text", text);
  for (const file of files) form.append("files", file, file.name);
  return form;
};

/** Все запросы задач доступны любой роли; менять комментарий может только автор. */
export const taskApi = {
  list: async (): Promise<Result<Task[]>> =>
    mapResult(await apiFetch<TaskDto[]>("/tasks"), (list) => list.map(toTask)),

  create: async (input: NewTaskInput): Promise<Result<Task>> =>
    mapResult(await apiFetch<TaskDto>("/tasks", { method: "POST", body: toCreateTaskBody(input) }), toTask),

  setStatus: async (id: string, status: TaskStatus): Promise<Result<Task>> =>
    mapResult(await apiFetch<TaskDto>(`/tasks/${id}`, { method: "PATCH", body: { status: toStatusDto(status) } }), toTask),

  remove: (id: string): Promise<Result<void>> => apiFetch(`/tasks/${id}`, { method: "DELETE" }),

  uploadFiles: async (taskId: string, files: File[]): Promise<Result<TaskAttachment[]>> =>
    mapResult(
      await apiFetch<TaskFileDto[]>(`/tasks/${taskId}/files`, { method: "POST", body: filesForm(files) }),
      (list) => list.map(toAttachment),
    ),

  downloadFile: (taskId: string, fileId: string): Promise<Result<Blob>> =>
    apiFetch(`/tasks/${taskId}/files/${fileId}`, { responseType: "blob" }),

  /** Текст и файлы уходят одним запросом: комментарий сохраняется целиком или не сохраняется. */
  addComment: async (taskId: string, text: string, files: File[]): Promise<Result<TaskComment>> =>
    mapResult(
      await apiFetch<TaskCommentDto>(`/tasks/${taskId}/comments`, { method: "POST", body: filesForm(files, text) }),
      toComment,
    ),

  editComment: async (taskId: string, commentId: string, text: string): Promise<Result<TaskComment>> =>
    mapResult(
      await apiFetch<TaskCommentDto>(`/tasks/${taskId}/comments/${commentId}`, { method: "PATCH", body: { text } }),
      toComment,
    ),

  removeComment: (taskId: string, commentId: string): Promise<Result<void>> =>
    apiFetch(`/tasks/${taskId}/comments/${commentId}`, { method: "DELETE" }),
};
