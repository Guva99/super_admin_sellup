export type ClientStatus = "lead" | "onboarding" | "active" | "paused" | "churned";
export type ClientNiche = "retail" | "services";

/**
 * Стадия воронки подключения. Шире статуса: между «лидом» и «онбордингом»
 * есть демо и договор, которые статусом не выражаются.
 */
export type ClientStage = ClientStatus | "demo" | "contract";

export interface Integration {
  id: string;
  name: string;
  status: "ok" | "error" | "disconnected";
  lastSync: string | null;
  errorMessage?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  status: "done" | "in_progress" | "pending";
  assignee: string;
  /** Когда взят в работу / закрыт (ставит бэкенд); «Потрачено» — разница, см. `onboardingTime.ts`. */
  startedAt: string | null;
  completedAt: string | null;
  dueDate: string;
}

/** Данные формы «Подключить бизнес». */
export interface NewClientInput {
  name: string;
  planId: string;
  /** Только для тарифа с ценой на клиента (isCustom). */
  customPrice?: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  niche: ClientNiche;
  size: string;
  fixedPrice: boolean;
  stages: { title: string; description: string }[];
}

export interface ClientHealth {
  activity: number;
  integrations: number;
  payments: number;
  support: number;
}

export interface ClientOwner {
  name: string;
  email: string;
  phone: string;
}

export interface Client {
  id: string;
  name: string;
  /** Префикс ключей задач: CG-1, CG-2. Задаётся при подключении бизнеса. */
  taskKey: string;
  initials: string;
  color: string;
  /** null — ниша не указана. */
  niche: ClientNiche | null;
  planId: string | null;
  planName: string | null;
  /** Системный код тарифа ("full", "early_access", "custom") или null. */
  planCode: string | null;
  fixedPrice: boolean;
  status: ClientStatus;
  stage: ClientStage;
  /** Цена, зафиксированная при подключении. */
  monthlyPrice: number;
  /** Вклад в MRR: monthlyPrice, только пока клиент «Активен», иначе 0. */
  mrr: number;
  healthScore: number;
  health: ClientHealth;
  connectedAt: string;
  hoursThisMonth: number;
  manager: string;
  owner: ClientOwner;
  size: string;
  nextAction: string;
  daysInStatus: number;
  integrations: Integration[];
  onboardingSteps: OnboardingStep[];
  notes: string;
}
