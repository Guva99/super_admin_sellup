import { useCallback, useEffect, useState } from "react";
import { describeApiError, type Result } from "@/shared/api";
import { siteAnalyticsApi } from "../api/siteAnalyticsApi";
import { AUTO_AGGREGATE_MAX_DAYS, periodDays, periodError, withPreviousPeriod } from "./period";
import type {
  AggregateResult,
  Heatmap,
  HeatmapDevice,
  LeadFunnel,
  LeadSort,
  ListQuery,
  PageSort,
  TrafficGroupBy,
  TrafficOverview,
  TrafficPages,
  TrafficPeriod,
  TrafficPoint,
} from "./types";

/**
 * Данные раздела «Посещаемость» живут на его странице, а не в общем сторе:
 * нужны только там и только для выбранного периода.
 */

export interface LoadState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Загрузка по ключу. Пока грузится новый ключ, на экране остаются прежние
 * данные — таблица и график не мигают пустотой при смене периода или сортировки.
 * Ответ на устаревший ключ отбрасывается.
 */
function useLoad<T>(key: string | null, load: () => Promise<Result<T>>): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ data: null, isLoading: key !== null, error: null });

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    load().then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { data: result.data, isLoading: false, error: null }
          : (prev) => ({ data: prev.data, isLoading: false, error: describeApiError(result.error) }),
      );
    });
    return () => {
      cancelled = true;
    };
    // load пересоздаётся на каждый рендер; что грузить, определяет key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

/* --- пересчёт сводок --- */

/**
 * Сводки по дням бэкенд пересчитывает и сам (сегодня и вчера — каждые
 * 10 минут, неделю — ночью), но открытый период должен быть свежим сейчас.
 * Результат пересчёта держим пять минут: переключение вкладок и возврат к тому
 * же периоду не гоняют его заново.
 */
const AGGREGATE_FRESH_MS = 5 * 60_000;
const aggregateCache = new Map<string, { at: number; done: Promise<Result<AggregateResult>> }>();

function runAggregate(period: TrafficPeriod, force: boolean): Promise<Result<AggregateResult>> {
  const key = `${period.from}:${period.to}`;
  const cached = aggregateCache.get(key);
  if (!force && cached && Date.now() - cached.at < AGGREGATE_FRESH_MS) return cached.done;
  // Вместе с предыдущим периодом: обзор сравнивает с ним цифры.
  const done = siteAnalyticsApi.aggregate(withPreviousPeriod(period));
  aggregateCache.set(key, { at: Date.now(), done });
  return done;
}

export interface TrafficAggregation {
  /** Можно грузить данные: пересчёт закончился (успехом или ошибкой) или не нужен. */
  ready: boolean;
  /** Отметка последнего пересчёта — входит в ключи запросов, новый пересчёт перезагружает всё. */
  version: number;
  isRunning: boolean;
  /** Период короткий — пересчитывается сам при открытии; длинный — только кнопкой. */
  auto: boolean;
  /** Когда закончился последний пересчёт этого периода (ms), null — не пересчитывали. */
  finishedAt: number | null;
  error: string | null;
  recalculate: () => void;
}

/** Готовность сводок периода: данные раздела грузятся только после пересчёта. */
export function useTrafficAggregation(period: TrafficPeriod): TrafficAggregation {
  const valid = periodError(period) === null;
  const auto = valid && periodDays(period) <= AUTO_AGGREGATE_MAX_DAYS;
  const key = `${period.from}:${period.to}`;
  const [state, setState] = useState({ key: "", ready: false, isRunning: false, finishedAt: null as number | null, error: null as string | null });

  const start = useCallback(
    (force: boolean) => {
      setState((prev) => ({ ...prev, key, isRunning: true, error: null }));
      runAggregate(period, force).then((result) => {
        const cached = aggregateCache.get(key);
        setState((prev) =>
          prev.key !== key
            ? prev
            : {
                key,
                ready: true,
                isRunning: false,
                // Время из кэша, а не «сейчас»: повторное открытие того же периода даёт тот же ключ данных.
                finishedAt: cached?.at ?? Date.now(),
                error: result.ok ? null : describeApiError(result.error),
              },
        );
      });
    },
    // period меняется вместе с key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  useEffect(() => {
    if (!valid) return;
    if (auto) start(false);
    else setState({ key, ready: true, isRunning: false, finishedAt: null, error: null });
  }, [key, valid, auto, start]);

  const current = state.key === key;
  return {
    ready: valid && current && state.ready,
    version: current ? (state.finishedAt ?? 0) : 0,
    isRunning: current && state.isRunning,
    auto,
    finishedAt: current ? state.finishedAt : null,
    error: current ? state.error : null,
    recalculate: () => start(true),
  };
}

/** То, что запросам данных нужно от пересчёта. */
export type AggregationGate = Pick<TrafficAggregation, "ready" | "version">;

/* --- данные --- */

const periodKey = (period: TrafficPeriod) => `${period.from}:${period.to}`;

export function useTrafficOverview(period: TrafficPeriod, gate: AggregationGate) {
  const key = gate.ready ? `${periodKey(period)}:${gate.version}` : null;
  return useLoad<TrafficOverview>(key, () => siteAnalyticsApi.overview(period));
}

export function useTrafficSeries(period: TrafficPeriod, groupBy: TrafficGroupBy, gate: AggregationGate) {
  const key = gate.ready ? `${periodKey(period)}:${groupBy}:${gate.version}` : null;
  return useLoad<TrafficPoint[]>(key, () => siteAnalyticsApi.timeSeries(period, groupBy));
}

export function useTrafficPages(period: TrafficPeriod, list: ListQuery<PageSort>, gate: AggregationGate) {
  const key = gate.ready ? `${periodKey(period)}:${JSON.stringify(list)}:${gate.version}` : null;
  return useLoad<TrafficPages>(key, () => siteAnalyticsApi.pages(period, list));
}

export function useLeadFunnel(period: TrafficPeriod, list: ListQuery<LeadSort>, gate: AggregationGate) {
  const key = gate.ready ? `${periodKey(period)}:${JSON.stringify(list)}:${gate.version}` : null;
  return useLoad<LeadFunnel>(key, () => siteAnalyticsApi.leadFunnel(period, list));
}

/** Карта кликов читает сырые события — пересчёта сводок не ждёт. */
export function useHeatmap(period: TrafficPeriod, pagePath: string, device: HeatmapDevice) {
  const key = pagePath && periodError(period) === null ? `${periodKey(period)}:${pagePath}:${device}` : null;
  return useLoad<Heatmap>(key, () => siteAnalyticsApi.heatmap(period, pagePath, device));
}
