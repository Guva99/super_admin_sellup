import { useEffect, useMemo, useRef } from "react";
import { AlertCircle, ArrowLeft, FileText, Film, Mail, MousePointerClick, Send, ScrollText, Tag, Users } from "lucide-react";
import {
  deviceLabel,
  formatClock,
  formatDuration,
  hostOf,
  planLabel,
  sourceLabel,
  useVisit,
  visitorLabel,
  type Visit,
  type VisitEvent,
} from "@/entities/site-analytics";
import { formatDateTimeMoscow } from "@/shared/lib";
import { buildTimeline, eventAt, type Timeline } from "../model/replay";
import { usePlayback, type Playback } from "../model/usePlayback";
import { ReplayPlayer } from "./ReplayPlayer";

/** Строка хронологии: что сделал посетитель. Начало визита не показываем — с него начинается первая страница. */
function describe(event: VisitEvent): { icon: typeof FileText; text: string; detail?: string } | null {
  switch (event.type) {
    case "page_view":
      return { icon: FileText, text: "Открыл страницу", detail: event.pagePath };
    case "click":
      return { icon: MousePointerClick, text: "Клик", detail: event.pagePath };
    case "scroll":
      return { icon: ScrollText, text: `Прокрутил страницу до ${event.scrollDepthPercent ?? 0} %`, detail: event.pagePath };
    case "lead_form_open":
      return { icon: FileText, text: "Открыл форму заявки", detail: event.pagePath };
    case "lead_submit":
      return { icon: Send, text: "Отправил заявку", detail: event.pagePath };
    case "goal":
      if (event.goal === "telegram") return { icon: Send, text: "Перешёл в Telegram", detail: event.pagePath };
      if (event.goal === "email") return { icon: Mail, text: "Нажал на почту", detail: event.pagePath };
      if (event.goal === "plan") return { icon: Tag, text: `Выбрал тариф «${planLabel(event.plan)}»`, detail: event.pagePath };
      return null;
    default:
      return null;
  }
}

const EVENT_TONE: Partial<Record<VisitEvent["type"], string>> = {
  lead_form_open: "text-amber-600",
  lead_submit: "text-emerald-600",
  goal: "text-brand-600",
};

interface ChronologyProps {
  events: VisitEvent[];
  /** От чего отсчитывать время строк, мс эпохи. */
  origin: number;
  timeline: Timeline | null;
  playback: Playback | null;
}

/** Хронология визита. С записью — клик по строке перематывает плеер, текущая строка подсвечена. */
function Chronology({ events, origin, timeline, playback }: ChronologyProps) {
  const rows = useMemo(
    () =>
      events.flatMap((event) => {
        const row = describe(event);
        return row ? [{ event, row, at: Date.parse(event.occurredAt) - origin }] : [];
      }),
    [events, origin],
  );
  // Последняя строка, до которой дошла запись (строки — по времени).
  let current = -1;
  if (playback) for (let i = 0; i < rows.length && rows[i].at <= playback.time; i++) current = i;
  const listRef = useRef<HTMLOListElement>(null);

  // Текущая строка — в поле зрения, пока идёт запись.
  useEffect(() => {
    if (!playback?.playing || current < 0) return;
    listRef.current?.children[current]?.scrollIntoView({ block: "nearest" });
  }, [current, playback?.playing]);

  return (
    <div className="bg-surface border border-ink-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-ink-100">
        <h4 className="text-xs font-semibold text-ink-900">Что делал</h4>
        <p className="text-[11px] text-ink-400 mt-0.5">{timeline ? "Клик по строке — перейти к этому месту записи" : "Время — от начала визита"}</p>
      </div>
      <ol ref={listRef} className="max-h-[560px] overflow-y-auto divide-y divide-ink-50">
        {rows.map(({ event, row, at }, i) => {
          const Icon = row.icon;
          const active = i === current;
          const content = (
            <>
              <span className="w-10 flex-shrink-0 text-[11px] tabular-nums text-ink-400">{formatClock(Math.max(0, at))}</span>
              <Icon size={13} className={`flex-shrink-0 mt-px ${EVENT_TONE[event.type] ?? "text-ink-400"}`} />
              <span className="min-w-0">
                <span className={`block text-xs ${EVENT_TONE[event.type] ?? "text-ink-800"}`}>{row.text}</span>
                {row.detail && <span className="block text-[11px] font-mono text-ink-400 truncate">{row.detail}</span>}
              </span>
            </>
          );
          return (
            <li key={i}>
              {timeline && playback ? (
                <button
                  type="button"
                  // Чуть раньше события — чтобы было видно, что к нему привело.
                  onClick={() => playback.seek(eventAt(timeline, event) - 1500)}
                  className={`w-full flex items-start gap-2 px-4 py-2 text-left transition-colors ${active ? "bg-brand-50" : "hover:bg-ink-50"}`}
                >
                  {content}
                </button>
              ) : (
                <div className="flex items-start gap-2 px-4 py-2">{content}</div>
              )}
            </li>
          );
        })}
        {rows.length === 0 && <li className="px-4 py-6 text-center text-xs text-ink-400">Событий нет</li>}
      </ol>
    </div>
  );
}

function Summary({ visit, onVisitor }: { visit: Visit; onVisitor: (visitorId: string) => void }) {
  const campaign = [visit.utmSource, visit.utmMedium, visit.utmCampaign].filter(Boolean).join(" / ");
  const facts: Array<[string, string]> = [
    ["Начало", formatDateTimeMoscow(visit.startedAt)],
    ["На сайте", formatDuration(visit.durationSec)],
    ["Страниц", String(visit.pageViews)],
    ["Кликов", String(visit.clicks)],
    ["Откуда", [sourceLabel(visit.source), visit.referrer && hostOf(visit.referrer), campaign].filter(Boolean).join(" · ")],
    [
      "Устройство",
      [deviceLabel(visit.deviceType), visit.browser, visit.os, visit.viewportWidth && `${visit.viewportWidth}×${visit.viewportHeight}`].filter(Boolean).join(" · "),
    ],
  ];
  return (
    <div className="bg-surface border border-ink-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-ink-900 font-mono">{visitorLabel(visit.visitorId)}</span>
        <span className="text-xs text-ink-400">{visit.visitNumber <= 1 ? "первый визит" : `${visit.visitNumber}-й визит`}</span>
        {visit.leadSubmitted && <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium">Оставил заявку</span>}
        {!visit.leadSubmitted && visit.formOpened && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">Открыл форму</span>}
        {visit.visitorSessions > 1 && (
          <button type="button" onClick={() => onVisitor(visit.visitorId)} className="ml-auto flex items-center gap-1 text-xs text-brand-600 hover:underline">
            <Users size={12} />
            Все визиты посетителя ({visit.visitorSessions})
          </button>
        )}
      </div>
      <dl className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-4 gap-y-2">
        {facts.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[11px] text-ink-400">{label}</dt>
            <dd className="text-xs text-ink-800 truncate" title={value}>
              {value || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Player({ timeline, siteUrl, events }: { timeline: Timeline; siteUrl: string; events: VisitEvent[] }) {
  const playback = usePlayback(timeline);
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0 bg-surface border border-ink-200 rounded-xl p-4">
        <ReplayPlayer timeline={timeline} playback={playback} siteUrl={siteUrl} />
      </div>
      <div className="w-[280px] flex-shrink-0">
        <Chronology events={events} origin={timeline.origin} timeline={timeline} playback={playback} />
      </div>
    </div>
  );
}

interface VisitViewProps {
  sessionId: string;
  onBack: () => void;
  onVisitor: (visitorId: string) => void;
}

/** Один визит: кто и откуда, запись поверх сайта и хронология. Без записи — только хронология. */
export function VisitView({ sessionId, onBack, onVisitor }: VisitViewProps) {
  const { data, isLoading, error } = useVisit(sessionId);
  // Пока грузится другой визит, на экране не должен остаться прежний.
  const detail = data?.session.sessionId === sessionId ? data : null;
  const timeline = useMemo(() => (detail ? buildTimeline(detail) : null), [detail]);

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800">
        <ArrowLeft size={13} />К списку визитов
      </button>

      {error && (
        <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
          <AlertCircle size={13} />
          {error}
        </div>
      )}
      {!detail && isLoading && <div className="h-[480px] bg-surface border border-ink-200 rounded-xl animate-pulse" />}

      {detail && (
        <>
          <Summary visit={detail.session} onVisitor={onVisitor} />
          {timeline ? (
            <>
              {detail.truncated && (
                <p className="text-xs text-amber-700">Запись очень длинная — показано начало, конец не поместился в один ответ.</p>
              )}
              {/* Свой плеер на каждый визит: фрейм грузится заново на его первой странице. */}
              <Player key={sessionId} timeline={timeline} siteUrl={detail.siteUrl} events={detail.events} />
            </>
          ) : (
            <div className="flex items-start gap-4">
              <div className="flex-1 flex items-start gap-3 bg-surface border border-ink-200 rounded-xl p-5 text-xs text-ink-500">
                <Film size={16} className="flex-shrink-0 text-ink-300" />
                <p className="leading-relaxed">
                  У этого визита нет записи для плеера. Запись движений ведётся с тех пор, как её включили на сайте, и хранится 30 дней — более
                  старые визиты видны только хронологией. Счётчик пишет визит, только если посетитель нажал «Принять» в баннере cookie.
                </p>
              </div>
              <div className="w-[280px] flex-shrink-0">
                <Chronology events={detail.events} origin={Date.parse(detail.session.startedAt)} timeline={null} playback={null} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
