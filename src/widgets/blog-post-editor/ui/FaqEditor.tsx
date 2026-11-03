import { ArrowDown, ArrowUp, HelpCircle, Plus, Trash2, Wand2 } from "lucide-react";
import { FAQ_MAX, type BlogFaqItem } from "@/entities/blog-post";
import { AutoTextarea } from "./AutoTextarea";

interface FaqEditorProps {
  items: BlogFaqItem[];
  onChange: (items: BlogFaqItem[]) => void;
  /** В тексте нашёлся раздел «Вопросы и ответы» — его можно перенести сюда. */
  fromText?: { count: number; apply: () => void };
}

const fieldClass =
  "w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-surface text-ink-800 placeholder:text-ink-300 focus:outline-none focus:border-brand-400";

/** «Вопросы и ответы»: на сайте — раскрывающимся списком и разметкой FAQPage для поисковиков. */
export function FaqEditor({ items, onChange, fromText }: FaqEditorProps) {
  const set = (index: number, patch: Partial<BlogFaqItem>) => onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index: number, by: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    onChange(next);
  };

  return (
    <div className="bg-surface border border-ink-200 rounded-xl p-5 space-y-3">
      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <HelpCircle size={14} className="text-ink-400" />
          Вопросы и ответы
        </h3>
        <p className="text-xs text-ink-400 mt-0.5">
          На сайте — раскрывающимся списком в конце статьи, а для поисковиков — разметкой FAQ: вопросы могут показаться прямо в выдаче.
        </p>
      </div>

      {fromText && (
        <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-50 border border-brand-100 text-xs text-ink-700">
          <Wand2 size={14} className="flex-shrink-0 text-brand-500" />
          <span className="flex-1 min-w-[200px]">
            В тексте есть раздел «Вопросы и ответы» ({fromText.count}). Перенесём его сюда — из текста он уйдёт, на сайте станет списком.
          </span>
          <button type="button" onClick={fromText.apply} className="px-2.5 py-1 rounded-md bg-brand-500 text-white font-semibold hover:bg-brand-600">
            Перенести из текста
          </button>
        </div>
      )}

      {items.map((item, index) => {
        const incomplete = (item.question.trim() === "") !== (item.answer.trim() === "");
        return (
          <div key={index} className={`rounded-lg border p-3 space-y-2 ${incomplete ? "border-amber-300" : "border-ink-100"}`}>
            <div className="flex items-start gap-2">
              <span className="w-5 pt-2 text-xs tabular-nums text-ink-400">{index + 1}.</span>
              <input
                value={item.question}
                onChange={(e) => set(index, { question: e.target.value })}
                placeholder="Вопрос"
                maxLength={300}
                className={`${fieldClass} font-medium`}
              />
              <div className="flex flex-shrink-0 pt-1">
                <IconButton title="Выше" disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp size={13} />
                </IconButton>
                <IconButton title="Ниже" disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                  <ArrowDown size={13} />
                </IconButton>
                <IconButton title="Удалить вопрос" onClick={() => onChange(items.filter((_, i) => i !== index))}>
                  <Trash2 size={13} />
                </IconButton>
              </div>
            </div>
            <div className="pl-7">
              <AutoTextarea
                value={item.answer}
                onChange={(e) => set(index, { answer: e.target.value })}
                placeholder="Ответ"
                maxLength={4000}
                className={fieldClass}
              />
              {incomplete && <p className="text-[11px] text-amber-700 mt-1">Заполните и вопрос, и ответ — иначе статью не сохранить</p>}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...items, { question: "", answer: "" }])}
        disabled={items.length >= FAQ_MAX}
        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:text-ink-300"
      >
        <Plus size={13} />
        {items.length >= FAQ_MAX ? `Не больше ${FAQ_MAX} вопросов` : "Добавить вопрос"}
      </button>
    </div>
  );
}

function IconButton({ title, disabled = false, onClick, children }: { title: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="p-1.5 rounded-md text-ink-400 hover:bg-ink-50 hover:text-ink-700 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
