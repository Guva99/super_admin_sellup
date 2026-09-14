import { apiFetch, type Result } from "@/shared/api";
import type { ClientHistoryEvent } from "../model/types";

/** Ответ бэкенда совпадает с моделью. Любая роль; новое сверху. */
export const clientHistoryApi = {
  list: (clientId: string): Promise<Result<ClientHistoryEvent[]>> => apiFetch(`/clients/${clientId}/history`),
};
