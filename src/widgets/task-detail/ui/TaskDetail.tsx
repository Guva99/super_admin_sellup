import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TaskTitle } from "@/features/edit-task-title";
import { ModalOverlay } from "@/shared/ui";
import { useTaskDetail } from "../model/useTaskDetail";
import { ActivitySection } from "./ActivitySection";
import { AttachmentsSection } from "./AttachmentsSection";
import { DescriptionSection } from "./DescriptionSection";
import { DetailsSidebar } from "./DetailsSidebar";
import { MetaFooter } from "./MetaFooter";
import { TaskBreadcrumb } from "./TaskBreadcrumb";
import { TaskDialogFrame } from "./TaskDialogFrame";

interface TaskDetailProps {
  taskId: string;
  onClose: () => void;
}

/**
 * Карточка задачи в модалке по адресу /tasks/:taskId. Раскладка как в Jira:
 * слева заголовок, описание, вложения и активность; справа — поля. Та же
 * раскладка у новой задачи (`TaskCreateDialog`).
 */
export function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const { task, client, history, currentUserName, formatHistoryValue, formatTime, deleteTask } = useTaskDetail(taskId);
  const navigate = useNavigate();

  const remove = () => {
    if (!task || !window.confirm(`Удалить задачу ${task.key} «${task.title}»?`)) return;
    deleteTask();
    onClose();
  };

  if (!task) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-500">Задача не найдена — возможно, её удалили.</p>
          <button type="button" onClick={onClose} className="mt-3 text-xs text-brand-500 hover:underline">
            К доске
          </button>
        </div>
      </ModalOverlay>
    );
  }

  return (
    <TaskDialogFrame
      onClose={onClose}
      breadcrumb={
        <TaskBreadcrumb
          task={task}
          parentLabel={client?.name ?? "Задачи"}
          onParentClick={client ? () => navigate(`/clients/${client.id}/tasks`) : undefined}
        />
      }
      actions={
        <button type="button" onClick={remove} title="Удалить задачу" className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50">
          <Trash2 size={15} />
        </button>
      }
      aside={
        <>
          <DetailsSidebar task={task} client={client} onOpenClient={(id) => navigate(`/clients/${id}`)} />
          <MetaFooter task={task} />
        </>
      }
    >
      <TaskTitle task={task} />
      <DescriptionSection task={task} />
      <AttachmentsSection task={task} />
      <ActivitySection
        task={task}
        history={history}
        currentUserName={currentUserName}
        formatHistoryValue={formatHistoryValue}
        formatTime={formatTime}
      />
    </TaskDialogFrame>
  );
}
