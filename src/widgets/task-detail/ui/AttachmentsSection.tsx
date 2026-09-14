import { useState } from "react";
import { Paperclip } from "lucide-react";
import { ATTACHMENT_ACCEPT, AttachmentPreview, attachmentError, useTasks, type Task } from "@/entities/task";
import { describeApiError } from "@/shared/api";

/** Вложения самой задачи (не комментариев) и кнопка «Прикрепить». */
export function AttachmentsSection({ task }: { task: Task }) {
  const { addFiles } = useTasks();
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (list: FileList | null) => {
    if (!list) return;
    const files = Array.from(list);
    const problem = files.map(attachmentError).find(Boolean);
    if (problem) {
      setError(problem);
      return;
    }
    setIsUploading(true);
    setError(null);
    const result = await addFiles(task.id, files);
    setIsUploading(false);
    if (!result.ok) setError(describeApiError(result.error));
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Вложения {task.attachments.length > 0 && <span className="text-slate-400">({task.attachments.length})</span>}
        </h2>
        <label className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-500 cursor-pointer">
          <Paperclip size={11} />
          {isUploading ? "Загрузка…" : "Прикрепить"}
          <input
            type="file"
            multiple
            accept={ATTACHMENT_ACCEPT}
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error && <p className="text-[11px] text-red-600 mb-2">{error}</p>}
      {task.attachments.length === 0 ? (
        <p className="text-xs text-slate-400">Файлов нет</p>
      ) : (
        <div className="space-y-2">
          {task.attachments.map((file) => (
            <AttachmentPreview key={file.id} taskId={task.id} file={file} />
          ))}
        </div>
      )}
    </section>
  );
}
