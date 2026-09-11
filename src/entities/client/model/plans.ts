import type { ClientPlan } from "./types";

/**
 * Прайс-лист. Единственный источник правды по ценам: и экран настроек,
 * и расчёт потенциального апсейла в биллинге читают отсюда.
 */
export interface PlanDefinition {
  id: ClientPlan;
  name: string;
  price: number;
  setup: number;
  description: string;
}

export const PLANS: PlanDefinition[] = [
  { id: "full", name: "Полный", price: 70_000, setup: 15_000, description: "CRM + Омниканал + Склад + Сайт" },
  { id: "early_access", name: "Ранний доступ", price: 5_000, setup: 0, description: "Льготный тариф для первых 5 клиентов" },
];

/** Цена полного тарифа — база для расчёта апсейла с раннего доступа. */
export const FULL_PLAN_PRICE = PLANS[0].price;

export const PLAN_LABEL: Record<ClientPlan, string> = {
  full: "Полный",
  early_access: "Ранний доступ",
  custom: "Кастомный",
};
