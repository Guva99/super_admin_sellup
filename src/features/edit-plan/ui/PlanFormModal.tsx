import { AlertCircle, Loader2, X } from "lucide-react";
import { ModalOverlay } from "@/shared/ui";
import type { PlanFormController } from "../model/usePlanForm";

const inputClass =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-slate-300";

export function PlanFormModal({ controller }: { controller: PlanFormController }) {
  const { isOpen, editing, draft, isDirty, restored, isSubmitting, error, close, patch, submit } = controller;

  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={close} unsaved={isDirty}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        noValidate
        className="w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{editing ? "Редактировать тариф" : "Новый тариф"}</h2>
            {editing && (
              <p className="text-xs text-slate-400 mt-0.5">Новая цена — только для новых клиентов</p>
            )}
          </div>
          <button type="button" onClick={close} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="plan-name" className="text-xs font-medium text-slate-600 block mb-1.5">Название *</label>
            <input id="plan-name" autoFocus value={draft.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Полный" className={inputClass} />
          </div>

          <div>
            <label htmlFor="plan-description" className="text-xs font-medium text-slate-600 block mb-1.5">Описание</label>
            <input id="plan-description" value={draft.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Что входит в тариф" className={inputClass} />
          </div>

          {!editing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.isCustom}
                onChange={(e) => patch({ isCustom: e.target.checked })}
                className="w-4 h-4 accent-brand-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700">Цена задаётся для каждого клиента</span>
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="plan-price" className="text-xs font-medium text-slate-600 block mb-1.5">
                {draft.isCustom ? "Базовая цена, ₽/мес" : "Цена, ₽/мес *"}
              </label>
              <input id="plan-price" type="number" min="0" value={draft.price} onChange={(e) => patch({ price: e.target.value })} placeholder={draft.isCustom ? "0" : "70000"} className={inputClass} />
            </div>
            <div>
              <label htmlFor="plan-setup" className="text-xs font-medium text-slate-600 block mb-1.5">Разовая оплата, ₽</label>
              <input id="plan-setup" type="number" min="0" value={draft.setupPrice} onChange={(e) => patch({ setupPrice: e.target.value })} placeholder="0" className={inputClass} />
            </div>
          </div>

          {draft.isCustom && <p className="text-xs text-slate-400">Базовая цена подставится при подключении бизнеса — там её можно изменить под клиента.</p>}

          {restored && <p className="text-[11px] text-amber-600">Восстановлен незаконченный черновик тарифа.</p>}
          {error && (
            <div role="alert" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
              <AlertCircle size={13} className="flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <button type="button" onClick={close} className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800">
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
          >
            {isSubmitting && <Loader2 size={12} className="animate-spin" />}
            {editing ? "Сохранить" : "Добавить тариф"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
