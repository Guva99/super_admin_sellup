import { AlertCircle } from "lucide-react";
import type { Client } from "@/entities/client";
import { ClientHistoryEventRow, useClientHistory } from "@/entities/client-history";
import { formatRelativeTime } from "@/shared/lib";
import { clientHistoryFormatters, groupByDay } from "../model/formatters";

interface ClientHistoryProps {
  client: Client;
  onOpenTask: (taskId: string) => void;
}

/**
 * Всё, что происходило с бизнесом: платежи, воронка, онбординг, его задачи и
 * комментарии к ним. Ведёт бэкенд (`GET /clients/{id}/history`), здесь только чтение.
 */
export function ClientHistory({ client, onOpenTask }: ClientHistoryProps) {
  const { events, isLoading, error } = useClientHistory(client.id);
  const days = groupByDay(events);

  return (
    <div className="max-w-[760px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">История</h3>
        {events.length > 0 && <span className="text-xs text-slate-400">{events.length} событий</span>}
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-red-600 bg-red-50 border border-red-100">
          <AlertCircle size={13} />
          {error}
        </div>
      )}
      {isLoading && <p className="py-8 text-center text-sm text-slate-400">Загружаем историю…</p>}
      {!isLoading && !error && events.length === 0 && (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
          <p className="text-sm text-slate-400">Истории пока нет</p>
        </div>
      )}

      {days.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 space-y-5">
          {days.map((day) => (
            <section key={day.label}>
              <h4 className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-3">{day.label}</h4>
              <div className="space-y-3">
                {day.events.map((event) => (
                  <ClientHistoryEventRow key={event.id} event={event} format={clientHistoryFormatters} formatTime={formatRelativeTime} onOpenTask={onOpenTask} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
