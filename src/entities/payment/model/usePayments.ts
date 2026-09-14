import { useCallback, useEffect, useMemo, useState } from "react";
import { describeApiError, type Result } from "@/shared/api";
import { paymentApi } from "../api/paymentApi";
import type { NewPaymentInput, Payment } from "./types";

export interface PaymentsState {
  payments: Payment[];
  /** Всего оплачено — сумма всех платежей. */
  total: number;
  isLoading: boolean;
  error: string | null;
  add: (input: NewPaymentInput) => Promise<Result<Payment>>;
  remove: (paymentId: string) => Promise<Result<void>>;
  downloadReceipt: (paymentId: string) => Promise<Result<Blob>>;
}

/**
 * Платежи одного бизнеса. Живут на вкладке «Биллинг», а не в общем сторе:
 * нужны только там и только для открытого бизнеса.
 */
export function usePayments(clientId: string): PaymentsState {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    paymentApi.list(clientId).then((result) => {
      if (cancelled) return;
      if (result.ok) setPayments(result.data);
      else setError(describeApiError(result.error));
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const add = useCallback(
    async (input: NewPaymentInput) => {
      const result = await paymentApi.create(clientId, input);
      // Новые сверху, как отдаёт сервер (по дате платежа).
      if (result.ok) setPayments((prev) => [result.data, ...prev].sort((a, b) => b.paidAt.localeCompare(a.paidAt)));
      return result;
    },
    [clientId],
  );

  const remove = useCallback(
    async (paymentId: string) => {
      const result = await paymentApi.remove(clientId, paymentId);
      if (result.ok) setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      return result;
    },
    [clientId],
  );

  const downloadReceipt = useCallback((paymentId: string) => paymentApi.downloadReceipt(clientId, paymentId), [clientId]);

  const total = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);

  return { payments, total, isLoading, error, add, remove, downloadReceipt };
}
