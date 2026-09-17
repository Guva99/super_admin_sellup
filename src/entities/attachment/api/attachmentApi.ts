import { apiFetch, apiUpload, type Result } from "@/shared/api";
import type { Attachment } from "../model/types";

/** Ответ бэкенда совпадает с моделью — маппер не нужен. */
export const attachmentApi = {
  /**
   * Один файл за запрос: так у каждого свой прогресс и своя ошибка. Без
   * `taskId` файл становится черновиком текущего пользователя.
   */
  upload: async (file: File, taskId: string | null, onProgress?: (fraction: number) => void): Promise<Result<Attachment>> => {
    const form = new FormData();
    if (taskId) form.append("taskId", taskId);
    form.append("files", file, file.name);
    const result = await apiUpload<Attachment[]>("/attachments", form, { onProgress });
    return result.ok ? { ok: true, data: result.data[0] } : result;
  },

  content: (id: string): Promise<Result<Blob>> => apiFetch(`/attachments/${id}/content`, { responseType: "blob" }),

  remove: (id: string): Promise<Result<void>> => apiFetch(`/attachments/${id}`, { method: "DELETE" }),

  listByTask: (taskId: string): Promise<Result<Attachment[]>> => apiFetch(`/tasks/${taskId}/attachments`),
};
