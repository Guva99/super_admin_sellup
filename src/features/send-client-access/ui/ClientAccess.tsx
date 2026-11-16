import { Check, Loader2, Pencil, Send, X } from "lucide-react";
import { type Client } from "@/entities/client";
import { useClientAccess } from "../model/useClientAccess";

/** Адрес магазина и письмо с доступом — в боковой колонке карточки клиента. */
export function ClientAccess({ client }: { client: Client }) {
  const access = useClientAccess(client);
  const canSend = Boolean(client.slug && client.owner.email);

  return (
    <div>
      <p className="text-[10px] text-ink-400 uppercase tracking-wide font-medium mb-2.5">Доступ клиента</p>

      {access.isEditing ? (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="text"
              value={access.draft}
              onChange={(e) => access.setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void access.saveSlug();
                if (e.key === "Escape") access.cancelEdit();
              }}
              placeholder="apple"
              aria-label="Адрес магазина"
              className="min-w-0 flex-1 px-1.5 py-0.5 font-mono text-[11px] border border-brand-300 rounded outline-none focus:ring-2 focus:ring-brand-50"
            />
            <button type="button" onClick={() => void access.saveSlug()} disabled={access.isSaving} title="Сохранить" className="p-0.5 text-emerald-500 hover:text-emerald-600 disabled:text-ink-300">
              <Check size={12} />
            </button>
            <button type="button" onClick={access.cancelEdit} title="Отмена" className="p-0.5 text-ink-300 hover:text-ink-500">
              <X size={12} />
            </button>
          </div>
          <p className="text-[10px] text-ink-400">Из него строятся адреса сайта и админки — они в блоке «Установка».</p>
        </div>
      ) : client.slug ? (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-ink-400">Адрес</span>
          <span className="font-mono text-ink-700 font-medium">{client.slug}</span>
          <button type="button" onClick={access.startEdit} title="Изменить адрес" className="text-ink-300 hover:text-brand-500 transition-colors">
            <Pencil size={11} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={access.startEdit} className="text-xs text-brand-600 hover:underline">
          Задать адрес магазина
        </button>
      )}

      <button
        type="button"
        onClick={() => void access.send()}
        disabled={!canSend || access.isSending}
        title={
          !client.slug
            ? "Сначала задайте адрес магазина"
            : !client.owner.email
              ? "У бизнеса не указана почта владельца"
              : "Письмо со ссылкой, где владелец задаёт пароль"
        }
        className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg border border-ink-200 text-ink-700 hover:border-brand-300 hover:text-brand-600 disabled:opacity-50 disabled:hover:border-ink-200 disabled:hover:text-ink-700 transition-colors"
      >
        {access.isSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        Отправить доступ
      </button>
      <p className="mt-1.5 text-[10px] leading-snug text-ink-400">
        Письмо уходит само при переносе в «Активен». Владелец задаёт пароль по ссылке и попадает в админку.
      </p>
      {access.sentTo && <p className="mt-1.5 text-[10px] text-emerald-600">Отправлено на {access.sentTo}</p>}
      {access.error && (
        <p role="alert" className="mt-1.5 text-[10px] text-red-600">
          {access.error}
        </p>
      )}
    </div>
  );

}
