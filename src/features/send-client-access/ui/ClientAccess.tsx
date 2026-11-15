import { Check, Loader2, Pencil, Send, X } from "lucide-react";
import { CLIENT_ROOT_DOMAIN, clientAddresses, type Client } from "@/entities/client";
import { useClientAccess } from "../model/useClientAccess";

const stripScheme = (url: string) => url.replace(/^https?:\/\//, "");

/** Адрес магазина и письмо с доступом — в боковой колонке карточки клиента. */
export function ClientAccess({ client }: { client: Client }) {
  const access = useClientAccess(client);
  const addresses = client.slug ? clientAddresses(client.slug) : null;
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
          <p className="text-[10px] text-ink-400 break-all">
            {access.draft || "адрес"}.{CLIENT_ROOT_DOMAIN}
          </p>
        </div>
      ) : addresses ? (
        <div className="space-y-1 text-xs">
          <div className="flex items-start gap-1.5">
            <div className="min-w-0 flex-1 space-y-1">
              <AddressLink label="Сайт" url={addresses.storefront} />
              <AddressLink label="Админка" url={addresses.admin} />
            </div>
            <button type="button" onClick={access.startEdit} title="Изменить адрес" className="mt-0.5 text-ink-300 hover:text-brand-500 transition-colors">
              <Pencil size={11} />
            </button>
          </div>
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

function AddressLink({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-ink-400 flex-shrink-0">{label}</span>
      <a href={url} target="_blank" rel="noreferrer" className="min-w-0 break-all text-ink-700 hover:text-brand-600 font-medium">
        {stripScheme(url)}
      </a>
    </div>
  );
}
