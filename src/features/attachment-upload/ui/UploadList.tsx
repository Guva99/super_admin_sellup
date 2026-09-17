import { AlertCircle, FileText, Image as ImageIcon, Loader2, RotateCcw, X } from "lucide-react";
import { formatBytes, isImageType } from "@/shared/lib";
import type { UploadQueue } from "../model/useUploadQueue";

interface UploadListProps {
  queue: UploadQueue;
  /** Показывать и уже загруженные — в форме новой задачи это весь её список. */
  showDone?: boolean;
}

/** Строки очереди: прогресс, ошибка с «Повторить», крестик — убрать из списка. */
export function UploadList({ queue, showDone = false }: UploadListProps) {
  const rows = showDone ? queue.items : queue.items.filter((item) => item.status !== "done");
  if (rows.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {rows.map((item) => (
        <li key={item.id} className="relative overflow-hidden flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
          {item.status === "uploading" && (
            <span className="absolute left-0 bottom-0 h-0.5 bg-brand-400 transition-[width]" style={{ width: `${Math.round(item.progress * 100)}%` }} />
          )}
          {item.status === "uploading" ? (
            <Loader2 size={12} className="text-brand-400 animate-spin flex-shrink-0" />
          ) : item.status === "error" ? (
            <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
          ) : isImageType(item.file.type) ? (
            <ImageIcon size={12} className="text-brand-400 flex-shrink-0" />
          ) : (
            <FileText size={12} className="text-slate-400 flex-shrink-0" />
          )}
          <span className="text-[11px] text-slate-700 flex-1 truncate">{item.attachment?.name ?? item.file.name}</span>
          {item.status === "error" ? (
            <span className="text-[10px] text-red-600 truncate max-w-[220px]" title={item.error ?? ""}>{item.error}</span>
          ) : (
            <span className="text-[10px] text-slate-400 flex-shrink-0">{formatBytes(item.file.size)}</span>
          )}
          {item.status === "error" && (
            <button type="button" onClick={() => queue.retry(item.id)} className="flex items-center gap-1 text-[10px] text-brand-500 hover:underline flex-shrink-0">
              <RotateCcw size={10} />
              Повторить
            </button>
          )}
          {item.status !== "uploading" && (
            <button type="button" onClick={() => queue.dismiss(item.id)} aria-label={`Убрать ${item.file.name}`} className="text-slate-300 hover:text-red-400 flex-shrink-0">
              <X size={11} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
