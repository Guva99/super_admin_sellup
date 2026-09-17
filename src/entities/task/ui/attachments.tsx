import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, FileText, Image as ImageIcon } from "lucide-react";
import { describeApiError } from "@/shared/api";
import { formatBytes, saveBlob, type MarkdownImage } from "@/shared/lib";
import type { Task, TaskAttachment } from "../model/types";
import { allAttachments, attachmentKey, findAttachment, isImageAttachment } from "../model/files";
import { useTasks } from "../model/store";

/**
 * Картинка из вложения. Файлы отдаются по токену, поэтому обычный <img src>
 * на адрес API не работает: содержимое скачивается и показывается как Blob.
 */
export function AttachmentImage({ taskId, file, className }: { taskId: string; file: TaskAttachment; className: string }) {
  const { downloadFile } = useTasks();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    downloadFile(taskId, file.id).then((result) => {
      if (!result.ok || cancelled) return;
      objectUrl = URL.createObjectURL(result.data);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [downloadFile, taskId, file.id]);

  if (!url) return <div className={`${className} bg-slate-100 animate-pulse`} />;
  return (
    <img
      src={url}
      alt={file.name}
      className={className}
      onClick={(e) => {
        // Открыть оригинал, но не начать правку описания вокруг.
        e.stopPropagation();
        window.open(url, "_blank");
      }}
    />
  );
}

/** Скачивание файла — тем же запросом с токеном. */
export function useDownloadAttachment(taskId: string) {
  const { downloadFile } = useTasks();
  const [error, setError] = useState<string | null>(null);

  const download = async (file: TaskAttachment) => {
    const result = await downloadFile(taskId, file.id);
    if (result.ok) saveBlob(result.data, file.name);
    else setError(describeApiError(result.error));
  };
  return { download, downloadError: error };
}

/** Строка вложения задачи: раскрывается в превью картинки или кнопку скачивания. */
export function AttachmentPreview({ taskId, file, trailing }: { taskId: string; file: TaskAttachment; trailing?: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const { download } = useDownloadAttachment(taskId);
  const isImg = isImageAttachment(file.type);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors">
        <button onClick={() => setExpanded((v) => !v)} className="flex-1 min-w-0 flex items-center gap-2 text-left">
          {isImg ? <ImageIcon size={12} className="text-brand-400 flex-shrink-0" /> : <FileText size={12} className="text-slate-400 flex-shrink-0" />}
          <span className="text-[11px] text-slate-700 flex-1 truncate">{file.name}</span>
          <span className="text-[10px] text-slate-400 flex-shrink-0">{formatBytes(file.size)}</span>
          <ChevronDown size={10} className={`text-slate-300 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
        {trailing}
      </div>
      {expanded && isImg && (
        <div className="border-t border-slate-100">
          <AttachmentImage taskId={taskId} file={file} className="w-full object-contain max-h-64 cursor-pointer" />
        </div>
      )}
      {expanded && !isImg && (
        <div className="border-t border-slate-100 px-3 py-2">
          <button onClick={() => download(file)} className="text-[11px] text-brand-500 hover:underline">
            Скачать файл
          </button>
        </div>
      )}
    </div>
  );
}

/** Файл комментария: картинка — превью, остальное — кнопка скачивания. */
export function CommentAttachment({ taskId, file }: { taskId: string; file: TaskAttachment }) {
  const { download } = useDownloadAttachment(taskId);
  if (isImageAttachment(file.type)) {
    return (
      <AttachmentImage
        taskId={taskId}
        file={file}
        className="rounded-lg border border-slate-200 max-w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
      />
    );
  }
  return (
    <button
      onClick={() => download(file)}
      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 transition-colors group/file"
    >
      <FileText size={11} className="text-slate-400 group-hover/file:text-brand-500 flex-shrink-0" />
      <span className="text-[11px] text-slate-600 group-hover/file:text-brand-600 truncate flex-1 text-left">{file.name}</span>
      <span className="text-[10px] text-slate-400 flex-shrink-0">{formatBytes(file.size)}</span>
    </button>
  );
}

/**
 * Как показывать картинки разметки в описании и комментариях этой задачи:
 * ссылка `attach:<ключ>` ищется среди её вложений. Незагруженная ещё картинка
 * (черновик новой задачи) ссылки не найдёт — там своя отрисовка.
 */
export function taskImageRenderer(task: Task) {
  const files = allAttachments(task);
  return (image: MarkdownImage) => {
    const key = attachmentKey(image.src);
    const file = key ? findAttachment(files, key) : null;
    if (!file || !isImageAttachment(file.type)) return null;
    return <AttachmentImage taskId={task.id} file={file} className="rounded-lg border border-slate-200 w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" />;
  };
}

/** Предпросмотр ещё не отправленного файла: он есть только в браузере. */
export function LocalImage({ file, className }: { file: File; className: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url ? <img src={url} alt={file.name} className={className} /> : null;
}
