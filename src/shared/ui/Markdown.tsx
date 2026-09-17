import type { ReactNode } from "react";
import { ImageOff } from "lucide-react";
import { parseMarkdown, type MarkdownBlock, type MarkdownImage } from "../lib/markdown";
import { ResizableImage } from "./ResizableImage";

interface MarkdownProps {
  text: string;
  /** Клик по чекбоксу; без обработчика чек-листы только для чтения. */
  onToggleChecklist?: (line: number) => void;
  /**
   * Чем показать картинку: разметка не знает, откуда берутся файлы (у задач
   * содержимое качается по токену). Без обработчика вместо картинки — её имя.
   */
  renderImage?: (image: MarkdownImage) => ReactNode;
  /** Новая ширина картинки после растягивания за угол; null — во всю ширину. */
  onResizeImage?: (line: number, width: number | null) => void;
  className?: string;
}

/** Отображение текста, размеченного по правилам `shared/lib/markdown`. */
export function Markdown({ text, onToggleChecklist, renderImage, onResizeImage, className = "" }: MarkdownProps) {
  const blocks = parseMarkdown(text);
  return (
    <div className={`space-y-2 text-sm text-slate-700 leading-relaxed ${className}`}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} onToggleChecklist={onToggleChecklist} renderImage={renderImage} onResizeImage={onResizeImage} />
      ))}
    </div>
  );
}

type BlockProps = Pick<MarkdownProps, "onToggleChecklist" | "renderImage" | "onResizeImage"> & { block: MarkdownBlock };

function Block({ block, onToggleChecklist, renderImage, onResizeImage }: BlockProps) {
  switch (block.type) {
    case "heading":
      return <p className="font-semibold text-slate-900">{block.text}</p>;
    case "paragraph":
      return <p className="whitespace-pre-wrap">{block.text}</p>;
    case "list":
      return block.ordered ? (
        <ol className="list-decimal pl-5 space-y-0.5">{block.items.map((item, i) => <li key={i}>{item}</li>)}</ol>
      ) : (
        <ul className="list-disc pl-5 space-y-0.5">{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
      );
    case "image": {
      const { image } = block;
      const content = renderImage?.(image);
      if (!content) {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <ImageOff size={12} />
            {image.alt || "картинка"}
          </span>
        );
      }
      return (
        <ResizableImage
          width={image.width}
          onResize={onResizeImage ? (width) => onResizeImage(image.line, width) : undefined}
          onReset={onResizeImage ? () => onResizeImage(image.line, null) : undefined}
        >
          {content}
        </ResizableImage>
      );
    }
    case "checklist":
      return (
        <ul className="space-y-1">
          {block.items.map((item) => (
            <li key={item.line} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={item.checked}
                disabled={!onToggleChecklist}
                // Клик по чекбоксу — переключение пункта, а не «начать правку» у родителя.
                onClick={(e) => e.stopPropagation()}
                onChange={() => onToggleChecklist?.(item.line)}
                className="mt-1 accent-brand-500 cursor-pointer disabled:cursor-default"
              />
              <span className={item.checked ? "line-through text-slate-400" : ""}>{item.text}</span>
            </li>
          ))}
        </ul>
      );
  }
}
