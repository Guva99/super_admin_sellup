import type { MonthlyHours, MrrPoint, OnboardingDuration } from "./types";

/**
 * Пустые ряды для графиков: истории в бэкенде пока нет, и показывать вместо
 * неё выдуманные цифры нельзя. Подписи месяцев — последние `count` месяцев,
 * считая текущий; значения — нули, пока не появится API аналитики.
 */
const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

export function lastMonths(count: number, now: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return MONTHS[date.getMonth()];
  });
}

export const emptyMrrHistory = (months = 6): MrrPoint[] =>
  lastMonths(months).map((month) => ({ month, mrr: 0, clients: 0 }));

export const emptyMonthlyHours = (target: number, months = 6): MonthlyHours[] =>
  lastMonths(months).map((month) => ({ month, avg: 0, target }));

export const emptyOnboardingDuration = (months = 6): OnboardingDuration[] =>
  lastMonths(months).map((month) => ({ month, days: 0 }));
