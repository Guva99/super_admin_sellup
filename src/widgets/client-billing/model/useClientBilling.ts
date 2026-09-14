import { useState } from "react";
import { usePayments, type Payment, type PaymentsState } from "@/entities/payment";
import { useSession } from "@/entities/session";
import { canRecordPayments } from "@/entities/user";
import { describeApiError } from "@/shared/api";

export interface ClientBillingData {
  payments: PaymentsState;
  /** Удалять ошибочные платежи может тот же круг, что их вносит. */
  canManage: boolean;
  /** Платёж, удаление которого ждёт подтверждения. */
  pendingDelete: Payment | null;
  isDeleting: boolean;
  deleteError: string | null;
  askDelete: (payment: Payment) => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
}

/** Данные вкладки «Биллинг»: платежи бизнеса и удаление ошибочно внесённого. */
export function useClientBilling(clientId: string): ClientBillingData {
  const payments = usePayments(clientId);
  const { user } = useSession();
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    const result = await payments.remove(pendingDelete.id);
    setIsDeleting(false);
    if (!result.ok) {
      setDeleteError(describeApiError(result.error));
      return;
    }
    setPendingDelete(null);
  };

  return {
    payments,
    canManage: canRecordPayments(user?.roleKey),
    pendingDelete,
    isDeleting,
    deleteError,
    askDelete: (payment) => {
      setDeleteError(null);
      setPendingDelete(payment);
    },
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
  };
}
