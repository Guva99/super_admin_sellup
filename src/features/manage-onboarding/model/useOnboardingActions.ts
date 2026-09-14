import { useClients, type OnboardingStep } from "@/entities/client";
import { useSession } from "@/entities/session";
import { useTasks } from "@/entities/task";
import { describeApiError } from "@/shared/api";

export interface OnboardingActions {
  updateStep: (clientId: string, stepId: string, patch: Partial<OnboardingStep>) => void;
  addStepToTasks: (clientId: string, step: OnboardingStep) => void;
  removeStepFromTasks: (taskId: string) => void;
}

/**
 * Связка «этап онбординга ↔ задача» — единственное место, где эти две
 * сущности встречаются. Связь хранит сама задача (`onboardingStepId`), поэтому
 * «В задачи» — это создание задачи, а «Убрать» — её удаление.
 */
export function useOnboardingActions(): OnboardingActions {
  const { updateOnboardingStep } = useClients();
  const { addTask, deleteTask, reportError } = useTasks();
  const { user } = useSession();

  const addStepToTasks = async (clientId: string, step: OnboardingStep) => {
    const result = await addTask({
      title: step.title,
      description: step.description ?? "",
      clientId,
      type: "onboarding",
      kind: "task",
      priority: "medium",
      dueDate: step.dueDate || null,
      // Этап ведёт тот, кто вывел его в задачи.
      assigneeId: user?.id ?? null,
      onboardingStepId: step.id,
    });
    if (!result.ok) reportError(`Не удалось создать задачу из этапа: ${describeApiError(result.error)}`);
  };

  return { updateStep: updateOnboardingStep, addStepToTasks, removeStepFromTasks: deleteTask };
}
