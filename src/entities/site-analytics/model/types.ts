/**
 * Посещаемость лендинга — ответы бэкенда (`/analytics/*`) как есть.
 * Даты — календарные дни по Москве в виде YYYY-MM-DD, обе границы периода включительно.
 */

export interface TrafficPeriod {
  from: string;
  to: string;
}

export interface TrafficTotals {
  sessions: number;
  uniqueVisitors: number;
  pageViews: number;
  bouncedSessions: number;
  totalPageDurationSec: number;
  pageDurationSamples: number;
  averageTimeOnPageSec: number;
  /** Доля визитов с одним просмотром, %. */
  bounceRate: number;
  /** Визиты на просмотр, %. */
  exitRate: number;
}

/** Сравнение с прошлым периодом: счётчики и время — в %, null — сравнивать не с чем; доли — в пунктах. */
export interface TrafficDelta {
  sessionsPercent: number | null;
  uniqueVisitorsPercent: number | null;
  pageViewsPercent: number | null;
  averageTimeOnPageSecPercent: number | null;
  bounceRatePoints: number | null;
  exitRatePoints: number | null;
}

export interface TrafficSource {
  source: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  sessions: number;
  uniqueVisitors: number;
  pageViews: number;
  /** Доля просмотров, %. */
  share: number;
}

export interface TrafficDevice {
  deviceType: string;
  sessions: number;
  uniqueVisitors: number;
  pageViews: number;
  share: number;
}

export interface TrafficOverview {
  from: string;
  to: string;
  current: TrafficTotals;
  previous: TrafficTotals;
  comparison: TrafficDelta;
  /** false — период длиннее хранения сырых событий: посетители сложены по дням и могут повторяться. */
  uniqueVisitorsExact: boolean;
  sources: TrafficSource[];
  devices: TrafficDevice[];
}

export type TrafficGroupBy = "day" | "week";

export interface TrafficPoint {
  periodStart: string;
  sessions: number;
  uniqueVisitors: number;
  pageViews: number;
  averageTimeOnPageSec: number;
  bounceRate: number;
}

export type SortDirection = "asc" | "desc";

export type PageSort = "views" | "average_time" | "bounce_rate" | "exit_rate";

export interface TrafficPage {
  pagePath: string;
  pageUrl: string;
  pageType: string;
  pageViews: number;
  uniqueVisitors: number;
  entries: number;
  exits: number;
  averageTimeOnPageSec: number;
  /** Отказы на вход, %. */
  bounceRate: number;
  /** Выходы на просмотр, %. */
  exitRate: number;
}

interface PagedList<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  /** Адрес сайта — для ссылок и кадра карты кликов. */
  siteUrl: string;
  uniqueVisitorsExact: boolean;
}

export type TrafficPages = PagedList<TrafficPage>;

export type LeadSort = "views" | "form_opens" | "submits" | "view_to_open_rate" | "open_to_submit_rate" | "view_to_submit_rate";

/** Заявки по странице — в событиях. */
export interface LeadPage {
  pagePath: string;
  pageUrl: string;
  pageViews: number;
  formOpens: number;
  submits: number;
  uniqueViewers: number;
  uniqueOpeners: number;
  uniqueSubmitters: number;
  viewToOpenRate: number;
  openToSubmitRate: number;
  viewToSubmitRate: number;
}

/** Воронка всего сайта — в посетителях: зашёл → открыл форму → отправил. */
export interface LeadTotals {
  visitors: number;
  openers: number;
  submitters: number;
  visitToOpenRate: number;
  openToSubmitRate: number;
  visitToSubmitRate: number;
}

export interface LeadFunnel extends PagedList<LeadPage> {
  totals: LeadTotals;
}

export type HeatmapDevice = "desktop" | "tablet" | "mobile";

export interface HeatmapClick {
  /** От левого края окна посетителя. */
  x: number;
  /** От начала документа; у закреплённого элемента — от верха окна. */
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  documentHeight: number;
  /** Элемент был прилеплен к экрану (шапка, сцена с прокруткой): клик относится к окну, а не к месту в документе. */
  pinned: boolean;
  /** Где на странице был посетитель в момент клика. */
  scrollY: number;
  normalizedX: number;
  normalizedY: number;
}

export interface ScrollDepthBucket {
  bucket: string;
  minPercent: number;
  maxPercent: number;
  events: number;
  visitors: number;
  /** Доля посетителей страницы, %. */
  visitorShare: number;
}

export interface Heatmap {
  pagePath: string;
  device: HeatmapDevice;
  from: string;
  to: string;
  siteUrl: string;
  clicks: HeatmapClick[];
  scrollDepth: ScrollDepthBucket[];
  viewport: { samples: number; averageWidth: number; averageHeight: number };
  counts: { clickEvents: number; scrollEvents: number; returnedClicks: number; uniqueVisitors: number; sessions: number };
}

export interface AggregateResult {
  from: string;
  to: string;
  days: number;
}

export interface CleanupResult {
  rawRetentionDays: number;
  aggregateRetentionDays: number;
  rawCutoff: string;
  aggregateCutoff?: string;
  rawEventsDeleted: number;
  aggregateRowsDeleted: number;
}

export interface ListQuery<TSort extends string> {
  page: number;
  limit: number;
  sort: TSort;
  direction: SortDirection;
}
