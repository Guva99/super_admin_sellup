import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  TASK_STATUS_CLASS,
  TASK_STATUS_LABEL,
  TaskKey,
  TaskKindIcon,
  TaskPriorityIcon,
  useTasks,
  type Task,
} from "@/entities/task";
import { UserAvatar } from "@/shared/ui";

interface SubtasksSectionProps {
  task: Task;
  onOpenTask: (id: string) => void;
}

/**
 * Подзадачи, как в Jira: полоса выполнения, таблица (работа, приоритет,
 * исполнитель, статус) и быстрое добавление строкой. Подзадача — обычная
 * задача с родителем, поэтому открывается той же карточкой; свои подзадачи
 * у неё уже не заводятся (проверяет бэкенд).
 */
export function SubtasksSection({ task, onOpenTask }: SubtasksSectionProps) {
  const { subtasksOf, addTask, updateTask } = useTasks();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const subtasks = subtasksOf(task.id);
  const done = subtasks.filter((s) => s.status === "done").length;
  const percent = subtasks.length > 0 ? Math.round((done / subtasks.length) * 100) : 0;

  // Подзадача наследует бизнес и категорию родителя: заводят её, не отвлекаясь
  // на поля, — как строку чек-листа, только это настоящая задача.
  const create = async () => {
    const clean = title.trim();
    if (!clean || isSaving) return;
    setIsSaving(true);
    const result = await addTask({
      title: clean,
      description: "",
      clientId: task.clientId,
      parentId: task.id,
      type: task.type,
      kind: "task",
      priority: "medium",
      dueDate: null,
      assigneeId: null,
    });
    setIsSaving(false);
    if (result.ok) setTitle("");
  };

  const startAdding = () => {
    setTitle("");
    setAdding(true);
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Подзадачи {subtasks.length > 0 && <span className="text-slate-400">({subtasks.length})</span>}
        </h2>
        <button type="button" onClick={startAdding} className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-500">
          <Plus size={11} />
          Добавить
        </button>
      </div>

      {subtasks.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">{percent}% готово</span>
        </div>
      )}

      {subtasks.length === 0 && !adding && <p className="text-xs text-slate-400">Подзадач нет</p>}

      {subtasks.length > 0 && (
        <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors">
              <button type="button" onClick={() => onOpenTask(subtask.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left group">
                <TaskKindIcon kind={subtask.kind} size={12} />
                <TaskKey value={subtask.key} className={`text-[11px] ${subtask.status === "done" ? "line-through text-slate-400" : "text-slate-500"}`} />
                <span className={`text-xs truncate group-hover:text-brand-600 ${subtask.status === "done" ? "text-slate-400" : "text-slate-700"}`}>
                  {subtask.title}
                </span>
              </button>
              <TaskPriorityIcon priority={subtask.priority} size={12} />
              <UserAvatar name={subtask.assignee?.name ?? ""} size="xs" />
              <select
                aria-label={`Статус подзадачи ${subtask.key}`}
                value={subtask.status}
                onChange={(e) => updateTask(subtask.id, { status: e.target.value as Task["status"] })}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer outline-none ${TASK_STATUS_CLASS[subtask.status]}`}
              >
                {(Object.keys(TASK_STATUS_LABEL) as Task["status"][]).map((status) => (
                  <option key={status} value={status}>{TASK_STATUS_LABEL[status]}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="flex items-center gap-2 mt-2">
          <input
            autoFocus
            aria-label="Название подзадачи"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") create();
              if (e.key === "Escape") {
                e.stopPropagation();
                setAdding(false);
              }
            }}
            placeholder="Что нужно сделать?"
            className="flex-1 px-3 py-2 text-xs border border-brand-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-50 placeholder:text-slate-300"
          />
          <button
            type="button"
            onClick={create}
            disabled={!title.trim() || isSaving}
            className="px-3 py-2 text-[11px] font-medium bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg"
          >
            {isSaving ? "Создаём…" : "Добавить"}
          </button>
          <button type="button" onClick={() => setAdding(false)} aria-label="Отменить добавление" className="p-1.5 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}
    </section>
  );
}
