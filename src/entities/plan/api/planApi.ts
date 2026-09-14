import { apiFetch, type Result } from "@/shared/api";
import type { Plan, PlanInput } from "../model/types";

export const planApi = {
  list: (): Promise<Result<Plan[]>> => apiFetch("/plans"),

  /** Owner/Admin. */
  create: (input: PlanInput): Promise<Result<Plan>> => apiFetch("/plans", { method: "POST", body: input }),

  /** Owner/Admin. Меняет только тариф — цены уже подключённых клиентов остаются прежними. */
  update: (id: string, input: PlanInput): Promise<Result<Plan>> =>
    apiFetch(`/plans/${id}`, { method: "PATCH", body: input }),
};
