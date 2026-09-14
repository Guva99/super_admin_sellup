import { useTasks, type Task } from "@/entities/task";

/** Срок и дата начала. Пустая дата — «без даты». */
export function useChangeTaskDates() {
  const { updateTask } = useTasks();
  return {
    setDueDate: (task: Task, date: string) => {
      const next = date || null;
      if (next !== task.dueDate) updateTask(task.id, { dueDate: next });
    },
    setStartDate: (task: Task, date: string) => {
      const next = date || null;
      if (next !== task.startDate) updateTask(task.id, { startDate: next });
    },
  };
}
