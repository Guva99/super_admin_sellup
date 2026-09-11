import {
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  Calendar,
  Activity,
  ArrowUpRight,
  CreditCard,
  Zap,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  Cell,
} from "recharts";
import type { Client } from "@/entities/client";
import { healthLevel, HEALTH_LEVEL_LABEL, HEALTH_THRESHOLDS, HEALTH_HEX, HEALTH_BAR_CLASS } from "@/entities/client";
import type { HealthLevel } from "@/entities/client";
import type { MrrPoint, AttentionItem, UpcomingEvent } from "@/entities/analytics";
import { formatMoney } from "@/shared/lib";
import { CHART_COLORS } from "@/shared/config";

interface DashboardPageProps {
  clients: Client[];
  mrrHistory: MrrPoint[];
  attentionItems: AttentionItem[];
  upcomingEvents: UpcomingEvent[];
  onOpenClient: (id: string) => void;
  onNavigateClients: (healthFilter: "good" | "ok" | "risk") => void;
}

const eventTypeIcon = {
  training: Layers,
  renewal: CreditCard,
  launch: Zap,
  pricing: TrendingUp,
};

const eventTypeColors = {
  training: "bg-blue-50 text-blue-600",
  renewal: "bg-brand-50 text-brand-500",
  launch: "bg-emerald-50 text-emerald-600",
  pricing: "bg-amber-50 text-amber-600",
};

const severityColors = {
  high: "border-l-red-500",
  medium: "border-l-amber-400",
  low: "border-l-blue-400",
};

const attentionTypeIcon = {
  payment: CreditCard,
  health: Activity,
  integration: Zap,
  onboarding: Layers,
};

export default function DashboardPage({
  clients,
  mrrHistory,
  attentionItems,
  upcomingEvents,
  onOpenClient,
  onNavigateClients,
}: DashboardPageProps) {
  const activeClients = clients.filter((c) => c.status === "active").length;
  const onboardingClients = clients.filter((c) => c.status === "onboarding").length;
  const mrr = clients.reduce((sum, c) => sum + c.mrr, 0);
  const arr = mrr * 12;
  const avgHealth = Math.round(
    clients.filter((c) => c.healthScore > 0).reduce((sum, c) => sum + c.healthScore, 0) /
      clients.filter((c) => c.healthScore > 0).length
  );
  const totalHoursWeek = 42;

  /** Клиенты без оценки (healthScore === 0) в распределение не попадают. */
  const healthCount = (level: HealthLevel) =>
    clients.filter((c) => c.healthScore > 0 && healthLevel(c.healthScore) === level).length;

  const kpis = [
    {
      label: "MRR",
      value: formatMoney(mrr),
      sub: `ARR ${formatMoney(arr)}`,
      icon: TrendingUp,
      trend: "+12%",
      color: "text-brand-500",
      bg: "bg-brand-50",
    },
    {
      label: "Активных клиентов",
      value: String(activeClients),
      sub: `${clients.filter((c) => c.status !== "churned" && c.status !== "lead").length} всего подключено`,
      icon: Users,
      trend: "+2",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "В онбординге",
      value: String(onboardingClients),
      sub: "Средний срок 34 дня",
      icon: Layers,
      trend: null,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Avg Health Score",
      value: String(avgHealth),
      sub: "Цель ≥ 80",
      icon: Activity,
      trend: avgHealth >= 80 ? "↑" : "↓",
      color: avgHealth >= 75 ? "text-emerald-600" : "text-amber-600",
      bg: avgHealth >= 75 ? "bg-emerald-50" : "bg-amber-50",
    },
    {
      label: "Часов за неделю",
      value: String(totalHoursWeek),
      sub: "Цель < 30 ч",
      icon: Clock,
      trend: null,
      color: totalHoursWeek < 30 ? "text-emerald-600" : "text-amber-600",
      bg: totalHoursWeek < 30 ? "bg-emerald-50" : "bg-amber-50",
    },
  ];

  const formatYAxis = (value: number) => {
    if (value >= 1000) return `${value / 1000}k`;
    return String(value);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px]">
      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{kpi.label}</span>
                <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <Icon size={13} className={kpi.color} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-slate-900 tracking-tight">
                    {kpi.value}
                  </span>
                  {kpi.trend && (
                    <span className={`text-xs font-medium ${kpi.color}`}>{kpi.trend}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4 items-stretch">
        {/* MRR chart */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5 flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">MRR и клиенты</h3>
              <p className="text-xs text-slate-400 mt-0.5">Последние 6 месяцев</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-brand-500 rounded inline-block" />
                MRR
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-400 rounded inline-block" />
                Клиенты
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mrrHistory} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.brand} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_COLORS.brand} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clientsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="mrr"
                tickFormatter={formatYAxis}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="clients"
                orientation="right"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 15]}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value, name) => [
                  name === "mrr" ? formatMoney(Number(value)) : Number(value),
                  name === "mrr" ? "MRR" : "Клиенты",
                ]}
              />
              <Area
                yAxisId="mrr"
                type="monotone"
                dataKey="mrr"
                stroke={CHART_COLORS.brand}
                strokeWidth={2}
                fill="url(#mrrGrad)"
              />
              <Area
                yAxisId="clients"
                type="monotone"
                dataKey="clients"
                stroke={CHART_COLORS.emerald}
                strokeWidth={2}
                fill="url(#clientsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Health distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Health Score</h3>
            <p className="text-xs text-slate-400 mt-0.5">Распределение клиентов · нажмите на строку</p>
            <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              Оценка рассчитывается по 4 параметрам: <span className="text-slate-700 font-medium">активность</span>, <span className="text-slate-700 font-medium">интеграции</span>, <span className="text-slate-700 font-medium">платежи</span>, <span className="text-slate-700 font-medium">поддержка</span>. Чем выше — тем здоровее клиент.
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={[
                { range: `${HEALTH_THRESHOLDS.good}–100`, count: healthCount("good"), key: "good" },
                { range: `${HEALTH_THRESHOLDS.ok}–${HEALTH_THRESHOLDS.good - 1}`, count: healthCount("ok"), key: "ok" },
                { range: `0–${HEALTH_THRESHOLDS.ok - 1}`, count: healthCount("risk"), key: "risk" },
              ]}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              onClick={(d: any) => d?.activePayload?.[0] && onNavigateClients(d.activePayload[0].payload.key)}
              style={{ cursor: "pointer" }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v) => [Number(v), "клиентов"]}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                <Cell fill={HEALTH_HEX.good} />
                <Cell fill={HEALTH_HEX.ok} />
                <Cell fill={HEALTH_HEX.risk} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1">
            {[
              { label: `${HEALTH_LEVEL_LABEL.good} (${HEALTH_THRESHOLDS.good}+)`, desc: "Активны, платят вовремя, интеграции работают", count: healthCount("good"), color: HEALTH_BAR_CLASS.good, filter: "good" as const },
              { label: `${HEALTH_LEVEL_LABEL.ok} (${HEALTH_THRESHOLDS.ok}–${HEALTH_THRESHOLDS.good - 1})`, desc: "Небольшие проблемы, ситуация под контролем", count: healthCount("ok"), color: HEALTH_BAR_CLASS.ok, filter: "ok" as const },
              { label: `${HEALTH_LEVEL_LABEL.risk} (<${HEALTH_THRESHOLDS.ok})`, desc: "Риск оттока: долги, нет активности, ошибки", count: healthCount("risk"), color: HEALTH_BAR_CLASS.risk, filter: "risk" as const },
            ].map((row) => (
              <button
                key={row.label}
                onClick={() => onNavigateClients(row.filter)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors group text-left"
              >
                <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${row.color}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-600 group-hover:text-slate-900 font-medium">{row.label}</span>
                  <p className="text-[10px] text-slate-400 truncate">{row.desc}</p>
                </div>
                <span className="text-xs font-semibold text-slate-700 flex-shrink-0">{row.count}</span>
                <ArrowUpRight size={11} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Attention */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900">Нужно внимание</h3>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-50 text-red-600 rounded-full">
                {attentionItems.filter((a) => a.severity === "high").length} срочных
              </span>
            </div>
          </div>
          <ul className="divide-y divide-slate-50">
            {attentionItems.map((item) => {
              const Icon = attentionTypeIcon[item.type];
              return (
                <li
                  key={item.id}
                  className={`flex items-start gap-3 px-5 py-3 border-l-2 ${severityColors[item.severity]} hover:bg-slate-50 cursor-pointer transition-colors`}
                  onClick={() => onOpenClient(item.clientId)}
                >
                  <Icon size={13} className="mt-0.5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {item.client}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.message}</p>
                  </div>
                  <ArrowUpRight size={12} className="text-slate-300 mt-0.5 flex-shrink-0" />
                </li>
              );
            })}
          </ul>
        </div>

        {/* Upcoming events */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
            <Calendar size={14} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Ближайшие события</h3>
          </div>
          <ul className="divide-y divide-slate-50">
            {upcomingEvents.map((event) => {
              const Icon = eventTypeIcon[event.type];
              const colorClass = eventTypeColors[event.type];
              const dateObj = new Date(event.date);
              const day = dateObj.getDate();
              const monthNames = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
              const month = monthNames[dateObj.getMonth()];
              return (
                <li key={event.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-shrink-0 w-10 text-center">
                    <div className="text-lg font-semibold text-slate-800 leading-none">{day}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">{month}</div>
                  </div>
                  <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700">{event.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{event.client}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
