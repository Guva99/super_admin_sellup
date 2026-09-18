import { AlertCircle, Trash2 } from "lucide-react";
import type { Client } from "@/entities/client";
import { NoReceipt, ReceiptPreview } from "@/entities/payment";
import { RecordPaymentButton } from "@/features/record-payment";
import { formatAmount, formatCalendarDate, formatMoney } from "@/shared/lib";
import { ModalOverlay } from "@/shared/ui";
import { useClientBilling } from "../model/useClientBilling";

export function ClientBilling({ client }: { client: Client }) {
  const { payments, canManage, pendingDelete, isDeleting, deleteError, askDelete, cancelDelete, confirmDelete } = useClientBilling(client.id);

  return (
    <div className="space-y-5 max-w-[760px]">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Тариф</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{client.planName ?? "—"}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">MRR</p>
          <p className="text-sm font-semibold text-slate-900 mt-1 font-mono">{client.mrr > 0 ? formatMoney(client.mrr) : "—"}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Оплачено</p>
          <p className="text-sm font-semibold text-slate-900 mt-1 font-mono">{payments.isLoading ? "…" : formatAmount(payments.total)}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">История платежей</h3>
          <RecordPaymentButton clientId={client.id} onAdd={payments.add} />
        </div>

        {payments.error && (
          <div role="alert" className="flex items-center gap-2 px-5 py-3 text-xs text-red-600 bg-red-50 border-b border-red-100">
            <AlertCircle size={13} />
            {payments.error}
          </div>
        )}

        {payments.payments.length > 0 && (
          <table className="w-full text-xs">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium text-slate-400">Дата</th>
                <th className="px-5 py-2.5 text-left font-medium text-slate-400">Описание</th>
                <th className="px-3 py-2.5 text-left font-medium text-slate-400">Чек</th>
                <th className="px-3 py-2.5 text-left font-medium text-slate-400">Внёс</th>
                <th className="px-5 py-2.5 text-right font-medium text-slate-400">Сумма</th>
                {canManage && <th className="w-10" />}
              </tr>
            </thead>
            <tbody>
              {payments.payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatCalendarDate(p.paidAt)}</td>
                  <td className="px-5 py-3 text-slate-600">{p.description || <span className="text-slate-300">—</span>}</td>
                  <td className="px-3 py-2">{p.receipt ? <ReceiptPreview receipt={p.receipt} paymentId={p.id} download={payments.downloadReceipt} /> : <NoReceipt />}</td>
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{p.recordedByName || "—"}</td>
                  <td className="px-5 py-3 text-right font-mono font-medium text-slate-800 whitespace-nowrap">{formatAmount(p.amount)}</td>
                  {canManage && (
                    <td className="pr-3 py-3 text-right">
                      <button type="button" onClick={() => askDelete(p)} title="Удалить платёж" className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {payments.isLoading && <p className="px-5 py-8 text-center text-sm text-slate-400">Загружаем платежи…</p>}
        {!payments.isLoading && !payments.error && payments.payments.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">Платежей ещё нет</p>}
      </div>

      {pendingDelete && (
        <ModalOverlay onClose={cancelDelete}>
          <div className="w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">
                Удалить платёж {formatAmount(pendingDelete.amount)} от {formatCalendarDate(pendingDelete.paidAt)}?
              </h2>
            </div>
            <div className="p-5 space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>Платёж и его чек исчезнут из биллинга, сумма «Оплачено» уменьшится.</p>
              <p className="text-slate-400">В истории бизнеса останется отметка об удалении.</p>
              {deleteError && (
                <div role="alert" className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-600">
                  <AlertCircle size={13} className="flex-shrink-0 mt-px" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <button type="button" onClick={cancelDelete} className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800">
                Отмена
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
              >
                {isDeleting ? "Удаляем…" : "Удалить платёж"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
