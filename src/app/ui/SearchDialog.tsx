import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ClientAvatar, useClients } from "@/entities/client";
import { useTasks, TaskTypeIcon } from "@/entities/task";
import { ModalOverlay } from "@/shared/ui";

const MAX_PER_GROUP = 5;

/**
 * Глобальный поиск (⌘K). Ищет по клиентам и задачам в уже загруженных
 * сторах — отдельного запроса на бэкенд нет и пока не нужно.
 */
export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const { clients } = useClients();
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const needle = query.trim().toLowerCase();
  const matchedClients = needle
    ? clients.filter((c) => c.name.toLowerCase().includes(needle)).slice(0, MAX_PER_GROUP)
    : [];
  const matchedTasks = needle
    ? tasks.filter((t) => t.title.toLowerCase().includes(needle)).slice(0, MAX_PER_GROUP)
    : [];
  const isEmpty = needle !== "" && matchedClients.length === 0 && matchedTasks.length === 0;

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
          <Search size={15} className="text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск клиентов, задач..."
            className="flex-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 bg-transparent"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded font-mono text-slate-500">
            Esc
          </kbd>
        </div>

        {needle === "" && <p className="text-xs text-slate-400 text-center py-8">Начните вводить запрос...</p>}
        {isEmpty && <p className="text-xs text-slate-400 text-center py-8">Ничего не найдено</p>}

        {matchedClients.length > 0 && (
          <div className="border-t border-slate-100 first:border-t-0">
            <p className="px-4 pt-3 pb-1.5 text-[10px] uppercase tracking-wide font-medium text-slate-400">
              Клиенты
            </p>
            {matchedClients.map((client) => (
              <button
                key={client.id}
                onClick={() => go(`/clients/${client.id}`)}
                className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-left transition-colors"
              >
                <ClientAvatar client={client} className="w-6 h-6 rounded-md text-[9px]" />
                <span className="text-xs text-slate-700 truncate">{client.name}</span>
              </button>
            ))}
          </div>
        )}

        {matchedTasks.length > 0 && (
          <div className="border-t border-slate-100">
            <p className="px-4 pt-3 pb-1.5 text-[10px] uppercase tracking-wide font-medium text-slate-400">
              Задачи
            </p>
            {matchedTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => go(task.clientId ? `/clients/${task.clientId}/tasks` : "/tasks")}
                className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-left transition-colors"
              >
                <TaskTypeIcon type={task.type} size={12} />
                <span className="text-xs text-slate-700 truncate">{task.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}
