import type { Result } from "@/shared/api";
import { attachmentApi } from "../api/attachmentApi";

/**
 * Картинки отдаются по токену, поэтому в `<img src>` идёт blob-URL. Одна
 * картинка нужна и редактору, и просмотру, и лайтбоксу — качаем один раз на
 * сессию и держим URL здесь; освобождать нечего, пока вкладка жива.
 */
const urls = new Map<string, Promise<Result<string>>>();

export function loadAttachmentImage(id: string): Promise<Result<string>> {
  let pending = urls.get(id);
  if (!pending) {
    pending = attachmentApi.content(id).then((result) => {
      if (!result.ok) {
        // Ошибку не кэшируем: следующая попытка пойдёт на сервер снова.
        urls.delete(id);
        return result;
      }
      return { ok: true as const, data: URL.createObjectURL(result.data) };
    });
    urls.set(id, pending);
  }
  return pending;
}

/** Удалённое вложение больше не показываем из кэша. */
export function forgetAttachmentImage(id: string): void {
  urls.delete(id);
}
