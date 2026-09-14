import type { Task } from "@/entities/task";
import type { GroupMode, TaskGroup } from "./types";

export const UNASSIGNED_GROUP_ID = "unassigned";

/**
 * Чистая функция: плоский список → секции доски. Порядок секций — по имени
 * исполнителя, «Не назначено» всегда последняя. Ничего не мутирует, поэтому
 * новый режим — это ещё одна ветка здесь и запись в GROUP_MODE_LABEL.
 */
export function groupTasks(tasks: readonly Task[], mode: GroupMode): TaskGroup[] {
  switch (mode) {
    case "none":
      return [{ id: "all", title: "Все задачи", assignee: null, tasks: [...tasks] }];
    case "assignee":
      return groupByAssignee(tasks);
  }
}

function groupByAssignee(tasks: readonly Task[]): TaskGroup[] {
  const byAssignee = new Map<string, TaskGroup>();
  const unassigned: TaskGroup = { id: UNASSIGNED_GROUP_ID, title: "Не назначено", assignee: null, tasks: [] };

  for (const task of tasks) {
    if (!task.assignee) {
      unassigned.tasks.push(task);
      continue;
    }
    let group = byAssignee.get(task.assignee.id);
    if (!group) {
      group = { id: task.assignee.id, title: task.assignee.name, assignee: task.assignee, tasks: [] };
      byAssignee.set(task.assignee.id, group);
    }
    group.tasks.push(task);
  }

  const groups = [...byAssignee.values()].sort((a, b) => a.title.localeCompare(b.title, "ru"));
  if (unassigned.tasks.length > 0) groups.push(unassigned);
  return groups;
}
