import { useClients } from "@/entities/client";
import {
  ClientAvatar,
  healthLevel,
  healthTextClass,
  HEALTH_BAR_CLASS,
  HEALTH_THRESHOLDS,
} from "@/entities/client";
import { emptyMonthlyHours, emptyOnboardingDuration } from "@/entities/analytics";
import { CHART_COLORS, valueAxis } from "@/shared/config";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

/** Целевые 20 ч/мес — план, а не измерение: его и показываем пунктиром. */
const HOURS_TARGET = 20;
// Часов и сроков онбординга бэкенд пока не считает — ряды нулевые.
const monthlyHours = emptyMonthlyHours(HOURS_TARGET);
const onboardingDuration = emptyOnboardingDuration();

export default function MetricsPage() {
  const { clients } = useClients();

  const scoredClients = clients.filter((c) => c.healthScore > 0);
  // Без оценённых клиентов делить не на что — иначе на экране «NaN».
  const avgHealth = scoredClients.length > 0
    ? Math.round(scoredClients.reduce((s, c) => s + c.healthScore, 0) / scoredClients.length)
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-[1100px]">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Ср. часов на клиента/мес", value: "0", note: "Нет данных", good: false },
          { label: "Ср. срок онбординга", value: "0", note: "Нет данных", good: false },
          {
            label: "Avg Health Score",
            value: String(avgHealth),
            note: scoredClients.length === 0 ? "Нет оценённых клиентов" : avgHealth >= HEALTH_THRESHOLDS.good ? "Хорошо" : "Нужно улучшать",
            good: scoredClients.length > 0 && avgHealth >= HEALTH_THRESHOLDS.good,
          },
          { label: "NPS (оценочный)", value: "0", note: "Нет данных", good: false },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-2">{k.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{k.value}</p>
            <p className={`text-xs mt-1 ${k.good ? "text-emerald-600" : "text-slate-400"}`}>{k.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Часы на клиента — тренд</h3>
          <p className="text-xs text-slate-400 mb-4">Цель: снизить до <strong className="text-slate-600">≤20 ч/мес</strong> — ключевой показатель масштабируемости</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyHours} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} {...valueAxis(monthlyHours.flatMap((point) => [point.avg, point.target]))} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Line type="monotone" dataKey="avg" stroke={CHART_COLORS.brand} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.brand }} name="Факт" />
              <Line type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Цель" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Срок онбординга</h3>
          <p className="text-xs text-slate-400 mb-4">Среднее время от договора до запуска, дней</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={onboardingDuration} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} {...valueAxis(onboardingDuration.map((point) => point.days))} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v) => [`${v} дней`, "Срок"]} />
              <Bar dataKey="days" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health score list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Health Score по клиентам</h3>
        </div>
        {scoredClients.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">Нет данных</p>}
        <div className="divide-y divide-slate-50">
          {clients.filter((c) => c.healthScore > 0).sort((a, b) => b.healthScore - a.healthScore).map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3">
              <div className="flex items-center gap-2 w-52 flex-shrink-0">
                <ClientAvatar client={c} className="w-5 h-5 rounded text-[9px]" />
                <span className="text-xs text-slate-700 truncate">{c.name}</span>
              </div>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${HEALTH_BAR_CLASS[healthLevel(c.healthScore)]}`}
                  style={{ width: `${c.healthScore}%` }}
                />
              </div>
              <span className={`text-xs font-semibold font-mono w-8 text-right ${healthTextClass(c.healthScore)}`}>
                {c.healthScore}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
