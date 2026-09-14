import { useState } from "react";
import { useClients, type Client } from "@/entities/client";
import { useSession } from "@/entities/session";
import { useTasks } from "@/entities/task";
import { isOwner } from "@/entities/user";
import { describeApiError } from "@/shared/api";

export interface DeleteClientController {
  /** Удалять бизнес может только владелец — остальным кнопка не показывается. */
  canDelete: boolean;
  /** Открыто ли подтверждение. */
  isConfirming: boolean;
  isDeleting: boolean;
  error: string | null;
  /** Сколько задач исчезнет вместе с бизнесом. */
  taskCount: number;
  ask: () => void;
  cancel: () => void;
  confirm: () => void;
}

/**
 * Удаление бизнеса. Бэкенд прячет бизнес и его задачи, но строки оставляет,
 * поэтому ошибочное удаление можно отменить в базе. Задачи убираем и из
 * памяти: перезагрузка страницы для этого не нужна.
 */
export function useDeleteClient(client: Client, onDeleted: () => void): DeleteClientController {
  const { removeClient } = useClients();
  const { tasksOfClient, dropClientTasks } = useTasks();
  const { user } = useSession();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setError(null);
    const result = await removeClient(client.id);
    setIsDeleting(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    dropClientTasks(client.id);
    setIsConfirming(false);
    onDeleted();
  };

  return {
    canDelete: isOwner(user?.roleKey),
    isConfirming,
    isDeleting,
    error,
    taskCount: tasksOfClient(client.id).length,
    ask: () => {
      setError(null);
      setIsConfirming(true);
    },
    cancel: () => setIsConfirming(false),
    confirm,
  };
}
