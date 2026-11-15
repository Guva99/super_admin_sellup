import type { AccessInviteOutcome } from "./types";

/** Домен, на котором живут магазины клиентов: <slug>.<домен>. */
export const CLIENT_ROOT_DOMAIN = (import.meta.env.VITE_CLIENT_ROOT_DOMAIN ?? "sellup-system.online").replace(/^\.+|\.+$/g, "");

/** Адреса магазина по его slug: витрина и админка. */
export function clientAddresses(slug: string) {
  return {
    storefront: `https://${slug}.${CLIENT_ROOT_DOMAIN}`,
    admin: `https://admin.${slug}.${CLIENT_ROOT_DOMAIN}`,
  };
}

/** Что вводят в поле адреса: строчные латинские буквы, цифры и дефис. */
export const normaliseSlugInput = (value: string) => value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);

/** Те же правила, что на бэкенде (service.NormaliseSlug); занятость проверяет он. */
export function slugError(slug: string): string | null {
  if (slug.length < 3) return "Адрес — не короче 3 символов";
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug) || slug.includes("--")) {
    return "Латинские буквы, цифры и дефис; начинается и кончается буквой или цифрой";
  }
  return null;
}

const PROBLEM: Record<NonNullable<AccessInviteOutcome["reason"]>, string> = {
  NO_SLUG: "не задан адрес магазина",
  NO_EMAIL: "не указана почта владельца",
  EMAIL_TAKEN: "с этой почтой уже входит другой кабинет или сотрудник",
  INVALID_EMAIL: "почта владельца указана с ошибкой",
  FAILED: "не удалось отправить",
};

/** Почему письмо доступа не ушло — словами. */
export const accessInviteProblem = (reason: AccessInviteOutcome["reason"]) => PROBLEM[reason ?? "FAILED"];

/** Разделы из заявки (ключи модулей бэкенда) — подписи для менеджера. */
export const CLIENT_SECTION_LABEL: Record<string, string> = {
  CRM: "CRM и заказы",
  WAREHOUSE: "Склад",
  ANALYTICS: "Аналитика",
  FINANCE: "Финансы",
  MARKETPLACE: "Маркетплейсы",
  OZON: "Ozon",
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
  AI: "ИИ-продавец",
  SITE_BUILDER: "Сайт",
};
