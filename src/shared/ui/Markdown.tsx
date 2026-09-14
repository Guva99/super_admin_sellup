import { parseMarkdown, type MarkdownBlock } from "../lib/markdown";

interface MarkdownProps {
  text: string;
  /** Клик по чекбоксу; без обработчика чек-листы только для чтения. */
  onToggleChecklist?: (line: number) => void;
  className?: string;
}

/** Отображение текста, размеченного по правилам `shared/lib/markdown`. */
export function Markdown({ text, onToggleChecklist, className = "" }: MarkdownProps) {
  const blocks = parseMarkdown(text);
  return (
    <div className={`space-y-2 text-sm text-slate-700 leading-relaxed ${className}`}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} onToggleChecklist={onToggleChecklist} />
      ))}
    </div>
  );
}

function Block({ block, onToggleChecklist }: { block: MarkdownBlock; onToggleChecklist?: (line: number) => void }) {
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
