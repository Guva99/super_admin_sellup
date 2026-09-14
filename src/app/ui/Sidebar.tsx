import { CircleDot, ChevronLeft, Plus, Building2, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useSession } from "@/entities/session";
import { useTasks } from "@/entities/task";
import { useUiActions } from "@/shared/lib";
import { navRoutes } from "../routes";

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

  const navLinkClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
      collapsed ? "justify-center" : ""
    } ${isActive ? "bg-brand-50 text-brand-600 font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`;

  return (
    <aside
      className={`flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ease-in-out flex-shrink-0 ${
        collapsed ? "w-14" : "w-[220px]"
      }`}
    >
      <div
        className={`flex items-center gap-2.5 px-3.5 border-b border-slate-200 flex-shrink-0 ${
          collapsed ? "justify-center py-3.5" : "py-3.5"
        }`}
        style={{ height: 49 }}
      >
        <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          <CircleDot size={14} className="text-white" />
        </div>
        {!collapsed && <span className="text-sm font-semibold text-slate-900 truncate">SellUp Console</span>}
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
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
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
            className="w-full flex items-center justify-center p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
            title="Добавить задачу"
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      <nav className="flex-1 py-2 overflow-y-auto">
        <ul className="px-2 space-y-0.5">
          {navRoutes("main").map((route) => {
            const Icon = route.handle.icon!;
            const badge = route.handle.showTaskBadge ? highPriorityCount : 0;
            return (
              <li key={route.path}>
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
                      {badge > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 py-2 px-2 space-y-0.5">
        {navRoutes("bottom").map((route) => {
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
              <span className="text-xs text-slate-600 flex-1 truncate">{user?.fullName}</span>
              <button onClick={logout} title="Выйти" aria-label="Выйти" className="text-slate-400 hover:text-slate-700 flex-shrink-0">
                <LogOut size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      <button
        onClick={onToggleCollapsed}
        className="border-t border-slate-200 flex items-center justify-center py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <ChevronLeft size={14} className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
      </button>
    </aside>
  );
}
