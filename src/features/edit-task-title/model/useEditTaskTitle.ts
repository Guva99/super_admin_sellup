import { useTasks, type Task } from "@/entities/task";

/** Название нельзя опустошить — форма это отсекает до запроса. */
export function useEditTaskTitle() {
  const { updateTask } = useTasks();
  return {
    save: (task: Task, title: string) => {
      const clean = title.trim();
      if (clean && clean !== task.title) updateTask(task.id, { title: clean });
    },
  };
}
