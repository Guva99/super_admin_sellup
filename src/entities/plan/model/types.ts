/** Тариф — форма Plan из Swagger бэкенда. */
export interface Plan {
  id: string;
  /** Системный код: "full", "early_access", "custom"; null у тарифов, добавленных позже. */
  code: string | null;
  name: string;
  description: string;
  /** Цена в месяц. */
  price: number;
  /** Разовая оплата за подключение. */
  setupPrice: number;
  /** Цена задаётся для каждого клиента при подключении. */
  isCustom: boolean;
  status: "ACTIVE" | "ARCHIVED";
}

export interface PlanInput {
  name: string;
  description: string;
  price: number;
  setupPrice: number;
  isCustom: boolean;
}
