/**
 * Ключ задач бизнеса: CG-1, NI-2. Правила те же, что проверяет бэкенд
 * (service/task_key.go) — здесь они нужны, чтобы подсказать об ошибке до
 * отправки и не пускать в поле лишние символы.
 */
export const MAX_TASK_KEY_LENGTH = 10;

/** Ключ задач без бизнеса — занять его бизнесу нельзя. */
export const INTERNAL_TASK_KEY = "SC";

/** Приводит ввод к виду ключа: латиница, верхний регистр, не длиннее 10. */
export function normaliseTaskKeyInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, MAX_TASK_KEY_LENGTH);
}

/** Текст ошибки для пользователя или null, если ключ подходит. */
export function taskKeyError(value: string): string | null {
  if (value === "") return "Укажите ключ — до 10 английских букв";
  if (value === INTERNAL_TASK_KEY) return "Ключ SC занят внутренними задачами — выберите другой";
  return null;
}
