import { UserAvatar } from "@/shared/ui";
import { TASK_HISTORY_FIELD_LABEL, type TaskHistoryEvent, type TaskHistoryField } from "../model/types";

/** Перевод значения из обозначений бэкенда в подпись; по умолчанию как есть. */
export type HistoryValueFormatter = (field: TaskHistoryField, value: string) => string;

const EMPTY = "—";

interface HistoryEventProps {
  event: TaskHistoryEvent;
  formatValue?: HistoryValueFormatter;
  formatTime: (iso: string) => string;
}

/** Строка истории: «Гуванч · Статус: К выполнению → В работе · 5 мин назад». */
export function HistoryEvent({ event, formatValue = (_, value) => value, formatTime }: HistoryEventProps) {
  return (
    <div className="flex gap-2.5">
      <UserAvatar name={event.actorName} size="sm" className="mt-0.5" />
      <div className="flex-1 min-w-0 text-xs leading-relaxed">
        <span className="font-semibold text-slate-700">{event.actorName}</span>
        <span className="text-slate-500"> · </span>
        <Description event={event} formatValue={formatValue} />
        <span className="text-slate-400"> · {formatTime(event.at)}</span>
      </div>
    </div>
  );
}

function Description({ event, formatValue }: { event: TaskHistoryEvent; formatValue: HistoryValueFormatter }) {
  switch (event.type) {
    case "created":
      return <span className="text-slate-600">задача создана</span>;
    case "comment":
      return <span className="text-slate-600">добавлен комментарий</span>;
    case "field_changed": {
      const field = event.field;
      if (!field) return <span className="text-slate-600">изменение</span>;
      if (field === "attachments") {
        return (
          <span className="text-slate-600">
            приложены файлы: <span className="text-slate-800">{event.newValue}</span>
          </span>
        );
      }
      if (field === "description") return <span className="text-slate-600">изменено описание</span>;
      const from = formatValue(field, event.oldValue);
      const to = formatValue(field, event.newValue);
      return (
        <span className="text-slate-600">
          {TASK_HISTORY_FIELD_LABEL[field]}: <span className="text-slate-400 line-through">{from || EMPTY}</span>{" "}
          <span className="text-slate-400">→</span> <span className="text-slate-800 font-medium">{to || EMPTY}</span>
        </span>
      );
    }
  }
}
