import type { Client, OnboardingStep } from "@/entities/client";
import type { Task } from "@/entities/task";
import { todayIso } from "@/shared/lib";

export interface OnboardingActions {
  updateStep: (clientId: string, stepId: string, patch: Partial<OnboardingStep>) => void;
  addStepToTasks: (clientId: string, step: OnboardingStep) => void;
  removeStepFromTasks: (clientId: string, stepId: string, taskId: string) => void;
}

/**
 * Действия над этапами онбординга одной группой.
 * Раньше эти три колбэка прокидывались из App через страницу в таб — по одному пропу на действие.
 */
export function useOnboardingActions(
  updateClients: (updater: (prev: Client[]) => Client[]) => void,
  addTask: (task: Task) => void,
  removeTask: (id: string) => void,
): OnboardingActions {
  const updateStep = (clientId: string, stepId: string, patch: Partial<OnboardingStep>) =>
    updateClients((prev) =>
      prev.map((client) =>
        client.id === clientId
          ? {
              ...client,
              onboardingSteps: client.onboardingSteps.map((step) =>
                step.id === stepId ? { ...step, ...patch } : step,
              ),
            }
          : client,
      ),
    );

  const addStepToTasks = (clientId: string, step: OnboardingStep) => {
    const taskId = `t${Date.now()}`;
    addTask({
      id: taskId,
      title: step.title,
      description: step.description,
      clientId,
      type: "onboarding",
      priority: "medium",
      status: "todo",
      dueDate: step.dueDate || null,
      assignee: step.assignee,
      createdAt: todayIso(),
      onboardingStepId: step.id,
    });
    updateStep(clientId, step.id, { taskId });
  };

  const removeStepFromTasks = (clientId: string, stepId: string, taskId: string) => {
    removeTask(taskId);
    updateStep(clientId, stepId, { taskId: undefined });
  };

  return { updateStep, addStepToTasks, removeStepFromTasks };
}
