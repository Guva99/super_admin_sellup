import { useTasks, type Task } from "@/entities/task";

/** Метки — свободные слова; бэкенд убирает пустые и дубли, лимит 20 × 50 символов. */
export function useChangeTaskLabels() {
  const { updateTask } = useTasks();
  return {
    setLabels: (task: Task, labels: string[]) => updateTask(task.id, { labels }),
  };
}
