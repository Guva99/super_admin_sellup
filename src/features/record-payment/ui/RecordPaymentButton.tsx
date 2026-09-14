import { useEffect, useState } from "react";
import { AlertCircle, CreditCard, FileText, Paperclip, X } from "lucide-react";
import { RECEIPT_ACCEPT, type NewPaymentInput, type Payment } from "@/entities/payment";
import type { Result } from "@/shared/api";
import { formatBytes } from "@/shared/lib";
import { ModalOverlay } from "@/shared/ui";
import { useRecordPayment } from "../model/useRecordPayment";

interface RecordPaymentButtonProps {
  onAdd: (input: NewPaymentInput) => Promise<Result<Payment>>;
}

const INPUT_CLASS = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-slate-300";

/**
 * «Внести платёж» на вкладке биллинга: сумма, дата, за что и чек. Кнопки нет
 * ни у кого, кроме владельца и администратора.
 */
export function RecordPaymentButton({ onAdd }: RecordPaymentButtonProps) {
  const { canRecord, isOpen, draft, receipt, isSubmitting, error, open, close, patch, attachReceipt, submit } = useRecordPayment(onAdd);

  if (!canRecord) return null;

  return (
    <>
      <button type="button" onClick={open} className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 transition-colors">
        <CreditCard size={12} />
        Внести платёж
      </button>

      {isOpen && (
        <ModalOverlay onClose={close}>
          <div className="w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Новый платёж</h2>
              <button type="button" onClick={close} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Сумма, ₽ *</label>
                  <input
                    autoFocus
                    type="text"
                    inputMode="decimal"
                    value={draft.amount}
                    onChange={(e) => patch({ amount: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="70 000"
                    className={`${INPUT_CLASS} font-mono`}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Дата платежа *</label>
                  <input type="date" value={draft.paidAt} onChange={(e) => patch({ paidAt: e.target.value })} className={INPUT_CLASS} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">За что</label>
                <input
                  type="text"
                  value={draft.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Подписка за сентябрь"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Чек</label>
                {receipt ? (
                  <ReceiptDraft file={receipt} onRemove={() => attachReceipt(null)} />
                ) : (
                  <label className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-slate-200 rounded-lg text-xs text-slate-500 hover:border-brand-300 hover:text-brand-600 cursor-pointer transition-colors">
                    <Paperclip size={13} />
                    Прикрепить фото или PDF чека
                    <input
                      type="file"
                      accept={RECEIPT_ACCEPT}
                      className="hidden"
                      onChange={(e) => {
                        attachReceipt(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
                  <AlertCircle size={13} className="flex-shrink-0 mt-px" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <button type="button" onClick={close} className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800">
                Отмена
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
              >
                {isSubmitting ? "Сохраняем…" : "Сохранить платёж"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}

/** Прикреплённый, но ещё не отправленный чек: картинка — превью, PDF — имя файла. */
function ReceiptDraft({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    if (!isImage) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isImage]);

  return (
    <div className="flex items-center gap-3 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
      {isImage && url ? <img src={url} alt={file.name} className="h-12 w-16 object-cover rounded border border-slate-200" /> : <FileText size={16} className="text-slate-400 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-700 truncate">{file.name}</p>
        <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
      </div>
      <button type="button" onClick={onRemove} title="Убрать чек" className="text-slate-400 hover:text-red-500">
        <X size={14} />
      </button>
    </div>
  );
}
