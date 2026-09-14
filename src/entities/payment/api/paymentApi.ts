import { apiFetch, type Result } from "@/shared/api";
import type { NewPaymentInput, Payment } from "../model/types";

/** Ответ бэкенда совпадает с моделью — отдельный маппер не нужен. */
export const paymentApi = {
  list: (clientId: string): Promise<Result<Payment[]>> => apiFetch(`/clients/${clientId}/payments`),

  /** Owner/Admin. Сумма, дата и чек уходят одной формой. */
  create: (clientId: string, input: NewPaymentInput): Promise<Result<Payment>> => {
    const form = new FormData();
    form.append("amount", String(input.amount));
    form.append("paidAt", input.paidAt);
    form.append("description", input.description);
    if (input.receipt) form.append("receipt", input.receipt, input.receipt.name);
    return apiFetch(`/clients/${clientId}/payments`, {
      method: "POST",
      body: form,
    });
  },

  /** Owner/Admin. Для платежа, внесённого по ошибке. */
  remove: (clientId: string, paymentId: string): Promise<Result<void>> =>
    apiFetch(`/clients/${clientId}/payments/${paymentId}`, {
      method: "DELETE",
    }),

  downloadReceipt: (clientId: string, paymentId: string): Promise<Result<Blob>> =>
    apiFetch(`/clients/${clientId}/payments/${paymentId}/receipt`, {
      responseType: "blob",
    }),
};
