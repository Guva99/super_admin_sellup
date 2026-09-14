import { useState } from "react";
import { useSession } from "@/entities/session";
import { useTasks, type TaskComment } from "@/entities/task";
import { describeApiError } from "@/shared/api";

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
  remove: (comment: TaskComment) => void;
}

export function useEditTaskComment(taskId: string): EditCommentController {
  const { editComment, deleteComment } = useTasks();
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
    },
    cancel: () => setEditingId(null),
    setDraft,
    save,
    remove: (comment) => deleteComment(taskId, comment.id),
  };
}
