import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { describeApiError, type Result } from "@/shared/api";
import { userApi } from "../api/userApi";
import type { NewUserInput, Role, User } from "./types";

/**
 * Команда из базы: исполнители задач и вкладка «Настройки → Команда».
 */
export interface UsersStore {
  users: User[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  addUser: (input: NewUserInput) => Promise<Result<User>>;
  removeUser: (id: string) => Promise<Result<void>>;
}

const UsersContext = createContext<UsersStore | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([userApi.list(), userApi.listRoles()]).then(([usersResult, rolesResult]) => {
      if (cancelled) return;
      if (usersResult.ok) setUsers(usersResult.data);
      else setError(describeApiError(usersResult.error));
      if (rolesResult.ok) setRoles(rolesResult.data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addUser = useCallback(async (input: NewUserInput) => {
    const result = await userApi.create(input);
    if (result.ok) setUsers((prev) => [result.data, ...prev]);
    return result;
  }, []);

  const removeUser = useCallback(async (id: string) => {
    const result = await userApi.remove(id);
    if (result.ok) setUsers((prev) => prev.filter((user) => user.id !== id));
    return result;
  }, []);

  const value = useMemo<UsersStore>(
    () => ({ users, roles, isLoading, error, addUser, removeUser }),
    [users, roles, isLoading, error, addUser, removeUser],
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers(): UsersStore {
  const store = useContext(UsersContext);
  if (!store) throw new Error("useUsers вызван вне <UsersProvider>");
  return store;
}
