import StarterKit from "@tiptap/starter-kit";
import { InputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "tiptap-markdown";
import { TaskImage, type TaskImageOptions } from "./imageExtension";
import { TaskItemView } from "../ui/TaskItemView";

/**
 * Пункт чек-листа: свой node view (галочка работает и в чтении) и правило
 * для «- [ ] пункт» — привычной записи из markdown. Встроенное правило
 * TaskItem ждёт «[ ] » в начале абзаца, а после «- » абзац уже внутри
 * маркированного списка — превращаем этот список в чек-лист.
 */
const ChecklistItem = TaskItem.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TaskItemView);
  },

  addInputRules() {
    return [
      ...(this.parent?.() ?? []),
      new InputRule({
        find: /^\[( |x|X)?\]\s$/,
        handler: ({ state, range, chain, match }) => {
          const parent = state.selection.$from.node(-1);
          if (!parent || parent.type.name !== "listItem") return null;
          chain().deleteRange(range).toggleTaskList().run();
          if (match[1] && match[1] !== " ") chain().updateAttributes("taskItem", { checked: true }).run();
          return undefined;
        },
      }),
    ];
  },
});

interface BuildOptions {
  placeholder: string;
  image: Pick<TaskImageOptions, "resolver" | "uploader" | "onRetry">;
}

/**
 * Минимальный набор, как просили: заголовки, списки, чек-листы, код, цитаты,
 * ссылки, таблицы и картинки. В хранилище уходит markdown, а не HTML:
 * сырой HTML на входе выключен (`html: false`) — так нечему стать XSS.
 */
export function buildExtensions({ placeholder, image }: BuildOptions) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: { openOnClick: false, autolink: true },
    }),
    TaskList,
    ChecklistItem.configure({ nested: true }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({ placeholder }),
    TaskImage.configure({ ...image, allowBase64: false }),
    Markdown.configure({
      html: false,
      tightLists: true,
      bulletListMarker: "-",
      linkify: true,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ];
}
