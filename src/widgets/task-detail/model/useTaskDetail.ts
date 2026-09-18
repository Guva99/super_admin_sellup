import { useClients, type Client } from "@/entities/client";
import { useSession } from "@/entities/session";
import {
  kindFromDto,
  priorityFromDto,
  statusFromDto,
  TASK_KIND_LABEL,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  useTasks,
  type Task,
} from "@/entities/task";
import { useTaskHistory, type HistoryValueFormatter, type TaskHistoryState } from "@/entities/task-history";
import { formatRelativeTime } from "@/shared/lib";

export interface TaskDetailData {
  task: Task | undefined;
  client: Client | null;
  /** Родитель подзадачи — для хлебных крошек; у обычной задачи null. */
  parent: Task | null;
  /** Сколько подзадач уйдёт вместе с задачей при удалении. */
  subtaskCount: number;
  history: TaskHistoryState;
  /** Имя вошедшего — автор новых комментариев. */
  currentUserName: string;
  formatHistoryValue: HistoryValueFormatter;
  formatTime: (iso: string) => string;
  deleteTask: () => void;
}

/**
 * Значения истории приходят в обозначениях бэкенда — переводим их словарями
 * задачи здесь, а не в entities/task-history: сущности друг друга не импортируют.
 */
const formatHistoryValue: HistoryValueFormatter = (field, value) => {
  if (!value) return "";
  switch (field) {
    case "status":
      return TASK_STATUS_LABEL[statusFromDto(value) ?? "todo"] ?? value;
    case "kind":
      return TASK_KIND_LABEL[kindFromDto(value) ?? "task"] ?? value;
    case "priority":
      return TASK_PRIORITY_LABEL[priorityFromDto(value) ?? "medium"] ?? value;
    case "dueDate":
    case "startDate":
      return new Date(value).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    default:
      return value;
  }
};

/** Всё, что нужно карточке, — через хуки сущностей; сама она в API не ходит. */
export function useTaskDetail(taskId: string): TaskDetailData {
  const { tasks, subtasksOf, deleteTask } = useTasks();
  const { clients } = useClients();
  const { user } = useSession();
  const task = tasks.find((t) => t.id === taskId);

  // Комментарии и файлы не двигают updatedAt задачи — учитываем их отдельно.
  const revision = task ? `${task.updatedAt}:${task.comments.length}:${task.attachments.length}` : "";
  const history = useTaskHistory(taskId, revision, task !== undefined);

  return {
    task,
    client: task?.clientId ? clients.find((c) => c.id === task.clientId) ?? null : null,
    parent: task?.parentId ? tasks.find((t) => t.id === task.parentId) ?? null : null,
    subtaskCount: task ? subtasksOf(task.id).length : 0,
    history,
    currentUserName: user?.fullName ?? "",
    formatHistoryValue,
    formatTime: formatRelativeTime,
    deleteTask: () => deleteTask(taskId),
  };
}
