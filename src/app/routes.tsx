import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CheckSquare,
  Wallet,
  Plug,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { lazy, type ComponentType } from "react";
import { createBrowserRouter, type RouteObject } from "react-router-dom";

import { LoginPage } from "@/pages/login";
import { AuthenticatedApp } from "./ui/AuthenticatedApp";
import { NotFoundPage } from "./ui/NotFoundPage";

/**
 * Страницы грузятся по требованию: recharts тянут только дашборд, метрики и
 * биллинг, и без разбиения они попадали в общий бандл, который качает даже
 * тот, кто открыл «Настройки». Импорт идёт через бочку слайса, а не напрямую
 * в ui/, чтобы не ломать правило «наружу — только через index.ts».
 */
const lazyPage = <T extends string>(load: () => Promise<Record<T, ComponentType>>, name: T) =>
  lazy(() => load().then((module) => ({ default: module[name] })));

const DashboardPage = lazyPage(() => import("@/pages/dashboard"), "DashboardPage");
const ClientsPage = lazyPage(() => import("@/pages/clients"), "ClientsPage");
const ClientDetailPage = lazyPage(() => import("@/pages/client-detail"), "ClientDetailPage");
const PipelinePage = lazyPage(() => import("@/pages/pipeline"), "PipelinePage");
const TasksPage = lazyPage(() => import("@/pages/tasks"), "TasksPage");
const BillingPage = lazyPage(() => import("@/pages/billing"), "BillingPage");
const IntegrationsPage = lazyPage(() => import("@/pages/integrations"), "IntegrationsPage");
const MetricsPage = lazyPage(() => import("@/pages/metrics"), "MetricsPage");
const SettingsPage = lazyPage(() => import("@/pages/settings"), "SettingsPage");

/**
 * Данные раздела, которые нужны шапке и меню. Кладутся в route.handle,
 * поэтому и заголовок, и подсветка пункта меню выводятся из одного описания
 * маршрута — параллельных списков, которые надо править синхронно, больше нет.
 */
export interface RouteHandle {
  /** Заголовок в шапке. */
  title: string;
  /** Подпись в меню. Отсутствует — раздела в меню нет (напр. карточка клиента). */
  navLabel?: string;
  icon?: LucideIcon;
  /** Размещение в меню: основной список или низ панели. */
  placement?: "main" | "bottom";
  /** Показывать счётчик задач высокого приоритета. */
  showTaskBadge?: boolean;
}

type AppRoute = RouteObject & {
  path: string;
  handle: RouteHandle;
};

/**
 * Единственное место, где описаны разделы. Путь — часть описания, поэтому
 * URL, заголовок и пункт меню не могут разъехаться.
 */
export const APP_ROUTES: AppRoute[] = [
  {
    path: "/",
    element: <DashboardPage />,
    handle: { title: "Дашборд", navLabel: "Дашборд", icon: LayoutDashboard, placement: "main" },
  },
  {
    path: "/clients",
    element: <ClientsPage />,
    handle: { title: "Клиенты", navLabel: "Клиенты", icon: Users, placement: "main" },
  },
  {
    // :tab необязателен — /clients/c1 открывает вкладку «Обзор».
    path: "/clients/:clientId/:tab?",
    element: <ClientDetailPage />,
    handle: { title: "Карточка клиента" },
  },
  {
    path: "/pipeline",
    element: <PipelinePage />,
    handle: { title: "Онбординг Pipeline", navLabel: "Онбординг", icon: KanbanSquare, placement: "main" },
  },
  {
    path: "/tasks",
    element: <TasksPage />,
    handle: { title: "Задачи", navLabel: "Задачи", icon: CheckSquare, placement: "main", showTaskBadge: true },
  },
  {
    path: "/billing",
    element: <BillingPage />,
    handle: { title: "Биллинг и финансы", navLabel: "Биллинг", icon: Wallet, placement: "main" },
  },
  {
    path: "/integrations",
    element: <IntegrationsPage />,
    handle: { title: "Интеграции", navLabel: "Интеграции", icon: Plug, placement: "main" },
  },
  {
    path: "/metrics",
    element: <MetricsPage />,
    handle: { title: "Метрики продукта", navLabel: "Метрики", icon: BarChart3, placement: "main" },
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    handle: { title: "Настройки", navLabel: "Настройки", icon: Settings, placement: "bottom" },
  },
];

/** Разделы меню в нужной части панели, в порядке объявления. */
export const navRoutes = (placement: "main" | "bottom") =>
  APP_ROUTES.filter((route) => route.handle.navLabel && route.handle.placement === placement);

export const router = createBrowserRouter([
  {
    // Единственный публичный маршрут. Импортирован статически, а не лениво:
    // для невошедшего пользователя это первый экран, ждать его чанк незачем.
    path: "/login",
    element: <LoginPage />,
  },
  {
    // Всё остальное — только после входа (см. AuthenticatedApp).
    path: "/",
    element: <AuthenticatedApp />,
    children: [...APP_ROUTES, { path: "*", element: <NotFoundPage />, handle: { title: "Страница не найдена" } }],
  },
]);
