import { useCallback, useEffect, useState } from "react";
import { describeApiError } from "@/shared/api";
import { clientHistoryApi } from "../api/clientHistoryApi";
import type { ClientHistoryEvent } from "./types";

export interface ClientHistoryState {
  events: ClientHistoryEvent[];
  isLoading: boolean;
  error: string | null;
  /** Перечитать ленту — после того, как что-то сделали на этой же вкладке. */
  refresh: () => void;
}

/** История бизнеса с сервера. Читается при открытии вкладки и по `refresh`. */
export function useClientHistory(clientId: string): ClientHistoryState {
  const [events, setEvents] = useState<ClientHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    clientHistoryApi.list(clientId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setEvents(result.data);
        setError(null);
      } else {
        setError(describeApiError(result.error));
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [clientId, generation]);

  const refresh = useCallback(() => setGeneration((g) => g + 1), []);

  return { events, isLoading, error, refresh };
}
