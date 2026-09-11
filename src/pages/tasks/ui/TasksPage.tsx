import { useState } from "react";
import type { Client } from "@/entities/client";
import type { Task } from "@/entities/task";
import { TaskBoard, TaskDetailPanel } from "@/features/task-board";

interface Props {
  tasks: Task[];
  clients: Client[];
  onAddTask: (clientId?: string) => void;
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onOpenClient: (id: string) => void;
}

export default function TasksPage({ tasks, clients, onAddTask, onUpdateTask, onDeleteTask, onOpenClient }: Props) {
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

  const deleteTask = (id: string) => {
    onDeleteTask(id);
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
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={deleteTask}
        onOpenClient={onOpenClient}
      />

      {/* ── Task Detail Panel ── */}
      {detailTask && (
        <TaskDetailPanel
          task={detailTask}
          client={detailClient}
          onClose={() => setDetailTaskId(null)}
          onUpdate={onUpdateTask}
          onDelete={deleteTask}
          onOpenClient={onOpenClient}
        />
      )}
    </div>
  );
}
