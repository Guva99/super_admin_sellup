import { Link2, Loader2, Server, Unlink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  attachExternalInstallation,
  detachExternalInstallation,
  getInstallation,
  startInstallation,
  type Client,
  type InstallationDto,
} from "@/entities/client";
import { describeApiError } from "@/shared/api";

type State = "none" | "working" | "running" | "failed" | "external";

/** Что с установкой, одним словом: по задаче агента, а без неё — по деплою. */
function stateOf(installation: InstallationDto | null): State {
  if (installation?.deployment?.external) return "external";
  const task = installation?.task;
  if (task?.status === "PENDING" || task?.status === "RUNNING") return "working";
  if (task?.status === "FAILED" || installation?.deployment?.status === "FAILED") return "failed";
  if (installation?.deployment?.status === "RUNNING") return "running";
  return "none";
}

const STATE_TEXT: Record<State, { label: string; className: string }> = {
  none: { label: "Не создана", className: "text-ink-500" },
  working: { label: "Создаётся…", className: "text-amber-600" },
  running: { label: "Работает", className: "text-emerald-600" },
  failed: { label: "Ошибка", className: "text-red-600" },
  external: { label: "Существующая", className: "text-emerald-600" },
};

const INPUT =
  "w-full px-1.5 py-1 text-[11px] border border-ink-200 rounded outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-50";
const BUTTON =
  "w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg border border-ink-200 text-ink-700 hover:border-brand-300 hover:text-brand-600 disabled:opacity-50 disabled:hover:border-ink-200 disabled:hover:text-ink-700 transition-colors";

const stripScheme = (url: string) => url.replace(/^https?:\/\//, "");

/**
 * Установка бизнеса — его собственные админка, сайт и база.
 *
 * Обычно её создаёт агент ячейки по кнопке; пока он работает, статус
 * обновляется сам. Магазин, сделанный до платформы (текущий проект на
 * dev-сервере), привязывается как существующая установка: агент его не
 * трогает, а письма и «Открыть админку» ведут по его адресам.
 */
export function ClientInstallation({ client }: { client: Client }) {
  const [installation, setInstallation] = useState<InstallationDto | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAttaching, setIsAttaching] = useState(false);
  const [form, setForm] = useState({ adminUrl: "https://", storefrontUrl: "https://", installationName: client.slug ?? "" });

  const load = useCallback(async () => {
    const result = await getInstallation(client.id);
    if (result.ok) setInstallation(result.data);
  }, [client.id]);

  // Адрес мог только что смениться — адреса установки тоже.
  useEffect(() => {
    void load();
  }, [load, client.slug]);

  const state = stateOf(installation);

  // Агент поднимает установку несколько минут — спрашиваем, пока не закончит.
  useEffect(() => {
    if (state !== "working") return;
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [state, load]);

  const run = async (action: () => Promise<{ ok: boolean; error?: Parameters<typeof describeApiError>[0] }>) => {
    setIsBusy(true);
    setError(null);
    const result = await action();
    setIsBusy(false);
    if (!result.ok) {
      if (result.error) setError(describeApiError(result.error));
      return false;
    }
    await load();
    return true;
  };

  const attach = async () => {
    const storefrontUrl = form.storefrontUrl.trim() === "https://" ? "" : form.storefrontUrl;
    if (await run(() => attachExternalInstallation(client.id, { ...form, storefrontUrl }))) setIsAttaching(false);
  };

  const text = STATE_TEXT[state];
  const failure = installation?.task?.error ?? installation?.deployment?.error;
  const addresses = installation?.addresses;

  return (
    <div>
      <p className="text-[10px] text-ink-400 uppercase tracking-wide font-medium mb-2.5">Установка</p>
      <div className="flex justify-between text-xs">
        <span className="text-ink-400">Состояние</span>
        <span className={`font-medium ${text.className}`}>{text.label}</span>
      </div>
      {installation?.deployment?.version && state !== "none" && state !== "external" && (
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-ink-400">Релиз</span>
          <span className="text-ink-700 font-medium font-mono">{installation.deployment.version}</span>
        </div>
      )}
      {addresses && (
        <div className="mt-2 space-y-1 text-xs">
          <AddressRow label="Админка" url={addresses.admin} />
          <AddressRow label="Сайт" url={addresses.storefront} />
          {state === "external" && installation?.installationName && (
            <div className="flex gap-1.5">
              <span className="text-ink-400 flex-shrink-0">Имя</span>
              <span className="min-w-0 break-all text-ink-700 font-medium font-mono">{installation.installationName}</span>
            </div>
          )}
        </div>
      )}
      {state === "failed" && failure && (
        <p className="mt-1.5 text-[10px] text-red-600 break-words whitespace-pre-line line-clamp-6" title={failure}>
          {failure}
        </p>
      )}

      {state === "external" ? (
        <button type="button" onClick={() => void run(() => detachExternalInstallation(client.id))} disabled={isBusy} className={`mt-3 ${BUTTON}`}>
          {isBusy ? <Loader2 size={12} className="animate-spin" /> : <Unlink size={12} />}
          Отвязать
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void run(() => startInstallation(client.id))}
          disabled={!client.slug || isBusy || state === "working"}
          title={!client.slug ? "Сначала задайте адрес магазина" : "Задача уйдёт агенту ячейки"}
          className={`mt-3 ${BUTTON}`}
        >
          {isBusy || state === "working" ? <Loader2 size={12} className="animate-spin" /> : <Server size={12} />}
          {state === "running" ? "Обновить до последнего релиза" : state === "failed" ? "Повторить" : "Создать установку"}
        </button>
      )}

      {state === "none" && !isAttaching && (
        <button type="button" onClick={() => setIsAttaching(true)} className="mt-1.5 flex items-center gap-1 text-[11px] text-brand-600 hover:underline">
          <Link2 size={11} /> Привязать существующую установку
        </button>
      )}
      {isAttaching && (
        <form
          className="mt-2 space-y-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            void attach();
          }}
        >
          <input className={INPUT} value={form.adminUrl} onChange={(e) => setForm({ ...form, adminUrl: e.target.value })} aria-label="Адрес админки" placeholder="https://admin.shop.ru" />
          <input className={INPUT} value={form.storefrontUrl} onChange={(e) => setForm({ ...form, storefrontUrl: e.target.value })} aria-label="Адрес сайта" placeholder="https://shop.ru" />
          <input className={`${INPUT} font-mono`} value={form.installationName} onChange={(e) => setForm({ ...form, installationName: e.target.value.toLowerCase() })} aria-label="Имя установки" placeholder="crystal" />
          <p className="text-[10px] leading-snug text-ink-400">Имя — значение SSO_AUDIENCE в .env этой установки.</p>
          <div className="flex gap-1.5">
            <button type="submit" disabled={isBusy} className="flex-1 py-1.5 text-[11px] font-medium rounded bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-60">
              Привязать
            </button>
            <button type="button" onClick={() => setIsAttaching(false)} className="px-2 py-1.5 text-[11px] text-ink-500 hover:text-ink-700">
              Отмена
            </button>
          </div>
        </form>
      )}

      <p className="mt-1.5 text-[10px] leading-snug text-ink-400">
        {state === "external"
          ? "Магазин работал до платформы: агент его не трогает, письма и «Открыть админку» ведут по этим адресам."
          : "Своя админка, сайт и база клиента. Письмо с доступом отправляйте, когда установка работает."}
      </p>
      {error && (
        <p role="alert" className="mt-1.5 text-[10px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function AddressRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-ink-400 flex-shrink-0">{label}</span>
      <a href={url} target="_blank" rel="noreferrer" className="min-w-0 break-all text-ink-700 hover:text-brand-600 font-medium">
        {stripScheme(url)}
      </a>
    </div>
  );
}
