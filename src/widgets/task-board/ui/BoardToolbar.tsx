import { AlertTriangle, ChevronDown, Filter, Plus, Search, X } from "lucide-react";
import type { Client } from "@/entities/client";
import { TASK_KINDS, TASK_KIND_LABEL, TASK_TYPE_LABEL, type TaskKind, type TaskType } from "@/entities/task";
import type { User } from "@/entities/user";
import { GROUP_MODE_LABEL, type GroupMode } from "@/features/group-tasks";
import type { BoardFiltersController } from "@/features/filter-tasks";
import { Dropdown, DropdownItem, UserAvatar } from "@/shared/ui";

const TASK_TYPES = Object.keys(TASK_TYPE_LABEL) as TaskType[];
const GROUP_MODES = Object.keys(GROUP_MODE_LABEL) as GroupMode[];

interface BoardToolbarProps {
  filters: BoardFiltersController;
  users: User[];
  clients: Client[];
  groupMode: GroupMode;
  onGroupModeChange: (mode: GroupMode) => void;
  totals: { open: number; done: number; overdue: number };
  onCreate: () => void;
}

/** Поиск, аватары участников, «Фильтр» и «Группировка», как в Trello. */
export function BoardToolbar({ filters, users, clients, groupMode, onGroupModeChange, totals, onCreate }: BoardToolbarProps) {
  const { filters: f, isActive, setQuery, toggleMember, patch, reset } = filters;
  const selectClass = "w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 text-slate-600 outline-none focus:border-brand-400 bg-white cursor-pointer";

  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
      <label className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={f.query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по доске"
          className="w-56 pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-md outline-none focus:border-brand-400 placeholder:text-slate-400"
        />
      </label>

      {/* Участники: клик по аватару оставляет только его задачи */}
      <div className="flex items-center -space-x-1.5">
        {users.slice(0, 8).map((user) => {
          const active = f.memberIds.includes(user.id);
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => toggleMember(user.id)}
              title={user.fullName}
              className={`rounded-full ring-2 transition-all ${active ? "ring-brand-500 z-10 scale-110" : "ring-white hover:z-10 hover:scale-105"} ${f.memberIds.length > 0 && !active ? "opacity-50" : ""}`}
            >
              <UserAvatar name={user.fullName} size="sm" />
            </button>
          );
        })}
      </div>

      <Dropdown
        panelClassName="w-64 p-3 space-y-2.5"
        trigger={(open) => (
          <button
            type="button"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors ${
              isActive || open ? "border-brand-300 text-brand-600 bg-brand-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter size={12} />
            Фильтр
          </button>
        )}
      >
        {() => (
          <>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Бизнес</label>
              <select value={f.clientId} onChange={(e) => patch({ clientId: e.target.value })} className={selectClass}>
                <option value="">Все бизнесы</option>
                {clients.filter((c) => c.status !== "churned").map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Тип</label>
              <select value={f.kind} onChange={(e) => patch({ kind: e.target.value as TaskKind | "" })} className={selectClass}>
                <option value="">Любой</option>
                {TASK_KINDS.map((kind) => (
                  <option key={kind} value={kind}>{TASK_KIND_LABEL[kind]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Категория</label>
              <select value={f.type} onChange={(e) => patch({ type: e.target.value as TaskType | "" })} className={selectClass}>
                <option value="">Любая</option>
                {TASK_TYPES.map((type) => (
                  <option key={type} value={type}>{TASK_TYPE_LABEL[type]}</option>
                ))}
              </select>
            </div>
            {isActive && (
              <button type="button" onClick={reset} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-500">
                <X size={11} />
                Сбросить фильтры
              </button>
            )}
          </>
        )}
      </Dropdown>

      <Dropdown
        trigger={(open) => (
          <button
            type="button"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors ${open ? "border-brand-300 bg-brand-50 text-brand-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            <span className="text-slate-400">Группировка:</span>
            {GROUP_MODE_LABEL[groupMode]}
            <ChevronDown size={12} />
          </button>
        )}
      >
        {(close) =>
          GROUP_MODES.map((mode) => (
            <DropdownItem
              key={mode}
              active={mode === groupMode}
              onSelect={() => {
                onGroupModeChange(mode);
                close();
              }}
            >
              {GROUP_MODE_LABEL[mode]}
            </DropdownItem>
          ))
        }
      </Dropdown>

      <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
        <span>
          <strong className="text-slate-700">{totals.open}</strong> в работе
        </span>
        <span>
          <strong className="text-slate-700">{totals.done}</strong> готово
        </span>
        {totals.overdue > 0 && (
          <span className="flex items-center gap-1 text-red-500 font-medium">
            <AlertTriangle size={11} />
            {totals.overdue} просрочено
          </span>
        )}
        <button type="button" onClick={onCreate} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-md transition-colors">
          <Plus size={12} />
          Создать
        </button>
      </div>
    </div>
  );
}
