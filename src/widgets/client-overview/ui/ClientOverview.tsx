import { ChevronRight } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { HealthBar, HEALTH_HEX, healthLevel, healthTextClass, type Client } from "@/entities/client";

export function ClientOverview({ client }: { client: Client }) {
  return (
    <div className="space-y-5 max-w-[900px]">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Health Score</h3>
        {client.healthScore > 0 ? (
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" startAngle={180} endAngle={-180}
                  data={[{ value: client.healthScore, fill: HEALTH_HEX[healthLevel(client.healthScore)] }]}>
                  <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#f1f5f9" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-bold font-mono ${healthTextClass(client.healthScore)}`}>{client.healthScore}</span>
                <span className="text-[9px] text-slate-400">/100</span>
              </div>
            </div>
            <div className="flex-1 max-w-[320px] space-y-3">
              <HealthBar label="Активность" value={client.health.activity} />
              <HealthBar label="Интеграции" value={client.health.integrations} />
              <HealthBar label="Платежи" value={client.health.payments} />
              <HealthBar label="Поддержка" value={client.health.support} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Клиент ещё не подключён — данных нет</p>
        )}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Заметки</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{client.notes || "Заметок нет"}</p>
      </div>
      {client.nextAction && client.nextAction !== "—" && (
        <div className="bg-brand-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3">
          <ChevronRight size={14} className="text-brand-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-brand-600">Следующее действие</p>
            <p className="text-sm text-indigo-900 mt-0.5">{client.nextAction}</p>
          </div>
        </div>
      )}
    </div>
  );
}
