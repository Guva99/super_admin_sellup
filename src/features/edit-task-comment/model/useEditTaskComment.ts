import { useState } from "react";
import { useSession } from "@/entities/session";
import { usePastedFile, useTasks, type TaskComment } from "@/entities/task";
import type { PastedFile } from "@/shared/ui";
import { describeApiError } from "@/shared/api";
import { setImageWidth, toggleChecklistItem } from "@/shared/lib";

export interface EditCommentController {
  /** id комментария, который сейчас правится. */
  editingId: string | null;
  draft: string;
  error: string | null;
  /** Свои комментарии — их можно менять и удалять (бэкенд проверяет автора). */
  isOwn: (comment: TaskComment) => boolean;
  start: (comment: TaskComment) => void;
  cancel: () => void;
  setDraft: (text: string) => void;
  save: () => void;
  /** Галочка и растянутая за угол картинка — правка строки в тексте своего комментария. */
  toggleChecklist: (comment: TaskComment, line: number) => void;
  resizeImage: (comment: TaskComment, line: number, width: number | null) => void;
  /** Вставка картинки из буфера прямо в текст комментария. */
  uploadPaste: (file: File) => PastedFile | null;
  pasteError: string | null;
  remove: (comment: TaskComment) => void;
}

export function useEditTaskComment(taskId: string): EditCommentController {
  const { editComment, deleteComment } = useTasks();
  const { uploadPaste, pasteError, clearPasteError } = usePastedFile(taskId);
  const { user } = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!editingId) return;
    const result = await editComment(taskId, editingId, draft.trim());
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    setEditingId(null);
    setError(null);
  };

  return {
    editingId,
    draft,
    error,
    isOwn: (comment) => comment.authorId === user?.id,
    start: (comment) => {
      setEditingId(comment.id);
      setDraft(comment.text);
      setError(null);
      clearPasteError();
    },
    cancel: () => setEditingId(null),
    setDraft,
    save,
    toggleChecklist: (comment, line) => {
      editComment(taskId, comment.id, toggleChecklistItem(comment.text, line));
    },
    resizeImage: (comment, line, width) => {
      editComment(taskId, comment.id, setImageWidth(comment.text, line, width));
    },
    uploadPaste,
    pasteError,
    remove: (comment) => deleteComment(taskId, comment.id),
  };
}
