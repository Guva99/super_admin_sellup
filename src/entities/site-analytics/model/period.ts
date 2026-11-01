import { MOSCOW_TIME_ZONE } from "@/shared/lib";
import type { TrafficGroupBy, TrafficPeriod } from "./types";

/**
 * Периоды раздела «Посещаемость». Сутки — московские, как и на бэкенде:
 * «сегодня» считается по Москве, а не по часовому поясу браузера.
 * Даты — календарные YYYY-MM-DD; арифметика идёт в UTC, чтобы ни один пояс
 * не сдвинул день.
 */

/** Бэкенд принимает не больше 366 дней за раз. */
export const MAX_PERIOD_DAYS = 366;

/**
 * Сводки по дням короткого периода раздел пересчитывает сам при открытии;
 * длинного — только кнопкой: пересчёт года заметно грузит базу.
 */
export const AUTO_AGGREGATE_MAX_DAYS = 31;

const DAY_MS = 86_400_000;

const toUtc = (ymd: string) => Date.parse(`${ymd}T00:00:00Z`);
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function todayMoscow(now = new Date()): string {
  // en-CA даёт ровно YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: MOSCOW_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function addDays(ymd: string, days: number): string {
  return fromUtc(toUtc(ymd) + days * DAY_MS);
}

/** Дней в периоде, обе границы включительно. */
export function periodDays(period: TrafficPeriod): number {
  return Math.round((toUtc(period.to) - toUtc(period.from)) / DAY_MS) + 1;
}

const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toUtc(value));

/** Что не так с периодом — или null, если его можно запрашивать. */
export function periodError(period: TrafficPeriod): string | null {
  if (!isDate(period.from) || !isDate(period.to)) return "Укажите обе даты";
  if (period.from > period.to) return "Начало периода позже конца";
  if (periodDays(period) > MAX_PERIOD_DAYS) return `Период — не больше ${MAX_PERIOD_DAYS} дней`;
  return null;
}

/**
 * Период вместе с предыдущим такой же длины: обзор сравнивает с ним цифры,
 * и его сводки тоже должны быть свежими. Не влезают вместе в лимит — только сам период.
 */
export function withPreviousPeriod(period: TrafficPeriod): TrafficPeriod {
  const extended = { from: addDays(period.from, -periodDays(period)), to: period.to };
  return periodDays(extended) <= MAX_PERIOD_DAYS ? extended : period;
}

/** Длинный период по дням — частокол; с двух месяцев точки идут по неделям. */
export function defaultGroupBy(period: TrafficPeriod): TrafficGroupBy {
  return periodDays(period) > 62 ? "week" : "day";
}

export type PeriodPreset = "today" | "7d" | "30d" | "90d" | "month" | "prev_month" | "custom";

export const PERIOD_PRESETS: { id: PeriodPreset; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "7d", label: "7 дней" },
  { id: "30d", label: "30 дней" },
  { id: "90d", label: "90 дней" },
  { id: "month", label: "Этот месяц" },
  { id: "prev_month", label: "Прошлый месяц" },
  { id: "custom", label: "Свой период" },
];

/** Период пресета на сегодняшний московский день; у «своего» периода дат нет — null. */
export function presetPeriod(preset: PeriodPreset, today = todayMoscow()): TrafficPeriod | null {
  const monthStart = `${today.slice(0, 8)}01`;
  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "7d":
      return { from: addDays(today, -6), to: today };
    case "30d":
      return { from: addDays(today, -29), to: today };
    case "90d":
      return { from: addDays(today, -89), to: today };
    case "month":
      return { from: monthStart, to: today };
    case "prev_month": {
      const lastOfPrev = addDays(monthStart, -1);
      return { from: `${lastOfPrev.slice(0, 8)}01`, to: lastOfPrev };
    }
    case "custom":
      return null;
  }
}

/** Какому пресету соответствует период — чтобы ссылка с датами открывалась с подсвеченной кнопкой. */
export function presetOf(period: TrafficPeriod, today = todayMoscow()): PeriodPreset {
  const match = PERIOD_PRESETS.find(({ id }) => {
    const p = presetPeriod(id, today);
    return p && p.from === period.from && p.to === period.to;
  });
  return match?.id ?? "custom";
}
