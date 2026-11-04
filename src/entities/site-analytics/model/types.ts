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

/** Тарифы лендинга — PlanId в sellup_web (sections/pricing/pricing.ts). */
export type SitePlan = "start" | "business" | "pro";

/** Цель лендинга помимо формы заявки: Telegram, почта, выбор тарифа (тогда plan — какого). */
export interface GoalStat {
  goal: "telegram" | "email" | "plan";
  plan?: SitePlan;
  events: number;
  visitors: number;
  /** Доля от зашедших за период, %. */
  visitorRate: number;
}

export interface Goals {
  /** Зашедшие за период — от них считается доля. */
  visitors: number;
  /** Все цели, даже недостигнутые, в постоянном порядке. */
  items: GoalStat[];
  /** false — период начался раньше самых старых хранимых событий (90 дней), счёт только за его конец. */
  complete: boolean;
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
  replayRetentionDays: number;
  replayCutoff: string;
  replayChunksDeleted: number;
}

/* --- визиты и их запись --- */

export type VisitSort = "started_at" | "duration" | "page_views" | "clicks";

/** «opened» — открыл форму заявки, «submitted» — отправил заявку. */
export type VisitLeadFilter = "" | "opened" | "submitted";

/** Пустое поле не фильтрует. */
export interface VisitFilter {
  device: string;
  source: string;
  lead: VisitLeadFilter;
  visitorId: string;
  /** Только визиты с записью для плеера. */
  recorded: boolean;
}

/** Визит — события одного захода, свёрнутые в строку. Время — ISO, в UTC. */
export interface Visit {
  sessionId: string;
  visitorId: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  pageViews: number;
  clicks: number;
  entryPage: string;
  exitPage: string;
  source: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  deviceType: string;
  browser: string;
  os: string;
  viewportWidth: number;
  viewportHeight: number;
  formOpened: boolean;
  leadSubmitted: boolean;
  hasReplay: boolean;
  /** Какой по счёту это визит посетителя (1 — первый из хранящихся) и сколько их всего. */
  visitNumber: number;
  visitorSessions: number;
}

export interface Visits {
  items: Visit[];
  total: number;
  page: number;
  limit: number;
  siteUrl: string;
  /** Сколько дней хранятся записи для плеера. */
  replayRetentionDays: number;
}

export interface VisitEvent {
  type: "session_start" | "page_view" | "click" | "scroll" | "lead_form_open" | "lead_submit" | "goal";
  occurredAt: string;
  pagePath: string;
  clickX?: number;
  clickY?: number;
  clickPinned?: boolean;
  scrollY?: number;
  scrollDepthPercent?: number;
  /** Только у цели. */
  goal?: GoalStat["goal"];
  plan?: SitePlan;
}

/**
 * Кадр записи — [t, вид, a, b]: t — мс от начала просмотра страницы. Виды —
 * REPLAY_KIND в виджете плеера (их же пишет счётчик сайта, siteReplayBuffer.ts).
 */
export type ReplayFrame = [t: number, kind: number, a: number, b: number];

/** Запись одного просмотра страницы. */
export interface ReplayPage {
  pageViewId: string;
  pagePath: string;
  startedAt: string;
  viewportWidth: number;
  viewportHeight: number;
  frames: ReplayFrame[];
}

export interface VisitDetail {
  session: Visit;
  events: VisitEvent[];
  /** Пусто — визит не записан: до включения записи или запись старше срока хранения. */
  pages: ReplayPage[];
  /** Запись длиннее одного ответа — её конец отрезан. */
  truncated: boolean;
  siteUrl: string;
}

export interface ListQuery<TSort extends string> {
  page: number;
  limit: number;
  sort: TSort;
  direction: SortDirection;
}
