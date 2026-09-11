import type { Client, ClientStage } from "../model/types";
import type { ClientDto } from "./dto";

const isStage = (value: string | undefined): value is ClientStage =>
  value === "lead" || value === "demo" || value === "contract" ||
  value === "onboarding" || value === "active" || value === "paused" || value === "churned";

/** DTO бэкенда → модель приложения. Единственное место, знающее про snake_case. */
export function toClient(dto: ClientDto): Client {
  return {
    id: dto.id,
    name: dto.name,
    initials: dto.initials,
    color: dto.color,
    niche: dto.niche,
    plan: dto.plan,
    fixedPrice: dto.fixed_price,
    status: dto.status,
    stage: isStage(dto.stage) ? dto.stage : dto.status,
    mrr: dto.mrr,
    healthScore: dto.health_score,
    health: dto.health,
    connectedAt: dto.connected_at,
    hoursThisMonth: dto.hours_this_month,
    manager: dto.manager,
    owner: dto.owner,
    size: dto.size,
    nextAction: dto.next_action,
    daysInStatus: dto.days_in_status,
    notes: dto.notes,
    integrations: [],
    onboardingSteps: [],
    payments: [],
  };
}
