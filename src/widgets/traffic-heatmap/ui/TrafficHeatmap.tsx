import { useEffect, useMemo, useState } from "react";
import { AlertCircle, MousePointerClick } from "lucide-react";
import {
  HEATMAP_DEVICE_LABEL,
  formatCount,
  formatPercent,
  useHeatmap,
  useTrafficPages,
  type AggregationGate,
  type HeatmapDevice,
  type ListQuery,
  type PageSort,
  type ScrollDepthBucket,
  type TrafficPeriod,
} from "@/entities/site-analytics";
import { Tabs } from "@/shared/ui";
import { HeatmapViewer } from "./HeatmapViewer";

const TOP_PAGES: ListQuery<PageSort> = { page: 1, limit: 50, sort: "views", direction: "desc" };

const DEVICE_TABS = (["desktop", "tablet", "mobile"] as const).map((id) => ({ id, label: HEATMAP_DEVICE_LABEL[id] }));

/** Путь из того, что вставили: полный адрес, путь с запросом или якорем. */
function toPath(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  try {
    return new URL(value).pathname || "/";
  } catch {
    const path = value.split(/[?#]/)[0];
    return path.startsWith("/") ? path : `/${path}`;
  }
}

function ScrollDepth({ buckets }: { buckets: ScrollDepthBucket[] }) {
  return (
    <div className="bg-surface border border-ink-200 rounded-xl p-4">
      <h4 className="text-xs font-semibold text-ink-900">Докуда прокрутили</h4>
      <p className="text-[11px] text-ink-400 mt-0.5 mb-3">Самая глубокая точка за просмотр — доля посетителей страницы</p>
      <div className="space-y-2.5">
        {buckets.map((b) => (
          <div key={b.bucket}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-ink-600">
                {b.minPercent}–{b.maxPercent} %
              </span>
              <span className="text-ink-500">
                {formatCount(b.visitors)} · <span className="font-medium text-ink-700">{formatPercent(b.visitorShare)}</span>
              </span>
            </div>
            <div className="mt-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-brand-400" style={{ width: `${Math.min(100, b.visitorShare)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="bg-surface border border-ink-200 rounded-xl p-4 space-y-2">
      <div
        className="h-2 rounded-full"
        style={{ background: "linear-gradient(90deg, rgb(59,130,246), rgb(34,197,94), rgb(234,179,8), rgb(239,68,68))" }}
      />
      <div className="flex justify-between text-[11px] text-ink-400">
        <span>редко</span>
        <span>часто</span>
      </div>
      <p className="text-[11px] text-ink-400 leading-relaxed">
        Клики по шапке и сценам, которые стоят на месте, пока страница прокручивается, видны, когда карта прокручена туда же, где был посетитель.
        Клики в окне заявки и баннере на карту не попадают.
      </p>
    </div>
  );
}

interface TrafficHeatmapProps {
  period: TrafficPeriod;
  gate: AggregationGate;
  pagePath: string;
  device: HeatmapDevice;
  onChange: (next: { pagePath?: string; device?: HeatmapDevice }) => void;
}

/**
 * Вкладка «Карта кликов»: страница из топа или вставленная руками, класс
 * устройства, живая страница с пятнами кликов и глубина прокрутки.
 * Страница и устройство — в адресе, ссылкой можно поделиться.
 */
export function TrafficHeatmap({ period, gate, pagePath, device, onChange }: TrafficHeatmapProps) {
  const pages = useTrafficPages(period, TOP_PAGES, gate);
  const heatmap = useHeatmap(period, pagePath, device);
  const [typed, setTyped] = useState("");

  // Без выбранной страницы — самая просматриваемая за период.
  const firstPath = pages.data?.items[0]?.pagePath;
  useEffect(() => {
    if (!pagePath && firstPath) onChange({ pagePath: firstPath });
  }, [pagePath, firstPath, onChange]);

  const options = useMemo(() => {
    const paths = (pages.data?.items ?? []).map((p) => ({ path: p.pagePath, views: p.pageViews }));
    // Страница из ссылки или вставленная руками может не попасть в топ — всё равно в списке.
    if (pagePath && !paths.some((p) => p.path === pagePath)) paths.unshift({ path: pagePath, views: -1 });
    return paths;
  }, [pages.data, pagePath]);

  const data = heatmap.data;
  const ready = data && data.pagePath === pagePath && data.device === device;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Страница"
          value={pagePath}
          onChange={(e) => onChange({ pagePath: e.target.value })}
          className="max-w-[360px] px-2.5 py-1.5 text-xs border border-ink-200 rounded-lg bg-surface text-ink-700 font-mono focus:outline-none focus:border-brand-400"
        >
          {!pagePath && <option value="">Страница…</option>}
          {options.map((o) => (
            <option key={o.path} value={o.path}>
              {o.path}
              {o.views >= 0 ? ` — ${formatCount(o.views)} просм.` : ""}
            </option>
          ))}
        </select>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const path = toPath(typed);
            if (path) onChange({ pagePath: path });
            setTyped("");
          }}
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Или вставьте адрес страницы"
            aria-label="Адрес страницы"
            className="w-[260px] px-2.5 py-1.5 text-xs border border-ink-200 rounded-lg bg-surface text-ink-700 focus:outline-none focus:border-brand-400"
          />
          <button type="submit" disabled={!typed.trim()} className="px-3 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 disabled:opacity-50 text-ink-600 text-xs font-medium">
            Показать
          </button>
        </form>
        <div className="ml-auto">
          <Tabs tabs={DEVICE_TABS} active={device} onChange={(id) => onChange({ device: id })} />
        </div>
      </div>

      {heatmap.error && (
        <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
          <AlertCircle size={13} />
          {heatmap.error}
        </div>
      )}

      {!pagePath && (
        <div className="bg-surface border border-ink-200 rounded-xl px-5 py-12 text-center text-sm text-ink-400">
          {pages.data && pages.data.items.length === 0 ? "За период просмотров нет — карте не из чего строиться" : "Выберите страницу"}
        </div>
      )}

      {pagePath && ready && (
        <>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <MousePointerClick size={13} className="text-ink-400" />
              Кликов: <span className="font-medium text-ink-800">{formatCount(data.counts.clickEvents)}</span>
              {data.counts.returnedClicks < data.counts.clickEvents && <span className="text-ink-400">(на карте последние {formatCount(data.counts.returnedClicks)})</span>}
            </span>
            <span>
              Посетителей: <span className="font-medium text-ink-800">{formatCount(data.counts.uniqueVisitors)}</span>
            </span>
            <span>
              Визитов: <span className="font-medium text-ink-800">{formatCount(data.counts.sessions)}</span>
            </span>
            {data.clicks.length === 0 && <span className="text-amber-700">Кликов с {HEATMAP_DEVICE_LABEL[device].toLowerCase()}а за период нет</span>}
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0 bg-surface border border-ink-200 rounded-xl p-4">
              <HeatmapViewer clicks={data.clicks} device={device} siteUrl={data.siteUrl} pagePath={pagePath} />
            </div>
            <div className="w-[230px] flex-shrink-0 space-y-4">
              <ScrollDepth buckets={data.scrollDepth} />
              <Legend />
            </div>
          </div>
        </>
      )}

      {pagePath && !ready && !heatmap.error && <div className="h-[420px] bg-surface border border-ink-200 rounded-xl animate-pulse" />}
    </div>
  );
}
