/**
 * Текущий пользователь — поля из ответа POST /auth/login (и /public/signup).
 *
 * kind — кто вошёл: staff — сотрудник SellUp, видит консоль; client —
 * человек бизнеса, видит свой кабинет. У сессий, сохранённых до появления
 * кабинета, поля нет — это всегда сотрудники.
 */
export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  roleKey: string;
  kind?: "staff" | "client";
  /** Только для кабинета: бизнес, его роль в нём, подтверждена ли почта. */
  clientId?: string;
  clientRole?: "OWNER" | "MEMBER";
  emailVerified?: boolean;
}

export const isClientUser = (user: SessionUser | null | undefined): boolean => user?.kind === "client";

export type SessionStatus = "authenticated" | "anonymous";

/**
 * Почему сессии нет — от этого зависит, вернуть ли пользователя после входа
 * на страницу, где он был:
 * logout  — вышел сам, возвращать некуда;
 * expired — протух refresh-токен — вернуть туда, где был;
 * null    — сессии и не было — вернуть на запрошенный адрес.
 */
export type SessionEndReason = "logout" | "expired" | null;
