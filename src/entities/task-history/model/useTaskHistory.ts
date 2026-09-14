import { useEffect, useState } from "react";
import { describeApiError } from "@/shared/api";
import { historyApi } from "../api/historyApi";
import type { TaskHistoryEvent } from "./types";

export interface TaskHistoryState {
  events: TaskHistoryEvent[];
  isLoading: boolean;
  error: string | null;
}

/**
 * История задачи с сервера. `revision` — любая строка, меняющаяся при
 * изменении задачи (например, `updatedAt` + число комментариев): по ней
 * лента перечитывается, отдельного «обновить» у истории нет.
 */
export function useTaskHistory(taskId: string, revision: string, enabled = true): TaskHistoryState {
  const [events, setEvents] = useState<TaskHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Задачи уже нет (удалили из карточки) — запрашивать нечего.
    if (!enabled) return;
    let cancelled = false;
    historyApi.list(taskId).then((result) => {
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
  }, [taskId, revision, enabled]);

  return { events, isLoading, error };
}
