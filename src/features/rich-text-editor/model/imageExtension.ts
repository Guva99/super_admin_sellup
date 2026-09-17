import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { attachmentKey } from "@/shared/lib";
import { ImageNodeView } from "../ui/ImageNodeView";
import type { ImageResolver, ImageUploader } from "./types";

export interface TaskImageOptions {
  resolver: ImageResolver;
  uploader: ImageUploader | null;
  /** Повтор упавшей загрузки; связывает узел с очередью через локальный id. */
  onRetry: (uploadId: string) => void;
  HTMLAttributes: Record<string, unknown>;
  inline: boolean;
  allowBase64: boolean;
}

export type UploadStatus = "uploading" | "error" | null;

/**
 * Картинка в описании. В тексте хранится как `![alt|width](attach:<id>)` —
 * ширина после вертикальной черты, как это уже делала лёгкая разметка.
 * Пока файл грузится, у узла есть previewUrl и status; такой узел в markdown
 * не попадает: ссылки у него ещё нет, а blob-URL сохранять бессмысленно.
 */
export const TaskImage = Image.extend<TaskImageOptions>({
  addOptions(): TaskImageOptions {
    return {
      HTMLAttributes: {},
      inline: false,
      allowBase64: false,
      ...this.parent?.(),
      resolver: { load: async () => ({ ok: false, error: { code: "unknown", message: "no resolver" } }), open: () => {} },
      uploader: null,
      onRetry: () => {},
    };
  },

  addAttributes() {
    return {
      src: { default: "" },
      alt: {
        default: "",
        // Из markdown приходит `alt|360` — ширина едет в отдельный атрибут.
        parseHTML: (el) => (el.getAttribute("alt") ?? "").split("|")[0],
      },
      width: {
        default: null,
        parseHTML: (el) => {
          const explicit = el.getAttribute("width");
          if (explicit) return Number(explicit) || null;
          const fromAlt = (el.getAttribute("alt") ?? "").split("|")[1];
          return fromAlt ? Number(fromAlt) || null : null;
        },
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      previewUrl: { default: null, rendered: false },
      uploadId: { default: null, rendered: false },
      status: { default: null, rendered: false },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: { write: (s: string) => void; closeBlock: (node: unknown) => void }, node: { attrs: Record<string, unknown> }) {
          const src = String(node.attrs.src ?? "");
          if (!attachmentKey(src)) return; // ещё грузится или битая — в текст не идёт
          const alt = String(node.attrs.alt ?? "").replace(/[[\]|]/g, " ").trim();
          const width = node.attrs.width ? `|${Math.round(Number(node.attrs.width))}` : "";
          state.write(`![${alt}${width}](${src})`);
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});
