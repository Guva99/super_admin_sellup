import type { Client, ClientStage, ClientStatus, NewClientInput, OnboardingStep } from "../model/types";
import type { ClientDto, OnboardingStepDto } from "./dto";
import { calendarDaysSince } from "@/shared/lib";

/**
 * DTO бэкенда ↔ модель приложения. Единственное место, знающее про формат
 * бэка: статусы и колонки в UPPER_CASE, другие имена полей.
 */

const STATUS: Record<ClientDto["status"], ClientStatus> = {
  LEAD: "lead",
  ONBOARDING: "onboarding",
  TRIAL: "onboarding",
  ACTIVE: "active",
  SUSPENDED: "paused",
  CANCELLED: "churned",
  ARCHIVED: "churned",
};

const STAGE: Record<ClientDto["stage"], ClientStage> = {
  LEAD: "lead",
  DEMO: "demo",
  CONTRACT: "contract",
  ONBOARDING: "onboarding",
  ACTIVE: "active",
};

const STEP_STATUS: Record<OnboardingStepDto["status"], OnboardingStep["status"]> = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

/** Палитра аватаров: цвет выбирается по id, поэтому не меняется между загрузками. */
const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ec4899", "#0ea5e9", "#f97316", "#84cc16", "#14b8a6",
];

function colorFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** Первые буквы двух первых слов; кавычки и знаки пропускаются («СтройМастер» → «С»). */
function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0] ?? "")
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export function toOnboardingStep(dto: OnboardingStepDto): OnboardingStep {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description || undefined,
    status: STEP_STATUS[dto.status],
    startedAt: dto.startedAt,
    completedAt: dto.completedAt,
    // Ответственных и сроков у этапов в бэкенде пока нет.
    assignee: "",
    dueDate: "",
  };
}

export function toClient(dto: ClientDto): Client {
  const status = STATUS[dto.status];
  const monthlyPrice = dto.monthlyPrice ?? 0;
  // Приостановленные и ушедшие клиенты не стоят ни в одной колонке воронки.
  const stage: ClientStage = status === "paused" || status === "churned" ? status : STAGE[dto.stage];

  return {
    id: dto.id,
    name: dto.companyName,
    taskKey: dto.taskKey,
    initials: initialsOf(dto.companyName),
    color: colorFor(dto.id),
    niche: dto.niche === "RETAIL" ? "retail" : dto.niche === "SERVICES" ? "services" : null,
    planId: dto.planId,
    planName: dto.planName,
    planCode: dto.planCode,
    fixedPrice: dto.fixedPrice,
    status,
    stage,
    monthlyPrice,
    // В MRR клиент попадает только в «Запуск / Активен».
    mrr: status === "active" ? monthlyPrice : 0,
    connectedAt: dto.createdAt,
    // Календарные дни по Москве: перенос в 23:50 и просмотр в 00:10 — уже «1 день».
    daysInStatus: calendarDaysSince(dto.stageChangedAt),
    owner: {
      name: dto.ownerName,
      email: dto.ownerEmail,
      phone: dto.ownerPhone,
    },
    size: dto.companySize,
    onboardingSteps: dto.onboardingSteps.map(toOnboardingStep),
    // Этих данных в бэкенде пока нет.
    healthScore: 0,
    health: { activity: 0, integrations: 0, payments: 0, support: 0 },
    hoursThisMonth: 0,
    manager: "",
    nextAction: "",
    notes: "",
    integrations: [],
  };
}

/** Обозначения бэкенда из истории бизнеса → модель; неизвестное — undefined. */
export const stageFromDto = (value: string): ClientStage | undefined => STAGE[value as ClientDto["stage"]];
export const clientStatusFromDto = (value: string): ClientStatus | undefined => STATUS[value as ClientDto["status"]];
export const stepStatusFromDto = (value: string): OnboardingStep["status"] | undefined => STEP_STATUS[value as OnboardingStepDto["status"]];

export function toCreateClientBody(input: NewClientInput) {
  return {
    companyName: input.name,
    planId: input.planId,
    customPrice: input.customPrice,
    ownerName: input.ownerName,
    ownerPhone: input.ownerPhone,
    ownerEmail: input.ownerEmail,
    niche: input.niche === "retail" ? "RETAIL" : "SERVICES",
    companySize: input.size,
    fixedPrice: input.fixedPrice,
    onboardingSteps: input.stages,
  };
}

export const toStageDto = (stage: ClientStage): ClientDto["stage"] | null =>
  (Object.keys(STAGE) as ClientDto["stage"][]).find((key) => STAGE[key] === stage) ?? null;

export const toStepStatusDto = (status: OnboardingStep["status"]): OnboardingStepDto["status"] =>
  (Object.keys(STEP_STATUS) as OnboardingStepDto["status"][]).find((key) => STEP_STATUS[key] === status)!;
