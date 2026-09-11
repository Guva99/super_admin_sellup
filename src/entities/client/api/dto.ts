import type { ClientNiche, ClientPlan, ClientStatus } from "../model/types";

/**
 * Форма клиента как её отдаёт бэкенд. Отделена от модели приложения:
 * поля бэка могут переименоваться, не задев UI.
 */
export interface ClientDto {
  id: string;
  name: string;
  initials: string;
  color: string;
  niche: ClientNiche;
  plan: ClientPlan;
  fixed_price: boolean;
  status: ClientStatus;
  stage?: string;
  mrr: number;
  health_score: number;
  health: { activity: number; integrations: number; payments: number; support: number };
  connected_at: string;
  hours_this_month: number;
  manager: string;
  owner: { name: string; email: string; phone: string };
  size: string;
  next_action: string;
  days_in_status: number;
  notes: string;
}
