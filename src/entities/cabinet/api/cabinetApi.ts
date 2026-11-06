import { apiFetch, type Result } from "@/shared/api";
import type { CabinetOverview, PublicPlan, SlugAvailability } from "../model/types";

export const cabinetApi = {
  me: (): Promise<Result<CabinetOverview>> => apiFetch("/cabinet/me"),

  resendVerification: (): Promise<Result<void>> => apiFetch("/cabinet/email/resend", { method: "POST" }),

  publicPlans: (): Promise<Result<PublicPlan[]>> => apiFetch("/public/plans", { auth: false }),

  slugAvailability: (slug: string): Promise<Result<SlugAvailability>> =>
    apiFetch(`/public/slugs/${encodeURIComponent(slug)}`, { auth: false }),
};
