import { useState } from "react";
import { Trash2, ExternalLink, AlertTriangle, Clock, Paperclip, Rocket, MessageSquare } from "lucide-react";
import { formatDate } from "@/shared/lib";
import type { KanbanCardHandlers } from "@/shared/ui";
import { UserAvatar } from "@/shared/ui";
import type { Task, TaskStatus, TaskCardClient } from "../model/types";
import { isTaskOverdue } from "../model/types";
import { TASK_PRIORITY_DOT, TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from "../model/dictionaries";
import { TaskKindIcon } from "./TaskKindIcon";
import { TaskKey } from "./TaskKey";

/**
 * Карточка на доске, как в Trello/Jira: заголовок, метки, внизу — вид работы,
 * ключ, срок и аватар исполнителя. Цвет карточки не несёт смысла — смысл
 * несут ромб/галочка и красный срок у просроченных.
 */
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
  const isOverdue = isTaskOverdue(task);
  const isDone = task.status === "done";

  return (
    <div
      {...handlers}
      onClick={onClick}
      className={`relative bg-white border rounded-lg cursor-pointer select-none transition-all group ${
        isOverdue ? "border-red-200" : "border-slate-200"
      } ${isDragging ? "opacity-40 scale-95 shadow-lg" : "hover:shadow-md hover:border-slate-300"} ${isDone ? "opacity-60" : ""} ${
        isSelected ? "ring-2 ring-brand-400 ring-offset-1" : ""
      }`}
    >
      <div className="p-3">
        {/* Заголовок + меню */}
        <div className="flex items-start gap-2">
          <p className={`text-xs font-medium text-slate-800 leading-snug flex-1 ${isDone ? "line-through text-slate-400" : ""}`}>
            {task.title}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            aria-label="Действия"
            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 transition-all flex-shrink-0 text-lg leading-none -mt-1"
          >
            ···
          </button>
        </div>

        {/* Метки и бизнес */}
        {(task.labels.length > 0 || task.onboardingStepId || client) && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {task.onboardingStepId && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-600 font-medium">
                <Rocket size={9} />
                Этап онбординга
              </span>
            )}
            {task.labels.map((label) => (
              <span key={label} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium">
                {label}
              </span>
            ))}
            {client && (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenClient(client.id); }}
                className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-brand-50 group/chip"
                title={client.name}
              >
                <span className="w-3.5 h-3.5 rounded flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: client.color }}>
                  {client.initials[0]}
                </span>
                <span className="text-[10px] text-slate-500 group-hover/chip:text-brand-500 truncate max-w-[120px]">{client.name}</span>
                <ExternalLink size={8} className="text-slate-300 opacity-0 group-hover/chip:opacity-100" />
              </button>
            )}
          </div>
        )}

        {/* Низ: вид, ключ, срок, счётчики, аватар */}
        <div className="flex items-center gap-2 mt-2.5">
          <TaskKindIcon kind={task.kind} size={13} />
          <TaskKey value={task.key} />
          <span className={`w-1.5 h-1.5 rounded-full ${TASK_PRIORITY_DOT[task.priority]}`} title={`Приоритет: ${TASK_PRIORITY_LABEL[task.priority]}`} />
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? "text-red-500" : "text-slate-400"}`}>
              {isOverdue ? <AlertTriangle size={9} /> : <Clock size={9} />}
              {formatDate(task.dueDate)}
            </span>
          )}
          <span className="flex-1" />
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400" title="Вложения">
              <Paperclip size={9} />
              {task.attachments.length}
            </span>
          )}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400" title="Комментарии">
              <MessageSquare size={9} />
              {task.comments.length}
            </span>
          )}
          <UserAvatar name={task.assignee?.name ?? ""} size="xs" />
        </div>
      </div>

      {/* Контекстное меню */}
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
