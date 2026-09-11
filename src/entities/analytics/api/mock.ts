import type { MrrPoint, AttentionItem, UpcomingEvent, MonthlyHours, OnboardingDuration } from "../model/types";

export const mrrHistory: MrrPoint[] = [
  { month: "Апр", mrr: 245000, clients: 4 },
  { month: "Май", mrr: 290000, clients: 5 },
  { month: "Июн", mrr: 320000, clients: 6 },
  { month: "Июл", mrr: 345000, clients: 7 },
  { month: "Авг", mrr: 360000, clients: 8 },
  { month: "Сен", mrr: 400000, clients: 9 },
];

export const attentionItems: AttentionItem[] = [
  { id: "a1", type: "payment" as const, clientId: "4", client: "Детский мир «Карапуз»", message: "Просрочен платёж 70 000 ₽ за август", severity: "high" as const },
  { id: "a2", type: "payment" as const, clientId: "7", client: "Сеть «Бытовой»", message: "Просрочен платёж 70 000 ₽. Клиент на паузе 45 дней", severity: "high" as const },
  { id: "a3", type: "health" as const, clientId: "7", client: "Сеть «Бытовой»", message: "Health score упал до 38 — риск оттока", severity: "high" as const },
  { id: "a4", type: "integration" as const, clientId: "3", client: "ТД «Хозяин»", message: "1С не подключается 36 дней", severity: "medium" as const },
  { id: "a5", type: "onboarding" as const, clientId: "11", client: "SportLife", message: "Онбординг длится 48 дней — превышен целевой срок 30 дней", severity: "medium" as const },
  { id: "a6", type: "integration" as const, clientId: "2", client: "«Модный квартал»", message: "Wildberries: ошибка авторизации API", severity: "low" as const },
];

export const upcomingEvents: UpcomingEvent[] = [
  { id: "e1", date: "2026-09-10", type: "training" as const, client: "Магазин «Тренд»", title: "Обучение команды по CRM" },
  { id: "e2", date: "2026-09-15", type: "renewal" as const, client: "Книжный «Слово»", title: "Продление договора" },
  { id: "e3", date: "2026-09-20", type: "launch" as const, client: "Магазин «Тренд»", title: "Запуск платформы" },
  { id: "e4", date: "2026-10-01", type: "launch" as const, client: "ТД «Хозяин»", title: "Плановый запуск" },
  { id: "e5", date: "2026-12-01", type: "pricing" as const, client: "«АгроМаркет»", title: "Конец кастомного тарифа (45k → 70k)" },
];

export const monthlyHours: MonthlyHours[] = [
  { month: "Апр", avg: 28, target: 20 },
  { month: "Май", avg: 35, target: 20 },
  { month: "Июн", avg: 31, target: 20 },
  { month: "Июл", avg: 24, target: 20 },
  { month: "Авг", avg: 22, target: 20 },
  { month: "Сен", avg: 19, target: 20 },
];

export const onboardingDuration: OnboardingDuration[] = [
  { month: "Янв", days: 52 },
  { month: "Фев", days: 48 },
  { month: "Мар", days: 44 },
  { month: "Апр", days: 40 },
  { month: "Май", days: 36 },
  { month: "Июн", days: 34 },
];

export interface RetentionCohort {
  cohort: string;
  m0: number | null;
  m1: number | null;
  m2: number | null;
  m3: number | null;
  m6: number | null;
  m12: number | null;
}

export const retentionCohorts: RetentionCohort[] = [
  { cohort: "Янв 24", m0: 100, m1: 100, m2: 100, m3: 100, m6: 100, m12: 100 },
  { cohort: "Мар 24", m0: 100, m1: 100, m2: 100, m3: 100, m6: 100, m12: null },
  { cohort: "Май 24", m0: 100, m1: 100, m2: 100, m3: 100, m6: 87, m12: null },
  { cohort: "Авг 24", m0: 100, m1: 100, m2: 100, m3: 89, m6: null, m12: null },
];
