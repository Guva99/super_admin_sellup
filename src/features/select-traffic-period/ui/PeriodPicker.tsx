import { PERIOD_PRESETS } from "@/entities/site-analytics";
import type { PeriodPickerController } from "../model/usePeriodPicker";

const DATE_INPUT =
  "px-2.5 py-1.5 text-xs border border-ink-200 rounded-lg bg-surface text-ink-700 focus:outline-none focus:border-brand-400";

/** Пресеты периода таблетками и поля «своего периода». */
export function PeriodPicker({ controller }: { controller: PeriodPickerController }) {
  const { preset, draft, draftError, choosePreset, setDraft, applyDraft } = controller;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="radiogroup" aria-label="Период" className="flex flex-wrap gap-1 bg-ink-100 rounded-lg p-1">
        {PERIOD_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={preset === p.id}
            onClick={() => choosePreset(p.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              preset === p.id ? "bg-surface text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            applyDraft();
          }}
        >
          <input type="date" aria-label="Начало периода" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={DATE_INPUT} />
          <span className="text-xs text-ink-400">—</span>
          <input type="date" aria-label="Конец периода" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={DATE_INPUT} />
          <button
            type="submit"
            disabled={draftError !== null}
            className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
          >
            Показать
          </button>
          {draftError && <span className="text-xs text-red-600">{draftError}</span>}
        </form>
      )}
    </div>
  );
}
