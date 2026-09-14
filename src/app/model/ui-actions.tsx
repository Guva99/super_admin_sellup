import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useClients } from "@/entities/client";
import { usePlans } from "@/entities/plan";
import { useUsers } from "@/entities/user";
import { useOnboardingTemplate } from "@/entities/onboarding-template";
import { useCreateTask, CreateTaskModal } from "@/features/create-task";
import { useConnectBusiness, ConnectBusinessModal } from "@/features/connect-business";
import { UiActionsContext, type UiActions } from "@/shared/lib";

/**
 * Реализация глобальных действий (контракт и хук — в shared/lib/ui-actions).
 * Модалки живут здесь, в провайдере, а не на странице, поэтому не исчезают
 * при переходе между разделами.
 */
export function UiActionsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { clients, addClient } = useClients();
  const { activePlans } = usePlans();
  const { users } = useUsers();
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
      <CreateTaskModal controller={createTask} clients={clients} users={users} />
      <ConnectBusinessModal controller={connectBusiness} />
    </UiActionsContext.Provider>
  );
}
