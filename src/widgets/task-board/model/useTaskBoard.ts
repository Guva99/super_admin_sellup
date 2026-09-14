import { useMemo, useState } from "react";
import { useTasks } from "@/entities/task";
import { filterTasks, useBoardFilters, type BoardFiltersController } from "@/features/filter-tasks";
import { groupTasks, type GroupMode, type TaskGroup } from "@/features/group-tasks";

export interface TaskBoardController {
  filters: BoardFiltersController;
  groupMode: GroupMode;
  setGroupMode: (mode: GroupMode) => void;
  groups: TaskGroup[];
  /** Секции, свёрнутые пользователем. */
  collapsed: ReadonlySet<string>;
  toggleGroup: (id: string) => void;
  /** Сводка для тулбара считается по всем задачам, не по отфильтрованным. */
  totals: { open: number; done: number; overdue: number };
}

/**
 * Состояние доски: фильтры тулбара и режим группировки. Сами разбиения —
 * чистые функции из features, поэтому новый режим не трогает виджет.
 */
export function useTaskBoard(): TaskBoardController {
  const { tasks } = useTasks();
  const filters = useBoardFilters();
  const [groupMode, setGroupMode] = useState<GroupMode>("assignee");
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

  const groups = useMemo(() => groupTasks(filterTasks(tasks, filters.filters), groupMode), [tasks, filters.filters, groupMode]);

  const totals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      open: tasks.filter((t) => t.status !== "done").length,
      done: tasks.filter((t) => t.status === "done").length,
      overdue: tasks.filter((t) => t.dueDate && t.status !== "done" && new Date(t.dueDate) < today).length,
    };
  }, [tasks]);

  const toggleGroup = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return { filters, groupMode, setGroupMode, groups, collapsed, toggleGroup, totals };
}
