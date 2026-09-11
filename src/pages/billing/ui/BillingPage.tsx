import { TrendingUp, CreditCard, Users, ArrowDownRight } from "lucide-react";
import type { Client } from "@/entities/client";
import { ClientAvatar } from "@/entities/client";
import type { MrrPoint, RetentionCohort } from "@/entities/analytics";
import { formatMoney } from "@/shared/lib";
import { CHART_COLORS } from "@/shared/config";
import { FULL_PLAN_PRICE } from "@/entities/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

function CellColor({ value }: { value: number | null }) {
  if (value === null) return <td className="px-3 py-2 text-slate-200 text-center text-xs">—</td>;
  const bg =
    value >= 95 ? "bg-emerald-100 text-emerald-800" :
    value >= 80 ? "bg-emerald-50 text-emerald-700" :
    value >= 60 ? "bg-amber-50 text-amber-700" :
    "bg-red-50 text-red-600";
  return (
    <td className={`px-3 py-2 text-center text-xs font-mono font-semibold rounded ${bg}`}>
      {value}%
    </td>
  );
}

interface BillingPageProps {
  clients: Client[];
  mrrHistory: MrrPoint[];
  retentionCohorts: RetentionCohort[];
}

export default function BillingPage({ clients, mrrHistory, retentionCohorts }: BillingPageProps) {
  const mrr = clients.reduce((s, c) => s + c.mrr, 0);
  const arr = mrr * 12;
  const avgCheck = Math.round(
    clients.filter((c) => c.mrr > 0).reduce((s, c) => s + c.mrr, 0) /
    clients.filter((c) => c.mrr > 0).length
  );
  const earlyAccessClients = clients.filter((c) => c.plan === "early_access" && c.mrr > 0);
  const potentialUpsell = earlyAccessClients.reduce((s, c) => s + (FULL_PLAN_PRICE - c.mrr), 0);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "MRR", value: formatMoney(mrr), icon: TrendingUp, color: "text-brand-500 bg-brand-50" },
          { label: "ARR", value: formatMoney(arr), icon: TrendingUp, color: "text-violet-600 bg-violet-50" },
          { label: "Средний чек", value: formatMoney(avgCheck), icon: CreditCard, color: "text-blue-600 bg-blue-50" },
          { label: "Потенциал апсейла", value: formatMoney(potentialUpsell), icon: ArrowDownRight, color: "text-emerald-600 bg-emerald-50" },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{k.label}</span>
                <div className={`w-7 h-7 rounded-lg ${k.color} flex items-center justify-center`}>
                  <Icon size={13} />
                </div>
              </div>
              <p className="text-xl font-semibold text-slate-900 font-mono">{k.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* MRR chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Динамика MRR</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mrrHistory} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="billingMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.brand} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART_COLORS.brand} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v) => [formatMoney(Number(v)), "MRR"]}
              />
              <Area type="monotone" dataKey="mrr" stroke={CHART_COLORS.brand} strokeWidth={2} fill="url(#billingMrr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cohort retention */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Cohort Retention</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400">
                <th className="px-3 py-1.5 text-left font-medium">Когорта</th>
                <th className="px-3 py-1.5 text-center font-medium">M0</th>
                <th className="px-3 py-1.5 text-center font-medium">M1</th>
                <th className="px-3 py-1.5 text-center font-medium">M3</th>
                <th className="px-3 py-1.5 text-center font-medium">M6</th>
                <th className="px-3 py-1.5 text-center font-medium">M12</th>
              </tr>
            </thead>
            <tbody>
              {retentionCohorts.map((row) => (
                <tr key={row.cohort} className="border-t border-slate-50">
                  <td className="px-3 py-2 text-slate-600 font-medium">{row.cohort}</td>
                  <CellColor value={row.m0} />
                  <CellColor value={row.m1} />
                  <CellColor value={row.m3} />
                  <CellColor value={row.m6} />
                  <CellColor value={row.m12} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Early access block */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Users size={14} className="text-violet-500" />
          <h3 className="text-sm font-semibold text-slate-900">Ранний доступ</h3>
          <span className="text-xs text-slate-400 ml-1">— льготная цена, переход на полный тариф</span>
        </div>
        <table className="w-full text-xs">
          <thead className="border-b border-slate-100">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium text-slate-400">Клиент</th>
              <th className="px-5 py-2.5 text-left font-medium text-slate-400">Текущий MRR</th>
              <th className="px-5 py-2.5 text-left font-medium text-slate-400">Fix price</th>
              <th className="px-5 py-2.5 text-left font-medium text-slate-400">Потенциал</th>
              <th className="px-5 py-2.5 text-left font-medium text-slate-400">Менеджер</th>
            </tr>
          </thead>
          <tbody>
            {earlyAccessClients.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <ClientAvatar client={c} className="w-6 h-6 rounded-md text-[10px]" />
                    <span className="font-medium text-slate-700">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-slate-700">{formatMoney(c.mrr)}</td>
                <td className="px-5 py-3 text-slate-500">{c.fixedPrice ? "Да" : "Нет"}</td>
                <td className="px-5 py-3 font-mono text-emerald-600">+{formatMoney(FULL_PLAN_PRICE - c.mrr)}/мес</td>
                <td className="px-5 py-3 text-slate-500">{c.manager}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
