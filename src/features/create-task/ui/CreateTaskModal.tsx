import { X, Paperclip, AlertCircle } from "lucide-react";
import type { Client } from "@/entities/client";
import type { TaskType, TaskKind, TaskPriority } from "@/entities/task";
import { ATTACHMENT_ACCEPT, TASK_KINDS, TASK_KIND_LABEL, TASK_TYPE_OPTION_LABEL, TASK_PRIORITY_OPTION_LABEL } from "@/entities/task";
import { INTERNAL_TASK_KEY, MAX_TASK_KEY_LENGTH } from "@/entities/client";
import type { User } from "@/entities/user";
import { ModalOverlay } from "@/shared/ui";
import { formatBytes } from "@/shared/lib";
import type { CreateTaskController } from "../model/useCreateTask";

interface CreateTaskModalProps {
  controller: CreateTaskController;
  clients: Client[];
  /** Сотрудники из базы — кандидаты в исполнители. */
  users: User[];
}

const TASK_TYPES: TaskType[] = ["call", "task", "update", "integration", "support", "onboarding"];
const TASK_PRIORITIES: TaskPriority[] = ["high", "medium", "low"];

export function CreateTaskModal({ controller, clients, users }: CreateTaskModalProps) {
  const { isOpen, draft, attachments, clientPreset, selectedClient, canEditTaskKey, isSubmitting, error, close, patch, attachFiles, removeAttachment, submit } = controller;

  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={close}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Новая задача</h2>
          <button onClick={close} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Название *</label>
            <input
              autoFocus
              type="text"
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="Что нужно сделать?"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-slate-300"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Описание</label>
            <textarea
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Детали..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors resize-none placeholder:text-slate-300"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Бизнес</label>
              <select
                value={draft.clientId}
                onChange={(e) => patch({ clientId: e.target.value })}
                disabled={!!clientPreset}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white text-slate-700 cursor-pointer"
              >
                <option value="">— Без бизнеса —</option>
                {clients.filter((c) => c.status !== "churned").map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">
                Ключ задач
                {selectedClient && !canEditTaskKey && <span className="ml-1 text-slate-400 font-normal">— задан</span>}
              </label>
              <input
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
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors font-mono uppercase disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-300 placeholder:font-sans"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Категория</label>
              <select
                value={draft.type}
                onChange={(e) => patch({ type: e.target.value as TaskType })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white text-slate-700 cursor-pointer"
              >
                {TASK_TYPES.map((type) => (
                  <option key={type} value={type}>{TASK_TYPE_OPTION_LABEL[type]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Тип</label>
              <select
                value={draft.kind}
                onChange={(e) => patch({ kind: e.target.value as TaskKind })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white text-slate-700 cursor-pointer"
              >
                {TASK_KINDS.map((kind) => (
                  <option key={kind} value={kind}>{TASK_KIND_LABEL[kind]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Приоритет</label>
              <select
                value={draft.priority}
                onChange={(e) => patch({ priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white text-slate-700 cursor-pointer"
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>{TASK_PRIORITY_OPTION_LABEL[priority]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Дедлайн</label>
              <input
                type="date"
                value={draft.dueDate}
                onChange={(e) => patch({ dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 text-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Исполнитель</label>
              <select
                value={draft.assigneeId}
                onChange={(e) => patch({ assigneeId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white text-slate-700 cursor-pointer"
              >
                <option value="">— Не назначен —</option>
                {users.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          <label className="text-xs font-medium text-slate-600 block mb-1.5">Прикрепить файлы</label>
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 hover:border-brand-300 hover:bg-brand-50/30 cursor-pointer transition-colors w-fit">
            <Paperclip size={13} className="text-slate-400" />
            <span className="text-xs text-slate-500">Выбрать файлы или фото</span>
            <input
              type="file"
              multiple
              accept={ATTACHMENT_ACCEPT}
              className="hidden"
              onChange={(e) => {
                attachFiles(e.target.files);
                // Иначе повторный выбор того же файла не вызовет onChange.
                e.target.value = "";
              }}
            />
          </label>
          {attachments.length > 0 && (
            <ul className="mt-2 space-y-1">
              {attachments.map((file, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                  <Paperclip size={10} className="text-slate-400 flex-shrink-0" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-slate-400 flex-shrink-0">{formatBytes(file.size)}</span>
                  <button onClick={() => removeAttachment(i)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                    <X size={10} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div role="alert" className="mx-5 mb-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
            <AlertCircle size={13} className="flex-shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        <div className="px-5 pb-5 flex gap-2 justify-end border-t border-slate-100 pt-4">
          <button onClick={close} className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">Отмена</button>
          <button
            onClick={submit}
            disabled={!draft.title.trim() || isSubmitting}
            className="px-5 py-2 text-xs font-medium bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors"
          >
            {isSubmitting ? "Создаём…" : "Создать"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
