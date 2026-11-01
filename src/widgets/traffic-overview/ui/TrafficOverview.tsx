import { useState, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  defaultGroupBy,
  deviceLabel,
  formatCount,
  formatDuration,
  formatPercent,
  formatPointLabel,
  hostOf,
  sourceLabel,
  useTrafficOverview,
  useTrafficSeries,
  type AggregationGate,
  type TrafficDelta,
  type TrafficGroupBy,
  type TrafficOverview as Overview,
  type TrafficPeriod,
  type TrafficSource,
} from "@/entities/site-analytics";
import { CHART_COLORS, useChartColors, valueAxis } from "@/shared/config";
import { Tabs } from "@/shared/ui";

interface Kpi {
  label: string;
  value: string;
  /** Изменение к прошлому периоду: в процентах или пунктах; null — сравнивать не с чем. */
  delta: number | null;
  unit: "%" | "п.";
  /** Рост — это хорошо (визиты) или плохо (отказы). */
  upIsGood: boolean;
  note?: string;
}

function kpis(overview: Overview): Kpi[] {
  const { current: c, comparison: d } = overview;
  const pick = (key: keyof TrafficDelta) => d[key];
  return [
    { label: "Визиты", value: formatCount(c.sessions), delta: pick("sessionsPercent"), unit: "%", upIsGood: true },
    {
      label: "Посетители",
      value: formatCount(c.uniqueVisitors),
      delta: pick("uniqueVisitorsPercent"),
      unit: "%",
      upIsGood: true,
      note: overview.uniqueVisitorsExact ? undefined : "Сумма по дням: кто заходил в разные дни, посчитан несколько раз",
    },
    { label: "Просмотры", value: formatCount(c.pageViews), delta: pick("pageViewsPercent"), unit: "%", upIsGood: true },
    { label: "Время на странице", value: formatDuration(c.averageTimeOnPageSec), delta: pick("averageTimeOnPageSecPercent"), unit: "%", upIsGood: true },
    { label: "Отказы", value: formatPercent(c.bounceRate), delta: pick("bounceRatePoints"), unit: "п.", upIsGood: false },
    { label: "Выходы", value: formatPercent(c.exitRate), delta: pick("exitRatePoints"), unit: "п.", upIsGood: false },
  ];
}

function DeltaBadge({ kpi }: { kpi: Kpi }) {
  if (kpi.delta === null) return <span className="text-xs text-ink-400">нет данных для сравнения</span>;
  if (kpi.delta === 0) return <span className="text-xs text-ink-400">без изменений</span>;
  const good = kpi.delta > 0 === kpi.upIsGood;
  const sign = kpi.delta > 0 ? "+" : "−";
  const value = Math.abs(kpi.delta).toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  return (
    <span className={`text-xs font-medium ${good ? "text-emerald-600" : "text-red-600"}`}>
      {sign}
      {value}
      {kpi.unit === "%" ? " %" : " п."} <span className="font-normal text-ink-400">к прошлому периоду</span>
    </span>
  );
}

const SERIES = [
  { key: "sessions", label: "Визиты", color: CHART_COLORS.brand },
  { key: "uniqueVisitors", label: "Посетители", color: CHART_COLORS.emerald },
  { key: "pageViews", label: "Просмотры", color: CHART_COLORS.amber },
] as const;

const GROUP_TABS = [
  { id: "day", label: "По дням" },
  { id: "week", label: "По неделям" },
] as const;

function TrafficChart({ period, gate }: { period: TrafficPeriod; gate: AggregationGate }) {
  const chart = useChartColors();
  const [groupBy, setGroupBy] = useState<TrafficGroupBy>(() => defaultGroupBy(period));
  const series = useTrafficSeries(period, groupBy, gate);
  const points = (series.data ?? []).map((p) => ({ ...p, label: formatPointLabel(p.periodStart, groupBy) }));

  return (
    <div className="bg-surface border border-ink-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Динамика</h3>
          <div className="flex items-center gap-3 mt-1">
            {SERIES.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-xs text-ink-500">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>
        <Tabs tabs={GROUP_TABS} active={groupBy} onChange={setGroupBy} />
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={points} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} minTickGap={16} />
          <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} {...valueAxis(points.flatMap((p) => [p.sessions, p.uniqueVisitors, p.pageViews]))} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${chart.gridStrong}` }} />
          {SERIES.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} fill={s.color} fillOpacity={0.08} strokeWidth={2} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Подпись строки источника: откуда именно — сайт или метки кампании. */
function sourceDetail(s: TrafficSource): string | null {
  const utm = [s.utmSource, s.utmMedium, s.utmCampaign].filter(Boolean).join(" / ");
  if (utm) return utm;
  return s.referrer ? hostOf(s.referrer) : null;
}

function ShareRow({ label, detail, share, value }: { label: string; detail?: string | null; share: number; value: string }) {
  return (
    <div className="px-5 py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-ink-700 truncate">
          {label}
          {detail && <span className="ml-1.5 text-ink-400">{detail}</span>}
        </span>
        <span className="text-xs text-ink-500 flex-shrink-0">
          {value} · <span className="font-medium text-ink-700">{formatPercent(share)}</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-brand-400" style={{ width: `${Math.min(100, share)}%` }} />
      </div>
    </div>
  );
}

function Breakdown({ title, hint, children, empty }: { title: string; hint: string; children: ReactNode; empty: boolean }) {
  return (
    <div className="bg-surface border border-ink-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-ink-100">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        <p className="text-xs text-ink-400 mt-0.5">{hint}</p>
      </div>
      {empty ? <p className="px-5 py-8 text-center text-sm text-ink-400">Нет данных</p> : <div className="py-1.5">{children}</div>}
    </div>
  );
}

/** Вкладка «Обзор»: показатели со сравнением, динамика, источники, устройства. */
export function TrafficOverview({ period, gate }: { period: TrafficPeriod; gate: AggregationGate }) {
  const { data, isLoading, error } = useTrafficOverview(period, gate);

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      <div className={`grid grid-cols-3 xl:grid-cols-6 gap-4 transition-opacity ${isLoading ? "opacity-60" : ""}`}>
        {(data ? kpis(data) : []).map((k) => (
          <div key={k.label} className="bg-surface border border-ink-200 rounded-xl p-4" title={k.note}>
            <p className="text-xs text-ink-400 mb-2">
              {k.label}
              {k.note && " *"}
            </p>
            <p className="text-2xl font-semibold text-ink-900">{k.value}</p>
            <p className="mt-1 leading-tight">
              <DeltaBadge kpi={k} />
            </p>
          </div>
        ))}
        {!data &&
          Array.from({ length: 6 }, (_, i) => <div key={i} className="h-[104px] bg-surface border border-ink-200 rounded-xl animate-pulse" />)}
      </div>

      {/* Новый период — заново выбирается шаг: по дням или по неделям. */}
      <TrafficChart key={`${period.from}:${period.to}`} period={period} gate={gate} />

      <div className="grid grid-cols-2 gap-4">
        <Breakdown title="Источники" hint="Откуда пришли — доля просмотров" empty={!data || data.sources.length === 0}>
          {data?.sources.map((s, i) => (
            <ShareRow key={i} label={sourceLabel(s.source)} detail={sourceDetail(s)} share={s.share} value={`${formatCount(s.sessions)} виз.`} />
          ))}
        </Breakdown>
        <Breakdown title="Устройства" hint="С чего смотрели — доля просмотров" empty={!data || data.devices.length === 0}>
          {data?.devices.map((d) => (
            <ShareRow key={d.deviceType} label={deviceLabel(d.deviceType)} share={d.share} value={`${formatCount(d.sessions)} виз.`} />
          ))}
        </Breakdown>
      </div>
    </div>
  );
}
