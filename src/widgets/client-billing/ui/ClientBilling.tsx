import { CreditCard } from "lucide-react";
import type { Client } from "@/entities/client";
import { PLAN_LABEL } from "@/entities/client";
import { formatMoney } from "@/shared/lib";

export function ClientBilling({ client }: { client: Client }) {
  const total = client.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  return (
    <div className="space-y-5 max-w-[700px]">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Тариф</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{PLAN_LABEL[client.plan]}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">MRR</p>
          <p className="text-sm font-semibold text-slate-900 mt-1 font-mono">{client.mrr > 0 ? formatMoney(client.mrr) : "—"}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Оплачено</p>
          <p className="text-sm font-semibold text-slate-900 mt-1 font-mono">{formatMoney(total)}</p>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">История платежей</h3>
          <button className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 transition-colors">
            <CreditCard size={12} />Выставить счёт
          </button>
        </div>
        <table className="w-full text-xs">
          <thead className="border-b border-slate-100">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium text-slate-400">Дата</th>
              <th className="px-5 py-2.5 text-left font-medium text-slate-400">Описание</th>
              <th className="px-5 py-2.5 text-right font-medium text-slate-400">Сумма</th>
              <th className="px-5 py-2.5 text-center font-medium text-slate-400">Статус</th>
            </tr>
          </thead>
          <tbody>
            {client.payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-slate-500">{new Date(p.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-5 py-3 text-slate-600">{p.description}</td>
                <td className="px-5 py-3 text-right font-mono font-medium text-slate-800">{formatMoney(p.amount)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    p.status === "paid" ? "bg-emerald-50 text-emerald-700" :
                    p.status === "overdue" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {p.status === "paid" ? "Оплачен" : p.status === "overdue" ? "Просрочен" : "Ожидает"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {client.payments.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">Платежей ещё нет</p>}
      </div>
    </div>
  );
}
