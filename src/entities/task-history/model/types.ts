export type TaskHistoryEventType = "created" | "field_changed" | "comment";

/** Поля задачи, изменения которых попадают в историю (имена — как в API). */
export type TaskHistoryField =
  | "title"
  | "description"
  | "kind"
  | "priority"
  | "status"
  | "labels"
  | "dueDate"
  | "startDate"
  | "assignee"
  | "attachments";

/**
 * Одна строка истории задачи. Приходит с сервера — история пишется там на
 * каждом изменении, клиент её только читает.
 */
export interface TaskHistoryEvent {
  id: string;
  actorId: string | null;
  actorName: string;
  type: TaskHistoryEventType;
  field?: TaskHistoryField;
  /** Значения в обозначениях бэкенда (статус — `IN_PROGRESS`); подпись даёт `formatValue`. */
  oldValue: string;
  newValue: string;
  at: string;
}

export const TASK_HISTORY_FIELD_LABEL: Record<TaskHistoryField, string> = {
  title: "Название",
  description: "Описание",
  kind: "Тип",
  priority: "Приоритет",
  status: "Статус",
  labels: "Метки",
  dueDate: "Срок",
  startDate: "Дата начала",
  assignee: "Исполнитель",
  attachments: "Вложения",
};
