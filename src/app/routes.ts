import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CheckSquare,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type PageId =
  | "dashboard"
  | "clients"
  | "client-detail"
  | "pipeline"
  | "tasks"
  | "metrics"
  | "settings";

export interface RouteDefinition {
  id: PageId;
  /** Заголовок в шапке. */
  title: string;
  /** Подпись в боковом меню. Отсутствует — страница в меню не показывается. */
  navLabel?: string;
  icon?: LucideIcon;
  /** Пункт меню, который подсвечивается на этой странице. */
  activeAs?: PageId;
  /** Размещение в меню: основной список или низ панели. */
  placement?: "main" | "bottom";
  /** Показывать счётчик задач с высоким приоритетом. */
  showTaskBadge?: boolean;
}

/**
 * Единственное место, где описаны страницы.
 * Раньше это были четыре параллельных списка в App.tsx, которые надо было править синхронно.
 */
export const ROUTES: RouteDefinition[] = [
  { id: "dashboard", title: "Дашборд", navLabel: "Дашборд", icon: LayoutDashboard, placement: "main" },
  { id: "clients", title: "Клиенты", navLabel: "Клиенты", icon: Users, placement: "main" },
  { id: "client-detail", title: "Карточка клиента", activeAs: "clients" },
  { id: "pipeline", title: "Онбординг Pipeline", navLabel: "Онбординг", icon: KanbanSquare, placement: "main" },
  { id: "tasks", title: "Задачи", navLabel: "Задачи", icon: CheckSquare, placement: "main", showTaskBadge: true },
  { id: "metrics", title: "Метрики продукта", navLabel: "Метрики", icon: BarChart3, placement: "main" },
  { id: "settings", title: "Настройки", navLabel: "Настройки", icon: Settings, placement: "bottom" },
];

const byId = new Map(ROUTES.map((route) => [route.id, route]));

export const routeTitle = (id: PageId) => byId.get(id)?.title ?? "";

/** Какой пункт меню подсвечен на этой странице. */
export const activeNavId = (id: PageId): PageId => byId.get(id)?.activeAs ?? id;

export const navRoutes = (placement: "main" | "bottom") =>
  ROUTES.filter((route) => route.navLabel && route.placement === placement);
