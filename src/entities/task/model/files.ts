import type { TaskAttachment } from "./types";
import { isImageType } from "@/shared/lib";

export { MAX_FILE_BYTES, MAX_UPLOAD_BYTES, ATTACHMENT_ACCEPT, attachmentError, attachmentRef, attachmentKey, pastedFile } from "@/shared/lib";

export const isImageAttachment = isImageType;

export function findAttachment(attachments: TaskAttachment[], key: string): TaskAttachment | null {
  return attachments.find((file) => file.id === key) ?? attachments.find((file) => file.name === key) ?? null;
}

/** Вложения задачи и всех её комментариев — картинка в тексте может быть любой из них. */
export function allAttachments(task: { attachments: TaskAttachment[]; comments: { attachments: TaskAttachment[] }[] }): TaskAttachment[] {
  return [...task.attachments, ...task.comments.flatMap((comment) => comment.attachments)];
}

