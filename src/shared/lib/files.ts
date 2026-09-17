/**
 * Правила вложений — те же, что проверяет бэкенд (service/tasks.go). Проверка
 * здесь нужна, чтобы сказать об ошибке сразу при выборе файла, а не после
 * отправки. Лежит в shared: файлы нужны и задачам, и вложениям как сущности,
 * а сущности друг друга не импортируют.
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

export const isImageType = (type: string): boolean => type.startsWith("image/");

/**
 * Ссылка на вложение внутри разметки: `![имя](attach:<id>)`. Id, а не адрес
 * файла: адрес может смениться, а доступ проверяется на каждом запросе.
 */
export const attachmentRef = (id: string): string => `attach:${id}`;
export const attachmentKey = (src: string): string | null => (src.startsWith("attach:") ? src.slice("attach:".length) : null);

/**
 * Скриншот из буфера всегда приходит как «image.png» — даём своё имя, чтобы
 * в списке вложений их можно было различить.
 */
export function pastedFile(file: File): File {
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ".png";
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 6);
  return new File([file], `paste-${stamp}-${suffix}${ext}`, { type: file.type });
}
