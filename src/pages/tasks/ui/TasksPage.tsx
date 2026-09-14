import { useNavigate, useParams } from "react-router-dom";
import { TaskBoard } from "@/widgets/task-board";
import { TaskDetail } from "@/widgets/task-detail";

/**
 * Доска; открытая карточка — часть адреса (/tasks/:taskId), чтобы на задачу
 * можно было дать ссылку.
 */
export default function TasksPage() {
  const { taskId } = useParams<{ taskId?: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex h-full">
      <TaskBoard selectedTaskId={taskId ?? null} onOpenTask={(id) => navigate(`/tasks/${id}`)} />
      {taskId && <TaskDetail taskId={taskId} onClose={() => navigate("/tasks")} />}
    </div>
  );
}
