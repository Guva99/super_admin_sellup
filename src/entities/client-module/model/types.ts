/**
 * Модули админки IRP, которые менеджер включает клиенту после созвона.
 * Ключ — ключ фичи control plane; IRP получает его в нижнем регистре
 * (CRM → crm) через реестр клиентов. Заказы и каталог — ядро, их не
 * выключают, поэтому здесь их нет.
 */
export const ADMIN_MODULES = [
  { key: "CRM", title: "CRM", hint: "Клиенты, задачи и отчёты" },
  { key: "FINANCE", title: "Финансы", hint: "Статистика продаж и каналы" },
  { key: "LOYALTY", title: "Лояльность", hint: "Бонусные баллы покупателей" },
  { key: "WEBVISOR", title: "Вебвизор", hint: "Записи визитов витрины" },
] as const;

export type AdminModuleKey = (typeof ADMIN_MODULES)[number]["key"];

/** Запись бэкенда GET /clients/{id}/features. */
export interface ClientFeature {
  featureKey: string;
  state: "ENABLED" | "DISABLED" | "BETA" | "LIMITED";
}

/** Включён ли модуль: всё, кроме DISABLED (так считает и реестр). */
export const isModuleOn = (state: ClientFeature["state"] | undefined): boolean =>
  state !== undefined && state !== "DISABLED";
