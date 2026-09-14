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
  onboardingSteps: OnboardingStepDto[];
}

export interface OnboardingStepDto {
  id: string;
  position: number;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
}
