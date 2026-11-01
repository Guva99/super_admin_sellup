import { Fragment, useState } from "react";
import { AlertCircle, ChevronRight, ExternalLink } from "lucide-react";
import {
  Pager,
  SortHeader,
  formatCount,
  formatPercent,
  useLeadFunnel,
  type AggregationGate,
  type LeadSort,
  type LeadTotals,
  type ListQuery,
  type TrafficPeriod,
} from "@/entities/site-analytics";

const FIRST_PAGE: ListQuery<LeadSort> = { page: 1, limit: 50, sort: "submits", direction: "desc" };

/** Три шага воронки сайта в посетителях и конверсия каждого перехода. */
function FunnelSteps({ totals, exact }: { totals: LeadTotals; exact: boolean }) {
  const steps = [
    { label: "Зашли на сайт", value: totals.visitors, rate: null },
    { label: "Открыли форму заявки", value: totals.openers, rate: totals.visitToOpenRate },
    { label: "Отправили заявку", value: totals.submitters, rate: totals.openToSubmitRate },
  ];
  return (
    <div className="bg-surface border border-ink-200 rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink-900">Воронка заявок</h3>
        <span className="text-xs text-ink-400">
          Из зашедших отправили заявку: <span className="font-semibold text-ink-700">{formatPercent(totals.visitToSubmitRate)}</span>
        </span>
      </div>
      <div className="flex items-stretch gap-2">
        {steps.map((step, i) => (
          <Fragment key={step.label}>
            {i > 0 && (
              <div className="flex flex-col items-center justify-center text-ink-300 w-16 flex-shrink-0">
                <ChevronRight size={16} />
                <span className="text-xs font-medium text-ink-600">{formatPercent(step.rate ?? 0)}</span>
              </div>
            )}
            <div className="flex-1 rounded-lg bg-ink-50 border border-ink-100 px-4 py-3">
              <p className="text-xs text-ink-400">{step.label}</p>
              <p className="text-2xl font-semibold text-ink-900 mt-1">{formatCount(step.value)}</p>
            </div>
          </Fragment>
        ))}
      </div>
      <p className="text-xs text-ink-400 mt-3">
        Считаются посетители: открыть форму несколько раз — всё равно один человек.
        {!exact && " Период длиннее хранения событий — числа сложены по дням и могут повторяться."}
      </p>
    </div>
  );
}

/**
 * Вкладка «Заявки» — вместо воронки товаров магазина: у лендинга одна
 * конверсия, форма заявки. Сверху — воронка сайта, ниже — по страницам:
 * где открывают форму и где её отправляют.
 */
export function TrafficLeads({ period, gate }: { period: TrafficPeriod; gate: AggregationGate }) {
  const [query, setQuery] = useState(FIRST_PAGE);
  const { data, isLoading, error } = useLeadFunnel(period, query, gate);
  const header = { query, onChange: setQuery };

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      {data ? <FunnelSteps totals={data.totals} exact={data.uniqueVisitorsExact} /> : <div className="h-[168px] bg-surface border border-ink-200 rounded-xl animate-pulse" />}

      <div className="bg-surface border border-ink-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-ink-100">
          <h3 className="text-sm font-semibold text-ink-900">По страницам</h3>
          <p className="text-xs text-ink-400 mt-0.5">В событиях: сколько раз открыли форму и отправили заявку на этой странице.</p>
        </div>
        <div className={`overflow-x-auto transition-opacity ${isLoading ? "opacity-60" : ""}`}>
          <table className="w-full text-xs">
            <thead className="text-ink-400 border-b border-ink-100">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium">Страница</th>
                <SortHeader label="Просмотры" sort="views" {...header} />
                <SortHeader label="Открыли форму" sort="form_opens" {...header} />
                <SortHeader label="Заявки" sort="submits" {...header} />
                <SortHeader label="Просмотр → форма" sort="view_to_open_rate" {...header} />
                <SortHeader label="Форма → заявка" sort="open_to_submit_rate" {...header} />
                <SortHeader label="Просмотр → заявка" sort="view_to_submit_rate" {...header} />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {data?.items.map((row) => (
                <tr key={row.pagePath} className="hover:bg-ink-50/60">
                  <td className="px-5 py-2.5 max-w-[320px]">
                    <a
                      href={`${data.siteUrl}${row.pagePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-ink-800 hover:text-brand-600 font-mono max-w-full"
                    >
                      <span className="truncate">{row.pagePath}</span>
                      <ExternalLink size={11} className="flex-shrink-0 text-ink-300" />
                    </a>
                  </td>
                  <td className="px-3 py-2.5 text-right text-ink-600">{formatCount(row.pageViews)}</td>
                  <td className="px-3 py-2.5 text-right text-ink-600">{formatCount(row.formOpens)}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-ink-800">{formatCount(row.submits)}</td>
                  <td className="px-3 py-2.5 text-right text-ink-600">{formatPercent(row.viewToOpenRate)}</td>
                  <td className="px-3 py-2.5 text-right text-ink-600">{formatPercent(row.openToSubmitRate)}</td>
                  <td className="px-3 py-2.5 text-right text-ink-600">{formatPercent(row.viewToSubmitRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.items.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink-400">За период просмотров нет</p>}
        </div>
        {data && <Pager total={data.total} query={query} onChange={setQuery} />}
      </div>
    </div>
  );
}
