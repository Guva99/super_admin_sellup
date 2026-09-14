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

/**
 * Настройки оси Y под данные. Пока данных нет, ось показывает один ноль:
 * иначе recharts сам придумывает шкалу 0–4, и пустой график выглядит так,
 * будто на нём что-то измерено.
 */
export function valueAxis(values: number[]) {
  const max = Math.max(0, ...values);
  return {
    allowDecimals: false,
    domain: [0, max || 1] as [number, number],
    ticks: max ? undefined : [0],
  };
}
