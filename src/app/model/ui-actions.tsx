import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useClients } from "@/entities/client";
import { usePlans } from "@/entities/plan";
import { useOnboardingTemplate } from "@/entities/onboarding-template";
import { useCreateTask } from "@/features/create-task";
import { useConnectBusiness, ConnectBusinessModal } from "@/features/connect-business";
import { UiActionsContext, type UiActions } from "@/shared/lib";
import { TaskCreateDialog } from "@/widgets/task-detail";

/**
 * Реализация глобальных действий (контракт и хук — в shared/lib/ui-actions).
 * Модалки живут здесь, в провайдере, а не на странице, поэтому не исчезают
 * при переходе между разделами.
 */
export function UiActionsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { clients, addClient } = useClients();
  const { activePlans } = usePlans();
  const { template } = useOnboardingTemplate();

  const createTask = useCreateTask();
  const connectBusiness = useConnectBusiness(template, activePlans, addClient, (client) =>
    navigate(`/clients/${client.id}`),
  );

  const value = useMemo<UiActions>(
    () => ({ openConnectBusiness: connectBusiness.open, openCreateTask: createTask.open }),
    [connectBusiness.open, createTask.open],
  );

  return (
    <UiActionsContext.Provider value={value}>
      {children}
      <TaskCreateDialog controller={createTask} clients={clients} />
      <ConnectBusinessModal controller={connectBusiness} />
    </UiActionsContext.Provider>
  );
}
