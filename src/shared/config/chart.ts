/**
 * recharts не понимает Tailwind-классы и принимает только строковые цвета,
 * поэтому палитра графиков живёт здесь и повторяет токены из index.css.
 */
export const CHART_COLORS = {
  brand: "#fd622c",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  slate: "#94a3b8",
  grid: "#e2e8f0",
} as const;
