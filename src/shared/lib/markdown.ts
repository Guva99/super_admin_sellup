/**
 * Лёгкая разметка описаний: абзацы, списки и чек-листы `- [ ]` / `- [x]`.
 * Этого хватает карточке задачи; полноценный markdown не нужен, а парсер
 * на 40 КБ ради трёх примитивов — лишний вес.
 */
export type MarkdownBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "checklist"; items: ChecklistItem[] };

export interface ChecklistItem {
  text: string;
  checked: boolean;
  /** Номер строки в исходном тексте — чтобы переключить именно этот пункт. */
  line: number;
}

const CHECK = /^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/;
const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^#{1,3}\s+(.*)$/;

export function parseMarkdown(text: string): MarkdownBlock[] {
  const lines = text.split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join("\n") });
      paragraph = [];
    }
  };
  const last = () => blocks[blocks.length - 1];

  lines.forEach((line, index) => {
    const check = line.match(CHECK);
    if (check) {
      flushParagraph();
      const item: ChecklistItem = { text: check[2], checked: check[1] !== " ", line: index };
      const prev = last();
      if (prev?.type === "checklist") prev.items.push(item);
      else blocks.push({ type: "checklist", items: [item] });
      return;
    }
    const numbered = line.match(NUMBERED);
    const bullet = numbered ? null : line.match(BULLET);
    if (numbered || bullet) {
      flushParagraph();
      const ordered = Boolean(numbered);
      const itemText = (numbered ?? bullet)![1];
      const prev = last();
      if (prev?.type === "list" && prev.ordered === ordered) prev.items.push(itemText);
      else blocks.push({ type: "list", ordered, items: [itemText] });
      return;
    }
    const heading = line.match(HEADING);
    if (heading) {
      flushParagraph();
      blocks.push({ type: "heading", text: heading[1] });
      return;
    }
    if (line.trim() === "") {
      flushParagraph();
      return;
    }
    paragraph.push(line);
  });
  flushParagraph();
  return blocks;
}

/** Переключает пункт чек-листа на строке `line`; остальной текст не трогает. */
export function toggleChecklistItem(text: string, line: number): string {
  const lines = text.split("\n");
  const current = lines[line];
  if (current === undefined) return text;
  lines[line] = current.replace(/\[( |x|X)\]/, (_, mark: string) => (mark === " " ? "[x]" : "[ ]"));
  return lines.join("\n");
}

/** Сколько пунктов чек-листа закрыто — для прогресса «2/5». */
export function checklistProgress(text: string): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const line of text.split("\n")) {
    const match = line.match(CHECK);
    if (!match) continue;
    total++;
    if (match[1] !== " ") done++;
  }
  return { done, total };
}
