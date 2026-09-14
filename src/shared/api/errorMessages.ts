import type { ApiError } from "./result";

/**
 * Перевод сообщений бэкенда для показа пользователю. Бэкенд отдаёт
 * стабильные английские тексты (backend/internal/http/respond.go) —
 * сопоставляем по тексту, остальное — общий текст по коду ошибки.
 */
const MESSAGES: Record<string, string> = {
  "invalid credentials": "Неверный email или пароль",
  "email and password are required": "Введите email и пароль",
  forbidden: "Недостаточно прав для этого действия",
  "companyName is required": "Укажите название бизнеса",
  "companyName is too long": "Название бизнеса слишком длинное",
  "ownerEmail must be a valid email": "Укажите корректный email владельца",
  "planId must reference an active plan": "Выбранный тариф недоступен — выберите другой",
  "customPrice must be greater than 0 for a custom plan": "Укажите сумму в месяц для кастомного тарифа",
  "onboarding step title is required": "У каждого этапа онбординга должно быть название",
  "client in this status can't be moved in the pipeline": "Клиента в этом статусе нельзя двигать по воронке",
  "plan name is required": "Укажите название тарифа",
  "plan prices can't be negative": "Цены тарифа не могут быть отрицательными",
  "task title is required": "Укажите название задачи",
  "clientId must reference an existing client": "Бизнес не найден — возможно, его удалили",
  "assigneeId must reference an existing user": "Исполнитель не найден — выберите другого",
  "onboardingStepId must reference a step of the task's client": "Этап онбординга не найден",
  "this onboarding step already has a task": "Этот этап уже есть в задачах",
  "a comment needs text or at least one file": "Напишите текст или прикрепите файл",
  "only the author can change a comment": "Менять и удалять комментарий может только его автор",
  "a file is larger than 10 MB": "Файл больше 10 МБ",
  "upload is larger than 25 MB": "Файлы вместе больше 25 МБ",
  "this file type is not allowed": "Такой тип файла прикрепить нельзя",
  "a valid email is required": "Укажите корректный email",
  "password must be between 8 and 72 characters": "Пароль — от 8 до 72 символов",
  "fullName is required": "Укажите имя",
  "a user with this email already exists": "Сотрудник с таким email уже есть",
  "you cannot delete your own account": "Нельзя удалить свой аккаунт",
  "only an owner can delete owners": "Удалить владельца может только владелец",
  "cannot delete the last active owner": "Нельзя удалить последнего владельца",
};

const BY_CODE: Record<ApiError["code"], string> = {
  bad_request: "Проверьте введённые данные",
  unauthorized: "Сессия закончилась, войдите снова",
  forbidden: "Недостаточно прав",
  not_found: "Не найдено",
  conflict: "Конфликт с текущими данными",
  network: "Не удалось связаться с сервером",
  unknown: "Что-то пошло не так. Попробуйте ещё раз",
};

export function describeApiError(error: ApiError): string {
  return MESSAGES[error.message] ?? BY_CODE[error.code];
}
