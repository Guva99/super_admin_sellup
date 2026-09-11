import { AlertTriangle, Plus } from "lucide-react";
import type { Client } from "@/entities/client";
import type { Task, TaskStatus } from "@/entities/task";
import { TASK_COLUMNS, TaskCard, isTaskOverdue } from "@/entities/task";
import { KanbanBoard } from "@/shared/ui";

/** Легенда цветов карточек под тулбаром. */
const LEGEND = [
  { color: "bg-orange-400", label: "Звонок", desc: "нужно позвонить" },
  { color: "bg-blue-500", label: "Интеграция", desc: "техническая задача" },
  { color: "bg-violet-400", label: "Поддержка", desc: "обращение клиента" },
  { color: "bg-cyan-400", label: "Обновление", desc: "изменение в системе" },
  { color: "bg-emerald-400", label: "Онбординг", desc: "этап подключения" },
  { color: "bg-red-400", label: "Просрочено", desc: "дедлайн прошёл" },
];

interface TaskBoardProps {
  /** Все задачи — счётчики в тулбаре не зависят от фильтров. */
  tasks: Task[];
  /** Задачи после фильтров — только они попадают в колонки. */
  filteredTasks: Task[];
  clients: Client[];
  clientFilter: string;
  typeFilter: string;
  selectedTaskId: string | null;
  onClientFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onSelectTask: (id: string) => void;
  onAddTask: (clientId?: string) => void;
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onOpenClient: (id: string) => void;
}

export function TaskBoard({
  tasks,
  filteredTasks,
  clients,
  clientFilter,
  typeFilter,
  selectedTaskId,
  onClientFilterChange,
  onTypeFilterChange,
  onSelectTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onOpenClient,
}: TaskBoardProps) {
  const overdueCount = tasks.filter((t) => isTaskOverdue(t)).length;

  return (
    <div className="flex flex-col flex-1 min-w-0 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3.5 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">
            <strong className="text-slate-700">{tasks.filter((t) => t.status !== "done").length}</strong> задач в работе
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">
            <strong className="text-slate-700">{tasks.filter((t) => t.status === "done").length}</strong> завершено
          </span>
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-red-500 font-medium">
              <AlertTriangle size={11} />
              {overdueCount} просрочено
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <select value={clientFilter} onChange={(e) => onClientFilterChange(e.target.value)} className="text-xs border border-slate-200 rounded-md px-2 py-1.5 text-slate-600 outline-none focus:border-brand-400 bg-white cursor-pointer">
            <option value="all">Все бизнесы</option>
            {clients.filter((c) => c.status !== "churned").map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)} className="text-xs border border-slate-200 rounded-md px-2 py-1.5 text-slate-600 outline-none focus:border-brand-400 bg-white cursor-pointer">
            <option value="all">Все типы</option>
            <option value="call">Звонки</option>
            <option value="task">Задачи</option>
            <option value="update">Обновления</option>
            <option value="integration">Интеграции</option>
            <option value="support">Поддержка</option>
            <option value="onboarding">Онбординг</option>
          </select>
          <button onClick={() => onAddTask()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-md transition-colors">
            <Plus size={12} />
            Добавить задачу
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 px-6 py-2 bg-white border-b border-slate-100">
        <span className="text-[10px] text-slate-400 mr-2 font-medium">Цвет карточки:</span>
        {LEGEND.map((l) => (
          <div key={l.label} className="group relative flex items-center gap-1.5 text-[11px] text-slate-500 px-2 py-1 rounded-md hover:bg-slate-50 cursor-default transition-colors">
            <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${l.color}`} />
            <span>{l.label}</span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {l.desc}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <KanbanBoard<Task, TaskStatus>
        columns={TASK_COLUMNS}
        items={filteredTasks}
        getItemId={(task) => task.id}
        getItemColumn={(task) => task.status}
        onMove={(taskId, status) => onUpdateTask(taskId, { status })}
        columnClassName="w-72"
        boardClassName="gap-4"
        listClassName="px-3 pb-3 min-h-[60px]"
        renderColumnHeader={(col, count) => (
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${col.accent}`} />
              <span className="text-xs font-semibold text-slate-700">{col.label}</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-white text-slate-500 rounded-full border border-slate-200">
                {count}
              </span>
            </div>
            <button onClick={() => onAddTask()} className="text-slate-400 hover:text-brand-500 transition-colors" title="Добавить задачу">
              <Plus size={13} />
            </button>
          </div>
        )}
        renderEmptyColumn={(_col, isDragOver) => (
          <div
            className={`h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-[11px] transition-colors cursor-pointer ${isDragOver ? "border-brand-300 text-brand-400 bg-brand-50" : "border-slate-200 text-slate-300 hover:border-slate-300 hover:text-slate-400"}`}
            onClick={() => onAddTask()}
          >
            <Plus size={14} />
            <span>Добавить задачу</span>
          </div>
        )}
        renderCard={(task, handlers, isDragging) => (
          <TaskCard
            task={task}
            client={task.clientId ? clients.find((c) => c.id === task.clientId) ?? null : null}
            handlers={handlers}
            isDragging={isDragging}
            isSelected={selectedTaskId === task.id}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onOpenClient={onOpenClient}
            onClick={() => onSelectTask(task.id)}
          />
        )}
      />
    </div>
  );
}
