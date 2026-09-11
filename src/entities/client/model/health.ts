export type HealthLevel = "good" | "ok" | "risk";

/** Пороговые значения health score. Единственное место, где живёт это правило. */
export const HEALTH_THRESHOLDS = { good: 80, ok: 60 } as const;

export function healthLevel(score: number): HealthLevel {
  if (score >= HEALTH_THRESHOLDS.good) return "good";
  if (score >= HEALTH_THRESHOLDS.ok) return "ok";
  return "risk";
}

export const HEALTH_LEVEL_LABEL: Record<HealthLevel, string> = {
  good: "Отличный",
  ok: "Нормальный",
  risk: "Под угрозой",
};

export const HEALTH_TEXT_CLASS: Record<HealthLevel, string> = {
  good: "text-emerald-600",
  ok: "text-amber-500",
  risk: "text-red-500",
};

export const HEALTH_BADGE_CLASS: Record<HealthLevel, string> = {
  good: "bg-emerald-50 text-emerald-700",
  ok: "bg-amber-50 text-amber-700",
  risk: "bg-red-50 text-red-700",
};

export const HEALTH_BAR_CLASS: Record<HealthLevel, string> = {
  good: "bg-emerald-400",
  ok: "bg-amber-400",
  risk: "bg-red-400",
};

/** Hex-цвета для recharts, который не понимает Tailwind-классы. */
export const HEALTH_HEX: Record<HealthLevel, string> = {
  good: "#10b981",
  ok: "#f59e0b",
  risk: "#ef4444",
};

export const healthTextClass = (score: number) => HEALTH_TEXT_CLASS[healthLevel(score)];

export const healthBadgeClass = (score: number) =>
  score === 0 ? "bg-slate-50 text-slate-400" : HEALTH_BADGE_CLASS[healthLevel(score)];
