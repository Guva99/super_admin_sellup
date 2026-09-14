import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setSessionExpiredHandler, tokenStorage, type Result } from "@/shared/api";
import { sessionApi } from "../api/sessionApi";
import type { SessionEndReason, SessionStatus, SessionUser } from "./types";

/**
 * Сессия: кто вошёл и жива ли сессия.
 *
 * Токены хранит shared/api/tokenStorage (они нужны HTTP-клиенту без React),
 * пользователь из ответа логина лежит рядом в localStorage — так после
 * перезагрузки сессия восстанавливается без запроса на сервер.
 */
export interface SessionStore {
  status: SessionStatus;
  user: SessionUser | null;
  endReason: SessionEndReason;
  login: (email: string, password: string) => Promise<Result<SessionUser>>;
  logout: () => void;
}

const SessionContext = createContext<SessionStore | null>(null);

const USER_KEY = "sellup.user";

/** Максимальная задержка setTimeout (2^31 − 1 мс ≈ 24,8 дня). */
const MAX_TIMEOUT_MS = 2_147_483_647;

function readUser(): SessionUser | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function writeUser(user: SessionUser | null) {
  try {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    // хранилище недоступно — сессия проживёт до перезагрузки
  }
}

/** Сохранённая сессия, если она есть и refresh-токен ещё не истёк. */
function restoreUser(): SessionUser | null {
  const tokens = tokenStorage.get();
  const user = readUser();
  if (tokens && user && !tokenStorage.isSessionExpired(tokens)) return user;
  tokenStorage.clear();
  writeUser(null);
  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(restoreUser);
  const [endReason, setEndReason] = useState<SessionEndReason>(null);

  const end = useCallback((reason: SessionEndReason) => {
    tokenStorage.clear();
    writeUser(null);
    setUser(null);
    setEndReason(reason);
  }, []);

  // Refresh-токен протух или отозван — HTTP-клиент сообщает об этом сюда.
  useEffect(() => {
    setSessionExpiredHandler(() => end("expired"));
    return () => setSessionExpiredHandler(null);
  }, [end]);

  // Конец сессии по сроку refresh-токена. Экраны пока на моках и в API не
  // ходят, поэтому ждать 401 нельзя — выкидываем на логин по таймеру.
  useEffect(() => {
    if (!user) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      const tokens = tokenStorage.get();
      if (!tokens || tokenStorage.isSessionExpired(tokens)) {
        end("expired");
        return;
      }
      // setTimeout хранит задержку в int32: больше ~24,8 дня переполняется и
      // срабатывает сразу. Сессия живёт полгода — ждём частями.
      const msLeft = new Date(tokens.refreshTokenExpiresAt).getTime() - Date.now();
      timer = setTimeout(check, Math.min(msLeft + 500, MAX_TIMEOUT_MS));
    };
    check();
    return () => clearTimeout(timer);
  }, [user, end]);

  const login = useCallback(async (email: string, password: string): Promise<Result<SessionUser>> => {
    const result = await sessionApi.login(email, password);
    if (!result.ok) return result;
    const { user: loggedIn, ...tokens } = result.data;
    tokenStorage.set(tokens);
    writeUser(loggedIn);
    setUser(loggedIn);
    setEndReason(null);
    return { ok: true, data: loggedIn };
  }, []);

  const logout = useCallback(() => {
    const tokens = tokenStorage.get();
    end("logout");
    // Ответ не важен: logout на сервере идемпотентен, а локально сессии уже нет.
    if (tokens) void sessionApi.logout(tokens.refreshToken);
  }, [end]);

  const value = useMemo<SessionStore>(
    () => ({ status: user ? "authenticated" : "anonymous", user, endReason, login, logout }),
    [user, endReason, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionStore {
  const store = useContext(SessionContext);
  if (!store) throw new Error("useSession вызван вне <SessionProvider>");
  return store;
}
