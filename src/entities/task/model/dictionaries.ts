import type { TaskType, TaskKind, TaskStatus, TaskPriority } from "./types";

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  call: "Звонок",
  task: "Задача",
  update: "Обновление",
  integration: "Интеграция",
  support: "Поддержка",
  onboarding: "Онбординг",
};

export const TASK_TYPE_CLASS: Record<TaskType, string> = {
  call: "text-orange-600 bg-orange-50",
  task: "text-slate-600 bg-slate-100",
  update: "text-cyan-700 bg-cyan-50",
  integration: "text-blue-700 bg-blue-50",
  support: "text-violet-700 bg-violet-50",
  onboarding: "text-emerald-700 bg-emerald-50",
};

/** Подписи для селекта создания задачи — с эмодзи, как было в форме. */
export const TASK_TYPE_OPTION_LABEL: Record<TaskType, string> = {
  call: "📞 Звонок",
  task: "✅ Задача",
  update: "🔄 Обновление",
  integration: "🔌 Интеграция",
  support: "💬 Поддержка",
  onboarding: "🚀 Онбординг",
};

export const TASK_KIND_LABEL: Record<TaskKind, string> = {
  task: "Задача",
  bug: "Баг",
};

/** Порядок видов работы в селектах. */
export const TASK_KINDS: TaskKind[] = ["task", "bug"];

/**
 * Одна подпись статуса на весь продукт.
 * Раньше «todo» назывался «Открыта» в карточке клиента и «К выполнению» на доске.
 */
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "К выполнению",
  in_progress: "В работе",
  review: "На проверке",
  done: "Готово",
};

export const TASK_STATUS_CLASS: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-brand-50 text-brand-600",
  review: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

export const TASK_PRIORITY_OPTION_LABEL: Record<TaskPriority, string> = {
  high: "🔴 Высокий",
  medium: "🟡 Средний",
  low: "⚪ Низкий",
};

export const TASK_PRIORITY_DOT: Record<TaskPriority, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-slate-300",
};

/** Колонки доски задач, слева направо. */
export const TASK_COLUMNS: { id: TaskStatus; label: string; description: string; accent: string }[] = [
  { id: "todo", label: "К выполнению", description: "Не начато", accent: "bg-slate-400" },
  { id: "in_progress", label: "В работе", description: "Активные задачи", accent: "bg-brand-500" },
  { id: "review", label: "На проверке", description: "Ожидает подтверждения", accent: "bg-amber-400" },
  { id: "done", label: "Готово", description: "Завершённые", accent: "bg-emerald-400" },
];
