import { apiFetch, type Result } from "@/shared/api";
import type {
  AggregateResult,
  CleanupResult,
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
} from "../model/types";

const query = (params: Record<string, string | number>) => new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();

/** Ответы бэкенда совпадают с моделью — маппер не нужен. Все ручки — Owner/Admin. */
export const siteAnalyticsApi = {
  overview: (period: TrafficPeriod): Promise<Result<TrafficOverview>> => apiFetch(`/analytics/overview?${query({ ...period })}`),

  timeSeries: (period: TrafficPeriod, groupBy: TrafficGroupBy): Promise<Result<TrafficPoint[]>> =>
    apiFetch(`/analytics/timeseries?${query({ ...period, groupBy })}`),

  pages: (period: TrafficPeriod, list: ListQuery<PageSort>): Promise<Result<TrafficPages>> =>
    apiFetch(`/analytics/pages?${query({ ...period, ...list })}`),

  leadFunnel: (period: TrafficPeriod, list: ListQuery<LeadSort>): Promise<Result<LeadFunnel>> =>
    apiFetch(`/analytics/leads/funnel?${query({ ...period, ...list })}`),

  /** Читает сырые события — пересчёта сводок не ждёт. */
  heatmap: (period: TrafficPeriod, pagePath: string, device: HeatmapDevice): Promise<Result<Heatmap>> =>
    apiFetch(`/analytics/heatmap?${query({ ...period, pagePath, device })}`),

  /** Пересобрать дневные сводки периода из сырых событий. */
  aggregate: (period: TrafficPeriod): Promise<Result<AggregateResult>> =>
    apiFetch("/analytics/aggregate", { method: "POST", body: period }),

  /** Удалить сырые события старше срока хранения (90 дней). */
  cleanup: (): Promise<Result<CleanupResult>> => apiFetch("/analytics/retention/cleanup", { method: "POST" }),
};
