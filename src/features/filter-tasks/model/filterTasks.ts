import type { Task, TaskKind, TaskType } from "@/entities/task";

export interface TaskFilters {
  /** Поиск по названию и ключу. */
  query: string;
  /** Исполнители (id); пусто — все. */
  memberIds: readonly string[];
  /** "" — все бизнесы. */
  clientId: string;
  /** "" — любая категория. */
  type: TaskType | "";
  /** "" — любой вид работы. */
  kind: TaskKind | "";
}

export const EMPTY_FILTERS: TaskFilters = { query: "", memberIds: [], clientId: "", type: "", kind: "" };

export const hasActiveFilters = (f: TaskFilters): boolean =>
  f.query.trim() !== "" || f.memberIds.length > 0 || f.clientId !== "" || f.type !== "" || f.kind !== "";

/** Чистая функция отбора задач для доски. */
export function filterTasks(tasks: readonly Task[], filters: TaskFilters): Task[] {
  const needle = filters.query.trim().toLowerCase();
  return tasks.filter((task) => {
    if (needle && !task.title.toLowerCase().includes(needle) && !task.key.toLowerCase().includes(needle)) return false;
    if (filters.memberIds.length > 0 && !filters.memberIds.includes(task.assignee?.id ?? "")) return false;
    if (filters.clientId && task.clientId !== filters.clientId) return false;
    if (filters.type && task.type !== filters.type) return false;
    if (filters.kind && task.kind !== filters.kind) return false;
    return true;
  });
}
