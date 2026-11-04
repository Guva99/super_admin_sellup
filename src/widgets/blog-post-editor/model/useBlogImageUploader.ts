import { useCallback, useMemo, useRef, useState } from "react";
import { err, ok, type Result } from "@/shared/api";
import { blogImageError, blogPostApi, describeBlogError } from "@/entities/blog-post";
import type { ImageUploader, StartedUpload } from "@/features/rich-text-editor";

export interface BlogImageUploader extends ImageUploader {
  /** Сколько картинок ещё грузится: пока не ноль, публиковать рано — в тексте их нет. */
  pending: number;
  /** Последняя ошибка загрузки — показывается над редактором. */
  error: string | null;
}

/**
 * Загрузка картинок статьи: в редакторе картинка встаёт сразу с превью, файл
 * уходит на /blog/images, по ответу в тексте появляется blog-image:<id>.
 * Неподходящий файл до сервера не доходит — у картинки сразу ошибка.
 */
export function useBlogImageUploader(): BlogImageUploader {
  const files = useRef(new Map<string, File>());
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (file: File): Promise<Result<{ id: string }>> => {
    const problem = blogImageError(file);
    if (problem) {
      setError(problem);
      return err<{ id: string }>({ code: "bad_request", message: problem });
    }
    setPending((n) => n + 1);
    const result = await blogPostApi.uploadImage(file);
    setPending((n) => n - 1);
    if (!result.ok) {
      setError(describeBlogError(result.error));
      return result;
    }
    setError(null);
    return ok({ id: result.data.id });
  }, []);

  const start = useCallback(
    (file: File): StartedUpload => {
      const id = crypto.randomUUID();
      files.current.set(id, file);
      return { id, previewUrl: URL.createObjectURL(file), done: send(file) };
    },
    [send],
  );

  const retry = useCallback(
    (id: string) => {
      const file = files.current.get(id);
      return file ? send(file) : Promise.resolve(err<{ id: string }>({ code: "unknown", message: "file is gone" }));
    },
    [send],
  );

  return useMemo(() => ({ start, retry, pending, error }), [start, retry, pending, error]);
}
