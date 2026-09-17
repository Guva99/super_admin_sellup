import { useCallback, useMemo, useRef, useState } from "react";
import { attachmentApi, type Attachment } from "@/entities/attachment";
import { describeApiError, type Result } from "@/shared/api";
import { attachmentError } from "@/shared/lib";

export interface UploadItem {
  /** Локальный id — по нему редактор находит свою картинку, пока у файла нет серверного. */
  id: string;
  file: File;
  /** 0…1 */
  progress: number;
  status: "uploading" | "done" | "error";
  error: string | null;
  attachment: Attachment | null;
}

export interface UploadQueue {
  items: UploadItem[];
  /** Что уже на сервере, в порядке добавления. */
  uploaded: Attachment[];
  isUploading: boolean;
  /** Ставит файлы в очередь и сразу начинает грузить; неподходящие — со статусом error. */
  enqueue: (files: File[]) => UploadItem[];
  retry: (id: string) => void;
  /** Убрать из списка (на сервере файл не трогается). */
  dismiss: (id: string) => void;
  /** Дождаться исхода загрузки — редактору, чтобы подменить превью на ссылку. */
  wait: (id: string) => Promise<Result<Attachment>>;
  reset: () => void;
}

type Waiter = { resolve: (result: Result<Attachment>) => void; promise: Promise<Result<Attachment>> };

const deferred = (): Waiter => {
  let resolve!: Waiter["resolve"];
  const promise = new Promise<Result<Attachment>>((r) => {
    resolve = r;
  });
  return { resolve, promise };
};

let counter = 0;

/**
 * Очередь загрузок с прогрессом и повтором. Каждый файл — отдельный запрос:
 * у каждого свой прогресс и своя ошибка, и один упавший не тянет остальные.
 * `taskId` null — файлы уходят черновиками, задача заберёт их при создании.
 */
export function useUploadQueue(taskId: string | null, onUploaded?: (attachment: Attachment) => void): UploadQueue {
  const [items, setItems] = useState<UploadItem[]>([]);
  const waiters = useRef(new Map<string, Waiter>());
  const files = useRef(new Map<string, File>());

  const patch = useCallback((id: string, changes: Partial<UploadItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }, []);

  const run = useCallback(
    async (id: string, file: File) => {
      const waiter = deferred();
      waiters.current.set(id, waiter);
      patch(id, { status: "uploading", progress: 0, error: null });
      const result = await attachmentApi.upload(file, taskId, (fraction) => patch(id, { progress: fraction }));
      if (result.ok) {
        patch(id, { status: "done", progress: 1, attachment: result.data });
        onUploaded?.(result.data);
      } else {
        patch(id, { status: "error", error: describeApiError(result.error) });
      }
      waiter.resolve(result);
    },
    [taskId, onUploaded, patch],
  );

  const enqueue = useCallback(
    (list: File[]) => {
      const created: UploadItem[] = list.map((file) => {
        counter += 1;
        const id = `upload-${counter}`;
        files.current.set(id, file);
        const problem = attachmentError(file);
        return { id, file, progress: 0, status: problem ? "error" : "uploading", error: problem, attachment: null };
      });
      setItems((prev) => [...prev, ...created]);
      for (const item of created) {
        if (item.status === "error") {
          const waiter = deferred();
          waiter.resolve({ ok: false, error: { code: "bad_request", message: item.error ?? "" } });
          waiters.current.set(item.id, waiter);
        } else {
          void run(item.id, item.file);
        }
      }
      return created;
    },
    [run],
  );

  const retry = useCallback(
    (id: string) => {
      const file = files.current.get(id);
      if (file && !attachmentError(file)) void run(id, file);
    },
    [run],
  );

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    files.current.delete(id);
    waiters.current.delete(id);
  }, []);

  const wait = useCallback((id: string) => {
    const waiter = waiters.current.get(id);
    return waiter ? waiter.promise : Promise.resolve<Result<Attachment>>({ ok: false, error: { code: "not_found", message: "unknown upload" } });
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    files.current.clear();
    waiters.current.clear();
  }, []);

  const uploaded = useMemo(() => items.flatMap((item) => (item.attachment ? [item.attachment] : [])), [items]);
  const isUploading = items.some((item) => item.status === "uploading");

  return { items, uploaded, isUploading, enqueue, retry, dismiss, wait, reset };
}
