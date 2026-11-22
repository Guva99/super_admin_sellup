import { apiFetch, type Result } from "@/shared/api";
import type { ClientFeature } from "../model/types";

export const clientModuleApi = {
  list: (clientId: string): Promise<Result<ClientFeature[]>> => apiFetch(`/clients/${clientId}/features`),

  /** Owner/Admin/Manager. В админке клиента изменение видно в пределах минуты. */
  set: (clientId: string, key: string, on: boolean): Promise<Result<ClientFeature>> =>
    apiFetch(`/clients/${clientId}/features/${key}`, {
      method: "PUT",
      body: { state: on ? "ENABLED" : "DISABLED" },
    }),
};
