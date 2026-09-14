import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { describeApiError, type Result } from "@/shared/api";
import { planApi } from "../api/planApi";
import type { Plan, PlanInput } from "./types";

/**
 * Тарифы из базы. Нужны форме подключения бизнеса, биллингу и «Настройкам»,
 * поэтому живут в сторе, а не в одной странице.
 */
export interface PlansStore {
  /** Все тарифы, включая архивные — у старых клиентов может быть архивный. */
  plans: Plan[];
  /** Тарифы, которые можно выбрать при подключении. */
  activePlans: Plan[];
  isLoading: boolean;
  error: string | null;
  createPlan: (input: PlanInput) => Promise<Result<Plan>>;
  updatePlan: (id: string, input: PlanInput) => Promise<Result<Plan>>;
}

const PlansContext = createContext<PlansStore | null>(null);

export function PlansProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    planApi.list().then((result) => {
      if (cancelled) return;
      if (result.ok) setPlans(result.data);
      else setError(describeApiError(result.error));
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const createPlan = useCallback(async (input: PlanInput) => {
    const result = await planApi.create(input);
    if (result.ok) setPlans((prev) => [...prev, result.data]);
    return result;
  }, []);

  const updatePlan = useCallback(async (id: string, input: PlanInput) => {
    const result = await planApi.update(id, input);
    if (result.ok) setPlans((prev) => prev.map((plan) => (plan.id === id ? result.data : plan)));
    return result;
  }, []);

  const value = useMemo<PlansStore>(
    () => ({
      plans,
      activePlans: plans.filter((plan) => plan.status === "ACTIVE"),
      isLoading,
      error,
      createPlan,
      updatePlan,
    }),
    [plans, isLoading, error, createPlan, updatePlan],
  );

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>;
}

export function usePlans(): PlansStore {
  const store = useContext(PlansContext);
  if (!store) throw new Error("usePlans вызван вне <PlansProvider>");
  return store;
}
