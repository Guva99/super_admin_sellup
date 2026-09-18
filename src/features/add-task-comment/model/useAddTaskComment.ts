import { useState } from "react";
import { attachmentError, usePastedFile, useTasks } from "@/entities/task";
import { describeApiError } from "@/shared/api";
import { useDraft } from "@/shared/lib";
import type { PastedFile } from "@/shared/ui";
import type { CommentPreset } from "./presets";

export interface CommentComposerController {
  text: string;
  files: File[];
  isSending: boolean;
  error: string | null;
  canSend: boolean;
  setText: (text: string) => void;
  /** Вставить заготовку в конец текста. */
  insertPreset: (preset: CommentPreset) => void;
  attachFiles: (files: FileList | null) => void;
  removeFile: (index: number) => void;
  /** Картинка из буфера уходит во вложения задачи и встаёт прямо в текст. */
  uploadPaste: (file: File) => PastedFile | null;
  send: () => void;
  /** Комментарий набран, но не отправлен: окно предупредит перед закрытием. */
  isDirty: boolean;
  /** Текст подставлен из черновика прошлого раза. */
  restored: boolean;
}

/** Поле нового комментария: текст, файлы, заготовки, отправка одним запросом. */
export function useAddTaskComment(taskId: string): CommentComposerController {
  const { addComment } = useTasks();
  const { uploadPaste, pasteError } = usePastedFile(taskId);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insertPreset = (preset: CommentPreset) => {
    setText((prev) => {
      const piece = `${preset.emoji} ${preset.text}`;
      if (!prev.trim()) return piece;
      return `${prev.replace(/\s+$/, "")}\n${piece}`;
    });
  };

  const attachFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    for (const file of Array.from(list)) {
      const problem = attachmentError(file);
      if (problem) setError(problem);
      else accepted.push(file);
    }
    if (accepted.length > 0) setFiles((prev) => [...prev, ...accepted]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  // Недописанный комментарий тоже жалко: держим его черновиком у задачи.
  const { restored, clear: forgetDraft } = useDraft<string>({
    key: `task-comment:${taskId}`,
    value: text,
    restore: setText,
    isEmpty: (value) => value.trim() === "",
  });

  const canSend = (text.trim() !== "" || files.length > 0) && !isSending;

  const send = async () => {
    if (!canSend) return;
    setIsSending(true);
    setError(null);
    const result = await addComment(taskId, text.trim(), files);
    setIsSending(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    forgetDraft();
    setText("");
    setFiles([]);
  };

  return {
    text,
    files,
    isSending,
    error: error ?? pasteError,
    canSend,
    isDirty: text.trim() !== "" || files.length > 0,
    restored,
    setText,
    insertPreset,
    attachFiles,
    removeFile,
    uploadPaste,
    send,
  };
}
