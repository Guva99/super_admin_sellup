import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import type { Client } from "@/entities/client";
import { ClientAvatar } from "@/entities/client";

interface IntegrationsPageProps {
  clients: Client[];
  onOpenClient: (id: string) => void;
}

const INTEGRATIONS = ["1С", "МойСклад", "Ozon", "Wildberries", "СДЭК", "WhatsApp", "Telegram", "Сайт"];
const integKey = ["1c", "moysklad", "ozon", "wb", "cdek", "whatsapp", "telegram", "site"];

export default function IntegrationsPage({ clients, onOpenClient }: IntegrationsPageProps) {
  const activeClients = clients.filter((c) => c.status === "active" || c.status === "onboarding");
  const allErrors = clients.flatMap((c) =>
    c.integrations.filter((i) => i.status === "error").map((i) => ({ client: c, integ: i }))
  );

  const statusOf = (clientId: string, key: string) => {
    const c = clients.find((cl) => cl.id === clientId);
    const integ = c?.integrations.find((i) => i.id === key);
    return integ?.status ?? null;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      {/* Errors */}
      {allErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-red-500" />
            <h3 className="text-sm font-semibold text-red-700">Активные ошибки интеграций</h3>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{allErrors.length}</span>
          </div>
          <div className="space-y-2">
            {allErrors.map(({ client, integ }, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white rounded-lg p-3 border border-red-100 cursor-pointer hover:border-red-300 transition-colors"
                onClick={() => onOpenClient(client.id)}
              >
                <ClientAvatar client={client} className="w-6 h-6 rounded text-[10px]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700">{client.name} · {integ.name}</p>
                  <p className="text-xs text-red-600 mt-0.5">{integ.errorMessage}</p>
                </div>
                {integ.lastSync && (
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {new Date(integ.lastSync).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Карта интеграций</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium text-slate-400 w-48">Клиент</th>
                {INTEGRATIONS.map((name) => (
                  <th key={name} className="px-2 py-2.5 text-center font-medium text-slate-400">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onOpenClient(client.id)}
                >
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <ClientAvatar client={client} className="w-5 h-5 rounded text-[9px]" />
                      <span className="font-medium text-slate-700 truncate">{client.name}</span>
                    </div>
                  </td>
                  {integKey.map((key) => {
                    const status = statusOf(client.id, key);
                    return (
                      <td key={key} className="px-2 py-2.5 text-center">
                        {status === "ok" ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center">
                              <Wifi size={10} className="text-emerald-600" />
                            </div>
                          </div>
                        ) : status === "error" ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 rounded bg-red-100 flex items-center justify-center">
                              <AlertCircle size={10} className="text-red-500" />
                            </div>
                          </div>
                        ) : status === "disconnected" ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center">
                              <WifiOff size={10} className="text-slate-400" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-200">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-5 px-5 py-3 border-t border-slate-100">
          {[
            { icon: <Wifi size={10} className="text-emerald-600" />, label: "Работает", bg: "bg-emerald-100" },
            { icon: <AlertCircle size={10} className="text-red-500" />, label: "Ошибка", bg: "bg-red-100" },
            { icon: <WifiOff size={10} className="text-slate-400" />, label: "Не подключена", bg: "bg-slate-100" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <div className={`w-5 h-5 rounded ${l.bg} flex items-center justify-center`}>{l.icon}</div>
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
