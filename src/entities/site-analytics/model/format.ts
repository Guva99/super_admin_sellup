import type { HeatmapDevice, TrafficGroupBy } from "./types";

/* Подписи того, что бэкенд отдаёт ключами. Неизвестный ключ показывается как есть. */

const SOURCE_LABEL: Record<string, string> = {
  direct: "Прямые заходы",
  search: "Поисковые системы",
  social: "Соцсети и мессенджеры",
  ads: "Реклама",
  email: "Рассылки",
  referral: "Переходы с сайтов",
  campaign: "Метки UTM",
};

const DEVICE_LABEL: Record<string, string> = {
  desktop: "Компьютеры",
  mobile: "Телефоны",
  tablet: "Планшеты",
  unknown: "Не определено",
};

/** Типы страниц лендинга — их ставит счётчик сайта (sellup_web, siteAnalyticsClassify.ts). */
const PAGE_TYPE_LABEL: Record<string, string> = {
  home: "Главная",
  feature: "Возможность",
  legal: "Документы",
  archive: "Старая версия",
  other: "Другое",
};

export const HEATMAP_DEVICE_LABEL: Record<HeatmapDevice, string> = {
  desktop: "Компьютер",
  tablet: "Планшет",
  mobile: "Телефон",
};

export const sourceLabel = (source: string) => SOURCE_LABEL[source] ?? source;
export const deviceLabel = (device: string) => DEVICE_LABEL[device] ?? device;
export const pageTypeLabel = (pageType: string) => PAGE_TYPE_LABEL[pageType] ?? pageType;

/** «2 мин 5 с», «45 с», «0 с». */
export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  if (total <= 0) return "0 с";
  if (total < 60) return `${total} с`;
  if (total < 3600) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return s ? `${m} мин ${s} с` : `${m} мин`;
  }
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

export const formatCount = (value: number) => value.toLocaleString("ru-RU");

export const formatPercent = (value: number) => `${value.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} %`;

/** Подпись точки графика: «5 нояб.» или «с 3 нояб.» для недели. */
export function formatPointLabel(ymd: string, groupBy: TrafficGroupBy): string {
  const label = new Date(`${ymd}T12:00:00Z`).toLocaleDateString("ru-RU", { day: "numeric", month: "short", timeZone: "UTC" });
  return groupBy === "week" ? `с ${label}` : label;
}

/** «1 нояб. 2026 — 7 нояб. 2026» короче: «1–7 нояб.», если месяц один. */
export function formatPeriod(from: string, to: string): string {
  const fmt = (ymd: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${ymd}T12:00:00Z`).toLocaleDateString("ru-RU", { ...opts, timeZone: "UTC" });
  if (from === to) return fmt(from, { day: "numeric", month: "long", year: "numeric" });
  if (from.slice(0, 7) === to.slice(0, 7)) return `${fmt(from, { day: "numeric" })}–${fmt(to, { day: "numeric", month: "long", year: "numeric" })}`;
  return `${fmt(from, { day: "numeric", month: "short" })} — ${fmt(to, { day: "numeric", month: "short", year: "numeric" })}`;
}

/** Хост без протокола и www. — подпись сайта-источника. */
export function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

/** Время плеера: «0:42», «12:05», «1:02:03». */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/**
 * Короткая метка анонимного посетителя — «#K3F9»: идентификатор из браузера
 * длинный и ничего не говорит, а различать посетителей в списке нужно.
 */
export function visitorLabel(visitorId: string): string {
  // FNV-1a: одна и та же метка для одного посетителя в любом месте консоли.
  let hash = 0x811c9dc5;
  for (let i = 0; i < visitorId.length; i++) {
    hash ^= visitorId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `#${(hash >>> 0).toString(36).toUpperCase().padStart(4, "0").slice(-4)}`;
}
