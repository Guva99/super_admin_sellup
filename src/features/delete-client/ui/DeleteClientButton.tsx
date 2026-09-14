import { AlertCircle, Trash2 } from "lucide-react";
import type { Client } from "@/entities/client";
import { ModalOverlay } from "@/shared/ui";
import { useDeleteClient } from "../model/useDeleteClient";

/**
 * «Удалить бизнес» в карточке клиента. Кнопки нет ни у кого, кроме владельца:
 * действие редкое и заметное, поэтому подтверждение отдельным окном.
 */
export function DeleteClientButton({ client, onDeleted }: { client: Client; onDeleted: () => void }) {
  const { canDelete, isConfirming, isDeleting, error, taskCount, ask, cancel, confirm } = useDeleteClient(client, onDeleted);

  if (!canDelete) return null;

  return (
    <>
      <button
        type="button"
        onClick={ask}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors"
      >
        <Trash2 size={12} />
        Удалить бизнес
      </button>

      {isConfirming && (
        <ModalOverlay onClose={cancel}>
          <div className="w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Удалить «{client.name}»?</h2>
            </div>
            <div className="p-5 space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                Бизнес пропадёт из списков, воронки и MRR
                {taskCount > 0 && <>, вместе с ним скроются его задачи ({taskCount})</>}.
              </p>
              <p className="text-slate-400">Данные остаются в базе — ошибочное удаление можно отменить. Ключ задач «{client.taskKey}» освободится.</p>
              {error && (
                <div role="alert" className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-600">
                  <AlertCircle size={13} className="flex-shrink-0 mt-px" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <button type="button" onClick={cancel} className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800">
                Отмена
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
              >
                {isDeleting ? "Удаляем…" : "Удалить бизнес"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}
