/**
 * Типизированный результат вместо голого throw.
 * Точка подмены мока на HTTP: меняется реализация, а не потребители.
 */
export interface ApiError {
  code: "not_found" | "network" | "unknown";
  message: string;
}

export type Result<T, E = ApiError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = <T>(error: ApiError): Result<T> => ({ ok: false, error });
