import { Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DescriptionEditor } from "@/features/edit-task-description";
import { TaskTitle } from "@/features/edit-task-title";
import { ModalOverlay } from "@/shared/ui";
import { useTaskDetail } from "../model/useTaskDetail";
import { ActivitySection } from "./ActivitySection";
import { AttachmentsSection } from "./AttachmentsSection";
import { DetailsSidebar } from "./DetailsSidebar";
import { MetaFooter } from "./MetaFooter";
import { TaskBreadcrumb } from "./TaskBreadcrumb";

interface TaskDetailProps {
  taskId: string;
  onClose: () => void;
}

/**
 * Карточка задачи в модалке по адресу /tasks/:taskId. Раскладка как в Jira:
 * слева заголовок, описание, вложения и активность; справа — детали.
 */
export function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const { task, client, history, currentUserName, formatHistoryValue, formatTime, deleteTask } = useTaskDetail(taskId);
  const navigate = useNavigate();

  const remove = () => {
    if (!task || !window.confirm(`Удалить задачу ${task.key} «${task.title}»?`)) return;
    deleteTask();
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-[960px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-96px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {!task ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500">Задача не найдена — возможно, её удалили.</p>
            <button type="button" onClick={onClose} className="mt-3 text-xs text-brand-500 hover:underline">
              К доске
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-100 flex-shrink-0">
              <TaskBreadcrumb
                task={task}
                parentLabel={client?.name ?? "Задачи"}
                onParentClick={client ? () => navigate(`/clients/${client.id}/tasks`) : undefined}
              />
              <span className="flex-1" />
              <button type="button" onClick={remove} title="Удалить задачу" className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={15} />
              </button>
              <button type="button" onClick={onClose} aria-label="Закрыть" className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-[1fr_300px]">
              <div className="min-w-0 overflow-y-auto px-6 py-5 space-y-6">
                <TaskTitle task={task} />
                <DescriptionEditor task={task} />
                <AttachmentsSection task={task} />
                <ActivitySection
                  task={task}
                  history={history}
                  currentUserName={currentUserName}
                  formatHistoryValue={formatHistoryValue}
                  formatTime={formatTime}
                />
              </div>
              <aside className="overflow-y-auto border-l border-slate-100 bg-slate-50/40 px-4 py-5 space-y-4">
                <DetailsSidebar task={task} client={client} onOpenClient={(id) => navigate(`/clients/${id}`)} />
                <MetaFooter task={task} />
              </aside>
            </div>
          </>
        )}
      </div>
    </ModalOverlay>
  );
}
