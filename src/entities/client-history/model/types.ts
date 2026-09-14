/** Задача, о которой событие; `exists` false — задача уже удалена, ссылки нет. */
export interface ClientHistoryTask {
  id: string;
  key: string;
  title: string;
  exists: boolean;
}

/**
 * Одна строка истории бизнеса (`ClientHistoryEvent` в Swagger). `action` —
 * сырое имя из аудита; текст по нему собирает UI. Для изменений поля
 * заполнены `field`/`oldValue`/`newValue` в обозначениях бэкенда.
 */
export interface ClientHistoryEvent {
  id: string;
  actorId: string | null;
  actorName: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  task: ClientHistoryTask | null;
  /** Остальные данные события: amount и paidAt платежа, title этапа, files… */
  details: Record<string, unknown>;
  at: string;
}
