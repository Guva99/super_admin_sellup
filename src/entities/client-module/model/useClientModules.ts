import { useCallback, useEffect, useState } from "react";
import { describeApiError, type Result } from "@/shared/api";
import { clientModuleApi } from "../api/clientModuleApi";
import type { ClientFeature } from "./types";

export interface ClientModulesState {
  /** Состояние по ключу фичи. */
  states: Record<string, ClientFeature["state"]>;
  isLoading: boolean;
  error: string | null;
  set: (key: string, on: boolean) => Promise<Result<ClientFeature>>;
}

/**
 * Модули одного бизнеса. Нужны только в его карточке, поэтому живут не в
 * общем сторе, а рядом с ней.
 */
export function useClientModules(clientId: string): ClientModulesState {
  const [states, setStates] = useState<Record<string, ClientFeature["state"]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    clientModuleApi.list(clientId).then((result) => {
      if (cancelled) return;
      if (result.ok) setStates(Object.fromEntries(result.data.map((f) => [f.featureKey, f.state])));
      else setError(describeApiError(result.error));
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const set = useCallback(
    async (key: string, on: boolean) => {
      const result = await clientModuleApi.set(clientId, key, on);
      if (result.ok) setStates((prev) => ({ ...prev, [key]: result.data.state }));
      return result;
    },
    [clientId],
  );

  return { states, isLoading, error, set };
}
