import { useState } from "react";
import {
  useTasks,
  TASK_COLUMNS,
  type NewTaskInput,
  type TaskKind,
  type TaskPerson,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from "@/entities/task";
import { useClients, normaliseTaskKeyInput, taskKeyError, type Client } from "@/entities/client";
import { useSession } from "@/entities/session";
import { useUsers } from "@/entities/user";
import { describeApiError } from "@/shared/api";
import type { CreateTaskPreset } from "@/shared/lib";

/** Черновик повторяет поля задачи: форма новой и карточка сохранённой одинаковы. */
export interface CreateTaskDraft {
  title: string;
  description: string;
  clientId: string;
  type: TaskType;
  kind: TaskKind;
  priority: TaskPriority;
  status: TaskStatus;
  labels: string[];
  dueDate: string | null;
  startDate: string | null;
  assignee: TaskPerson | null;
  /** Ключ выбранного бизнеса: подставляется из него, правится до первой задачи. */
  taskKey: string;
}

const emptyDraft = (assignee: TaskPerson | null): CreateTaskDraft => ({
  title: "",
  description: "",
  clientId: "",
  type: "task",
  kind: "task",
  priority: "medium",
  status: "todo",
  labels: [],
  dueDate: null,
  startDate: null,
  assignee,
  taskKey: "",
});

export interface CreateTaskController {
  isOpen: boolean;
  draft: CreateTaskDraft;
  clientPreset: string | null;
  /** Выбранный бизнес — от него зависит ключ задачи. */
  selectedClient: Client | null;
  /** Ключ ещё можно задать: у бизнеса нет задач. Дальше меняет владелец в карточке. */
  canEditTaskKey: boolean;
  isSubmitting: boolean;
  error: string | null;
  open: (preset?: CreateTaskPreset) => void;
  close: () => void;
  patch: (patch: Partial<CreateTaskDraft>) => void;
  /** Файлы уже загружены черновиками (в описание или списком) — задача заберёт их по id. */
  submit: (attachmentIds: string[]) => void;
}

/** Статус из предустановки — строка из shared; принимаем только известную колонку. */
const knownStatus = (value: string | undefined): TaskStatus | null =>
  TASK_COLUMNS.find((column) => column.id === value)?.id ?? null;

/**
 * Состояние и правила создания задачи. UI только отображает это — и рисует
 * теми же кусками, что и карточка сохранённой задачи.
 *
 * Файлы к новой задаче грузятся сразу, ещё до её создания (черновики на
 * сервере), поэтому картинка в описании ссылается на настоящий id; форма
 * при отправке передаёт список id, и задача забирает их себе.
 */
export function useCreateTask(): CreateTaskController {
  const { addTask, updateTask, tasksOfClient } = useTasks();
  const { clients, setTaskKey } = useClients();
  const { user } = useSession();
  const { users } = useUsers();
  const me: TaskPerson | null = user ? { id: user.id, name: user.fullName } : null;
  const personOf = (id: string): TaskPerson | null => {
    const found = users.find((u) => u.id === id);
    return found ? { id: found.id, name: found.fullName } : null;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<CreateTaskDraft>(() => emptyDraft(me));
  const [clientPreset, setClientPreset] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientById = (id: string): Client | null => clients.find((c) => c.id === id) ?? null;

  const open = (preset: CreateTaskPreset = {}) => {
    const client = preset.clientId ? clientById(preset.clientId) : null;
    const assignee = preset.assigneeId ? personOf(preset.assigneeId) : me;
    setDraft({
      ...emptyDraft(assignee),
      clientId: preset.clientId ?? "",
      taskKey: client?.taskKey ?? "",
      status: knownStatus(preset.status) ?? "todo",
    });
    setClientPreset(preset.clientId ?? null);
    setError(null);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const patch = (next: Partial<CreateTaskDraft>) =>
    setDraft((prev) => {
      // Сменили бизнес — подставляем его ключ.
      const taskKey = next.clientId !== undefined ? (clientById(next.clientId)?.taskKey ?? "") : prev.taskKey;
      return { ...prev, taskKey, ...next };
    });

  const selectedClient = draft.clientId ? clientById(draft.clientId) : null;
  const canEditTaskKey = selectedClient !== null && tasksOfClient(selectedClient.id).length === 0;

  const submit = async (attachmentIds: string[]) => {
    if (!draft.title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const input: NewTaskInput = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      clientId: draft.clientId || null,
      type: draft.type,
      kind: draft.kind,
      priority: draft.priority,
      labels: draft.labels,
      dueDate: draft.dueDate,
      startDate: draft.startDate,
      assigneeId: draft.assignee?.id ?? null,
      attachmentIds,
    };
    // Ключ бизнеса сохраняется до задачи: её ключ строится уже из нового.
    if (selectedClient && canEditTaskKey && draft.taskKey !== selectedClient.taskKey) {
      const problem = taskKeyError(draft.taskKey);
      if (problem) {
        setError(problem);
        setIsSubmitting(false);
        return;
      }
      const keyResult = await setTaskKey(selectedClient.id, draft.taskKey);
      if (!keyResult.ok) {
        setError(describeApiError(keyResult.error));
        setIsSubmitting(false);
        return;
      }
    }

    const result = await addTask(input);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    // Бэкенд создаёт задачу в первой колонке; выбранный в форме статус
    // переносит её сразу — это отдельная строка в истории, так и задумано.
    if (draft.status !== "todo") updateTask(result.data.id, { status: draft.status });
    setIsOpen(false);
    setDraft(emptyDraft(me));
  };

  return {
    isOpen,
    draft,
    clientPreset,
    selectedClient,
    canEditTaskKey,
    isSubmitting,
    error,
    open,
    close,
    patch: (next: Partial<CreateTaskDraft>) => patch(next.taskKey !== undefined ? { ...next, taskKey: normaliseTaskKeyInput(next.taskKey) } : next),
    submit,
  };
}
