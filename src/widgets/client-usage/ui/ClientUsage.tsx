import { FileText, MessageSquare, Users, Zap } from "lucide-react";
import type { Client } from "@/entities/client";

/**
 * Использование платформы клиентом собирает его собственная система — в
 * контрольной панели этих цифр пока нет, поэтому везде нули.
 */
export function ClientUsage({ client }: { client: Client }) {
  if (client.status === "lead" || client.status === "churned") {
    return <p className="text-sm text-slate-400">Данные об использовании отсутствуют</p>;
  }
  const stats = [
    { label: "Сотрудников", value: "0", icon: Users, color: "text-brand-500 bg-brand-50" },
    { label: "Заказов за месяц", value: "0", icon: FileText, color: "text-emerald-600 bg-emerald-50" },
    { label: "Сообщений в чатах", value: "0", icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
    { label: "Активных SKU", value: "0", icon: Zap, color: "text-amber-600 bg-amber-50" },
  ];
  return (
    <div className="space-y-5 max-w-[700px]">
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className={`w-7 h-7 rounded-lg ${s.color} flex items-center justify-center mb-2`}><Icon size={13} /></div>
              <p className="text-lg font-semibold text-slate-900 font-mono">{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Топ функций за месяц</h3>
        <p className="py-6 text-center text-sm text-slate-400">Нет данных</p>
      </div>
    </div>
  );
}
