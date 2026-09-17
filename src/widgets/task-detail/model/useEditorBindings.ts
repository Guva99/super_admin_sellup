import { useCallback, useMemo, useRef, useState } from "react";
import { loadAttachmentImage, type Attachment } from "@/entities/attachment";
import type { TaskAttachment } from "@/entities/task";
import type { UploadQueue } from "@/features/attachment-upload";
import type { ImageResolver, ImageUploader } from "@/features/rich-text-editor";

export interface EditorBindings {
  uploader: ImageUploader;
  resolver: ImageResolver;
  lightbox: { url: string; alt: string } | null;
  closeLightbox: () => void;
}

/**
 * Связывает редактор с очередью загрузок и кэшем картинок. Обе фичи друг о
 * друге не знают (слайсы одного слоя), поэтому мост живёт здесь, в виджете.
 */
export function useEditorBindings(queue: UploadQueue): EditorBindings {
  const [lightbox, setLightbox] = useState<{ url: string; alt: string } | null>(null);
  // Очередь пересоздаёт объект на каждый рендер, а редактор держит загрузчик один раз.
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const uploader = useMemo<ImageUploader>(
    () => ({
      start: (file) => {
        const [item] = queueRef.current.enqueue([file]);
        return { id: item.id, previewUrl: URL.createObjectURL(file), done: queueRef.current.wait(item.id) };
      },
      retry: (id) => {
        queueRef.current.retry(id);
        return queueRef.current.wait(id);
      },
    }),
    [],
  );

  const resolver = useMemo<ImageResolver>(() => ({ load: loadAttachmentImage, open: (url, alt) => setLightbox({ url, alt }) }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  return { uploader, resolver, lightbox, closeLightbox };
}

/** Вложение сущности задачи из ответа API вложений — структурно те же поля. */
export const toTaskAttachment = (file: Attachment): TaskAttachment => ({
  id: file.id,
  name: file.name,
  size: file.size,
  type: file.contentType,
  isInline: file.isInline,
});
