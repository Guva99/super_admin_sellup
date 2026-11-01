import { AlertCircle, RefreshCw } from "lucide-react";
import { AUTO_AGGREGATE_MAX_DAYS, type TrafficAggregation } from "@/entities/site-analytics";

const timeOf = (ms: number) => new Date(ms).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

/**
 * «Пересчитать» и состояние сводок периода. Короткий период пересчитывается
 * сам при открытии; длинный показывает то, что уже посчитано, — кнопка для него.
 */
export function RecalculateButton({ controller }: { controller: TrafficAggregation }) {
  const { isRunning, auto, finishedAt, error, recalculate } = controller;

  const note = isRunning
    ? "Пересчитываем сводки…"
    : error
      ? null
      : finishedAt
        ? `Сводки пересчитаны в ${timeOf(finishedAt)}`
        : auto
          ? null
          : `Период длиннее ${AUTO_AGGREGATE_MAX_DAYS} дней — показаны сводки, посчитанные раньше`;

  return (
    <div className="flex items-center gap-3">
      {note && <span className="text-xs text-ink-400">{note}</span>}
      {error && (
        <span role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={12} />
          Не удалось пересчитать: {error}
        </span>
      )}
      <button
        type="button"
        onClick={recalculate}
        disabled={isRunning}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 disabled:opacity-60 text-ink-600 text-xs font-medium transition-colors"
      >
        <RefreshCw size={12} className={isRunning ? "animate-spin" : ""} />
        Пересчитать
      </button>
    </div>
  );
}
