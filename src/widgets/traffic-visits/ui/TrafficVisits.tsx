import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, Play, X } from "lucide-react";
import {
  Pager,
  SortHeader,
  deviceLabel,
  formatCount,
  formatDuration,
  hostOf,
  sourceLabel,
  useVisits,
  visitorLabel,
  type ListQuery,
  type TrafficPeriod,
  type Visit,
  type VisitFilter,
  type VisitLeadFilter,
  type VisitSort,
} from "@/entities/site-analytics";
import { formatDateTimeMoscow } from "@/shared/lib";
import { VisitView } from "./VisitView";

const FIRST_PAGE: ListQuery<VisitSort> = { page: 1, limit: 50, sort: "started_at", direction: "desc" };

const DEVICES = ["desktop", "mobile", "tablet"] as const;
const SOURCES = ["direct", "search", "ads", "social", "referral", "email", "campaign"] as const;

const selectClass =
  "px-2.5 py-1.5 text-xs border border-ink-200 rounded-lg bg-surface text-ink-700 focus:outline-none focus:border-brand-400";

function LeadBadge({ visit }: { visit: Visit }) {
  if (visit.leadSubmitted) return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium">Заявка</span>;
  if (visit.formOpened) return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">Форма</span>;
  return <span className="text-ink-300">—</span>;
}

function Cell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 ${className}`}>{children}</td>;
}

interface TrafficVisitsProps {
  period: TrafficPeriod;
  /** Открытый визит; пусто — список. */
  visitId: string;
  /** Только визиты этого посетителя; пусто — все. */
  visitorId: string;
  onChange: (next: { visit?: string; visitor?: string }) => void;
}

/**
 * Вкладка «Визиты»: кто заходил, когда (по Москве), откуда и с чего, что
 * успел — и запись визита для плеера. Открытый визит и посетитель — в адресе,
 * фильтры и сортировка живут, пока открыта вкладка.
 */
export function TrafficVisits({ period, visitId, visitorId, onChange }: TrafficVisitsProps) {
  const [query, setQuery] = useState(FIRST_PAGE);
  const [filter, setFilter] = useState<Omit<VisitFilter, "visitorId">>({ device: "", source: "", lead: "", recorded: false });
  const list = useVisits(period, { ...filter, visitorId }, query);
  const header = { query, onChange: setQuery };

  // Другой период или посетитель — с первой страницы списка.
  useEffect(() => setQuery((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 })), [visitorId, period.from, period.to]);

  const updateFilter = (next: Partial<typeof filter>) => {
    setFilter((prev) => ({ ...prev, ...next }));
    setQuery((prev) => ({ ...prev, page: 1 }));
  };

  if (visitId) {
    return <VisitView sessionId={visitId} onBack={() => onChange({ visit: "" })} onVisitor={(visitor) => onChange({ visit: "", visitor })} />;
  }

  const data = list.data;
  const filtered = Boolean(filter.device || filter.source || filter.lead || filter.recorded || visitorId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Устройство" value={filter.device} onChange={(e) => updateFilter({ device: e.target.value })} className={selectClass}>
          <option value="">Все устройства</option>
          {DEVICES.map((d) => (
            <option key={d} value={d}>
              {deviceLabel(d)}
            </option>
          ))}
        </select>
        <select aria-label="Источник" value={filter.source} onChange={(e) => updateFilter({ source: e.target.value })} className={selectClass}>
          <option value="">Все источники</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {sourceLabel(s)}
            </option>
          ))}
        </select>
        <select
          aria-label="Заявка"
          value={filter.lead}
          onChange={(e) => updateFilter({ lead: e.target.value as VisitLeadFilter })}
          className={selectClass}
        >
          <option value="">Все визиты</option>
          <option value="opened">Открыли форму заявки</option>
          <option value="submitted">Оставили заявку</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-ink-600 cursor-pointer select-none">
          <input type="checkbox" checked={filter.recorded} onChange={(e) => updateFilter({ recorded: e.target.checked })} className="accent-brand-500" />
          Только с записью
        </label>
        {visitorId && (
          <span className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-brand-50 text-xs text-brand-700">
            Посетитель <span className="font-mono font-semibold">{visitorLabel(visitorId)}</span>
            <button type="button" aria-label="Все посетители" onClick={() => onChange({ visitor: "" })} className="p-0.5 rounded hover:bg-brand-100">
              <X size={12} />
            </button>
          </span>
        )}
      </div>

      {list.error && (
        <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
          <AlertCircle size={13} />
          {list.error}
        </div>
      )}

      <div className="bg-surface border border-ink-200 rounded-xl overflow-hidden">
        <div className="flex items-baseline justify-between gap-3 px-5 py-3.5 border-b border-ink-100">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Визиты{data ? ` · ${formatCount(data.total)}` : ""}</h3>
            <p className="text-xs text-ink-400 mt-0.5">
              Посетители анонимны: один и тот же человек узнаётся по метке в браузере. Визиты хранятся 90 дней, записи для плеера —{" "}
              {data?.replayRetentionDays ?? 30}.
            </p>
          </div>
        </div>
        <div className={`overflow-x-auto transition-opacity ${list.isLoading ? "opacity-60" : ""}`}>
          <table className="w-full text-xs">
            <thead className="text-ink-400 border-b border-ink-100">
              <tr>
                <SortHeader label="Начало (МСК)" sort="started_at" align="left" {...header} />
                <th className="px-3 py-2.5 text-left font-medium">Посетитель</th>
                <th className="px-3 py-2.5 text-left font-medium">Откуда</th>
                <th className="px-3 py-2.5 text-left font-medium">Устройство</th>
                <th className="px-3 py-2.5 text-left font-medium">Вход</th>
                <SortHeader label="Страниц" sort="page_views" {...header} />
                <SortHeader label="Кликов" sort="clicks" {...header} />
                <SortHeader label="На сайте" sort="duration" {...header} />
                <th className="px-3 py-2.5 text-left font-medium">Заявка</th>
                <th className="px-3 py-2.5 font-medium" aria-label="Запись" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {data?.items.map((visit) => (
                <tr key={visit.sessionId} onClick={() => onChange({ visit: visit.sessionId })} className="cursor-pointer hover:bg-ink-50/60">
                  <Cell className="pl-5 whitespace-nowrap text-ink-800">{formatDateTimeMoscow(visit.startedAt)}</Cell>
                  <Cell className="whitespace-nowrap">
                    <button
                      type="button"
                      title="Все визиты этого посетителя"
                      onClick={(event) => {
                        event.stopPropagation();
                        onChange({ visitor: visit.visitorId });
                      }}
                      className="font-mono font-medium text-ink-800 hover:text-brand-600"
                    >
                      {visitorLabel(visit.visitorId)}
                    </button>
                    <span className="ml-1.5 text-ink-400">{visit.visitNumber <= 1 ? "новый" : `${visit.visitNumber}-й визит`}</span>
                  </Cell>
                  <Cell className="max-w-[200px]">
                    <span className="block text-ink-700 truncate">{sourceLabel(visit.source)}</span>
                    {(visit.utmCampaign || visit.referrer) && (
                      <span className="block text-[11px] text-ink-400 truncate">{visit.utmCampaign || hostOf(visit.referrer)}</span>
                    )}
                  </Cell>
                  <Cell className="whitespace-nowrap">
                    <span className="block text-ink-700">{deviceLabel(visit.deviceType)}</span>
                    <span className="block text-[11px] text-ink-400">{[visit.browser, visit.os].filter(Boolean).join(", ")}</span>
                  </Cell>
                  <Cell className="max-w-[200px]">
                    <span className="block font-mono text-ink-700 truncate" title={visit.entryPage}>
                      {visit.entryPage || "—"}
                    </span>
                  </Cell>
                  <Cell className="text-right text-ink-600">{formatCount(visit.pageViews)}</Cell>
                  <Cell className="text-right text-ink-600">{formatCount(visit.clicks)}</Cell>
                  <Cell className="text-right whitespace-nowrap text-ink-800">{formatDuration(visit.durationSec)}</Cell>
                  <Cell>
                    <LeadBadge visit={visit} />
                  </Cell>
                  <Cell className="pr-5 text-right">
                    {visit.hasReplay && (
                      <span title="Есть запись — откройте визит, чтобы посмотреть" className="inline-flex text-brand-500">
                        <Play size={13} />
                      </span>
                    )}
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.items.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-400">{filtered ? "Под эти условия визитов нет" : "За период визитов нет"}</p>
          )}
        </div>
        {data && <Pager total={data.total} query={query} onChange={setQuery} />}
      </div>
    </div>
  );
}
