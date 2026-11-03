import { useState } from "react";
import { CircleDot, ChevronDown, ChevronLeft, Plus, Building2, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { useSession } from "@/entities/session";
import { useTasks } from "@/entities/task";
import { ThemeToggle, useThemeToggle } from "@/features/toggle-theme";
import { useUiActions } from "@/shared/lib";
import { NAV_GROUPS, navRoutes, type NavGroupId } from "../routes";

type NavRoute = ReturnType<typeof navRoutes>[number];
type NavEntry = { kind: "route"; route: NavRoute } | { kind: "group"; id: NavGroupId; routes: NavRoute[] };

/** Пункты меню по порядку; пункты одного раздела собираются в него — там, где стоит первый из них. */
function navEntries(routes: NavRoute[]): NavEntry[] {
  const entries: NavEntry[] = [];
  for (const route of routes) {
    const group = route.handle.group;
    if (!group) entries.push({ kind: "route", route });
    else if (!entries.some((e) => e.kind === "group" && e.id === group))
      entries.push({ kind: "group", id: group, routes: routes.filter((r) => r.handle.group === group) });
  }
  return entries;
}

/** Начало адреса раздела без параметров: «/traffic/:tab?» → «/traffic». */
const basePath = (path: string) => path.replace(/\/:.*$/, "") || "/";

/** Какие разделы меню свёрнуты — запоминается в браузере. По умолчанию все раскрыты. */
const CLOSED_GROUPS_KEY = "sellup.nav.closed";
function readClosedGroups(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CLOSED_GROUPS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const initials = (fullName: string) =>
  fullName.split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "?";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/**
 * Меню строится из APP_ROUTES, подсветка — на NavLink: активный пункт
 * определяется адресом, а не отдельным пропсом. Карточка клиента
 * (/clients/:id) сама подсвечивает «Клиенты», потому что это вложенный путь.
 */
export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const { highPriorityCount } = useTasks();
  const { openConnectBusiness, openCreateTask } = useUiActions();
  const { user, logout } = useSession();
  const themeToggle = useThemeToggle();
  const { pathname } = useLocation();
  const [closedGroups, setClosedGroups] = useState(readClosedGroups);
  const toggleGroup = (id: string) =>
    setClosedGroups((prev) => {
      const next = prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id];
      try {
        localStorage.setItem(CLOSED_GROUPS_KEY, JSON.stringify(next));
      } catch {
        // Хранилище недоступно — раздел просто не запомнит состояние.
      }
      return next;
    });

  const navLinkClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
      collapsed ? "justify-center" : ""
    } ${isActive ? "bg-brand-50 text-brand-600 font-medium" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"}`;

  const navItem = (route: NavRoute) => {
    const Icon = route.handle.icon!;
    const badge = route.handle.showTaskBadge ? highPriorityCount : 0;
    return (
      <NavLink
        to={route.path}
        end={route.path === "/"}
        className={({ isActive }) => navLinkClass(isActive)}
        title={collapsed ? route.handle.navLabel : undefined}
      >
        <Icon size={16} className="flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{route.handle.navLabel}</span>
            {badge > 0 && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">{badge}</span>}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={`flex flex-col bg-surface border-r border-ink-200 transition-all duration-200 ease-in-out flex-shrink-0 ${
        collapsed ? "w-14" : "w-[220px]"
      }`}
    >
      <div
        className={`flex items-center gap-2.5 px-3.5 border-b border-ink-200 flex-shrink-0 ${
          collapsed ? "justify-center py-3.5" : "py-3.5"
        }`}
        style={{ height: 49 }}
      >
        <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          <CircleDot size={14} className="text-white" />
        </div>
        {!collapsed && <span className="text-sm font-semibold text-ink-900 truncate">SellUp Console</span>}
      </div>

      {!collapsed && (
        <div className="px-3 pt-3 space-y-1.5">
          <button
            onClick={openConnectBusiness}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors"
          >
            <Building2 size={13} />
            Подключить бизнес
          </button>
          <button
            onClick={() => openCreateTask()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-ink-200 hover:border-ink-300 hover:bg-ink-50 text-ink-600 text-xs font-medium transition-colors"
          >
            <Plus size={13} />
            Добавить задачу
          </button>
        </div>
      )}
      {collapsed && (
        <div className="px-1.5 pt-3 space-y-1.5">
          <button
            onClick={openConnectBusiness}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            title="Подключить бизнес"
          >
            <Building2 size={14} />
          </button>
          <button
            onClick={() => openCreateTask()}
            className="w-full flex items-center justify-center p-2 rounded-lg border border-ink-200 hover:bg-ink-50 text-ink-500 transition-colors"
            title="Добавить задачу"
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      <nav className="flex-1 py-2 overflow-y-auto">
        <ul className="px-2 space-y-0.5">
          {navEntries(navRoutes("main", user?.roleKey)).map((entry) => {
            if (entry.kind === "route") return <li key={entry.route.path}>{navItem(entry.route)}</li>;
            const group = NAV_GROUPS[entry.id];
            // В узком меню раздела нет — только иконки его пунктов.
            if (collapsed) return entry.routes.map((route) => <li key={route.path}>{navItem(route)}</li>);
            const open = !closedGroups.includes(entry.id);
            const childActive = entry.routes.some((route) => pathname.startsWith(basePath(route.path)));
            const GroupIcon = group.icon;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.id)}
                  aria-expanded={open}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors hover:bg-ink-50 ${
                    childActive && !open ? "text-brand-600 font-medium" : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  <GroupIcon size={16} className="flex-shrink-0" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown size={13} className={`text-ink-400 transition-transform ${open ? "" : "-rotate-90"}`} />
                </button>
                {open && <ul className="mt-0.5 ml-[18px] pl-2 border-l border-ink-100 space-y-0.5">{entry.routes.map((route) => <li key={route.path}>{navItem(route)}</li>)}</ul>}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-ink-200 py-2 px-2 space-y-0.5">
        {navRoutes("bottom", user?.roleKey).map((route) => {
          const Icon = route.handle.icon!;
          return (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) => navLinkClass(isActive)}
              title={collapsed ? route.handle.navLabel : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span>{route.handle.navLabel}</span>}
            </NavLink>
          );
        })}
        <div className={`flex items-center gap-2.5 px-2.5 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-brand-600">{user ? initials(user.fullName) : "?"}</span>
          </div>
          {!collapsed && (
            <>
              <span className="text-xs text-ink-600 flex-1 truncate">{user?.fullName}</span>
              <button onClick={logout} title="Выйти" aria-label="Выйти" className="text-ink-400 hover:text-ink-700 flex-shrink-0">
                <LogOut size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-ink-200 flex">
        <ThemeToggle controller={themeToggle} className="flex-1" />
        <button
          onClick={onToggleCollapsed}
          className="flex-1 border-l border-ink-200 flex items-center justify-center py-2 text-ink-400 hover:text-ink-600 hover:bg-ink-50 transition-colors"
        >
          <ChevronLeft size={14} className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
    </aside>
  );
}
