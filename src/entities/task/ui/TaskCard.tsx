import { useState } from "react";
import { Trash2, ExternalLink, AlertTriangle, Clock, Paperclip, Rocket } from "lucide-react";
import { formatDate } from "@/shared/lib";
import type { KanbanCardHandlers } from "@/shared/ui";
import type { Task, TaskStatus, TaskCardClient } from "../model/types";
import { isTaskOverdue } from "../model/types";
import { cardStyle } from "../model/cardStyle";
import { TASK_PRIORITY_DOT, TASK_STATUS_LABEL, TASK_TYPE_CLASS, TASK_TYPE_LABEL } from "../model/dictionaries";
import { TaskTypeIcon } from "./TaskTypeIcon";

export function TaskCard({
  task,
  client,
  handlers,
  isDragging,
  isSelected,
  onStatusChange,
  onDelete,
  onOpenClient,
  onClick,
}: {
  task: Task;
  client: TaskCardClient | null;
  handlers: KanbanCardHandlers;
  isDragging: boolean;
  isSelected: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onOpenClient: (id: string) => void;
  onClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { border, bg, strip } = cardStyle(task);

  const isOverdue = isTaskOverdue(task);
  const dueDateStr = task.dueDate ? formatDate(task.dueDate) : null;
  const hasAttachments = task.attachments.length > 0;

  return (
    <div
      {...handlers}
      onClick={onClick}
      className={`relative border rounded-xl overflow-hidden cursor-pointer select-none transition-all group ${border} ${bg} ${
        isDragging ? "opacity-40 scale-95 shadow-lg" : "hover:shadow-sm"
      } ${task.status === "done" ? "opacity-60" : ""} ${isSelected ? "ring-2 ring-brand-400 ring-offset-1" : ""}`}
    >
      {/* Color strip */}
      <div className={`h-[3px] w-full ${strip}`} />

      <div className="p-3">
        {/* Header: priority + title + menu */}
        <div className="flex items-start gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${TASK_PRIORITY_DOT[task.priority]}`} title={`Приоритет: ${task.priority}`} />
          <p className={`text-xs font-medium text-slate-800 leading-snug flex-1 ${task.status === "done" ? "line-through text-slate-400" : ""}`}>
            {task.title}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 transition-all flex-shrink-0 text-lg leading-none"
          >
            ···
          </button>
        </div>

        {/* Description snippet */}
        {task.description && (
          <p className="text-[11px] text-slate-400 mb-2 leading-relaxed line-clamp-2">{task.description}</p>
        )}

        {/* Onboarding origin badge */}
        {task.onboardingStepId && (
          <div className="flex items-center gap-1 mb-1.5 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 w-fit">
            <Rocket size={9} className="text-emerald-500" />
            <span className="text-[10px] text-emerald-600 font-medium">Этап онбординга</span>
          </div>
        )}

        {/* Client chip */}
        {client && (
          <button
            onClick={(e) => { e.stopPropagation(); onOpenClient(client.id); }}
            className="flex items-center gap-1.5 mb-2 group/chip"
          >
            <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: client.color }}>
              {client.initials[0]}
            </div>
            <span className="text-[11px] text-slate-500 group-hover/chip:text-brand-500 transition-colors truncate max-w-[170px]">
              {client.name}
            </span>
            <ExternalLink size={9} className="text-slate-300 group-hover/chip:text-brand-400 opacity-0 group-hover/chip:opacity-100 transition-all" />
          </button>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${TASK_TYPE_CLASS[task.type]}`}>
            <TaskTypeIcon type={task.type} size={9} />
            {TASK_TYPE_LABEL[task.type]}
          </span>

          {dueDateStr && (
            <span className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? "text-red-500" : "text-slate-400"}`}>
              {isOverdue ? <AlertTriangle size={9} /> : <Clock size={9} />}
              {dueDateStr}
            </span>
          )}

          {/* Attachment indicator */}
          {hasAttachments && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
              <Paperclip size={9} className="text-brand-400" />
              {task.attachments.length}
            </span>
          )}

          {!hasAttachments && (
            <span className="text-[10px] text-slate-400 ml-auto">{task.assigneeName.split(" ")[0] || "—"}</span>
          )}
        </div>
      </div>

      {/* Context menu */}
      {menuOpen && (
        <div
          className="absolute right-2 top-7 z-20 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden min-w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).filter((s) => s !== task.status).map((s) => (
            <button key={s} onClick={() => { onStatusChange(task.id, s); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
              → {TASK_STATUS_LABEL[s]}
            </button>
          ))}
          <div className="border-t border-slate-100" />
          <button onClick={() => { onDelete(task.id); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-1.5 transition-colors">
            <Trash2 size={11} />
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}
