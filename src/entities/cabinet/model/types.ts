/** Тариф, как его показывают лендинг и форма регистрации — GET /public/plans. */
export interface PublicPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  setupPrice: number;
  /** «Индивидуально»: setupPrice не настоящая цена. */
  setupOnRequest: boolean;
  features: string[];
}

/** Ответ GET /public/slugs/{slug}. */
export interface SlugAvailability {
  slug: string;
  available: boolean;
  reason?: "taken" | "invalid" | "reserved";
  storefrontHost?: string;
  adminHost?: string;
}

export type CabinetStepStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface CabinetStep {
  title: string;
  description: string;
  status: CabinetStepStatus;
  startedAt: string | null;
  completedAt: string | null;
}

/** Колонка воронки продаж, в которой бизнес у команды SellUp. */
export type CabinetStage = "LEAD" | "DEMO" | "CONTRACT" | "ONBOARDING" | "ACTIVE";

/** Ответ GET /cabinet/me — главный экран кабинета. */
export interface CabinetOverview {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: "OWNER" | "MEMBER";
    emailVerifiedAt: string | null;
  };
  company: {
    id: string;
    name: string;
    legalName: string;
    phone: string;
    niche: string;
    stage: CabinetStage;
    status: string;
    slug: string | null;
    createdAt: string;
  };
  plan: { name: string; code: string | null; monthlyPrice: number | null } | null;
  onboardingSteps: CabinetStep[];
  /** Есть, когда у бизнеса выбран адрес. */
  addresses?: { storefront: string; admin: string };
}
