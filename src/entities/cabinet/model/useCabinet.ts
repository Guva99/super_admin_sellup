import { useCallback, useEffect, useState } from "react";
import { describeApiError } from "@/shared/api";
import { cabinetApi } from "../api/cabinetApi";
import type { CabinetOverview, PublicPlan } from "./types";

export interface CabinetState {
  overview: CabinetOverview | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/** Главный экран кабинета: бизнес, тариф, ход подключения. */
export function useCabinet(): CabinetState {
  const [overview, setOverview] = useState<CabinetOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    cabinetApi.me().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setOverview(result.data);
        setError(null);
      } else {
        setError(describeApiError(result.error));
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  const reload = useCallback(() => setRevision((r) => r + 1), []);
  return { overview, isLoading, error, reload };
}

/** Тарифы для формы регистрации; пустой список, пока не загрузились. */
export function usePublicPlans(): { plans: PublicPlan[]; error: string | null } {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    cabinetApi.publicPlans().then((result) => {
      if (cancelled) return;
      if (result.ok) setPlans(result.data);
      else setError(describeApiError(result.error));
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return { plans, error };
}
