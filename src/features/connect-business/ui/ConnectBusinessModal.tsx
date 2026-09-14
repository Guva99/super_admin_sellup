import { X, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, AlertCircle, Loader2 } from "lucide-react";
import type { ClientNiche } from "@/entities/client";
import { CLIENT_NICHE_LABEL } from "@/entities/client";
import { ModalOverlay } from "@/shared/ui";
import type { ConnectBusinessController } from "../model/useConnectBusiness";

const NICHES: ClientNiche[] = ["retail", "services"];

export function ConnectBusinessModal({ controller }: { controller: ConnectBusinessController }) {
  const {
    isOpen, draft, plans, selectedPlan, stagesExpanded, isSubmitting, error,
    close, patch, toggleStages, addStage, removeStage, updateStage, submit,
  } = controller;

  if (!isOpen || !draft) return null;

  return (
    <ModalOverlay onClose={close}>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Подключить бизнес</h2>
            <p className="text-xs text-slate-400 mt-0.5">Добавится со статусом «Лид» → откроется его карточка</p>
          </div>
          <button onClick={close} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Название бизнеса *</label>
            <input
              autoFocus
              type="text"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="ООО «Название»"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Владелец</label>
              <input
                type="text"
                value={draft.ownerName}
                onChange={(e) => patch({ ownerName: e.target.value })}
                placeholder="Имя Фамилия"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 transition-colors placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Телефон</label>
              <input
                type="text"
                value={draft.ownerPhone}
                onChange={(e) => patch({ ownerPhone: e.target.value })}
                placeholder="+7 000 000-00-00"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 transition-colors placeholder:text-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Email</label>
            <input
              type="email"
              value={draft.ownerEmail}
              onChange={(e) => patch({ ownerEmail: e.target.value })}
              placeholder="owner@company.ru"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 transition-colors placeholder:text-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Ниша</label>
              <select
                value={draft.niche}
                onChange={(e) => patch({ niche: e.target.value as ClientNiche })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white text-slate-700 cursor-pointer"
              >
                {NICHES.map((niche) => (
                  <option key={niche} value={niche}>{CLIENT_NICHE_LABEL[niche]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Тариф</label>
              <select
                value={draft.planId}
                onChange={(e) => patch({ planId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white text-slate-700 cursor-pointer"
              >
                {!selectedPlan && <option value="">— Выберите тариф —</option>}
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {!plan.isCustom ? `${plan.name} — ${plan.price.toLocaleString("ru-RU")} ₽/мес` : plan.price > 0 ? `${plan.name} — от ${plan.price.toLocaleString("ru-RU")} ₽/мес` : plan.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Размер</label>
              <input
                type="text"
                value={draft.size}
                onChange={(e) => patch({ size: e.target.value })}
                placeholder="10 сотрудников"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 transition-colors placeholder:text-slate-300"
              />
            </div>
            {selectedPlan?.isCustom ? (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Фиксированная сумма ₽/мес *</label>
                <input
                  type="number"
                  min="0"
                  value={draft.customPrice}
                  onChange={(e) => patch({ customPrice: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-slate-300 bg-brand-50/30"
                />
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer pb-0.5">
                <input
                  type="checkbox"
                  checked={draft.fixedPrice}
                  onChange={(e) => patch({ fixedPrice: e.target.checked })}
                  className="w-4 h-4 accent-brand-500 cursor-pointer"
                />
                <span className="text-sm text-slate-700">Фиксированная цена</span>
              </label>
            )}
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={toggleStages} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Этапы онбординга</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-brand-100 text-brand-500 rounded-full font-semibold">{draft.stages.length}</span>
                <span className="text-[11px] text-slate-400">— будут показаны во вкладке «Онбординг»</span>
              </div>
              {stagesExpanded ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
            </button>

            {stagesExpanded && (
              <div className="p-3 space-y-2 bg-white">
                {draft.stages.map((stage, idx) => (
                  <div key={stage.id} className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                      <GripVertical size={12} className="text-slate-300" />
                      <span className="text-[11px] font-mono text-slate-400 w-4 text-right">{idx + 1}.</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <input
                        type="text"
                        value={stage.title}
                        onChange={(e) => updateStage(stage.id, "title", e.target.value)}
                        placeholder="Название этапа *"
                        className="w-full text-xs font-semibold text-slate-800 px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-brand-300 outline-none bg-white transition-colors placeholder:text-slate-300 placeholder:font-normal"
                      />
                      <input
                        type="text"
                        value={stage.description}
                        onChange={(e) => updateStage(stage.id, "description", e.target.value)}
                        placeholder="Описание этапа (необязательно)"
                        className="w-full text-xs text-slate-500 px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-brand-300 outline-none bg-white transition-colors placeholder:text-slate-300"
                      />
                    </div>
                    <button onClick={() => removeStage(stage.id)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-1" title="Удалить этап">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={addStage} className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-brand-500 hover:text-brand-600 border border-dashed border-brand-200 hover:border-brand-300 rounded-lg transition-colors bg-brand-50/50">
                  <Plus size={11} />Добавить этап
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div role="alert" className="mx-6 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600 flex-shrink-0">
            <AlertCircle size={13} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="px-6 pb-5 pt-3 border-t border-slate-100 flex gap-2 justify-end flex-shrink-0">
          <button onClick={close} disabled={isSubmitting} className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">Отмена</button>
          <button
            onClick={() => void submit()}
            disabled={!draft.name.trim() || isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors"
          >
            {isSubmitting && <Loader2 size={12} className="animate-spin" />}
            {isSubmitting ? "Сохраняем…" : "Добавить бизнес →"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
