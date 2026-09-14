import { useState } from "react";
import { receiptError, type NewPaymentInput, type Payment } from "@/entities/payment";
import { useSession } from "@/entities/session";
import { canRecordPayments } from "@/entities/user";
import { describeApiError, type Result } from "@/shared/api";

/** Поля формы как их вводят: сумма — строкой, чтобы не мешать печатать «1 500,50». */
export interface PaymentDraft {
  amount: string;
  paidAt: string;
  description: string;
}

export interface RecordPaymentController {
  /** Вносить платежи могут владелец и администратор — остальным кнопки нет. */
  canRecord: boolean;
  isOpen: boolean;
  draft: PaymentDraft;
  receipt: File | null;
  isSubmitting: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  patch: (changes: Partial<PaymentDraft>) => void;
  /** null — убрать прикреплённый чек. Неподходящий файл не прикрепляется, а показывает ошибку. */
  attachReceipt: (file: File | null) => void;
  submit: () => void;
}

/** Сумма из поля ввода: пробелы и запятая допустимы; null — не число или не больше нуля. */
export function parseAmount(raw: string): number | null {
  const value = Number(raw.trim().replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Сегодня по локальному календарю — `toISOString()` дал бы дату по UTC. */
export function todayYmd(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const emptyDraft = (): PaymentDraft => ({
  amount: "",
  paidAt: todayYmd(),
  description: "",
});

/**
 * Ручное внесение платежа с чеком. Сохраняет через `add` из `usePayments` —
 * список на вкладке обновляется там же, перечитывать ничего не нужно.
 */
export function useRecordPayment(add: (input: NewPaymentInput) => Promise<Result<Payment>>): RecordPaymentController {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<PaymentDraft>(emptyDraft);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (isSubmitting) return;
    const amount = parseAmount(draft.amount);
    if (amount === null) {
      setError("Укажите сумму больше нуля");
      return;
    }
    if (!draft.paidAt) {
      setError("Укажите дату платежа");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const result = await add({
      amount,
      paidAt: draft.paidAt,
      description: draft.description.trim(),
      receipt,
    });
    setIsSubmitting(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    setDraft(emptyDraft());
    setReceipt(null);
    setIsOpen(false);
  };

  return {
    canRecord: canRecordPayments(user?.roleKey),
    isOpen,
    draft,
    receipt,
    isSubmitting,
    error,
    open: () => {
      setError(null);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
    patch: (changes) => setDraft((prev) => ({ ...prev, ...changes })),
    attachReceipt: (file) => {
      const problem = file ? receiptError(file) : null;
      if (problem) {
        setError(problem);
        return;
      }
      setError(null);
      setReceipt(file);
    },
    submit,
  };
}
