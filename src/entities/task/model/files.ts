/**
 * Правила вложений — те же, что проверяет бэкенд (service/tasks.go). Проверка
 * здесь нужна, чтобы сказать об ошибке сразу при выборе файла, а не после отправки.
 */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
/** Лимит одного запроса: все файлы комментария уходят вместе. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".heic", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"];

/** Для атрибута accept у <input type="file">. */
export const ATTACHMENT_ACCEPT = ALLOWED_EXTENSIONS.join(",");

/** Текст ошибки для пользователя или null, если файл можно прикрепить. */
export function attachmentError(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) return `«${file.name}»: такой тип файла прикрепить нельзя`;
  if (file.size > MAX_FILE_BYTES) return `«${file.name}» больше 10 МБ`;
  return null;
}

export const isImageAttachment = (type: string): boolean => type.startsWith("image/");
