import type { ClientStatus, ClientStage, ClientNiche, OnboardingStep } from "./types";

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  lead: "Лид",
  onboarding: "Онбординг",
  active: "Активен",
  paused: "Пауза",
  churned: "Отток",
};

export const CLIENT_STATUS_CLASS: Record<ClientStatus, string> = {
  lead: "bg-slate-100 text-slate-600",
  onboarding: "bg-blue-50 text-blue-700",
  active: "bg-emerald-50 text-emerald-700",
  paused: "bg-amber-50 text-amber-700",
  churned: "bg-red-50 text-red-600",
};

export const CLIENT_NICHE_LABEL: Record<ClientNiche, string> = {
  retail: "Товарный",
  services: "Услуги",
};

export const CLIENT_STAGE_LABEL: Record<ClientStage, string> = {
  lead: "Лид",
  demo: "Демо проведена",
  contract: "Договор",
  onboarding: "Онбординг",
  active: "Запуск / Активен",
  paused: "Пауза",
  churned: "Отток",
};

export const CLIENT_STAGE_ACCENT: Record<ClientStage, string> = {
  lead: "bg-slate-300",
  demo: "bg-blue-400",
  contract: "bg-violet-400",
  onboarding: "bg-brand-400",
  active: "bg-emerald-400",
  paused: "bg-amber-400",
  churned: "bg-red-400",
};

/** Колонки воронки подключения, слева направо. */
export const PIPELINE_STAGES: {
  id: ClientStage;
  label: string;
  description: string;
}[] = [
  { id: "lead", label: "Лид", description: "Первый контакт" },
  { id: "demo", label: "Демо проведена", description: "Презентация сделана" },
  { id: "contract", label: "Договор", description: "Оформление" },
  {
    id: "onboarding",
    label: "Онбординг",
    description: "Настройка и интеграции",
  },
  {
    id: "active",
    label: "Запуск / Активен",
    description: "Работает в боевом режиме",
  },
];

export const STEP_STATUS_LABEL: Record<OnboardingStep["status"], string> = {
  pending: "Ожидает",
  in_progress: "В работе",
  done: "Готово",
};

/** Порядок перебора статуса шага онбординга по клику. */
export const STEP_STATUS_CYCLE = {
  pending: "in_progress",
  in_progress: "done",
  done: "pending",
} as const;
