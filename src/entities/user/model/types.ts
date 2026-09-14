export type RoleKey = "OWNER" | "ADMIN" | "MANAGER" | "DEVELOPER" | "SUPPORT";

/** Сотрудник SellUp — пользователь админки (`User` в Swagger). */
export interface User {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  roleKey: RoleKey;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
}

export interface Role {
  id: string;
  key: RoleKey;
  name: string;
}

/** Данные формы «Добавить сотрудника». */
export interface NewUserInput {
  email: string;
  fullName: string;
  password: string;
  roleId: string;
}

export const ROLE_LABEL: Record<RoleKey, string> = {
  OWNER: "Владелец",
  ADMIN: "Администратор",
  MANAGER: "Менеджер",
  DEVELOPER: "Разработчик",
  SUPPORT: "Поддержка",
};

/** Добавлять и удалять сотрудников бэкенд разрешает владельцу и администратору. */
export const canManageTeam = (roleKey: string | undefined): boolean => roleKey === "OWNER" || roleKey === "ADMIN";
