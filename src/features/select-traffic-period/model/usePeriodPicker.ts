import { useEffect, useState } from "react";
import { periodError, presetOf, presetPeriod, type PeriodPreset, type TrafficPeriod } from "@/entities/site-analytics";

export interface PeriodPickerController {
  preset: PeriodPreset;
  /** Даты «своего периода», пока их правят, — запрос уходит только по «Показать». */
  draft: TrafficPeriod;
  draftError: string | null;
  choosePreset: (preset: PeriodPreset) => void;
  setDraft: (draft: TrafficPeriod) => void;
  applyDraft: () => void;
}

/**
 * Выбор периода. Сам период — у страницы (он в адресе); здесь пресеты и
 * поля «своего периода» с проверкой: начало не позже конца, не больше 366 дней.
 */
export function usePeriodPicker(period: TrafficPeriod, onChange: (period: TrafficPeriod) => void): PeriodPickerController {
  const [custom, setCustom] = useState(false);
  const [draft, setDraft] = useState(period);

  // Период сменился снаружи (ссылка, «назад») — поля показывают его.
  useEffect(() => setDraft({ from: period.from, to: period.to }), [period.from, period.to]);

  const preset = custom ? "custom" : presetOf(period);
  const draftError = periodError(draft);

  return {
    preset,
    draft,
    draftError,
    choosePreset: (next) => {
      const p = presetPeriod(next);
      setCustom(next === "custom");
      if (p) onChange(p);
    },
    setDraft,
    applyDraft: () => {
      if (draftError) return;
      onChange(draft);
    },
  };
}
