import { Suspense, useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Outlet, useMatches } from "react-router-dom";

import { useClients } from "@/entities/client";
import { useTasks } from "@/entities/task";
import { useUsers } from "@/entities/user";
import { UiActionsProvider } from "../model/ui-actions";
import type { RouteHandle } from "../routes";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchDialog } from "./SearchDialog";

/**
 * Постоянный каркас приложения: меню, шапка и место под страницу.
 * Переживает переходы между разделами — перерисовывается только <Outlet/>.
 */
export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const clients = useClients();
  const tasks = useTasks();
  const users = useUsers();

  const isLoading = clients.isLoading || tasks.isLoading || users.isLoading;
  const error = clients.error ?? tasks.error ?? users.error;
  // Несохранённые изменения из разных сторов показываются одной полосой.
  const mutationErrors = [
    { message: clients.mutationError, dismiss: clients.dismissMutationError },
    { message: tasks.mutationError, dismiss: tasks.dismissMutationError },
  ].filter((item): item is { message: string; dismiss: () => void } => item.message !== null);

  // ⌘K / Ctrl+K — глобальный поиск. Слушатель живёт здесь, потому что
  // каркас смонтирован всегда, в отличие от страниц.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Заголовок берётся из handle самого глубокого совпавшего маршрута.
  const matches = useMatches();
  const title = [...matches].reverse().find((m) => (m.handle as RouteHandle | undefined)?.title);
  const pageTitle = (title?.handle as RouteHandle | undefined)?.title ?? "";

  return (
    <UiActionsProvider>
      <div className="flex h-full bg-slate-50 min-w-[1280px]">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header title={pageTitle} onOpenSearch={() => setSearchOpen(true)} />

          {/* Не удалось сохранить изменение — оно уже откачено. */}
          {mutationErrors.map(({ message, dismiss }) => (
            <div key={message} role="alert" className="flex items-center gap-2 px-5 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600 flex-shrink-0">
              <AlertCircle size={13} className="flex-shrink-0" />
              <span className="flex-1">{message}</span>
              <button onClick={dismiss} aria-label="Скрыть" className="text-red-400 hover:text-red-600">
                <X size={13} />
              </button>
            </div>
          ))}

          <main className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-sm text-slate-400">Загрузка данных…</div>
            ) : error ? (
              <div className="p-8 text-sm text-red-600">Не удалось загрузить данные: {error}</div>
            ) : (
              // Страницы грузятся лениво (см. routes.tsx) — Suspense ловит
              // момент подгрузки чанка при первом заходе в раздел.
              <Suspense fallback={<div className="p-8 text-sm text-slate-400">Загрузка раздела…</div>}>
                <Outlet />
              </Suspense>
            )}
          </main>
        </div>

        {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
      </div>
    </UiActionsProvider>
  );
}
