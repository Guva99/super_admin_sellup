import { useState } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import { useTasks, type Task } from "@/entities/task";
import { UploadList, useUploadQueue } from "@/features/attachment-upload";
import { RichTextEditor, useRichTextEditor } from "@/features/rich-text-editor";
import { checklistProgress, useDraft } from "@/shared/lib";
import { Lightbox, useUnsavedGuard } from "@/shared/ui";
import { toTaskAttachment, useEditorBindings } from "../model/useEditorBindings";

/**
 * Описание сохранённой задачи: чтение — тот же редактор без правки (вид
 * совпадает, картинки открываются в лайтбоксе), клик или «Изменить» — правка.
 * Вставленный файл сразу уходит во вложения задачи, как в Jira.
 */
export function DescriptionSection({ task }: { task: Task }) {
  const { updateTask, addAttachment } = useTasks();
  const queue = useUploadQueue(task.id, (file) => addAttachment(task.id, toTaskAttachment(file)));
  const { uploader, resolver, lightbox, closeLightbox } = useEditorBindings(queue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.description ?? "");
  const saved = task.description ?? "";
  const progress = checklistProgress(saved);
  // Правка не сохранена — окно не закроется молча, а сам текст переживёт
  // и перезагрузку: он лежит черновиком в браузере.
  const dirty = editing && draft.trim() !== saved.trim();
  useUnsavedGuard(`description:${task.id}`, dirty);
  const { restored, clear: forgetDraft } = useDraft<string>({
    key: editing ? `task-description:${task.id}` : null,
    value: draft,
    restore: setDraft,
    isEmpty: (value) => value.trim() === saved.trim(),
  });

  const { editor, insertFiles } = useRichTextEditor({
    value: editing ? draft : saved,
    // В чтении меняться может только галочка чек-листа — такое сохраняем сразу.
    onChange: (markdown) => (editing ? setDraft(markdown) : updateTask(task.id, { description: markdown })),
    editable: editing,
    placeholder: "Опишите задачу… Картинку можно вставить из буфера или перетащить",
    uploader: editing ? uploader : null,
    resolver,
  });

  const start = () => {
    setDraft(saved);
    setEditing(true);
    setTimeout(() => editor?.commands.focus("end"), 0);
  };
  const save = () => {
    const next = draft.trim();
    if (next !== saved) updateTask(task.id, { description: next });
    forgetDraft();
    setEditing(false);
  };
  const cancel = () => {
    forgetDraft();
    setEditing(false);
    setDraft(saved);
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Описание</h2>
        {progress.total > 0 && (
          <span className="text-[11px] text-slate-400">
            {progress.done}/{progress.total} пунктов
          </span>
        )}
        {!editing && (
          <button type="button" onClick={start} className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-500">
            <Pencil size={11} />
            Изменить
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-1.5">
          <RichTextEditor editor={editor} insertFiles={insertFiles} className="border border-brand-300 rounded-lg ring-2 ring-brand-50 bg-white" />
          <UploadList queue={queue} />
          {restored && (
            <p className="flex items-center gap-1.5 text-[11px] text-amber-600">
              <RotateCcw size={11} />
              Восстановлен черновик прошлой правки.
              <button type="button" onClick={() => { forgetDraft(); setDraft(saved); }} className="underline hover:no-underline">
                Вернуть сохранённое
              </button>
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={queue.isUploading}
              title={queue.isUploading ? "Дождитесь загрузки файлов" : undefined}
              className="px-2.5 py-1 text-[11px] font-medium bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-md"
            >
              {queue.isUploading ? "Загрузка…" : "Сохранить"}
            </button>
            <button type="button" onClick={cancel} className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100">
              Отмена
            </button>
            <p className="text-[11px] text-slate-400">⌘V — вставить скриншот, файлы можно перетащить в текст.</p>
          </div>
        </div>
      ) : (
        <div onClick={start} className="cursor-text rounded-md -mx-1.5 px-1.5 py-0.5 hover:bg-slate-50 transition-colors">
          {saved ? <RichTextEditor editor={editor} /> : <p className="text-sm text-slate-400 px-1.5 py-1">Добавить описание…</p>}
        </div>
      )}

      <Lightbox src={lightbox?.url ?? null} alt={lightbox?.alt} onClose={closeLightbox} />
    </section>
  );
}
