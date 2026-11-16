/**
 * Клиент в том виде, в каком его отдаёт бэкенд (`Client` в Swagger).
 * Отделён от модели приложения: поля бэка могут переименоваться, не задев UI.
 */
export interface ClientDto {
  id: string;
  companyName: string;
  /** Префикс ключей задач этого бизнеса: CG-1, CG-2. */
  taskKey: string;
  status: "LEAD" | "ONBOARDING" | "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "ARCHIVED";
  stage: "LEAD" | "DEMO" | "CONTRACT" | "ONBOARDING" | "ACTIVE";
  stageChangedAt: string;
  planId: string | null;
  planName: string | null;
  planCode: string | null;
  monthlyPrice: number | null;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  niche: "RETAIL" | "SERVICES" | "";
  companySize: string;
  fixedPrice: boolean;
  createdAt: string;
  /** Адрес на нашем домене: <slug>.sellup-system.online; null — ещё не задан. */
  slug: string | null;
  /** Свободные данные; у заявки с лендинга — что бизнес просил. */
  metadata: {
    source?: string;
    message?: string;
    request?: { sections?: string[]; needsSite?: boolean };
  } | null;
  onboardingSteps: OnboardingStepDto[];
}

/** Что стало с письмом доступа, когда перенос в воронке сделал бизнес готовым. */
export interface AccessInviteOutcomeDto {
  sent: boolean;
  email?: string;
  reason?: "NO_SLUG" | "NO_EMAIL" | "EMAIL_TAKEN" | "INVALID_EMAIL" | "FAILED";
}

/** Ответ на перенос в воронке: клиент и, если бизнес стал готов, судьба письма. */
export interface MovedClientDto extends ClientDto {
  accessInvite?: AccessInviteOutcomeDto;
}

/** Установка бизнеса на ячейке: последняя задача агента и состояние. */
export interface InstallationDto {
  task: {
    id: string;
    status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
    error: string | null;
    createdAt: string;
    finishedAt: string | null;
  } | null;
  deployment: {
    status: "PENDING" | "CREATING" | "RUNNING" | "UPDATING" | "FAILED";
    version: string;
    error: string | null;
    /** Магазин сделан не агентом (проект, работавший до платформы). */
    external: boolean;
    adminUrl: string | null;
    storefrontUrl: string | null;
    ssoAudience: string | null;
  } | null;
  /** Где магазин: те же адреса, что в письмах и кабинете. */
  addresses?: { storefront: string; admin: string };
  /** Имя установки, для которой подписываются ссылки «Открыть админку». */
  installationName?: string;
}

/** Привязка существующей установки. */
export interface ExternalInstallationInput {
  adminUrl: string;
  storefrontUrl: string;
  installationName: string;
}

/** Ответ на ручную отправку письма доступа. */
export interface AccessInviteDto {
  email: string;
  addresses: { storefront: string; admin: string };
  resent: boolean;
}

export interface OnboardingStepDto {
  id: string;
  position: number;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  startedAt: string | null;
  completedAt: string | null;
}
