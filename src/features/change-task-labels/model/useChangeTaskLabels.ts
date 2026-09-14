import { useTasks, type Task } from "@/entities/task";

/** Метки — свободные слова; бэкенд убирает пустые и дубли, лимит 20 × 50 символов. */
export function useChangeTaskLabels() {
  const { updateTask } = useTasks();
  return {
    add: (task: Task, label: string) => {
      const clean = label.trim();
      if (!clean || task.labels.includes(clean)) return;
      updateTask(task.id, { labels: [...task.labels, clean] });
    },
    remove: (task: Task, label: string) => {
      updateTask(task.id, { labels: task.labels.filter((l) => l !== label) });
    },
  };
}
