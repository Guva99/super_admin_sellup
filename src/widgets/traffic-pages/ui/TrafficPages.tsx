import { useState } from "react";
import { AlertCircle, ExternalLink, MousePointerClick } from "lucide-react";
import {
  Pager,
  SortHeader,
  formatCount,
  formatDuration,
  formatPercent,
  pageTypeLabel,
  useTrafficPages,
  type AggregationGate,
  type ListQuery,
  type PageSort,
  type TrafficPeriod,
} from "@/entities/site-analytics";

const FIRST_PAGE: ListQuery<PageSort> = { page: 1, limit: 50, sort: "views", direction: "desc" };

/**
 * Вкладка «Страницы»: каждая страница сайта за период. Сортировка и
 * страницы — на сервере. У строки — ссылка на страницу и её карта кликов.
 */
export function TrafficPages({ period, gate, onOpenHeatmap }: { period: TrafficPeriod; gate: AggregationGate; onOpenHeatmap: (pagePath: string) => void }) {
  const [query, setQuery] = useState(FIRST_PAGE);
  const { data, isLoading, error } = useTrafficPages(period, query, gate);
  const header = { query, onChange: setQuery };

  return (
    <div className="bg-surface border border-ink-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-ink-100">
        <h3 className="text-sm font-semibold text-ink-900">Страницы</h3>
        <p className="text-xs text-ink-400 mt-0.5">
          Отказ — визит из одной страницы, считается от входов на страницу. Выход — последняя страница визита, считается от просмотров.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 mx-5 mt-4 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      <div className={`overflow-x-auto transition-opacity ${isLoading ? "opacity-60" : ""}`}>
        <table className="w-full text-xs">
          <thead className="text-ink-400 border-b border-ink-100">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">Страница</th>
              <SortHeader label="Просмотры" sort="views" {...header} />
              <th className="px-3 py-2.5 text-right font-medium" title={data && !data.uniqueVisitorsExact ? "Сумма по дням" : undefined}>
                Посетители
              </th>
              <th className="px-3 py-2.5 text-right font-medium">Входы</th>
              <SortHeader label="Время" sort="average_time" {...header} />
              <SortHeader label="Отказы" sort="bounce_rate" {...header} />
              <SortHeader label="Выходы" sort="exit_rate" {...header} />
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {data?.items.map((page) => (
              <tr key={page.pagePath} className="hover:bg-ink-50/60">
                <td className="px-5 py-2.5 max-w-[360px]">
                  <a
                    href={`${data.siteUrl}${page.pagePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-ink-800 hover:text-brand-600 font-mono truncate max-w-full"
                  >
                    <span className="truncate">{page.pagePath}</span>
                    <ExternalLink size={11} className="flex-shrink-0 text-ink-300" />
                  </a>
                  {page.pageType && <span className="block text-ink-400 mt-0.5">{pageTypeLabel(page.pageType)}</span>}
                </td>
                <td className="px-3 py-2.5 text-right font-medium text-ink-800">{formatCount(page.pageViews)}</td>
                <td className="px-3 py-2.5 text-right text-ink-600">{formatCount(page.uniqueVisitors)}</td>
                <td className="px-3 py-2.5 text-right text-ink-600">{formatCount(page.entries)}</td>
                <td className="px-3 py-2.5 text-right text-ink-600">{formatDuration(page.averageTimeOnPageSec)}</td>
                <td className="px-3 py-2.5 text-right text-ink-600">{formatPercent(page.bounceRate)}</td>
                <td className="px-3 py-2.5 text-right text-ink-600">{formatPercent(page.exitRate)}</td>
                <td className="px-5 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenHeatmap(page.pagePath)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-ink-500 hover:text-brand-600 hover:bg-brand-50 whitespace-nowrap"
                  >
                    <MousePointerClick size={12} />
                    Карта кликов
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.items.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink-400">За период просмотров нет</p>}
      </div>
      {data && <Pager total={data.total} query={query} onChange={setQuery} />}
    </div>
  );
}
