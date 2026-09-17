import { useSession } from "@/entities/session";
import { useTasks, type Task } from "@/entities/task";
import { useUsers, type User } from "@/entities/user";

/**
 * Назначение исполнителя. Имя подставляется в карточку сразу (в патче — только
 * id), ответ сервера потом заменит его тем, что сохранено.
 */
export function useChangeTaskAssignee() {
  const { updateTask } = useTasks();
  const { users } = useUsers();
  const { user: me } = useSession();

  const assign = (task: Task, user: User | null) => {
    if ((task.assignee?.id ?? null) === (user?.id ?? null)) return;
    updateTask(task.id, { assigneeId: user?.id ?? null }, { assignee: user ? { id: user.id, name: user.fullName } : null });
  };

  return { users, me, assign };
}
