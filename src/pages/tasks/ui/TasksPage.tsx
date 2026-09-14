import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/entities/client";
import { useTasks } from "@/entities/task";
import { TaskBoard, TaskDetailPanel } from "@/features/task-board";
import { useUiActions } from "@/shared/lib";

export default function TasksPage() {
  const { clients } = useClients();
  const { tasks, setStatus, deleteTask } = useTasks();
  const { openCreateTask } = useUiActions();
  const navigate = useNavigate();
  const openClient = (id: string) => navigate(`/clients/${id}`);

  const [clientFilter, setClientFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    if (clientFilter !== "all" && t.clientId !== clientFilter) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    return true;
  });

  const detailTask = detailTaskId ? tasks.find((t) => t.id === detailTaskId) ?? null : null;
  const detailClient = detailTask?.clientId ? clients.find((c) => c.id === detailTask.clientId) ?? null : null;

  /** Удаление закрывает панель деталей, если она показывала эту задачу. */
  const removeTask = (id: string) => {
    deleteTask(id);
    if (detailTaskId === id) setDetailTaskId(null);
  };

  return (
    <div className="flex h-full">
      <TaskBoard
        tasks={tasks}
        filteredTasks={filteredTasks}
        clients={clients}
        clientFilter={clientFilter}
        typeFilter={typeFilter}
        selectedTaskId={detailTaskId}
        onClientFilterChange={setClientFilter}
        onTypeFilterChange={setTypeFilter}
        onSelectTask={(id) => setDetailTaskId((prev) => (prev === id ? null : id))}
        onAddTask={openCreateTask}
        onStatusChange={setStatus}
        onDeleteTask={removeTask}
        onOpenClient={openClient}
      />

      {/* ── Task Detail Panel ── */}
      {detailTask && (
        <TaskDetailPanel
          task={detailTask}
          client={detailClient}
          onClose={() => setDetailTaskId(null)}
          onStatusChange={setStatus}
          onDelete={removeTask}
          onOpenClient={openClient}
        />
      )}
    </div>
  );
}
