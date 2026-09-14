import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { describeApiError, type Result } from "@/shared/api";
import { createClient, deleteClient, getClients, moveClientStage, updateClientTaskKey, updateOnboardingStep as saveOnboardingStep } from "../api/clientApi";
import type { Client, ClientStage, NewClientInput, OnboardingStep } from "./types";

/**
 * Единственный владелец списка клиентов. Клиенты приходят из бэкенда.
 *
 * Перемещения в воронке и правки этапов применяются сразу (интерфейс не ждёт
 * сервера), затем сохраняются; если сохранить не вышло — изменение
 * откатывается, а текст ошибки попадает в `mutationError` (его показывает
 * каркас приложения).
 */
export interface ClientsStore {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  /** Ошибка последнего неудачного сохранения; null — всё сохранено. */
  mutationError: string | null;
  dismissMutationError: () => void;
  addClient: (input: NewClientInput) => Promise<Result<Client>>;
  moveStage: (id: string, stage: ClientStage) => void;
  /** Переименовать ключ задач бизнеса. Ошибку показывает вызывающая форма. */
  setTaskKey: (id: string, taskKey: string) => Promise<Result<Client>>;
  /**
   * Удалить бизнес (только владелец). Данные остаются в базе, но из интерфейса
   * бизнес пропадает; его задачи убирает вызывающая фича.
   */
  removeClient: (id: string) => Promise<Result<void>>;
  /** На сервере сохраняются title, description и status. */
  updateOnboardingStep: (clientId: string, stepId: string, patch: Partial<OnboardingStep>) => void;
}

const ClientsContext = createContext<ClientsStore | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Актуальный список для откатов, без пересоздания колбэков на каждое изменение.
  const clientsRef = useRef(clients);
  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);

  useEffect(() => {
    let cancelled = false;
    getClients().then((result) => {
      if (cancelled) return;
      if (result.ok) setClients(result.data);
      else setError(describeApiError(result.error));
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const replaceClient = useCallback(
    (client: Client) => setClients((prev) => prev.map((c) => (c.id === client.id ? client : c))),
    [],
  );

  const addClient = useCallback(async (input: NewClientInput) => {
    const result = await createClient(input);
    if (result.ok) setClients((prev) => [result.data, ...prev]);
    return result;
  }, []);

  const setTaskKey = useCallback(
    async (id: string, taskKey: string) => {
      const result = await updateClientTaskKey(id, taskKey);
      if (result.ok) replaceClient(result.data);
      return result;
    },
    [replaceClient],
  );

  const removeClient = useCallback(async (id: string) => {
    const result = await deleteClient(id);
    if (result.ok) setClients((prev) => prev.filter((c) => c.id !== id));
    return result;
  }, []);

  const moveStage = useCallback(
    (id: string, stage: ClientStage) => {
      const before = clientsRef.current.find((c) => c.id === id);
      if (!before || before.stage === stage) return;

      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
      moveClientStage(id, stage).then((result) => {
        if (result.ok) {
          // Ответ сервера несёт новый статус, MRR и «дней в статусе».
          replaceClient(result.data);
        } else {
          replaceClient(before);
          setMutationError(`Не удалось переместить «${before.name}»: ${describeApiError(result.error)}`);
        }
      });
    },
    [replaceClient],
  );

  const updateOnboardingStep = useCallback(
    (clientId: string, stepId: string, patch: Partial<OnboardingStep>) => {
      const before = clientsRef.current.find((c) => c.id === clientId);
      if (!before) return;

    const applyStepPatch = (client: Client, stepPatch: Partial<OnboardingStep>): Client => ({
      ...client,
      onboardingSteps: client.onboardingSteps.map((step) => (step.id === stepId ? { ...step, ...stepPatch } : step)),
    });
    setClients((prev) => prev.map((c) => (c.id === clientId ? applyStepPatch(c, patch) : c)));

    const { title, description, status } = patch;
    if (title === undefined && description === undefined && status === undefined) return;

    saveOnboardingStep(clientId, stepId, { title, description, status }).then((result) => {
      if (result.ok) return;
      const previous = before.onboardingSteps.find((step) => step.id === stepId);
      if (previous) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === clientId
              ? applyStepPatch(c, {
                  title: previous.title,
                  description: previous.description,
                  status: previous.status,
                })
              : c,
          ),
        );
      }
      setMutationError(`Не удалось сохранить этап онбординга: ${describeApiError(result.error)}`);
    });
  }, []);

  const dismissMutationError = useCallback(() => setMutationError(null), []);

  const value = useMemo<ClientsStore>(
    () => ({
      clients,
      isLoading,
      error,
      mutationError,
      dismissMutationError,
      addClient,
      moveStage,
      setTaskKey,
      removeClient,
      updateOnboardingStep,
    }),
    [clients, isLoading, error, mutationError, dismissMutationError, addClient, moveStage, setTaskKey, removeClient, updateOnboardingStep],
  );

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
}

export function useClients(): ClientsStore {
  const store = useContext(ClientsContext);
  if (!store) throw new Error("useClients вызван вне <ClientsProvider>");
  return store;
}

/** Один клиент по id. Возвращает undefined, если такого нет. */
export function useClient(id: string | undefined): Client | undefined {
  const { clients } = useClients();
  return clients.find((client) => client.id === id);
}
