import { Check, Pencil, X } from "lucide-react";
import { MAX_TASK_KEY_LENGTH, type Client } from "@/entities/client";
import { useEditClientTaskKey } from "../model/useEditClientTaskKey";

/** Ключ задач бизнеса в его карточке: показывается всем, правится по правилам. */
export function ClientTaskKey({ client }: { client: Client }) {
  const { isEditing, draft, isSaving, error, canEdit, start, cancel, setDraft, save } = useEditClientTaskKey(client);

  if (!isEditing) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600" title="Ключ задач этого бизнеса">
          {client.taskKey}
        </span>
        {canEdit && (
          <button type="button" onClick={start} title="Изменить ключ задач" className="text-slate-300 hover:text-brand-500 transition-colors">
            <Pencil size={11} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_TASK_KEY_LENGTH}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          className="w-24 px-1.5 py-0.5 font-mono text-[11px] border border-brand-300 rounded outline-none focus:ring-2 focus:ring-brand-50 uppercase"
        />
        <button type="button" onClick={save} disabled={isSaving} title="Сохранить" className="p-0.5 text-emerald-500 hover:text-emerald-600 disabled:text-slate-300">
          <Check size={12} />
        </button>
        <button type="button" onClick={cancel} title="Отмена" className="p-0.5 text-slate-300 hover:text-slate-500">
          <X size={12} />
        </button>
      </div>
      <p className="text-[10px] text-slate-400">
        Ключи задач станут {draft || "—"}-1, {draft || "—"}-2…
      </p>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
