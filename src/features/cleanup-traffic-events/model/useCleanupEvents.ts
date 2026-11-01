import { useState } from "react";
import { siteAnalyticsApi, type CleanupResult } from "@/entities/site-analytics";
import { describeApiError } from "@/shared/api";

export interface CleanupEventsController {
  isConfirming: boolean;
  isDeleting: boolean;
  error: string | null;
  /** Итог последней чистки — показывается рядом с кнопкой. */
  result: CleanupResult | null;
  ask: () => void;
  cancel: () => void;
  confirm: () => void;
}

/**
 * Удаление сырых событий старше срока хранения. API делает это и сам каждую
 * ночь; кнопка — чтобы освободить место сейчас. Сводки по дням остаются.
 */
export function useCleanupEvents(): CleanupEventsController {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CleanupResult | null>(null);

  const confirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setError(null);
    const res = await siteAnalyticsApi.cleanup();
    setIsDeleting(false);
    if (!res.ok) {
      setError(describeApiError(res.error));
      return;
    }
    setResult(res.data);
    setIsConfirming(false);
  };

  return {
    isConfirming,
    isDeleting,
    error,
    result,
    ask: () => {
      setError(null);
      setIsConfirming(true);
    },
    cancel: () => setIsConfirming(false),
    confirm: () => void confirm(),
  };
}
