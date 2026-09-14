import { apiFetch, type Result } from "@/shared/api";
import type { NewUserInput, Role, User } from "../model/types";

export const userApi = {
  /** Любая роль: список нужен для выбора исполнителя задачи. */
  list: (): Promise<Result<User[]>> => apiFetch("/users"),

  listRoles: (): Promise<Result<Role[]>> => apiFetch("/roles"),

  /** Owner/Admin. Сотрудник сразу может войти с этим email и паролем. */
  create: (input: NewUserInput): Promise<Result<User>> => apiFetch("/users", { method: "POST", body: input }),

  /** Owner/Admin. Себя и последнего владельца удалить нельзя — бэкенд вернёт ошибку. */
  remove: (id: string): Promise<Result<void>> => apiFetch(`/users/${id}`, { method: "DELETE" }),
};
