import type { Result } from "@/shared/api";

/** Что редактору нужно от загрузки: он не знает ни про API, ни про очередь. */
export interface StartedUpload {
  /** Локальный id — по нему картинка в тексте найдётся, когда придёт ответ. */
  id: string;
  /** Blob-URL файла для превью, пока идёт загрузка. */
  previewUrl: string;
  done: Promise<Result<{ id: string }>>;
}

export interface ImageUploader {
  start: (file: File) => StartedUpload;
  retry: (id: string) => Promise<Result<{ id: string }>>;
}

/** Картинки по ссылке `attach:<id>`: как достать blob-URL и что делать по клику. */
export interface ImageResolver {
  load: (attachmentId: string) => Promise<Result<string>>;
  open: (url: string, alt: string) => void;
}
