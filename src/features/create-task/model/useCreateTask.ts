import { useState } from "react";
import {
  attachmentError,
  useTasks,
  TASK_COLUMNS,
  type NewTaskInput,
  type TaskKind,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from "@/entities/task";
import { useSession } from "@/entities/session";
import { describeApiError } from "@/shared/api";
import type { CreateTaskPreset } from "@/shared/lib";

export interface CreateTaskDraft {
  title: string;
  description: string;
  clientId: string;
  type: TaskType;
  kind: TaskKind;
  priority: TaskPriority;
  dueDate: string;
  /** id сотрудника; пусто — без исполнителя. */
  assigneeId: string;
}

const emptyDraft = (assigneeId: string): CreateTaskDraft => ({
  title: "",
  description: "",
  clientId: "",
  type: "task",
  kind: "task",
  priority: "medium",
  dueDate: "",
  assigneeId,
});

export interface CreateTaskController {
  isOpen: boolean;
  draft: CreateTaskDraft;
  attachments: File[];
  clientPreset: string | null;
  /** Колонка, из которой нажали «Создать»; задача попадёт в неё. */
  statusPreset: TaskStatus | null;
  isSubmitting: boolean;
  error: string | null;
  open: (preset?: CreateTaskPreset) => void;
  close: () => void;
  patch: (patch: Partial<CreateTaskDraft>) => void;
  attachFiles: (files: FileList | null) => void;
  removeAttachment: (index: number) => void;
  submit: () => void;
}

/** Статус из предустановки — строка из shared; принимаем только известную колонку. */
const knownStatus = (value: string | undefined): TaskStatus | null =>
  TASK_COLUMNS.find((column) => column.id === value)?.id ?? null;

/**
 * Состояние и правила создания задачи. UI-компонент только отображает это.
 * Исполнитель по умолчанию — тот, кто создаёт задачу.
 */
export function useCreateTask(): CreateTaskController {
  const { addTask, updateTask } = useTasks();
  const { user } = useSession();
  const currentUserId = user?.id ?? "";

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<CreateTaskDraft>(() => emptyDraft(currentUserId));
  const [clientPreset, setClientPreset] = useState<string | null>(null);
  const [statusPreset, setStatusPreset] = useState<TaskStatus | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = (preset: CreateTaskPreset = {}) => {
    setDraft({ ...emptyDraft(preset.assigneeId ?? currentUserId), clientId: preset.clientId ?? "" });
    setClientPreset(preset.clientId ?? null);
    setStatusPreset(knownStatus(preset.status));
    setAttachments([]);
    setError(null);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const patch = (next: Partial<CreateTaskDraft>) => setDraft((prev) => ({ ...prev, ...next }));

  const attachFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted: File[] = [];
    for (const file of Array.from(files)) {
      const problem = attachmentError(file);
      if (problem) setError(problem);
      else accepted.push(file);
    }
    if (accepted.length > 0) setAttachments((prev) => [...prev, ...accepted]);
  };

  const removeAttachment = (index: number) => setAttachments((prev) => prev.filter((_, i) => i !== index));

  const submit = async () => {
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
      dueDate: draft.dueDate || null,
      assigneeId: draft.assigneeId || null,
    };
    const result = await addTask(input, attachments);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    // Бэкенд создаёт задачу в первой колонке; «Создать» из другой колонки
    // сразу переносит её туда — это отдельная строка в истории, так и задумано.
    if (statusPreset && statusPreset !== "todo") updateTask(result.data.id, { status: statusPreset });
    setIsOpen(false);
    setDraft(emptyDraft(currentUserId));
    setAttachments([]);
  };

  return { isOpen, draft, attachments, clientPreset, statusPreset, isSubmitting, error, open, close, patch, attachFiles, removeAttachment, submit };
}
