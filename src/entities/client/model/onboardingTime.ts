import { HOUR_MS } from "@/shared/lib";
import type { OnboardingStep } from "./types";

/**
 * Календарное время этапа в часах: от взятия в работу до закрытия, у открытых —
 * до «сейчас». Не «рабочие часы» — их бэкенд не знает. Метки времени ставит
 * бэкенд (`applyStepStatus`), здесь только разница.
 */
export function stepHoursSpent(step: Pick<OnboardingStep, "startedAt" | "completedAt">, now = Date.now()): number {
  if (!step.startedAt) return 0;
  const end = step.completedAt ? new Date(step.completedAt).getTime() : now;
  return Math.max(0, (end - new Date(step.startedAt).getTime()) / HOUR_MS);
}

export const onboardingHoursSpent = (steps: OnboardingStep[], now = Date.now()): number =>
  steps.reduce((sum, step) => sum + stepHoursSpent(step, now), 0);
