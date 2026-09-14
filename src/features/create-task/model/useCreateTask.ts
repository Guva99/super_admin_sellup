import { useState } from "react";
import { attachmentError, useTasks, type NewTaskInput, type TaskPriority, type TaskType } from "@/entities/task";
import { useSession } from "@/entities/session";
import { describeApiError } from "@/shared/api";

export interface CreateTaskDraft {
  title: string;
  description: string;
  clientId: string;
  type: TaskType;
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
  priority: "medium",
  dueDate: "",
  assigneeId,
});

export interface CreateTaskController {
  isOpen: boolean;
  draft: CreateTaskDraft;
  attachments: File[];
  clientPreset: string | null;
  isSubmitting: boolean;
  error: string | null;
  open: (clientId?: string) => void;
  close: () => void;
  patch: (patch: Partial<CreateTaskDraft>) => void;
  attachFiles: (files: FileList | null) => void;
  removeAttachment: (index: number) => void;
  submit: () => void;
}

/**
 * Состояние и правила создания задачи. UI-компонент только отображает это.
 * Исполнитель по умолчанию — тот, кто создаёт задачу.
 */
export function useCreateTask(): CreateTaskController {
  const { addTask } = useTasks();
  const { user } = useSession();
  const currentUserId = user?.id ?? "";

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<CreateTaskDraft>(() => emptyDraft(currentUserId));
  const [clientPreset, setClientPreset] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = (clientId?: string) => {
    setDraft({ ...emptyDraft(currentUserId), clientId: clientId ?? "" });
    setClientPreset(clientId ?? null);
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
    setIsOpen(false);
    setDraft(emptyDraft(currentUserId));
    setAttachments([]);
  };

  return { isOpen, draft, attachments, clientPreset, isSubmitting, error, open, close, patch, attachFiles, removeAttachment, submit };
}
