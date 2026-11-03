import type { BlogFaqItem } from "@/entities/blog-post";

/*
 * «Вопросы и ответы» из вставленного текста — в отдельный список статьи.
 * В документах их пишут разделом в конце: заголовок «Вопросы и ответы», дальше
 * либо подзаголовок-вопрос и абзацы ответа, либо абзац «Вопрос? Ответ…»
 * (вопрос иногда жирным). Раздел уходит из текста — на сайте он станет
 * раскрывающимся списком и разметкой FAQ для поисковиков.
 */

type Node = { type: string; attrs?: Record<string, unknown>; content?: Node[]; text?: string; marks?: Array<{ type: string }> };

// Не \b: в JS он знает только латиницу, после «ответы» границы слова не увидит.
const SECTION_TITLE = /^\s*(вопросы и ответы|частые вопросы|ответы на вопросы|faq)(?!\p{L})/iu;

const textOf = (node: Node): string => (node.text ?? "") + (node.content ?? []).map(textOf).join("");
const isHeading = (node: Node) => node.type === "heading";
const levelOf = (node: Node) => Number(node.attrs?.level) || 2;

/** «Вопрос? Ответ» из одного абзаца; жирное начало — вопрос, иначе — до первого «?». */
function splitParagraph(node: Node): BlogFaqItem | null {
  const parts = node.content ?? [];
  const bold = parts.findIndex((part) => !part.marks?.some((mark) => mark.type === "bold"));
  if (bold > 0) {
    const question = parts.slice(0, bold).map(textOf).join("").trim();
    const answer = parts.slice(bold).map(textOf).join("").trim();
    if (question && answer) return { question, answer };
  }
  const text = textOf(node).trim();
  const mark = text.indexOf("?");
  if (mark <= 0 || mark === text.length - 1) return null;
  return { question: text.slice(0, mark + 1).trim(), answer: text.slice(mark + 1).trim() };
}

export interface ExtractedFaq {
  /** Документ без раздела, строкой JSON. */
  content: string;
  items: BlogFaqItem[];
}

export function extractFaq(content: string): ExtractedFaq | null {
  if (!content) return null;
  let doc: Node;
  try {
    doc = JSON.parse(content) as Node;
  } catch {
    return null;
  }
  const nodes = doc.content ?? [];
  const start = nodes.findIndex((node) => isHeading(node) && SECTION_TITLE.test(textOf(node)));
  if (start < 0) return null;
  const level = levelOf(nodes[start]);
  let end = start + 1;
  while (end < nodes.length && !(isHeading(nodes[end]) && levelOf(nodes[end]) <= level)) end++;
  const section = nodes.slice(start + 1, end);

  const items: BlogFaqItem[] = [];
  const hasQuestionHeadings = section.some(isHeading);
  for (const node of section) {
    const text = textOf(node).trim();
    if (!text) continue;
    if (hasQuestionHeadings) {
      if (isHeading(node)) items.push({ question: text, answer: "" });
      else if (items.length > 0) items[items.length - 1].answer = [items[items.length - 1].answer, text].filter(Boolean).join("\n\n");
      continue;
    }
    const item = node.type === "paragraph" ? splitParagraph(node) : null;
    if (item) items.push(item);
    // Абзац без вопроса — продолжение прошлого ответа.
    else if (items.length > 0) items[items.length - 1].answer = `${items[items.length - 1].answer}\n\n${text}`;
  }
  const complete = items.filter((item) => item.question && item.answer);
  if (complete.length === 0) return null;
  return { content: JSON.stringify({ ...doc, content: [...nodes.slice(0, start), ...nodes.slice(end)] }), items: complete };
}
