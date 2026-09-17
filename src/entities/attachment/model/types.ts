/**
 * Вложение задачи (`TaskFile` в Swagger). Картинка, вставленная в описание, и
 * файл, приложенный кнопкой, — одна сущность; `isInline` лишь говорит, что
 * текст на неё ссылается. `taskId` null — черновик: загружен, пока задачу
 * ещё не создали.
 */
export interface Attachment {
  id: string;
  taskId: string | null;
  commentId: string | null;
  name: string;
  contentType: string;
  size: number;
  isInline: boolean;
  createdAt: string;
}
