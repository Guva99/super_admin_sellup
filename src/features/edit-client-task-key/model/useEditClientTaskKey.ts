import { useState } from "react";
import { normaliseTaskKeyInput, taskKeyError, useClients, type Client } from "@/entities/client";
import { useSession } from "@/entities/session";
import { useTasks } from "@/entities/task";
import { describeApiError } from "@/shared/api";

export interface EditClientTaskKeyController {
  /** Правится ли ключ прямо сейчас. */
  isEditing: boolean;
  draft: string;
  isSaving: boolean;
  error: string | null;
  /** Можно ли вообще менять: до первой задачи — всем, дальше — владельцу. */
  canEdit: boolean;
  start: () => void;
  cancel: () => void;
  setDraft: (value: string) => void;
  save: () => void;
}

/**
 * Переименование ключа задач бизнеса в его карточке. Пока задач нет, ключ
 * меняет любой, кто правит клиентов; после первой задачи — только владелец,
 * потому что ключ уже стоит в названиях задач. Проверяет и бэкенд.
 */
export function useEditClientTaskKey(client: Client): EditClientTaskKeyController {
  const { setTaskKey } = useClients();
  const { tasksOfClient } = useTasks();
  const { user } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(client.taskKey);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTasks = tasksOfClient(client.id).length > 0;
  const canEdit = !hasTasks || user?.roleKey === "OWNER";

  const save = async () => {
    if (isSaving) return;
    if (draft === client.taskKey) {
      setIsEditing(false);
      return;
    }
    const problem = taskKeyError(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setIsSaving(true);
    const result = await setTaskKey(client.id, draft);
    setIsSaving(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    setIsEditing(false);
    setError(null);
  };

  return {
    isEditing,
    draft,
    isSaving,
    error,
    canEdit,
    start: () => {
      setDraft(client.taskKey);
      setError(null);
      setIsEditing(true);
    },
    cancel: () => {
      setIsEditing(false);
      setError(null);
    },
    setDraft: (value: string) => setDraft(normaliseTaskKeyInput(value)),
    save,
  };
}
