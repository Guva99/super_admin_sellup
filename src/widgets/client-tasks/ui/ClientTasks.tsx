import { useState } from "react";
import { CheckCircle2, CheckSquare, ChevronRight, Clock, Plus, Trash2 } from "lucide-react";
import {
  isTaskOverdue,
  TaskKey,
  TaskKindIcon,
  TaskTypeIcon,
  TASK_PRIORITY_DOT,
  TASK_STATUS_CLASS,
  TASK_STATUS_LABEL,
  TASK_TYPE_CLASS,
  TASK_TYPE_LABEL,
  type Task,
  type TaskStatus,
} from "@/entities/task";

interface ClientTasksProps {
  tasks: Task[];
  onAddTask: () => void;
  onOpenTask: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDeleteTask: (id: string) => void;
}

export function ClientTasks({ tasks, onAddTask, onOpenTask, onStatusChange, onDeleteTask }: ClientTasksProps) {
  const [showDone, setShowDone] = useState(false);
  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  const renderTask = (task: Task) => {
    const isOverdue = isTaskOverdue(task);
    return (
      <div
        key={task.id}
        onClick={() => onOpenTask(task.id)}
        className={`bg-white border rounded-xl p-4 flex items-start gap-3 group cursor-pointer hover:border-slate-300 transition-colors ${
          isOverdue ? "border-red-200 bg-red-50/20" : "border-slate-200"
        }`}
      >
        {/* Priority dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${TASK_PRIORITY_DOT[task.priority]}`} />
        <div className="flex-1 min-w-0">
          <p className={`flex items-center gap-1.5 text-sm font-medium ${task.status === "done" ? "line-through text-slate-400" : "text-slate-800"}`}>
            <TaskKindIcon kind={task.kind} size={13} />
            <TaskKey value={task.key} />
            {task.title}
          </p>
          {task.description && <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${TASK_TYPE_CLASS[task.type]}`}>
              <TaskTypeIcon type={task.type} size={9} />{TASK_TYPE_LABEL[task.type]}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TASK_STATUS_CLASS[task.status]}`}>
              {TASK_STATUS_LABEL[task.status]}
            </span>
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
                <Clock size={9} />
                {new Date(task.dueDate).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
              </span>
            )}
            {task.assignee && <span className="text-[10px] text-slate-400">{task.assignee.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {task.status !== "done" && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, "done"); }}
              className="p-1 text-slate-300 hover:text-emerald-500 transition-colors"
              title="Закрыть задачу"
            >
              <CheckCircle2 size={14} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} className="p-1 text-slate-300 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 max-w-[700px]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Задачи по клиенту
          {open.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-brand-100 text-brand-500 rounded-full font-semibold">
              {open.length}
            </span>
          )}
        </h3>
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 transition-colors font-medium"
        >
          <Plus size={12} />Добавить
        </button>
      </div>

      {open.length === 0 && (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-2 text-slate-300">
          <CheckSquare size={24} />
          <p className="text-sm">Нет открытых задач</p>
          <button onClick={onAddTask} className="text-xs text-brand-500 hover:text-brand-500 transition-colors mt-1">
            + Создать задачу
          </button>
        </div>
      )}

      {open.map(renderTask)}

      {done.length > 0 && (
        <div>
          <button
            onClick={() => setShowDone((v) => !v)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 mt-4 mb-2"
          >
            <ChevronRight size={12} className={`transition-transform ${showDone ? "rotate-90" : ""}`} />
            Завершённые ({done.length})
          </button>
          {showDone && done.map(renderTask)}
        </div>
      )}
    </div>
  );
}
