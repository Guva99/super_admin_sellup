/**
 * Лёгкая разметка описаний и комментариев: абзацы, списки, чек-листы
 * `- [ ]` / `- [x]` и картинки `![имя](ссылка)`. Этого хватает карточке
 * задачи; полноценный markdown не нужен, а парсер на 40 КБ ради четырёх
 * примитивов — лишний вес.
 */
export type MarkdownBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "checklist"; items: ChecklistItem[] }
  | { type: "image"; image: MarkdownImage };

/**
 * Картинка в тексте. `src` — ссылка в том виде, как её записал редактор
 * (у задач это `attach:<файл>`); что за ней стоит, разметка не знает.
 * `width` в пикселях — результат растягивания за угол, null — по ширине блока.
 */
export interface MarkdownImage {
  src: string;
  alt: string;
  width: number | null;
  /** Строка в исходном тексте — чтобы записать в неё новую ширину. */
  line: number;
}

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
/** `![имя](ссылка)`, ширина после вертикальной черты: `![имя|360](ссылка)`. */
const IMAGE = /^\s*!\[([^\]|]*)(?:\|(\d+))?\]\(([^)\s]*)\)\s*$/;

export const MIN_IMAGE_WIDTH = 80;

/**
 * Строки текста. Делим по любому переводу строки: комментарии приходят
 * формой (multipart), а она переносит строки как CRLF — при делении только по
 * "\n" в конце каждой остаётся "\r", и разметка перестаёт распознаваться:
 * точка в регулярных выражениях JS не совпадает с "\r".
 */
const splitLines = (text: string): string[] => text.split(/\r\n|\r|\n/);

/** Строка разметки для картинки — её же вставляет редактор при вставке из буфера. */
export function imageMarkdown(alt: string, src: string, width: number | null = null): string {
  return `![${alt.replace(/[[\]|]/g, " ").trim()}${width ? `|${Math.round(width)}` : ""}](${src})`;
}

/** Записывает новую ширину картинки на строке `line`; null — вернуть «по ширине блока». */
export function setImageWidth(text: string, line: number, width: number | null): string {
  const lines = splitLines(text);
  const match = lines[line]?.match(IMAGE);
  if (!match) return text;
  lines[line] = imageMarkdown(match[1], match[3], width);
  return lines.join("\n");
}

export function parseMarkdown(text: string): MarkdownBlock[] {
  const lines = splitLines(text);
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
    const image = line.match(IMAGE);
    if (image) {
      flushParagraph();
      blocks.push({
        type: "image",
        image: { alt: image[1], width: image[2] ? Number(image[2]) : null, src: image[3], line: index },
      });
      return;
    }
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
  const lines = splitLines(text);
  const current = lines[line];
  if (current === undefined) return text;
  lines[line] = current.replace(/\[( |x|X)\]/, (_, mark: string) => (mark === " " ? "[x]" : "[ ]"));
  return lines.join("\n");
}

/** Сколько пунктов чек-листа закрыто — для прогресса «2/5». */
export function checklistProgress(text: string): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const line of splitLines(text)) {
    const match = line.match(CHECK);
    if (!match) continue;
    total++;
    if (match[1] !== " ") done++;
  }
  return { done, total };
}
