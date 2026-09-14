import { useNavigate } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import { useClients } from "@/entities/client";
import { useTasks, type TaskStatus } from "@/entities/task";
import { useUsers } from "@/entities/user";
import { useChangeTaskStatus } from "@/features/change-task-status";
import { useUiActions } from "@/shared/lib";
import { useTaskBoard } from "../model/useTaskBoard";
import { AssigneeGroup } from "./AssigneeGroup";
import { BoardToolbar } from "./BoardToolbar";
import { GroupColumns } from "./GroupColumns";

interface TaskBoardProps {
  /** Задача, открытая в карточке, — подсвечивается на доске. */
  selectedTaskId: string | null;
  onOpenTask: (id: string) => void;
}

/**
 * Доска задач: тулбар, секции по исполнителям (или одна общая), внутри —
 * колонки статусов. Данные — только через хуки сущностей и фич.
 */
export function TaskBoard({ selectedTaskId, onOpenTask }: TaskBoardProps) {
  const board = useTaskBoard();
  const { deleteTask } = useTasks();
  const { users } = useUsers();
  const { clients } = useClients();
  const { change } = useChangeTaskStatus();
  const { openCreateTask } = useUiActions();
  const navigate = useNavigate();

  const openClient = (id: string) => navigate(`/clients/${id}`);
  const create = (status?: TaskStatus, assigneeId?: string) =>
    openCreateTask({ status, assigneeId, clientId: board.filters.filters.clientId || undefined });

  const grouped = board.groupMode !== "none";
  const columnsFor = (tasks: Parameters<typeof GroupColumns>[0]["tasks"], fill: boolean, assigneeId?: string) => (
    <GroupColumns
      tasks={tasks}
      clients={clients}
      selectedTaskId={selectedTaskId}
      fill={fill}
      onStatusChange={change}
      onDelete={deleteTask}
      onOpenTask={onOpenTask}
      onOpenClient={openClient}
      onCreate={(status) => create(status, assigneeId)}
    />
  );

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0">
      <BoardToolbar
        filters={board.filters}
        users={users}
        clients={clients}
        groupMode={board.groupMode}
        onGroupModeChange={board.setGroupMode}
        totals={board.totals}
        onCreate={() => create()}
      />

      {board.groups.every((g) => g.tasks.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-300">
          <CheckSquare size={28} />
          <p className="text-sm">{board.filters.isActive ? "Ничего не найдено" : "Задач пока нет"}</p>
          <button type="button" onClick={() => create()} className="text-xs text-brand-500 hover:underline">
            + Создать задачу
          </button>
        </div>
      ) : grouped ? (
        <div className="flex-1 overflow-y-auto">
          {board.groups.map((group) => (
            <AssigneeGroup key={group.id} group={group} collapsed={board.collapsed.has(group.id)} onToggle={() => board.toggleGroup(group.id)}>
              {columnsFor(group.tasks, false, group.assignee?.id)}
            </AssigneeGroup>
          ))}
        </div>
      ) : (
        columnsFor(board.groups[0].tasks, true)
      )}
    </div>
  );
}
