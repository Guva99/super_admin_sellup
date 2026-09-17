import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { describeApiError, type Result } from "@/shared/api";
import { taskApi } from "../api/taskApi";
import type { NewTaskInput, Task, TaskAttachment, TaskComment, TaskPatch } from "./types";

/**
 * Единственный владелец списка задач. Задачи и всё, что с ними связано
 * (комментарии, файлы, связь с этапом онбординга), хранятся в бэкенде.
 *
 * Изменения полей и удаление применяются сразу (интерфейс не ждёт сервера) и
 * откатываются при ошибке — текст ошибки попадает в `mutationError`, его
 * показывает каркас приложения. Создание задачи и комментарии возвращают
 * `Result`: их ошибки показывает форма, в которой пользователь находится.
 *
 * Историю изменений ведёт бэкенд на каждом PATCH — здесь ничего логировать
 * не нужно, и фичи change-* обязаны ходить только через `updateTask`.
 */
export interface TasksStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  mutationError: string | null;
  dismissMutationError: () => void;
  /** Сообщить об ошибке сценария вне формы (например, «В задачи» из онбординга). */
  reportError: (message: string) => void;
  addTask: (input: NewTaskInput, files?: File[]) => Promise<Result<Task>>;
  /**
   * Изменить поля задачи. `preview` — как показать изменение до ответа
   * сервера там, где по патчу этого не понять (исполнитель: в патче id,
   * в задаче — имя). Ответ сервера заменяет предпросмотр.
   */
  updateTask: (id: string, patch: TaskPatch, preview?: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  /** Приложить файлы к самой задаче (не к комментарию). */
  addFiles: (taskId: string, files: File[]) => Promise<Result<TaskAttachment[]>>;
  /** Файл уже загружен отдельным запросом (редактор, очередь) — просто показать его. */
  addAttachment: (taskId: string, file: TaskAttachment) => void;
  /** Файл удалён на сервере — убрать из задачи. */
  removeAttachment: (taskId: string, fileId: string) => void;
  /**
   * Убрать из памяти задачи удалённого бизнеса — запроса не делает: на сервере
   * они скрылись вместе с ним.
   */
  dropClientTasks: (clientId: string) => void;
  addComment: (taskId: string, text: string, files: File[]) => Promise<Result<TaskComment>>;
  editComment: (taskId: string, commentId: string, text: string) => Promise<Result<TaskComment>>;
  deleteComment: (taskId: string, commentId: string) => void;
  downloadFile: (taskId: string, fileId: string) => Promise<Result<Blob>>;
  /** Задачи одного клиента. */
  tasksOfClient: (clientId: string) => Task[];
  /** Счётчик для бейджа в меню: незакрытые задачи высокого приоритета. */
  highPriorityCount: number;
}

const TasksContext = createContext<TasksStore | null>(null);

/** Поля патча, которые в задаче выглядят так же, — показываем сразу. */
function previewOf(patch: TaskPatch): Partial<Task> {
  const { assigneeId, ...same } = patch;
  const preview: Partial<Task> = { ...same };
  if (assigneeId === null) preview.assignee = null;
  return preview;
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Актуальный список для откатов, без пересоздания колбэков на каждое изменение.
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    let cancelled = false;
    taskApi.list().then((result) => {
      if (cancelled) return;
      if (result.ok) setTasks(result.data);
      else setError(describeApiError(result.error));
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const replaceTask = useCallback(
    (task: Task) => setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t))),
    [],
  );

  const patchTask = useCallback(
    (id: string, patch: Partial<Task>) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [],
  );

  const reportError = useCallback((message: string) => setMutationError(message), []);

  const addTask = useCallback(async (input: NewTaskInput, files: File[] = []) => {
    const result = await taskApi.create(input);
    if (!result.ok) return result;

    let task = result.data;
    if (files.length > 0) {
      // Файлы грузятся по одному: лимит в 25 МБ считается на запрос.
      for (const file of files) {
        const uploaded = await taskApi.uploadFiles(task.id, [file]);
        if (uploaded.ok)
          task = {
            ...task,
            attachments: [...task.attachments, ...uploaded.data],
          };
        // Задача уже создана, поэтому форма закрывается — об ошибке файла
        // сообщаем полосой в каркасе.
        else setMutationError(`Не удалось приложить «${file.name}»: ${describeApiError(uploaded.error)}`);
      }
    }
    const created = task;
    setTasks((prev) => [created, ...prev]);
    return { ok: true as const, data: created };
  }, []);

  const updateTask = useCallback(
    (id: string, patch: TaskPatch, preview: Partial<Task> = {}) => {
      const before = tasksRef.current.find((t) => t.id === id);
      if (!before) return;

      patchTask(id, { ...previewOf(patch), ...preview });
      taskApi.update(id, patch).then((result) => {
        if (result.ok) replaceTask(result.data);
        else {
          replaceTask(before);
          setMutationError(`Не удалось сохранить «${before.title}»: ${describeApiError(result.error)}`);
        }
      });
    },
    [patchTask, replaceTask],
  );

  const deleteTask = useCallback((id: string) => {
    const before = tasksRef.current.find((t) => t.id === id);
    if (!before) return;
    const index = tasksRef.current.indexOf(before);

    setTasks((prev) => prev.filter((t) => t.id !== id));
    taskApi.remove(id).then((result) => {
      if (result.ok) return;
      // Возвращаем задачу на её место в списке.
      setTasks((prev) => [...prev.slice(0, index), before, ...prev.slice(index)]);
      setMutationError(`Не удалось удалить «${before.title}»: ${describeApiError(result.error)}`);
    });
  }, []);

  const addFiles = useCallback(async (taskId: string, files: File[]) => {
    const result = await taskApi.uploadFiles(taskId, files);
    if (result.ok) {
      const uploaded = result.data;
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, attachments: [...t.attachments, ...uploaded] } : t)));
    }
    return result;
  }, []);

  const addAttachment = useCallback((taskId: string, file: TaskAttachment) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId && !t.attachments.some((f) => f.id === file.id) ? { ...t, attachments: [...t.attachments, file] } : t)));
  }, []);

  const removeAttachment = useCallback((taskId: string, fileId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, attachments: t.attachments.filter((f) => f.id !== fileId) } : t)));
  }, []);

  const dropClientTasks = useCallback((clientId: string) => setTasks((prev) => prev.filter((t) => t.clientId !== clientId)), []);

  const addComment = useCallback(async (taskId: string, text: string, files: File[]) => {
    const result = await taskApi.addComment(taskId, text, files);
    if (result.ok) {
      const comment = result.data;
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t)));
    }
    return result;
  }, []);

  const editComment = useCallback(async (taskId: string, commentId: string, text: string) => {
    const result = await taskApi.editComment(taskId, commentId, text);
    if (result.ok) {
      const comment = result.data;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                comments: t.comments.map((c) => (c.id === commentId ? comment : c)),
              }
            : t,
        ),
      );
    }
    return result;
  }, []);

  const deleteComment = useCallback((taskId: string, commentId: string) => {
    const task = tasksRef.current.find((t) => t.id === taskId);
    const before = task?.comments ?? [];
    if (!before.some((c) => c.id === commentId)) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) } : t)),
    );
    taskApi.removeComment(taskId, commentId).then((result) => {
      if (result.ok) return;
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, comments: before } : t)));
      setMutationError(`Не удалось удалить комментарий: ${describeApiError(result.error)}`);
    });
  }, []);

  const downloadFile = useCallback((taskId: string, fileId: string) => taskApi.downloadFile(taskId, fileId), []);

  const tasksOfClient = useCallback((clientId: string) => tasks.filter((task) => task.clientId === clientId), [tasks]);

  const highPriorityCount = useMemo(
    () => tasks.filter((task) => task.status !== "done" && task.priority === "high").length,
    [tasks],
  );

  const dismissMutationError = useCallback(() => setMutationError(null), []);

  const value = useMemo<TasksStore>(
    () => ({
      tasks,
      isLoading,
      error,
      mutationError,
      dismissMutationError,
      reportError,
      addTask,
      updateTask,
      deleteTask,
      addFiles,
      addAttachment,
      removeAttachment,
      dropClientTasks,
      addComment,
      editComment,
      deleteComment,
      downloadFile,
      tasksOfClient,
      highPriorityCount,
    }),
    [
      tasks,
      isLoading,
      error,
      mutationError,
      dismissMutationError,
      reportError,
      addTask,
      updateTask,
      deleteTask,
      addFiles,
      addAttachment,
      removeAttachment,
      dropClientTasks,
      addComment,
      editComment,
      deleteComment,
      downloadFile,
      tasksOfClient,
      highPriorityCount,
    ],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksStore {
  const store = useContext(TasksContext);
  if (!store) throw new Error("useTasks вызван вне <TasksProvider>");
  return store;
}
