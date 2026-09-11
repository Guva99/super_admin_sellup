export type ClientStatus = "lead" | "onboarding" | "active" | "paused" | "churned";
export type ClientPlan = "full" | "early_access" | "custom";
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
  hoursSpent: number;
  dueDate: string;
  /** id связанной задачи, если этап выведен в задачи */
  taskId?: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "overdue" | "pending";
  description: string;
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
  initials: string;
  color: string;
  niche: ClientNiche;
  plan: ClientPlan;
  fixedPrice: boolean;
  status: ClientStatus;
  stage: ClientStage;
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
  payments: Payment[];
  notes: string;
}
