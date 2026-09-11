import { useState } from "react";
import { Search, ChevronUp, ChevronDown, SlidersHorizontal, UserPlus, X } from "lucide-react";
import type { Client, ClientStatus, ClientNiche, ClientPlan, HealthLevel } from "@/entities/client";
import {
  ClientAvatar,
  StatusBadge,
  healthLevel,
  healthBadgeClass,
  HEALTH_LEVEL_LABEL,
  HEALTH_THRESHOLDS,
  CLIENT_STATUS_LABEL,
  CLIENT_NICHE_LABEL,
} from "@/entities/client";
import { formatMoney } from "@/shared/lib";
import { PLAN_LABEL } from "@/entities/client";

interface ClientsPageProps {
  clients: Client[];
  onOpenClient: (id: string) => void;
  onConnectBusiness: () => void;
  healthFilter?: "good" | "ok" | "risk" | null;
  onClearHealthFilter?: () => void;
}

type SortKey = keyof Pick<Client, "name" | "mrr" | "healthScore" | "hoursThisMonth" | "connectedAt">;

const healthFilterLabel = (level: HealthLevel) => {
  if (level === "good") return `${HEALTH_LEVEL_LABEL.good} health (${HEALTH_THRESHOLDS.good}+)`;
  if (level === "ok") return `${HEALTH_LEVEL_LABEL.ok} health (${HEALTH_THRESHOLDS.ok}–${HEALTH_THRESHOLDS.good - 1})`;
  return `${HEALTH_LEVEL_LABEL.risk} (<${HEALTH_THRESHOLDS.ok})`;
};

export default function ClientsPage({ clients, onOpenClient, onConnectBusiness, healthFilter, onClearHealthFilter }: ClientsPageProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ClientStatus | "all">("all");
  const [filterNiche, setFilterNiche] = useState<ClientNiche | "all">("all");
  const [filterPlan, setFilterPlan] = useState<ClientPlan | "all">("all");
  const [filterManager, setFilterManager] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("mrr");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const managers = Array.from(new Set(clients.map((c) => c.manager)));

  const filtered = clients
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterNiche !== "all" && c.niche !== filterNiche) return false;
      if (filterPlan !== "all" && c.plan !== filterPlan) return false;
      if (filterManager !== "all" && c.manager !== filterManager) return false;
      if (healthFilter && healthLevel(c.healthScore) !== healthFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "desc" ? <ChevronDown size={11} /> : <ChevronUp size={11} />
    ) : (
      <ChevronDown size={11} className="opacity-30" />
    );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3.5 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="relative flex-shrink-0">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск клиентов..."
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-56 outline-none focus:border-brand-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
          />
        </div>

        {healthFilter && (
          <button
            onClick={onClearHealthFilter}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors flex-shrink-0 ${
              healthFilter === "good" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" :
              healthFilter === "ok" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" :
              "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${healthFilter === "good" ? "bg-emerald-500" : healthFilter === "ok" ? "bg-amber-500" : "bg-red-500"}`} />
            {healthFilterLabel(healthFilter)}
            <X size={10} />
          </button>
        )}

        <div className="flex items-center gap-2 flex-1">
          <SlidersHorizontal size={13} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ClientStatus | "all")}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5 text-slate-600 outline-none focus:border-brand-400 bg-white cursor-pointer"
          >
            <option value="all">Все статусы</option>
            {(Object.keys(CLIENT_STATUS_LABEL) as ClientStatus[]).map((status) => (
              <option key={status} value={status}>{CLIENT_STATUS_LABEL[status]}</option>
            ))}
          </select>
          <select
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value as ClientNiche | "all")}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5 text-slate-600 outline-none focus:border-brand-400 bg-white cursor-pointer"
          >
            <option value="all">Все ниши</option>
            {(Object.keys(CLIENT_NICHE_LABEL) as ClientNiche[]).map((niche) => (
              <option key={niche} value={niche}>{CLIENT_NICHE_LABEL[niche]}</option>
            ))}
          </select>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value as ClientPlan | "all")}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5 text-slate-600 outline-none focus:border-brand-400 bg-white cursor-pointer"
          >
            <option value="all">Все тарифы</option>
            {(Object.keys(PLAN_LABEL) as ClientPlan[]).map((plan) => (
              <option key={plan} value={plan}>{PLAN_LABEL[plan]}</option>
            ))}
          </select>
          <select
            value={filterManager}
            onChange={(e) => setFilterManager(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5 text-slate-600 outline-none focus:border-brand-400 bg-white cursor-pointer"
          >
            <option value="all">Все менеджеры</option>
            {managers.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <span className="text-xs text-brand-500 font-medium">{selected.size} выбрано</span>
          )}
          <span className="text-xs text-slate-400">{filtered.length} клиентов</span>
          <button
            onClick={onConnectBusiness}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 hover:border-brand-300 transition-colors"
          >
            <UserPlus size={12} />
            Подключить бизнес
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs min-w-[1100px]">
          <thead className="sticky top-0 bg-white z-10 border-b border-slate-200">
            <tr>
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="accent-brand-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500 cursor-pointer hover:text-slate-800 whitespace-nowrap" onClick={() => toggleSort("name")}>
                <span className="flex items-center gap-1">Клиент <SortIcon k="name" /></span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500 whitespace-nowrap">Ниша</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500 whitespace-nowrap">Тариф</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500 whitespace-nowrap">Статус</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500 cursor-pointer hover:text-slate-800 whitespace-nowrap" onClick={() => toggleSort("mrr")}>
                <span className="flex items-center justify-end gap-1">MRR <SortIcon k="mrr" /></span>
              </th>
              <th className="px-4 py-3 text-center font-medium text-slate-500 cursor-pointer hover:text-slate-800 whitespace-nowrap" onClick={() => toggleSort("healthScore")}>
                <span className="flex items-center justify-center gap-1">Health <SortIcon k="healthScore" /></span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500 cursor-pointer hover:text-slate-800 whitespace-nowrap" onClick={() => toggleSort("connectedAt")}>
                <span className="flex items-center gap-1">Подключён <SortIcon k="connectedAt" /></span>
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-500 cursor-pointer hover:text-slate-800 whitespace-nowrap" onClick={() => toggleSort("hoursThisMonth")}>
                <span className="flex items-center justify-end gap-1">Часов/мес <SortIcon k="hoursThisMonth" /></span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500 whitespace-nowrap">Менеджер</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr
                key={client.id}
                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group"
                onClick={() => onOpenClient(client.id)}
              >
                <td className="px-4 py-2.5" onClick={(e) => { e.stopPropagation(); toggleSelect(client.id); }}>
                  <input type="checkbox" checked={selected.has(client.id)} onChange={() => toggleSelect(client.id)} className="accent-brand-500 cursor-pointer" />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <ClientAvatar client={client} className="w-7 h-7 rounded-lg text-[10px]" />
                    <span className="font-medium text-slate-800 group-hover:text-brand-500 transition-colors">{client.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-slate-500">{CLIENT_NICHE_LABEL[client.niche]}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      client.plan === "early_access" ? "bg-violet-50 text-violet-700 border border-violet-200" :
                      client.plan === "custom" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {PLAN_LABEL[client.plan]}
                    </span>
                    {client.fixedPrice && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-200">Fix</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-700">
                  {client.mrr > 0 ? formatMoney(client.mrr) : "—"}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {client.healthScore > 0 ? (
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold font-mono ${healthBadgeClass(client.healthScore)}`}>
                      {client.healthScore}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  {new Date(client.connectedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-600">
                  {client.hoursThisMonth > 0 ? `${client.hoursThisMonth} ч` : "—"}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{client.manager}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-slate-400">Клиенты не найдены</p>
            <button onClick={onConnectBusiness} className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 transition-colors">
              <UserPlus size={12} />Подключить первый бизнес
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
