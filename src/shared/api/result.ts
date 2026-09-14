/**
 * Типизированный результат вместо голого throw.
 * Точка подмены мока на HTTP: меняется реализация, а не потребители.
 */
export interface ApiError {
  code: "bad_request" | "unauthorized" | "forbidden" | "not_found" | "conflict" | "network" | "unknown";
  /** Сообщение бэкенда как есть (англ.). Для показа пользователю — describeApiError. */
  message: string;
  /** HTTP-статус; отсутствует, если до сервера не достучались. */
  status?: number;
}

export type Result<T, E = ApiError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = <T>(error: ApiError): Result<T> => ({ ok: false, error });
