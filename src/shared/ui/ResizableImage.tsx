import { useRef, useState, type ReactNode } from "react";
import { MIN_IMAGE_WIDTH } from "../lib/markdown";

interface ResizableImageProps {
  /** Текущая ширина в пикселях; null — во всю ширину блока. */
  width: number | null;
  /** Новая ширина после того, как отпустили угол. Без обработчика размер не меняется. */
  onResize?: (width: number) => void;
  /** Вернуть «по ширине блока» — двойной клик по ручке. */
  onReset?: () => void;
  children: ReactNode;
}

/**
 * Картинка, которую можно растянуть за правый нижний угол, как в Jira.
 * Во время перетаскивания ширина живёт здесь, а наружу уходит один раз —
 * когда отпустили: каждый пиксель сохранять в текст незачем.
 */
export function ResizableImage({ width, onResize, onReset, children }: ResizableImageProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const shown = dragWidth ?? width;

  const startDrag = (e: React.PointerEvent) => {
    if (!onResize) return;
    e.preventDefault();
    e.stopPropagation();
    const box = boxRef.current;
    if (!box) return;
    const startX = e.clientX;
    const startWidth = box.getBoundingClientRect().width;
    // Шире родителя тянуть некуда — картинка всё равно упрётся в max-width.
    const maxWidth = box.parentElement?.getBoundingClientRect().width ?? startWidth;
    const widthAt = (clientX: number) => Math.round(Math.min(maxWidth, Math.max(MIN_IMAGE_WIDTH, startWidth + clientX - startX)));

    // Слушаем окно, а не саму ручку: курсор во время перетаскивания уходит
    // с неё, и события pointermove до элемента уже не долетают.
    const move = (ev: PointerEvent) => setDragWidth(widthAt(ev.clientX));
    const finish = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      const next = widthAt(ev.clientX);
      setDragWidth(null);
      if (next !== Math.round(startWidth)) onResize(next);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  };

  return (
    <div
      ref={boxRef}
      className="relative inline-block max-w-full group/image align-top"
      style={{ width: shown ? `${shown}px` : "fit-content" }}
    >
      {children}
      {onResize && (
        <span
          role="separator"
          aria-label="Изменить размер картинки"
          title="Потяните за угол; двойной клик — во всю ширину"
          onPointerDown={startDrag}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onReset?.();
          }}
          className="absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-sm bg-white border-2 border-brand-500 cursor-nwse-resize opacity-0 group-hover/image:opacity-100 transition-opacity"
        />
      )}
      {dragWidth !== null && (
        <span className="absolute right-1 top-1 px-1.5 py-0.5 rounded bg-slate-900/75 text-[10px] text-white font-mono">{dragWidth}px</span>
      )}
    </div>
  );
}
