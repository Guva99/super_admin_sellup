import { useEffect, useState } from "react";
import {
  Trash2,
  ExternalLink,
  Rocket,
  Paperclip,
  X,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  Send,
  Pencil,
  Check,
  AlertCircle,
} from "lucide-react";
import type { Client } from "@/entities/client";
import type { Task, TaskAttachment, TaskComment, TaskStatus } from "@/entities/task";
import {
  ATTACHMENT_ACCEPT,
  attachmentError,
  isImageAttachment,
  useTasks,
  TASK_PRIORITY_DOT,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  TASK_TYPE_CLASS,
  TASK_TYPE_LABEL,
} from "@/entities/task";
import { useSession } from "@/entities/session";
import { describeApiError } from "@/shared/api";
import { formatBytes, saveBlob } from "@/shared/lib";

/**
 * Картинка из вложения. Файлы отдаются по токену, поэтому обычный <img src>
 * на адрес API не работает: содержимое скачивается и показывается как Blob.
 */
function AttachmentImage({ taskId, file, className }: { taskId: string; file: TaskAttachment; className: string }) {
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
  return <img src={url} alt={file.name} className={className} onClick={() => window.open(url, "_blank")} />;
}

/** Скачивание файла — тем же запросом с токеном. */
function useDownload(taskId: string) {
  const { downloadFile } = useTasks();
  const [error, setError] = useState<string | null>(null);

  const download = async (file: TaskAttachment) => {
    const result = await downloadFile(taskId, file.id);
    if (result.ok) saveBlob(result.data, file.name);
    else setError(describeApiError(result.error));
  };
  return { download, downloadError: error };
}

function AttachmentPreview({ taskId, file }: { taskId: string; file: TaskAttachment }) {
  const [expanded, setExpanded] = useState(false);
  const { download } = useDownload(taskId);
  const isImg = isImageAttachment(file.type);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
      >
        {isImg
          ? <ImageIcon size={12} className="text-brand-400 flex-shrink-0" />
          : <FileText size={12} className="text-slate-400 flex-shrink-0" />
        }
        <span className="text-[11px] text-slate-700 flex-1 truncate">{file.name}</span>
        <span className="text-[10px] text-slate-400 flex-shrink-0">{formatBytes(file.size)}</span>
        <ChevronDown size={10} className={`text-slate-300 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && isImg && (
        <div className="border-t border-slate-100">
          <AttachmentImage taskId={taskId} file={file} className="w-full object-contain max-h-48 cursor-pointer" />
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

/** Предпросмотр ещё не отправленного файла: он есть только в браузере. */
function LocalImage({ file, className }: { file: File; className: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url ? <img src={url} alt={file.name} className={className} /> : null;
}

export function TaskDetailPanel({
  task,
  client,
  onClose,
  onStatusChange,
  onDelete,
  onOpenClient,
}: {
  task: Task;
  client: Client | null;
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onOpenClient: (id: string) => void;
}) {
  const { addComment, editComment, deleteComment } = useTasks();
  const { user } = useSession();
  const { download, downloadError } = useDownload(task.id);

  const [commentText, setCommentText] = useState("");
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const comments = task.comments;

  const handleCommentFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted: File[] = [];
    for (const file of Array.from(files)) {
      const problem = attachmentError(file);
      if (problem) setError(problem);
      else accepted.push(file);
    }
    if (accepted.length > 0) setCommentFiles((prev) => [...prev, ...accepted]);
  };

  const send = async () => {
    if ((!commentText.trim() && commentFiles.length === 0) || isSending) return;
    setIsSending(true);
    setError(null);
    const result = await addComment(task.id, commentText.trim(), commentFiles);
    setIsSending(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    setCommentText("");
    setCommentFiles([]);
  };

  const startEdit = (c: TaskComment) => {
    setEditingId(c.id);
    setEditingText(c.text);
  };

  const saveEdit = async (id: string) => {
    const result = await editComment(task.id, id, editingText.trim());
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    setEditingId(null);
  };

  const authorInitials = (name: string) =>
    name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "только что";
    if (diffMin < 60) return `${diffMin} мин назад`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} ч назад`;
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  return (
    <div className="w-[380px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TASK_PRIORITY_DOT[task.priority]}`} />
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${TASK_TYPE_CLASS[task.type]}`}>
              {TASK_TYPE_LABEL[task.type]}
            </span>
          </div>
          <h2 className={`text-sm font-semibold text-slate-900 leading-snug ${task.status === "done" ? "line-through text-slate-400" : ""}`}>
            {task.title}
          </h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0 mt-0.5 p-0.5 rounded hover:bg-slate-100 transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-5">
          {/* Description */}
          {task.description && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Описание</p>
              <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-slate-400 mb-1.5">Статус</p>
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                className="text-xs font-medium text-slate-700 bg-transparent outline-none cursor-pointer w-full"
              >
                {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => (
                  <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-slate-400 mb-1.5">Приоритет</p>
              <p className="text-xs font-medium text-slate-700">{TASK_PRIORITY_LABEL[task.priority]}</p>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-slate-400 mb-1.5">Дедлайн</p>
              <p className="text-xs font-medium text-slate-700">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
                  : "—"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-slate-400 mb-1.5">Исполнитель</p>
              <p className="text-xs font-medium text-slate-700">{task.assigneeName || "Не назначен"}</p>
            </div>
          </div>

          {/* Client */}
          {client && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Бизнес</p>
              <button
                onClick={() => onOpenClient(client.id)}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 transition-colors group"
              >
                <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: client.color }}>
                  {client.initials[0]}
                </div>
                <span className="text-xs font-medium text-slate-700 group-hover:text-brand-600 flex-1 truncate">{client.name}</span>
                <ExternalLink size={11} className="text-slate-300 group-hover:text-brand-400 flex-shrink-0" />
              </button>
            </div>
          )}

          {/* Onboarding badge */}
          {task.onboardingStepId && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 w-fit">
              <Rocket size={11} className="text-emerald-500" />
              <span className="text-xs text-emerald-700 font-medium">Этап онбординга</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Вложения ({task.attachments.length})
              </p>
              <div className="space-y-2">
                {task.attachments.map((file) => (
                  <AttachmentPreview key={file.id} taskId={task.id} file={file} />
                ))}
              </div>
            </div>
          )}

          {/* ── Comments ── */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Комментарии {comments.length > 0 && <span className="text-brand-500">({comments.length})</span>}
            </p>

            {/* Comment list */}
            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5 group/comment">
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-brand-600">{authorInitials(c.authorName)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-slate-700">{c.authorName}</span>
                        <span className="text-[10px] text-slate-400">{formatTime(c.createdAt)}</span>
                        {c.editedAt && <span className="text-[9px] text-slate-300 italic">ред.</span>}
                        {/* Actions — only own comments */}
                        {c.authorId === user?.id && editingId !== c.id && (
                          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(c)}
                              className="p-1 rounded text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                              <Pencil size={10} />
                            </button>
                            <button
                              onClick={() => deleteComment(task.id, c.id)}
                              className="p-1 rounded text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                      {editingId === c.id ? (
                        <div className="space-y-1.5">
                          <textarea
                            autoFocus
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            rows={2}
                            className="w-full text-xs text-slate-700 px-2.5 py-1.5 border border-brand-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-50 resize-none bg-white transition-colors"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit(c.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          />
                          <div className="flex gap-1.5">
                            <button onClick={() => saveEdit(c.id)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-colors">
                              <Check size={9} /> Сохранить
                            </button>
                            <button onClick={() => setEditingId(null)} className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {c.text && <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{c.text}</p>}
                          {c.attachments.length > 0 && (
                            <div className="space-y-1.5">
                              {c.attachments.map((file) =>
                                isImageAttachment(file.type) ? (
                                  <AttachmentImage
                                    key={file.id}
                                    taskId={task.id}
                                    file={file}
                                    className="rounded-lg border border-slate-200 max-w-full max-h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  />
                                ) : (
                                  <button
                                    key={file.id}
                                    onClick={() => download(file)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 transition-colors group/file"
                                  >
                                    <FileText size={11} className="text-slate-400 group-hover/file:text-brand-500 flex-shrink-0" />
                                    <span className="text-[11px] text-slate-600 group-hover/file:text-brand-600 truncate flex-1 text-left">{file.name}</span>
                                    <span className="text-[10px] text-slate-400 flex-shrink-0">{formatBytes(file.size)}</span>
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New comment input */}
            <div className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[9px] font-bold text-white">{authorInitials(user?.fullName ?? "")}</span>
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Написать комментарий… (⌘↵ отправить)"
                  rows={commentText || commentFiles.length > 0 ? 3 : 2}
                  className="w-full text-xs text-slate-700 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-50 resize-none placeholder:text-slate-300 transition-colors bg-slate-50 focus:bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                  }}
                />

                {/* Attached files preview */}
                {commentFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {commentFiles.map((file, i) =>
                      isImageAttachment(file.type) ? (
                        <div key={i} className="relative inline-block">
                          <LocalImage file={file} className="rounded-lg border border-slate-200 max-h-28 object-cover" />
                          <button
                            onClick={() => setCommentFiles((p) => p.filter((_, j) => j !== i))}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ) : (
                        <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
                          <FileText size={11} className="text-slate-400 flex-shrink-0" />
                          <span className="text-[11px] text-slate-600 truncate flex-1">{file.name}</span>
                          <button
                            onClick={() => setCommentFiles((p) => p.filter((_, j) => j !== i))}
                            className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                {(error || downloadError) && (
                  <div role="alert" className="flex items-start gap-1.5 text-[11px] text-red-600">
                    <AlertCircle size={11} className="flex-shrink-0 mt-px" />
                    <span>{error ?? downloadError}</span>
                  </div>
                )}

                {/* Toolbar: attach + send */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-md cursor-pointer transition-colors border border-transparent hover:border-brand-200">
                    <Paperclip size={11} />
                    Прикрепить
                    <input
                      type="file"
                      multiple
                      accept={ATTACHMENT_ACCEPT}
                      className="hidden"
                      onChange={(e) => {
                        handleCommentFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <div className="flex-1" />
                  {(commentText.trim() || commentFiles.length > 0) && (
                    <button
                      onClick={send}
                      disabled={isSending}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors"
                    >
                      <Send size={10} />
                      {isSending ? "Отправка…" : "Отправить"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 flex gap-2 items-center flex-shrink-0">
        <button
          onClick={() => onDelete(task.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={12} />
          Удалить
        </button>
        <div className="flex-1" />
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="text-xs font-medium text-brand-500 bg-brand-50 border border-brand-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-brand-100 transition-colors"
        >
          {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
