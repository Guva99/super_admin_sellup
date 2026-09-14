import { Plus } from "lucide-react";
import type { Client } from "@/entities/client";
import { TASK_COLUMNS, TaskCard, type Task, type TaskStatus } from "@/entities/task";
import { KanbanBoard } from "@/shared/ui";

interface GroupColumnsProps {
  tasks: Task[];
  clients: Client[];
  selectedTaskId: string | null;
  /** Занимать всю высоту страницы (режим без группировки). */
  fill: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onOpenTask: (id: string) => void;
  onOpenClient: (id: string) => void;
  onCreate: (status: TaskStatus) => void;
}

/** Четыре колонки статусов с перетаскиванием и «+ Создать» внизу каждой. */
export function GroupColumns({ tasks, clients, selectedTaskId, fill, onStatusChange, onDelete, onOpenTask, onOpenClient, onCreate }: GroupColumnsProps) {
  return (
    <KanbanBoard<Task, TaskStatus>
      columns={TASK_COLUMNS}
      items={tasks}
      getItemId={(task) => task.id}
      getItemColumn={(task) => task.status}
      onMove={onStatusChange}
      wrapperClassName={fill ? "flex-1 overflow-x-auto overflow-y-hidden p-5" : "overflow-x-auto px-5 pb-4"}
      columnClassName="w-72"
      boardClassName="gap-3"
      listClassName={fill ? "px-2.5 pb-2 min-h-[60px]" : "px-2.5 pb-1 min-h-[48px]"}
      renderColumnHeader={(col, count) => (
        <div className="flex items-center gap-2 px-3.5 py-2.5 flex-shrink-0">
          <span className={`w-2 h-2 rounded-full ${col.accent}`} />
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">{col.label}</span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-white text-slate-500 rounded-full border border-slate-200">{count}</span>
        </div>
      )}
      renderEmptyColumn={(_col, isDragOver) => (
        <div className={`h-12 rounded-lg border-2 border-dashed transition-colors ${isDragOver ? "border-brand-300 bg-brand-50" : "border-slate-200"}`} />
      )}
      renderColumnFooter={(col) => (
        <button
          type="button"
          onClick={() => onCreate(col.id)}
          className="flex items-center gap-1.5 mx-2.5 mb-2.5 px-2 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
        >
          <Plus size={13} />
          Создать
        </button>
      )}
      renderCard={(task, handlers, isDragging) => (
        <TaskCard
          task={task}
          client={task.clientId ? clients.find((c) => c.id === task.clientId) ?? null : null}
          handlers={handlers}
          isDragging={isDragging}
          isSelected={selectedTaskId === task.id}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onOpenClient={onOpenClient}
          onClick={() => onOpenTask(task.id)}
        />
      )}
    />
  );
}
