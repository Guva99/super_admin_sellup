import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ImageOff, Loader2, RotateCcw } from "lucide-react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { attachmentKey, MIN_IMAGE_WIDTH } from "@/shared/lib";
import type { TaskImageOptions, UploadStatus } from "../model/imageExtension";

/**
 * Картинка внутри текста: превью во время загрузки, ошибка с «Повторить»,
 * ручка изменения ширины в правом нижнем углу (только при правке), клик в
 * режиме чтения открывает лайтбокс.
 */
export function ImageNodeView({ node, editor, extension, updateAttributes, selected }: NodeViewProps) {
  const { resolver, onRetry } = extension.options as TaskImageOptions;
  const src = String(node.attrs.src ?? "");
  const alt = String(node.attrs.alt ?? "");
  const width = node.attrs.width as number | null;
  const status = node.attrs.status as UploadStatus;
  const previewUrl = node.attrs.previewUrl as string | null;
  const uploadId = node.attrs.uploadId as string | null;
  const attachmentId = attachmentKey(src);

  const [url, setUrl] = useState<string | null>(previewUrl);
  const [missing, setMissing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!attachmentId) return;
    let cancelled = false;
    resolver.load(attachmentId).then((result) => {
      if (cancelled) return;
      if (result.ok) setUrl(result.data);
      else setMissing(true);
    });
    return () => {
      cancelled = true;
    };
  }, [attachmentId, resolver]);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const box = boxRef.current;
    if (!box) return;
    const startX = e.clientX;
    const startWidth = box.getBoundingClientRect().width;
    const maxWidth = box.parentElement?.getBoundingClientRect().width ?? startWidth;
    const widthAt = (x: number) => Math.round(Math.min(maxWidth, Math.max(MIN_IMAGE_WIDTH, startWidth + x - startX)));
    const move = (ev: PointerEvent) => setDragWidth(widthAt(ev.clientX));
    const finish = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      setDragWidth(null);
      updateAttributes({ width: widthAt(ev.clientX) });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
  };

  const shownWidth = dragWidth ?? width;
  const editable = editor.isEditable;

  return (
    <NodeViewWrapper as="div" className="rte-image" data-drag-handle>
      <div
        ref={boxRef}
        className={`relative inline-block max-w-full align-top group/image rounded-lg ${selected && editable ? "ring-2 ring-brand-300" : ""}`}
        style={{ width: shownWidth ? `${shownWidth}px` : "fit-content" }}
      >
        {url && !missing ? (
          <img
            src={url}
            alt={alt}
            className={`block w-full h-auto max-w-full rounded-lg border border-slate-200 ${status === "uploading" ? "opacity-60" : ""} ${editable ? "" : "cursor-zoom-in"}`}
            draggable={false}
            onClick={(e) => {
              if (editable || status !== null) return;
              e.stopPropagation();
              resolver.open(url, alt);
            }}
          />
        ) : (
          <div className="flex items-center gap-2 px-3 py-6 min-w-[200px] rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
            {missing ? <ImageOff size={14} /> : <Loader2 size={14} className="animate-spin" />}
            {missing ? `Файл не найден${alt ? `: ${alt}` : ""}` : alt || "Картинка"}
          </div>
        )}

        {status === "uploading" && (
          <span className="absolute left-2 top-2 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/70 text-[11px] text-white">
            <Loader2 size={11} className="animate-spin" />
            Загрузка…
          </span>
        )}
        {status === "error" && (
          <span className="absolute inset-x-2 top-2 flex items-center gap-2 px-2 py-1 rounded bg-red-600/90 text-[11px] text-white">
            <AlertTriangle size={11} />
            <span className="flex-1 truncate">Не загрузилось</span>
            {uploadId && (
              <button type="button" onClick={() => onRetry(uploadId)} className="flex items-center gap-1 underline hover:no-underline">
                <RotateCcw size={10} />
                Повторить
              </button>
            )}
          </span>
        )}
        {editable && status === null && url && (
          <span
            role="separator"
            aria-label="Изменить размер картинки"
            title="Потяните за угол; двойной клик — во всю ширину"
            onPointerDown={startDrag}
            onDoubleClick={(e) => {
              e.stopPropagation();
              updateAttributes({ width: null });
            }}
            className="absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-sm bg-white border-2 border-brand-500 cursor-nwse-resize opacity-0 group-hover/image:opacity-100 transition-opacity"
          />
        )}
        {dragWidth !== null && (
          <span className="absolute right-1 top-1 px-1.5 py-0.5 rounded bg-slate-900/75 text-[10px] text-white font-mono">{dragWidth}px</span>
        )}
      </div>
    </NodeViewWrapper>
  );
}
