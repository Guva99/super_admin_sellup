import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CheckSquare,
  Wallet,
  Plug,
  BarChart3,
  MousePointerClick,
  FileText,
  Globe,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter, type RouteObject } from "react-router-dom";

import { canEditBlog, canViewSiteTraffic } from "@/entities/user";
import { LoginPage } from "@/pages/login";
import { RootApp } from "./ui/RootApp";
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
const TrafficPage = lazyPage(() => import("@/pages/traffic"), "TrafficPage");
const BlogPostsPage = lazyPage(() => import("@/pages/blog-posts"), "BlogPostsPage");
const BlogPostPage = lazyPage(() => import("@/pages/blog-post"), "BlogPostPage");
const SettingsPage = lazyPage(() => import("@/pages/settings"), "SettingsPage");
const SignupPage = lazyPage(() => import("@/pages/signup"), "SignupPage");
const ForgotPasswordPage = lazyPage(() => import("@/pages/password-reset"), "ForgotPasswordPage");
const ResetPasswordPage = lazyPage(() => import("@/pages/password-reset"), "ResetPasswordPage");
const VerifyEmailPage = lazyPage(() => import("@/pages/verify-email"), "VerifyEmailPage");

/** Публичные страницы лежат вне каркаса — у них свой Suspense. */
const standalone = (page: ReactNode) => <Suspense fallback={null}>{page}</Suspense>;

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
  /** Пункт меню только для этих ролей; без поля — для всех. Страница проверяет доступ сама. */
  visibleTo?: (roleKey: string | undefined) => boolean;
  /** Пункт стоит внутри раскрывающегося раздела меню (NAV_GROUPS), а не сам по себе. */
  group?: NavGroupId;
}

/** Разделы-папки меню: подпись и иконка; пункты внутри — маршруты с этим group. */
export const NAV_GROUPS = {
  landing: { label: "Лендинг", icon: Globe },
} satisfies Record<string, { label: string; icon: LucideIcon }>;

export type NavGroupId = keyof typeof NAV_GROUPS;

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
    // Карточка задачи — модалка поверх доски; адрес нужен, чтобы делиться ссылкой.
    path: "/tasks/:taskId",
    element: <TasksPage />,
    handle: { title: "Задачи" },
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
    // Вкладка — в пути (/traffic/pages), период и карта кликов — в запросе.
    path: "/traffic/:tab?",
    element: <TrafficPage />,
    handle: {
      title: "Аналитика лендинга",
      navLabel: "Аналитика",
      icon: MousePointerClick,
      placement: "main",
      group: "landing",
      visibleTo: canViewSiteTraffic,
    },
  },
  {
    path: "/landing/posts",
    element: <BlogPostsPage />,
    handle: { title: "Статьи блога", navLabel: "Статьи", icon: FileText, placement: "main", group: "landing", visibleTo: canEditBlog },
  },
  {
    // new — новая статья; id появляется с первым сохранением.
    path: "/landing/posts/:postId",
    element: <BlogPostPage />,
    handle: { title: "Статья блога" },
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    handle: { title: "Настройки", navLabel: "Настройки", icon: Settings, placement: "bottom" },
  },
];

/** Разделы меню в нужной части панели, в порядке объявления, — те, что видны роли. */
export const navRoutes = (placement: "main" | "bottom", roleKey: string | undefined) =>
  APP_ROUTES.filter(
    (route) => route.handle.navLabel && route.handle.placement === placement && (route.handle.visibleTo?.(roleKey) ?? true),
  );

export const router = createBrowserRouter([
  {
    // Импортирован статически, а не лениво: для невошедшего пользователя это
    // первый экран, ждать его чанк незачем.
    path: "/login",
    element: <LoginPage />,
  },
  // Без входа: регистрация бизнеса и ссылки из писем кабинета.
  { path: "/signup", element: standalone(<SignupPage />) },
  { path: "/forgot-password", element: standalone(<ForgotPasswordPage />) },
  { path: "/reset-password", element: standalone(<ResetPasswordPage />) },
  { path: "/verify-email", element: standalone(<VerifyEmailPage />) },
  {
    // Всё остальное — только после входа: сотруднику консоль
    // (AuthenticatedApp), бизнесу — его кабинет (см. RootApp).
    path: "/",
    element: <RootApp />,
    children: [...APP_ROUTES, { path: "*", element: <NotFoundPage />, handle: { title: "Страница не найдена" } }],
  },
]);
