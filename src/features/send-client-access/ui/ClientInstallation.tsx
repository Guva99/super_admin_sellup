import { Loader2, Server } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getInstallation, startInstallation, type Client, type InstallationDto } from "@/entities/client";
import { describeApiError } from "@/shared/api";

type State = "none" | "working" | "running" | "failed";

/** Что с установкой, одним словом: по задаче агента, а без неё — по деплою. */
function stateOf(installation: InstallationDto | null): State {
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
};

/**
 * Установка бизнеса — его собственные админка, сайт и база на ячейке.
 * Кнопка ставит задачу агенту ячейки; пока он работает, статус обновляется сам.
 */
export function ClientInstallation({ client }: { client: Client }) {
  const [installation, setInstallation] = useState<InstallationDto | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await getInstallation(client.id);
    if (result.ok) setInstallation(result.data);
  }, [client.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const state = stateOf(installation);

  // Агент поднимает установку несколько минут — спрашиваем, пока не закончит.
  useEffect(() => {
    if (state !== "working") return;
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [state, load]);

  const start = async () => {
    setIsStarting(true);
    setError(null);
    const result = await startInstallation(client.id);
    setIsStarting(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    await load();
  };

  const text = STATE_TEXT[state];
  const failure = installation?.task?.error ?? installation?.deployment?.error;

  return (
    <div>
      <p className="text-[10px] text-ink-400 uppercase tracking-wide font-medium mb-2.5">Установка</p>
      <div className="flex justify-between text-xs">
        <span className="text-ink-400">Состояние</span>
        <span className={`font-medium ${text.className}`}>{text.label}</span>
      </div>
      {installation?.deployment?.version && state !== "none" && (
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-ink-400">Релиз</span>
          <span className="text-ink-700 font-medium font-mono">{installation.deployment.version}</span>
        </div>
      )}
      {state === "failed" && failure && (
        <p className="mt-1.5 text-[10px] text-red-600 break-words whitespace-pre-line line-clamp-6" title={failure}>
          {failure}
        </p>
      )}

      <button
        type="button"
        onClick={() => void start()}
        disabled={!client.slug || isStarting || state === "working"}
        title={!client.slug ? "Сначала задайте адрес магазина" : "Задача уйдёт агенту ячейки"}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg border border-ink-200 text-ink-700 hover:border-brand-300 hover:text-brand-600 disabled:opacity-50 disabled:hover:border-ink-200 disabled:hover:text-ink-700 transition-colors"
      >
        {isStarting || state === "working" ? <Loader2 size={12} className="animate-spin" /> : <Server size={12} />}
        {state === "running" ? "Обновить до последнего релиза" : state === "failed" ? "Повторить" : "Создать установку"}
      </button>
      <p className="mt-1.5 text-[10px] leading-snug text-ink-400">
        Своя админка, сайт и база клиента. Письмо с доступом отправляйте, когда установка работает.
      </p>
      {error && (
        <p role="alert" className="mt-1.5 text-[10px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
