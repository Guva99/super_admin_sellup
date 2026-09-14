import { err, ok, type ApiError, type Result } from "./result";
import { tokenStorage, type StoredTokens } from "./tokenStorage";

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

/**
 * Что делать, когда сессия окончательно закончилась (refresh-токен протух,
 * отозван или пользователь удалён). Регистрирует стор сессии: shared не может
 * импортировать верхние слои, поэтому связь — через колбэк.
 */
let sessionExpiredHandler: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler;
}

function expireSession() {
  tokenStorage.clear();
  sessionExpiredHandler?.();
}

type RefreshOutcome = "refreshed" | "expired" | "unreachable";

/**
 * Один общий промис на все запросы, получившие 401 одновременно.
 *
 * Refresh-токен одноразовый: если пять параллельных запросов обновят его
 * независимо, первый получит новую пару, а остальные четыре предъявят уже
 * использованный токен. Бэкенд переживает это только в 30-секундном окне
 * (гонка вкладок), а внутри одной вкладки такого происходить не должно вовсе.
 */
let refreshInFlight: Promise<RefreshOutcome> | null = null;

function refreshTokens(): Promise<RefreshOutcome> {
  if (!refreshInFlight) {
    refreshInFlight = runRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function runRefresh(): Promise<RefreshOutcome> {
  const stored = tokenStorage.get();
  if (!stored || tokenStorage.isSessionExpired(stored)) return "expired";

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: stored.refreshToken }),
    });
  } catch {
    // Сеть упала — это не конец сессии. Разлогинивать нельзя, иначе любой
    // обрыв Wi-Fi выкидывал бы пользователя на экран входа.
    return "unreachable";
  }

  if (res.ok) {
    tokenStorage.set((await res.json()) as StoredTokens);
    return "refreshed";
  }

  if (res.status === 401) {
    // Соседняя вкладка могла успеть ротировать этот же токен — тогда в
    // хранилище уже лежит новая пара, и сессия жива.
    const latest = tokenStorage.get();
    if (latest && latest.refreshToken !== stored.refreshToken) return "refreshed";
    return "expired";
  }

  return "unreachable";
}

const CODE_BY_STATUS: Record<number, ApiError["code"]> = {
  400: "bad_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  // Файл больше лимита или недопустимого типа — ошибка в запросе.
  413: "bad_request",
  415: "bad_request",
};

async function toResult<T>(res: Response, responseType: ApiRequest["responseType"]): Promise<Result<T>> {
  if (res.ok) {
    if (res.status === 204) return ok(undefined as T);
    if (responseType === "blob") return ok((await res.blob()) as T);
    return ok((await res.json()) as T);
  }
  let message = res.statusText;
  try {
    const body = (await res.json()) as { error?: string };
    if (body.error) message = body.error;
  } catch {
    // тело не JSON — оставляем statusText
  }
  return err({ code: CODE_BY_STATUS[res.status] ?? "unknown", message, status: res.status });
}

const networkError = <T>(): Result<T> =>
  err({ code: "network", message: "network error" });

export interface ApiRequest {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** Объект уходит как JSON, FormData — как multipart/form-data (файлы). */
  body?: unknown;
  /** "blob" — ответ не JSON, а содержимое файла. */
  responseType?: "json" | "blob";
  /**
   * false — не подставлять токен и не пытаться обновлять сессию на 401.
   * Для login/refresh/logout: у них 401 означает ответ по существу.
   */
  auth?: boolean;
}

/**
 * Запрос к API. Сам подставляет access-токен; на 401 один раз обновляет
 * сессию и повторяет запрос. Если обновить не вышло — сессия закончена:
 * токены стираются и вызывается обработчик, который уводит на экран входа.
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, responseType = "json", auth = true }: ApiRequest = {},
): Promise<Result<T>> {
  const isForm = body instanceof FormData;
  const send = () => {
    const headers: Record<string, string> = {};
    // Для FormData заголовок с boundary браузер ставит сам.
    if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
    const token = auth ? tokenStorage.get()?.accessToken : undefined;
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  };

  let res: Response;
  try {
    res = await send();
  } catch {
    return networkError();
  }

  if (res.status !== 401 || !auth) return toResult<T>(res, responseType);

  const outcome = await refreshTokens();
  if (outcome === "unreachable") return networkError();
  if (outcome === "expired") {
    expireSession();
    return toResult<T>(res, responseType);
  }

  try {
    res = await send();
  } catch {
    return networkError();
  }
  // 401 даже со свежим токеном — пользователя отключили или удалили.
  if (res.status === 401) expireSession();
  return toResult<T>(res, responseType);
}
