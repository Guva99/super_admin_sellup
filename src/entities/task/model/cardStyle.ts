import type { Task } from "./types";
import { isTaskOverdue } from "./types";

export interface TaskCardStyle {
  border: string;
  bg: string;
  strip: string;
}

/** Цвет рамки, фона и верхней полосы карточки: просрочка важнее типа, тип важнее приоритета. */
export function cardStyle(task: Task): TaskCardStyle {
  if (isTaskOverdue(task)) return { border: "border-red-300", bg: "bg-red-50/60", strip: "bg-red-400" };
  if (task.type === "call") return { border: "border-orange-200", bg: "bg-orange-50/40", strip: "bg-orange-400" };
  if (task.type === "integration") return { border: "border-blue-200", bg: "bg-blue-50/40", strip: "bg-blue-500" };
  if (task.type === "support") return { border: "border-violet-200", bg: "bg-violet-50/30", strip: "bg-violet-400" };
  if (task.type === "update") return { border: "border-cyan-200", bg: "bg-cyan-50/30", strip: "bg-cyan-400" };
  if (task.type === "onboarding") return { border: "border-emerald-200", bg: "bg-emerald-50/30", strip: "bg-emerald-400" };
  if (task.priority === "high") return { border: "border-rose-200", bg: "bg-rose-50/30", strip: "bg-rose-500" };
  return { border: "border-slate-200", bg: "bg-white", strip: "bg-slate-300" };
}
