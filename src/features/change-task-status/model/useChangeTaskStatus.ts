import { useTasks, type TaskStatus } from "@/entities/task";

/**
 * Смена статуса — с доски, из меню карточки, из карточки задачи. Одна точка,
 * чтобы все места вели себя одинаково; историю пишет бэкенд.
 */
export function useChangeTaskStatus() {
  const { updateTask } = useTasks();
  return {
    change: (taskId: string, status: TaskStatus) => updateTask(taskId, { status }),
  };
}
