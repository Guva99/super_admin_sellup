import { AlertCircle, Check, Pencil, Trash2 } from "lucide-react";
import { CommentAttachment, taskImageRenderer, type Task, type TaskComment } from "@/entities/task";
import { Markdown, MarkdownEditor, UserAvatar } from "@/shared/ui";
import type { EditCommentController } from "../model/useEditTaskComment";

interface CommentListProps {
  task: Task;
  /** Какие комментарии показать: все или один (в общей ленте активности). */
  comments: TaskComment[];
  controller: EditCommentController;
  formatTime: (iso: string) => string;
}

/** Лента комментариев с разметкой; свои можно править на месте и удалять. */
export function CommentList({ task, comments, controller, formatTime }: CommentListProps) {
  const { editingId, draft, error, isOwn, start, cancel, setDraft, save, toggleChecklist, resizeImage, remove, uploadPaste, pasteError } = controller;
  const renderImage = taskImageRenderer(task);

  if (comments.length === 0) return <p className="text-xs text-slate-400">Комментариев пока нет</p>;

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2.5 group/comment">
          <UserAvatar name={c.authorName} size="sm" className="mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-slate-700">{c.authorName}</span>
              <span className="text-[10px] text-slate-400">{formatTime(c.createdAt)}</span>
              {c.editedAt && <span className="text-[9px] text-slate-300 italic">ред.</span>}
              {isOwn(c) && editingId !== c.id && (
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                  <button type="button" onClick={() => start(c)} aria-label="Изменить" className="p-1 rounded text-slate-300 hover:text-slate-500 hover:bg-slate-100">
                    <Pencil size={10} />
                  </button>
                  <button type="button" onClick={() => remove(c)} aria-label="Удалить" className="p-1 rounded text-slate-300 hover:text-red-400 hover:bg-red-50">
                    <Trash2 size={10} />
                  </button>
                </div>
              )}
            </div>
            {editingId === c.id ? (
              <div className="space-y-1.5">
                <MarkdownEditor
                  autoFocus
                  value={draft}
                  onChange={setDraft}
                  uploadPaste={uploadPaste}
                  onSubmit={save}
                  onCancel={cancel}
                  rows={Math.max(2, draft.split("\n").length + 1)}
                  className="text-xs text-slate-700 px-2.5 py-1.5 border-brand-300"
                />
                {(error || pasteError) && (
                  <p role="alert" className="flex items-center gap-1.5 text-[11px] text-red-600">
                    <AlertCircle size={11} />
                    {error ?? pasteError}
                  </p>
                )}
                <div className="flex gap-1.5">
                  <button type="button" onClick={save} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-brand-500 text-white rounded-md hover:bg-brand-600">
                    <Check size={9} /> Сохранить
                  </button>
                  <button type="button" onClick={cancel} className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100">
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {c.text && (
                  <Markdown
                    text={c.text}
                    className="text-xs text-slate-600"
                    renderImage={renderImage}
                    // Галочки и размер картинки меняет только автор — текст-то его.
                    onToggleChecklist={isOwn(c) ? (line) => toggleChecklist(c, line) : undefined}
                    onResizeImage={isOwn(c) ? (line, width) => resizeImage(c, line, width) : undefined}
                  />
                )}
                {c.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    {c.attachments.map((file) => (
                      <CommentAttachment key={file.id} taskId={task.id} file={file} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
