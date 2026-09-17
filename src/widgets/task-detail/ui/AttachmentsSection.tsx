import { useState } from "react";
import { Paperclip, Trash2 } from "lucide-react";
import { attachmentApi, forgetAttachmentImage } from "@/entities/attachment";
import { AttachmentPreview, useTasks, type Task, type TaskAttachment } from "@/entities/task";
import { UploadList, useUploadQueue } from "@/features/attachment-upload";
import { describeApiError } from "@/shared/api";
import { ATTACHMENT_ACCEPT } from "@/shared/lib";
import { toTaskAttachment } from "../model/useEditorBindings";

/**
 * Вложения задачи: и приложенные кнопкой, и вставленные в описание — это один
 * список; у вставленных подпись «в описании». Удаление файла из текста
 * вложение не убирает (как в Jira), удаление здесь — убирает совсем.
 */
export function AttachmentsSection({ task }: { task: Task }) {
  const { addAttachment, removeAttachment } = useTasks();
  const queue = useUploadQueue(task.id, (file) => addAttachment(task.id, toTaskAttachment(file)));
  const [error, setError] = useState<string | null>(null);

  const remove = async (file: TaskAttachment) => {
    if (!window.confirm(`Удалить файл «${file.name}»?${file.isInline ? " Он вставлен в описание — там останется пустое место." : ""}`)) return;
    const result = await attachmentApi.remove(file.id);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    setError(null);
    forgetAttachmentImage(file.id);
    removeAttachment(task.id, file.id);
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Вложения {task.attachments.length > 0 && <span className="text-slate-400">({task.attachments.length})</span>}
        </h2>
        <label className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-500 cursor-pointer">
          <Paperclip size={11} />
          Прикрепить
          <input
            type="file"
            multiple
            accept={ATTACHMENT_ACCEPT}
            className="hidden"
            onChange={(e) => {
              queue.enqueue(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error && <p className="text-[11px] text-red-600 mb-2">{error}</p>}
      <div className="space-y-2">
        <UploadList queue={queue} />
        {task.attachments.length === 0 && !queue.isUploading ? (
          <p className="text-xs text-slate-400">Файлов нет — их можно выбрать или вставить в описание из буфера</p>
        ) : (
          task.attachments.map((file) => (
            <AttachmentPreview
              key={file.id}
              taskId={task.id}
              file={file}
              trailing={
                <>
                  {file.isInline && <span className="px-1.5 py-0.5 rounded bg-brand-50 text-[10px] text-brand-600 font-medium flex-shrink-0">в описании</span>}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(file);
                    }}
                    aria-label={`Удалить ${file.name}`}
                    title="Удалить файл"
                    className="p-0.5 rounded text-slate-300 hover:text-red-500 flex-shrink-0"
                  >
                    <Trash2 size={11} />
                  </button>
                </>
              }
            />
          ))
        )}
      </div>
    </section>
  );
}
