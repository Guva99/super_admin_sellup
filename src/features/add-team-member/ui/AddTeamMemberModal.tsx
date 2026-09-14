import { AlertCircle, X } from "lucide-react";
import { ROLE_LABEL } from "@/entities/user";
import { ModalOverlay } from "@/shared/ui";
import type { AddTeamMemberController } from "../model/useAddTeamMember";

export function AddTeamMemberModal({ controller }: { controller: AddTeamMemberController }) {
  const { isOpen, draft, roles, isSubmitting, error, close, patch, submit } = controller;

  if (!isOpen) return null;

  const canSubmit = draft.email.trim() !== "" && draft.fullName.trim() !== "" && draft.password.length >= 8;

  return (
    <ModalOverlay onClose={close}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Добавить сотрудника</h2>
          <button onClick={close} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Имя *</label>
            <input
              autoFocus
              type="text"
              value={draft.fullName}
              onChange={(e) => patch({ fullName: e.target.value })}
              placeholder="Иван Петров"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-slate-300"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Email *</label>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => patch({ email: e.target.value })}
              placeholder="ivan@sellup.ru"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-slate-300"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Пароль для входа *</label>
            <input
              type="text"
              value={draft.password}
              onChange={(e) => patch({ password: e.target.value })}
              placeholder="Не короче 8 символов"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-slate-300"
            />
            <p className="text-[11px] text-slate-400 mt-1">Передайте пароль сотруднику — с ним он войдёт в консоль.</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Роль</label>
            <select
              value={draft.roleId}
              onChange={(e) => patch({ roleId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white text-slate-700 cursor-pointer"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{ROLE_LABEL[role.key] ?? role.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
              <AlertCircle size={13} className="flex-shrink-0 mt-px" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2 justify-end border-t border-slate-100 pt-4">
          <button onClick={close} className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">Отмена</button>
          <button
            onClick={submit}
            disabled={!canSubmit || isSubmitting}
            className="px-5 py-2 text-xs font-medium bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors"
          >
            {isSubmitting ? "Добавляем…" : "Добавить"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
