import { useMemo } from "react";
import { useTheme } from "@/shared/lib";

/**
 * recharts не понимает Tailwind-классы и принимает только строковые цвета,
 * поэтому палитра графиков живёт здесь и повторяет токены из index.css.
 * Это акценты — они одинаковые в светлой и тёмной теме.
 */
export const CHART_COLORS = {
  brand: "#fd622c",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
} as const;

/**
 * Нейтральные цвета графиков — сетка, подписи осей, подложки — зависят от темы.
 * Берём вычисленные значения переменных темы из index.css и перечитываем их
 * при её смене, чтобы не держать второй набор hex-ов для тёмной темы.
 */
export function useChartColors() {
  const [theme] = useTheme();
  return useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    const read = (name: string) => css.getPropertyValue(name).trim();
    return {
      grid: read("--color-ink-100"),
      gridStrong: read("--color-ink-200"),
      axis: read("--color-ink-400"),
    };
    // theme — не данные для расчёта, а сигнал перечитать переменные после смены темы.
  }, [theme]);
}

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
