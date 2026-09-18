import { useEffect } from "react";
import { AlertCircle, Paperclip, RotateCcw } from "lucide-react";
import type { Client } from "@/entities/client";
import { INTERNAL_TASK_KEY, MAX_TASK_KEY_LENGTH } from "@/entities/client";
import { TaskKey, TaskKindIcon } from "@/entities/task";
import { useSession } from "@/entities/session";
import { UploadList, useUploadQueue } from "@/features/attachment-upload";
import type { CreateTaskController } from "@/features/create-task";
import { RichTextEditor, useRichTextEditor } from "@/features/rich-text-editor";
import { ATTACHMENT_ACCEPT } from "@/shared/lib";
import { Lightbox, UserAvatar } from "@/shared/ui";
import { useEditorBindings } from "../model/useEditorBindings";
import { TaskDialogFrame } from "./TaskDialogFrame";
import { TaskFieldRow, TaskFields } from "./TaskFields";

interface TaskCreateDialogProps {
  controller: CreateTaskController;
  clients: Client[];
}

const SELECT_CLASS =
  "text-xs font-medium text-slate-800 bg-transparent -mx-1.5 px-1.5 py-1 rounded-md hover:bg-slate-100 outline-none cursor-pointer max-w-full";

/**
 * Новая задача — в том же окне, что и сохранённая: те же поля на тех же
 * местах. Отличия только в том, чего у новой задачи физически нет:
 * активности, истории и ссылки на себя, — и в подвале с кнопкой «Создать».
 * Файлы грузятся сразу, черновиками; задача заберёт их при создании.
 */
export function TaskCreateDialog({ controller, clients }: TaskCreateDialogProps) {
  const { isOpen, draft, restored, discardDraft, isDirty, clientPreset, selectedClient, canEditTaskKey, isSubmitting, error, close, patch, submit } = controller;
  const { user } = useSession();
  const queue = useUploadQueue(null);
  const { uploader, resolver, lightbox, closeLightbox } = useEditorBindings(queue);
  const { editor, insertFiles } = useRichTextEditor({
    value: draft.description,
    onChange: (description) => patch({ description }),
    editable: true,
    placeholder: "Опишите задачу… Картинку можно вставить из буфера или перетащить",
    uploader,
    resolver,
  });

  // Закрыли форму — её загрузки больше не нужны; сироты на сервере уберутся сами.
  useEffect(() => {
    if (!isOpen) queue.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const create = () => submit(queue.uploaded.map((file) => file.id));

  return (
    <TaskDialogFrame
      onClose={close}
      unsaved={isDirty}
      breadcrumb={
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>{selectedClient?.name ?? "Задачи"}</span>
          <span className="text-slate-300">/</span>
          <span className="flex items-center gap-1 px-1 py-0.5">
            <TaskKindIcon kind={draft.kind} size={13} />
            <TaskKey value={`${selectedClient ? draft.taskKey || selectedClient.taskKey : INTERNAL_TASK_KEY}-…`} className="text-slate-700" />
          </span>
          <span className="text-slate-400">Новая задача</span>
        </nav>
      }
      aside={
        <TaskFields
          value={draft}
          on={{
            status: (status) => patch({ status }),
            assignee: (person) => patch({ assignee: person ? { id: person.id, name: person.fullName } : null }),
            dueDate: (dueDate) => patch({ dueDate }),
            startDate: (startDate) => patch({ startDate }),
            labels: (labels) => patch({ labels }),
            priority: (priority) => patch({ priority }),
            kind: (kind) => patch({ kind }),
            type: (type) => patch({ type }),
          }}
        >
          <TaskFieldRow label="Бизнес">
            <select
              aria-label="Бизнес"
              value={draft.clientId}
              onChange={(e) => patch({ clientId: e.target.value })}
              disabled={Boolean(clientPreset)}
              className={`${SELECT_CLASS} disabled:cursor-default disabled:hover:bg-transparent`}
            >
              <option value="">Без бизнеса</option>
              {clients
                .filter((c) => c.status !== "churned" || c.id === draft.clientId)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </TaskFieldRow>
          <TaskFieldRow label="Ключ задач">
            <input
              aria-label="Ключ задач"
              type="text"
              value={selectedClient ? draft.taskKey : INTERNAL_TASK_KEY}
              onChange={(e) => patch({ taskKey: e.target.value })}
              disabled={!canEditTaskKey}
              maxLength={MAX_TASK_KEY_LENGTH}
              placeholder="CG"
              title={
                selectedClient
                  ? canEditTaskKey
                    ? "До 10 английских букв. После первой задачи ключ меняет только владелец в карточке бизнеса."
                    : "У бизнеса уже есть задачи — ключ меняет владелец в карточке бизнеса"
                  : "Задачи без бизнеса нумеруются как SC-1, SC-2"
              }
              className="w-full -mx-1.5 px-1.5 py-1 text-xs font-mono font-medium uppercase text-slate-800 bg-transparent rounded-md hover:bg-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-brand-100 disabled:text-slate-400 disabled:hover:bg-transparent placeholder:text-slate-300 placeholder:font-sans"
            />
          </TaskFieldRow>
          <TaskFieldRow label="Автор">
            <div className="flex items-center gap-2">
              <UserAvatar name={user?.fullName ?? ""} size="sm" />
              <span className="text-xs text-slate-800">{user?.fullName ?? "—"}</span>
            </div>
          </TaskFieldRow>
        </TaskFields>
      }
      footer={
        <>
          {error && (
            <p role="alert" className="flex items-center gap-1.5 mr-auto text-xs text-red-600">
              <AlertCircle size={13} />
              {error}
            </p>
          )}
          <button type="button" onClick={close} className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            Отмена
          </button>
          <button
            type="button"
            onClick={create}
            disabled={!draft.title.trim() || isSubmitting || queue.isUploading}
            title={queue.isUploading ? "Дождитесь загрузки файлов" : undefined}
            className="px-5 py-2 text-xs font-medium bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors"
          >
            {isSubmitting ? "Создаём…" : queue.isUploading ? "Загрузка файлов…" : "Создать"}
          </button>
        </>
      }
    >
      <input
        autoFocus
        aria-label="Название задачи"
        type="text"
        value={draft.title}
        onChange={(e) => patch({ title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") create();
        }}
        placeholder="Что нужно сделать?"
        className="w-full text-xl font-semibold text-slate-900 leading-snug px-1.5 py-0.5 -mx-1.5 bg-white border border-transparent hover:border-slate-200 focus:border-brand-300 rounded-md outline-none focus:ring-2 focus:ring-brand-50 placeholder:text-slate-300"
      />

      {restored && (
        <p className="flex items-center gap-1.5 -mb-2 text-[11px] text-amber-600">
          <RotateCcw size={11} />
          Восстановлен черновик прошлой задачи.
          <button type="button" onClick={discardDraft} className="underline hover:no-underline">
            Начать заново
          </button>
        </p>
      )}

      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Описание</h2>
        <RichTextEditor editor={editor} insertFiles={insertFiles} className="border border-slate-200 rounded-lg bg-white focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-50" />
        <p className="mt-1.5 text-[11px] text-slate-400">⌘V — вставить скриншот, файлы можно перетащить в текст.</p>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Вложения {queue.uploaded.length > 0 && <span className="text-slate-400">({queue.uploaded.length})</span>}
          </h2>
          <label className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-500 cursor-pointer">
            <Paperclip size={11} />
            Прикрепить
            <input
              type="file"
              multiple
              accept={ATTACHMENT_ACCEPT}
              className="hidden"
              onChange={(e) => {
                queue.enqueue(Array.from(e.target.files ?? []));
                // Иначе повторный выбор того же файла не вызовет onChange.
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {queue.items.length === 0 ? (
          <p className="text-xs text-slate-400">Файлов нет — их можно выбрать или вставить в описание из буфера</p>
        ) : (
          <UploadList queue={queue} showDone />
        )}
      </section>

      <Lightbox src={lightbox?.url ?? null} alt={lightbox?.alt} onClose={closeLightbox} />
    </TaskDialogFrame>
  );
}
