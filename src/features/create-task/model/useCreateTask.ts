import { useState } from "react";
import type { Task, TaskAttachment, TaskType, TaskPriority } from "@/entities/task";
import { MANAGERS } from "@/shared/api/mock";
import { todayIso } from "@/shared/lib";

export interface CreateTaskDraft {
  title: string;
  description: string;
  clientId: string;
  type: TaskType;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
}

const emptyDraft = (): CreateTaskDraft => ({
  title: "",
  description: "",
  clientId: "",
  type: "task",
  priority: "medium",
  dueDate: "",
  assignee: MANAGERS[0],
});

export interface CreateTaskController {
  isOpen: boolean;
  draft: CreateTaskDraft;
  attachments: TaskAttachment[];
  clientPreset: string | null;
  open: (clientId?: string) => void;
  close: () => void;
  patch: (patch: Partial<CreateTaskDraft>) => void;
  attachFiles: (files: FileList | null) => void;
  removeAttachment: (index: number) => void;
  submit: () => void;
}

/** Состояние и правила создания задачи. UI-компонент только отображает это. */
export function useCreateTask(onCreated: (task: Task) => void): CreateTaskController {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<CreateTaskDraft>(emptyDraft);
  const [clientPreset, setClientPreset] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);

  const open = (clientId?: string) => {
    setDraft({ ...emptyDraft(), clientId: clientId ?? "" });
    setClientPreset(clientId ?? null);
    setAttachments([]);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const patch = (next: Partial<CreateTaskDraft>) => setDraft((prev) => ({ ...prev, ...next }));

  const attachFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAttachments((prev) => [...prev, { name: file.name, size: file.size, type: file.type, dataUrl }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  const submit = () => {
    if (!draft.title.trim()) return;
    onCreated({
      id: `t${Date.now()}`,
      title: draft.title.trim(),
      description: draft.description || undefined,
      clientId: draft.clientId || null,
      type: draft.type,
      priority: draft.priority,
      status: "todo",
      dueDate: draft.dueDate || null,
      assignee: draft.assignee,
      createdAt: todayIso(),
      attachments: attachments.length > 0 ? attachments : undefined,
    });
    setIsOpen(false);
    setDraft(emptyDraft());
    setAttachments([]);
  };

  return { isOpen, draft, attachments, clientPreset, open, close, patch, attachFiles, removeAttachment, submit };
}
