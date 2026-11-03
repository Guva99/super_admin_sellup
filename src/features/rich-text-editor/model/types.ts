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

/**
 * Как картинка записана в тексте: ссылка из id файла и id обратно из ссылки.
 * У задач — `attach:<id>`, у статей блога — `blog-image:<id>`.
 */
export interface ImageRefs {
  ref: (id: string) => string;
  key: (src: string) => string | null;
}

/** Где живёт редактор: в задаче — markdown и чек-листы, в статье — документ и H2–H4. */
export type EditorVariant = "task" | "article";

/** Картинки по ссылке из ImageRefs: как достать URL и что делать по клику. */
export interface ImageResolver {
  load: (attachmentId: string) => Promise<Result<string>>;
  open: (url: string, alt: string) => void;
}
