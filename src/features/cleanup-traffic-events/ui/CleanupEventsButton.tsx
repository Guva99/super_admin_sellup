import { AlertCircle, Trash2 } from "lucide-react";
import { formatCount } from "@/entities/site-analytics";
import { ModalOverlay } from "@/shared/ui";
import type { CleanupEventsController } from "../model/useCleanupEvents";

/** «Удалить старые события» с подтверждением и итогом — сколько удалено. */
export function CleanupEventsButton({ controller }: { controller: CleanupEventsController }) {
  const { isConfirming, isDeleting, error, result, ask, cancel, confirm } = controller;

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-xs text-ink-400">
          Удалено событий: {formatCount(result.rawEventsDeleted)}
          {result.replayChunksDeleted > 0 && `, кусков записей визитов: ${formatCount(result.replayChunksDeleted)}`}
          {result.aggregateRowsDeleted > 0 && `, строк сводок: ${formatCount(result.aggregateRowsDeleted)}`}
        </span>
      )}
      <button
        type="button"
        onClick={ask}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={12} />
        Удалить старые события
      </button>

      {isConfirming && (
        <ModalOverlay onClose={cancel}>
          <div className="w-[420px] bg-surface rounded-2xl shadow-2xl border border-ink-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-100">
              <h2 className="text-sm font-semibold text-ink-900">Удалить старые события?</h2>
            </div>
            <div className="p-5 space-y-2 text-xs text-ink-600 leading-relaxed">
              <p>
                Сырые события старше 90 дней — клики, просмотры, прокрутка — будут удалены, а с ними записи визитов старше 30 дней. Карта кликов и список
                визитов за эти сроки опустеют.
              </p>
              <p className="text-ink-400">
                Сводки по дням останутся: визиты, источники и страницы за старые периоды видны по-прежнему. Сервер и так удаляет их каждую ночь.
              </p>
              {error && (
                <div role="alert" className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-600">
                  <AlertCircle size={13} className="flex-shrink-0 mt-px" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-ink-100 bg-ink-50/50">
              <button type="button" onClick={cancel} className="px-3 py-2 text-xs font-medium text-ink-600 hover:text-ink-800">
                Отмена
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
              >
                {isDeleting ? "Удаляем…" : "Удалить"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
