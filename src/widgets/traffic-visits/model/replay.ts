import type { ReplayFrame, VisitDetail, VisitEvent } from "@/entities/site-analytics";

/**
 * Запись визита как шкала времени: страницы одна за другой, а в каждой —
 * кадры [t, вид, a, b] от её начала (пишет счётчик сайта, siteReplayBuffer.ts).
 * Плеер спрашивает stateAt(t) — что было на экране посетителя в момент t.
 */

export const REPLAY_KIND = {
  move: 0,
  scroll: 1,
  click: 2,
  resize: 3,
  dialogOpen: 4,
  dialogClose: 5,
  hidden: 6,
  visible: 7,
} as const;

/** Пауза без действий длиннее — «Пропускать паузы» её проматывает. */
export const IDLE_GAP_MS = 3000;
/** Сколько видна вспышка клика. */
export const CLICK_FLASH_MS = 700;
/** Кадры мыши и прокрутки идут раз в 0,1 с; между далёкими — не тянем, а стоим. */
const INTERPOLATE_MAX_MS = 300;

export interface Segment {
  path: string;
  /** Начало и конец на шкале, мс от начала записи. */
  start: number;
  end: number;
  width: number;
  height: number;
  moves: ReplayFrame[];
  scrolls: ReplayFrame[];
  clicks: ReplayFrame[];
  sizes: ReplayFrame[];
  dialogs: ReplayFrame[];
  visibility: ReplayFrame[];
}

export type MarkerKind = "page" | "click" | "form" | "lead";

export interface Marker {
  at: number;
  kind: MarkerKind;
}

export interface Timeline {
  /** Момент начала записи, мс эпохи: от него отсчитана шкала. */
  origin: number;
  duration: number;
  segments: Segment[];
  markers: Marker[];
  /** Паузы, которые можно промотать: [откуда, куда]. */
  idle: Array<[number, number]>;
  /** Мыши не было ни разу — телефон или планшет: курсор не рисуем. */
  touch: boolean;
}

const byKind = (frames: ReplayFrame[], ...kinds: number[]) => frames.filter((f) => kinds.includes(f[1]));

export function buildTimeline(detail: VisitDetail): Timeline | null {
  const pages = [...detail.pages].sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
  if (pages.length === 0) return null;
  const eventTimes = detail.events.map((e) => Date.parse(e.occurredAt)).filter((t) => !Number.isNaN(t));
  const origin = Math.min(Date.parse(pages[0].startedAt), ...eventTimes);

  // Конец записи — последний кадр или событие визита.
  let end = 0;
  for (const page of pages) {
    const last = page.frames[page.frames.length - 1];
    end = Math.max(end, Date.parse(page.startedAt) - origin + (last ? last[0] : 0));
  }
  for (const t of eventTimes) end = Math.max(end, t - origin);

  const segments: Segment[] = pages.map((page, i) => {
    const start = Date.parse(page.startedAt) - origin;
    const next = pages[i + 1];
    return {
      path: page.pagePath,
      start,
      // Вторая вкладка того же визита может начаться раньше конца первой — страница длится до следующей.
      end: next ? Date.parse(next.startedAt) - origin : end,
      width: page.viewportWidth,
      height: page.viewportHeight,
      moves: byKind(page.frames, REPLAY_KIND.move),
      scrolls: byKind(page.frames, REPLAY_KIND.scroll),
      clicks: byKind(page.frames, REPLAY_KIND.click),
      sizes: byKind(page.frames, REPLAY_KIND.resize),
      dialogs: byKind(page.frames, REPLAY_KIND.dialogOpen, REPLAY_KIND.dialogClose),
      visibility: byKind(page.frames, REPLAY_KIND.hidden, REPLAY_KIND.visible),
    };
  });

  const markers: Marker[] = [];
  for (const segment of segments) {
    markers.push({ at: segment.start, kind: "page" });
    for (const click of segment.clicks) markers.push({ at: segment.start + click[0], kind: "click" });
  }
  for (const event of detail.events) {
    const kind: MarkerKind | null = event.type === "lead_form_open" ? "form" : event.type === "lead_submit" ? "lead" : null;
    if (kind) markers.push({ at: Date.parse(event.occurredAt) - origin, kind });
  }
  markers.sort((a, b) => a.at - b.at);

  return {
    origin,
    duration: Math.max(end, 1),
    segments,
    markers,
    idle: idleGaps(segments, eventTimes.map((t) => t - origin)),
    touch: segments.every((s) => s.moves.length === 0),
  };
}

/** Паузы между действиями длиннее IDLE_GAP_MS: перемотка оставляет секунду до и полсекунды после. */
function idleGaps(segments: Segment[], eventTimes: number[]): Array<[number, number]> {
  const times = [...eventTimes];
  for (const s of segments) {
    times.push(s.start);
    for (const list of [s.moves, s.scrolls, s.clicks, s.sizes, s.dialogs, s.visibility]) {
      for (const f of list) times.push(s.start + f[0]);
    }
  }
  times.sort((a, b) => a - b);
  const gaps: Array<[number, number]> = [];
  for (let i = 1; i < times.length; i++) {
    if (times[i] - times[i - 1] > IDLE_GAP_MS) gaps.push([times[i - 1] + 1000, times[i] - 500]);
  }
  return gaps;
}

/** Куда перескочить из пустой паузы; вне паузы — туда же. */
export function skipIdle(timeline: Timeline, t: number): number {
  for (const [from, to] of timeline.idle) {
    if (t >= from && t < to) return to;
  }
  return t;
}

/** Индекс последнего кадра не позже t (кадры отсортированы по времени); -1 — таких нет. */
function lastAt(frames: ReplayFrame[], t: number): number {
  let lo = 0;
  let hi = frames.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (frames[mid][0] <= t) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found;
}

/** Значение a/b в момент t: между частыми кадрами — плавно, между редкими — последнее. */
function valueAt(frames: ReplayFrame[], t: number): [number, number] | null {
  const i = lastAt(frames, t);
  if (i < 0) return null;
  const prev = frames[i];
  const next = frames[i + 1];
  if (!next || next[0] - prev[0] > INTERPOLATE_MAX_MS || next[0] === prev[0]) return [prev[2], prev[3]];
  const k = (t - prev[0]) / (next[0] - prev[0]);
  return [prev[2] + (next[2] - prev[2]) * k, prev[3] + (next[3] - prev[3]) * k];
}

export interface ScreenState {
  segment: number;
  path: string;
  width: number;
  height: number;
  scrollY: number;
  cursor: { x: number; y: number } | null;
  /** Недавние клики: age — сколько мс назад. */
  clicks: Array<{ x: number; y: number; age: number }>;
  dialogOpen: boolean;
  /** Посетитель ушёл на другую вкладку. */
  hidden: boolean;
}

export function segmentAt(timeline: Timeline, t: number): number {
  let index = 0;
  for (let i = 0; i < timeline.segments.length; i++) {
    if (timeline.segments[i].start <= t) index = i;
  }
  return index;
}

export function stateAt(timeline: Timeline, t: number): ScreenState {
  const index = segmentAt(timeline, t);
  const s = timeline.segments[index];
  const local = t - s.start;

  const size = lastAt(s.sizes, local);
  const scroll = valueAt(s.scrolls, local);
  const cursor = valueAt(s.moves, local);
  const dialog = lastAt(s.dialogs, local);
  const visibility = lastAt(s.visibility, local);

  const clicks: ScreenState["clicks"] = [];
  for (let i = lastAt(s.clicks, local); i >= 0 && local - s.clicks[i][0] <= CLICK_FLASH_MS; i--) {
    clicks.push({ x: s.clicks[i][2], y: s.clicks[i][3], age: local - s.clicks[i][0] });
  }

  return {
    segment: index,
    path: s.path,
    width: size >= 0 ? s.sizes[size][2] : s.width,
    height: size >= 0 ? s.sizes[size][3] : s.height,
    scrollY: scroll ? Math.round(scroll[0]) : 0,
    cursor: cursor ? { x: cursor[0], y: cursor[1] } : null,
    clicks,
    dialogOpen: dialog >= 0 && s.dialogs[dialog][1] === REPLAY_KIND.dialogOpen,
    hidden: visibility >= 0 && s.visibility[visibility][1] === REPLAY_KIND.hidden,
  };
}

/** Время события на шкале записи (может быть меньше нуля, если запись началась позже). */
export const eventAt = (timeline: Timeline, event: VisitEvent) => Date.parse(event.occurredAt) - timeline.origin;
