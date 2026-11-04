import { apiFetch, type Result } from "@/shared/api";
import type {
  AggregateResult,
  CleanupResult,
  Goals,
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
  VisitDetail,
  VisitFilter,
  Visits,
  VisitSort,
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

  /** Цели помимо формы заявки. Читает сырые события — пересчёта сводок не ждёт. */
  goals: (period: TrafficPeriod): Promise<Result<Goals>> => apiFetch(`/analytics/goals?${query({ ...period })}`),

  /** Читает сырые события — пересчёта сводок не ждёт. */
  heatmap: (period: TrafficPeriod, pagePath: string, device: HeatmapDevice): Promise<Result<Heatmap>> =>
    apiFetch(`/analytics/heatmap?${query({ ...period, pagePath, device })}`),

  /** Визиты, начавшиеся в период; пустые поля фильтра не уходят. Читает сырые события. */
  visits: (period: TrafficPeriod, filter: VisitFilter, list: ListQuery<VisitSort>): Promise<Result<Visits>> => {
    const params: Record<string, string | number> = { ...period, ...list };
    if (filter.device) params.device = filter.device;
    if (filter.source) params.source = filter.source;
    if (filter.lead) params.lead = filter.lead;
    if (filter.visitorId) params.visitorId = filter.visitorId;
    if (filter.recorded) params.recorded = "true";
    return apiFetch(`/analytics/sessions?${query(params)}`);
  },

  /** Визит целиком: хронология событий и запись для плеера. */
  visit: (sessionId: string): Promise<Result<VisitDetail>> => apiFetch(`/analytics/sessions/${encodeURIComponent(sessionId)}`),

  /** Пересобрать дневные сводки периода из сырых событий. */
  aggregate: (period: TrafficPeriod): Promise<Result<AggregateResult>> =>
    apiFetch("/analytics/aggregate", { method: "POST", body: period }),

  /** Удалить сырые события (старше 90 дней) и записи визитов (старше 30) — то, что прошло срок хранения. */
  cleanup: (): Promise<Result<CleanupResult>> => apiFetch("/analytics/retention/cleanup", { method: "POST" }),
};
