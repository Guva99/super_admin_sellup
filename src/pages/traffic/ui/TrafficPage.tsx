import { useCallback, useMemo } from "react";
import { Lock } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSession } from "@/entities/session";
import { formatPeriod, presetPeriod, useTrafficAggregation, type HeatmapDevice, type TrafficPeriod } from "@/entities/site-analytics";
import { canViewSiteTraffic } from "@/entities/user";
import { CleanupEventsButton, useCleanupEvents } from "@/features/cleanup-traffic-events";
import { RecalculateButton } from "@/features/recalculate-traffic";
import { PeriodPicker, usePeriodPicker } from "@/features/select-traffic-period";
import { Tabs } from "@/shared/ui";
import { TrafficHeatmap } from "@/widgets/traffic-heatmap";
import { TrafficLeads } from "@/widgets/traffic-leads";
import { TrafficOverview } from "@/widgets/traffic-overview";
import { TrafficPages } from "@/widgets/traffic-pages";

const TABS = [
  { id: "overview", label: "Обзор" },
  { id: "pages", label: "Страницы" },
  { id: "leads", label: "Заявки" },
  { id: "heatmap", label: "Карта кликов" },
] as const;

type TabId = (typeof TABS)[number]["id"];
const DEFAULT_TAB: TabId = "overview";
const isTabId = (value: string | undefined): value is TabId => TABS.some((tab) => tab.id === value);
const isDevice = (value: string | null): value is HeatmapDevice => value === "desktop" || value === "tablet" || value === "mobile";

/**
 * «Посещаемость» лендинга sellup-system.online по его собственному счётчику
 * (рядом с Яндекс.Метрикой, не вместо неё). Вкладка — в пути, период, страница
 * и устройство карты кликов — в запросе: любой вид можно открыть ссылкой.
 */
export default function TrafficPage() {
  const { user } = useSession();
  // Остальным ролям бэкенд ответит 403 — даже не спрашиваем.
  if (!canViewSiteTraffic(user?.roleKey)) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-ink-400">
        <Lock size={14} />
        Посещаемость сайта доступна владельцу и администратору
      </div>
    );
  }
  return <TrafficSection />;
}

function TrafficSection() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();

  const from = search.get("from");
  const to = search.get("to");
  // Без дат в адресе — последние 7 дней по Москве.
  const period = useMemo<TrafficPeriod>(() => (from && to ? { from, to } : presetPeriod("7d")!), [from, to]);
  const pagePath = search.get("path") ?? "";
  const deviceParam = search.get("device");
  const device: HeatmapDevice = isDevice(deviceParam) ? deviceParam : "desktop";

  const update = useCallback(
    (changes: Record<string, string | null>) =>
      setSearch(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(changes)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace: true },
      ),
    [setSearch],
  );

  const picker = usePeriodPicker(period, (next) => update({ from: next.from, to: next.to }));
  const aggregation = useTrafficAggregation(period);
  const cleanup = useCleanupEvents();

  const activeTab: TabId = isTabId(tab) ? tab : DEFAULT_TAB;
  const goToTab = (next: TabId, params = search) =>
    navigate({ pathname: next === DEFAULT_TAB ? "/traffic" : `/traffic/${next}`, search: params.toString() });

  const openHeatmap = (path: string) => {
    const next = new URLSearchParams(search);
    next.set("path", path);
    goToTab("heatmap", next);
  };

  const onHeatmapChange = useCallback(
    (next: { pagePath?: string; device?: HeatmapDevice }) =>
      update({ ...(next.pagePath !== undefined && { path: next.pagePath }), ...(next.device && { device: next.device }) }),
    [update],
  );

  return (
    <div className="p-6 space-y-5 max-w-[1280px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodPicker controller={picker} />
        <RecalculateButton controller={aggregation} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Tabs tabs={TABS} active={activeTab} onChange={(id) => goToTab(id)} />
        <span className="text-xs text-ink-400">{formatPeriod(period.from, period.to)} · по московскому времени</span>
      </div>

      {activeTab === "overview" && <TrafficOverview period={period} gate={aggregation} />}
      {activeTab === "pages" && <TrafficPages period={period} gate={aggregation} onOpenHeatmap={openHeatmap} />}
      {activeTab === "leads" && <TrafficLeads period={period} gate={aggregation} />}
      {activeTab === "heatmap" && (
        <TrafficHeatmap period={period} gate={aggregation} pagePath={pagePath} device={device} onChange={onHeatmapChange} />
      )}

      <div className="flex justify-end pt-2 border-t border-ink-100">
        <CleanupEventsButton controller={cleanup} />
      </div>
    </div>
  );
}
