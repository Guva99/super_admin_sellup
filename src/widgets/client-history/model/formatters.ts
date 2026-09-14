import { CLIENT_STAGE_LABEL, CLIENT_STATUS_LABEL, STEP_STATUS_LABEL, clientStatusFromDto, stageFromDto, stepStatusFromDto } from "@/entities/client";
import type { ClientHistoryEvent, ClientHistoryFormatters } from "@/entities/client-history";
import { kindFromDto, priorityFromDto, statusFromDto, TASK_KIND_LABEL, TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/entities/task";
import { TASK_HISTORY_FIELD_LABEL, type TaskHistoryField } from "@/entities/task-history";
import { formatCalendarDate } from "@/shared/lib";

/**
 * Значения истории приходят в обозначениях бэкенда. Переводим их словарями
 * клиента и задачи здесь, а не в entities/client-history: сущности друг друга
 * не импортируют.
 */
export const clientHistoryFormatters: ClientHistoryFormatters = {
  value: (field, value) => {
    if (!value) return "";
    switch (field) {
      case "stage": {
        const stage = stageFromDto(value);
        return stage ? CLIENT_STAGE_LABEL[stage] : value;
      }
      case "status": {
        // Поле «status» есть и у задачи (TODO…), и у бизнеса (LEAD…) — наборы не пересекаются.
        const taskStatus = statusFromDto(value);
        if (taskStatus) return TASK_STATUS_LABEL[taskStatus];
        const clientStatus = clientStatusFromDto(value);
        return clientStatus ? CLIENT_STATUS_LABEL[clientStatus] : value;
      }
      case "stepStatus": {
        const status = stepStatusFromDto(value);
        return status ? STEP_STATUS_LABEL[status] : value;
      }
      case "kind": {
        const kind = kindFromDto(value);
        return kind ? TASK_KIND_LABEL[kind] : value;
      }
      case "priority": {
        const priority = priorityFromDto(value);
        return priority ? TASK_PRIORITY_LABEL[priority] : value;
      }
      case "dueDate":
      case "startDate":
        return formatCalendarDate(value.slice(0, 10));
      default:
        return value;
    }
  },
  field: (field) => TASK_HISTORY_FIELD_LABEL[field as TaskHistoryField] ?? field,
};

export interface HistoryDay {
  /** «14 сентября 2026» — подпись группы. */
  label: string;
  events: ClientHistoryEvent[];
}

/** События, сгруппированные по дню в порядке ленты (новое сверху). */
export function groupByDay(events: ClientHistoryEvent[]): HistoryDay[] {
  const days: HistoryDay[] = [];
  for (const event of events) {
    const label = new Date(event.at).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const last = days[days.length - 1];
    if (last && last.label === label) last.events.push(event);
    else days.push({ label, events: [event] });
  }
  return days;
}
