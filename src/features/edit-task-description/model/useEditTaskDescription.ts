import { useTasks, type Task } from "@/entities/task";
import { toggleChecklistItem } from "@/shared/lib";

/**
 * Описание с чек-листами. Клик по чекбоксу переписывает строку `- [ ]` ↔
 * `- [x]` в тексте и сохраняет его целиком — отдельного состояния у пунктов нет.
 */
export function useEditTaskDescription() {
  const { updateTask } = useTasks();
  return {
    save: (task: Task, description: string) => {
      const clean = description.trim();
      if (clean !== (task.description ?? "")) updateTask(task.id, { description: clean });
    },
    toggleChecklist: (task: Task, line: number) => {
      updateTask(task.id, { description: toggleChecklistItem(task.description ?? "", line) });
    },
  };
}
