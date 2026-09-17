/** Сроки и «дней в статусе» считаются по Москве, а не по часовому поясу браузера. */
export const MOSCOW_TIME_ZONE = "Europe/Moscow";

const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;

/** Порядковый номер календарного дня в поясе — чтобы «вчера 23:50 → сегодня 00:10» было одним днём. */
function dayNumber(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return Math.floor(Date.UTC(part("year"), part("month") - 1, part("day")) / DAY_MS);
}

/** Полных календарных дней между датой и «сейчас» по московскому календарю. */
export function calendarDaysSince(iso: string, now = new Date(), timeZone = MOSCOW_TIME_ZONE): number {
  return Math.max(0, dayNumber(now, timeZone) - dayNumber(new Date(iso), timeZone));
}

/** «14 сент., 12:30» по Москве. */
export function formatDateTimeMoscow(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", { timeZone: MOSCOW_TIME_ZONE, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Часы для человека: «0 ч», «< 1 ч», «7 ч», «2 д 5 ч». */
export function formatHours(hours: number): string {
  if (hours <= 0) return "0 ч";
  if (hours < 1) return "< 1 ч";
  const whole = Math.round(hours);
  if (whole < 48) return `${whole} ч`;
  return `${Math.floor(whole / 24)} д ${whole % 24} ч`;
}
