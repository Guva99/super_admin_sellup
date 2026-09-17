import { useCallback, useState } from "react";
import { describeApiError } from "@/shared/api";
import type { PastedFile } from "@/shared/ui";
import { attachmentError, attachmentRef, isImageAttachment, pastedFile } from "./files";
import { useTasks } from "./store";

export interface PasteUploader {
  /** Готовый обработчик для `MarkdownEditor`. */
  uploadPaste: (file: File) => PastedFile | null;
  /** Последняя ошибка загрузки; показывает её форма, в которой печатали. */
  pasteError: string | null;
  clearPasteError: () => void;
}

/**
 * Вставка файла из буфера в описание или комментарий существующей задачи.
 * Файл становится вложением задачи — как в Jira, куда бы его ни вставили.
 *
 * Ссылка в тексте идёт по **имени** файла, а не по id: имя известно сразу,
 * поэтому текст правится один раз, до ответа сервера. Пока файл грузится,
 * картинка в тексте ещё не найдена и показана именем; если загрузка упала,
 * так и останется — об ошибке форма скажет рядом.
 */
export function usePastedFile(taskId: string): PasteUploader {
  const { addFiles } = useTasks();
  const [pasteError, setPasteError] = useState<string | null>(null);

  const uploadPaste = useCallback(
    (file: File): PastedFile | null => {
      const named = pastedFile(file);
      const problem = attachmentError(named);
      if (problem) {
        setPasteError(problem);
        return null;
      }
      setPasteError(null);
      void addFiles(taskId, [named]).then((result) => {
        if (!result.ok) setPasteError(describeApiError(result.error));
      });
      // Не-картинка остаётся вложением, но в текст её вставлять нечем.
      if (!isImageAttachment(named.type)) return null;
      return { src: attachmentRef(named.name), alt: file.name };
    },
    [addFiles, taskId],
  );

  return { uploadPaste, pasteError, clearPasteError: () => setPasteError(null) };
}
