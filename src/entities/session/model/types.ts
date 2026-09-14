/** Текущий пользователь — поля из ответа POST /auth/login. */
export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  roleKey: string;
}

export type SessionStatus = "authenticated" | "anonymous";

/**
 * Почему сессии нет — от этого зависит, вернуть ли пользователя после входа
 * на страницу, где он был:
 * logout  — вышел сам, возвращать некуда;
 * expired — протух refresh-токен — вернуть туда, где был;
 * null    — сессии и не было — вернуть на запрошенный адрес.
 */
export type SessionEndReason = "logout" | "expired" | null;
