import { AlertCircle, CheckCircle2, Circle, CircleDot, ExternalLink, Loader2, LogOut, Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cabinetApi, useCabinet, type CabinetOverview, type CabinetStage, type CabinetStep } from "@/entities/cabinet";
import { useSession } from "@/entities/session";
import { describeApiError } from "@/shared/api";
import { formatAmount } from "@/shared/lib";

/** Что сейчас происходит с бизнесом — по колонке воронки у команды SellUp. */
const STAGE_TEXT: Record<CabinetStage, { title: string; text: string }> = {
  LEAD: {
    title: "Заявка получена",
    text: "Менеджер свяжется с вами в течение рабочего дня, чтобы разобраться в задачах и показать систему.",
  },
  DEMO: { title: "Демо проведено", text: "Согласуем план запуска и подготовим договор." },
  CONTRACT: { title: "Готовим договор", text: "После подписания и оплаты подключения начнём настройку." },
  ONBOARDING: { title: "Настраиваем систему", text: "Подключаем интеграции и наполняем магазин. Ход работ — ниже." },
  ACTIVE: { title: "Система запущена", text: "Магазин и админка работают." },
};

/**
 * Кабинет бизнеса: что с подключением, какой тариф, где магазин и админка.
 * Сам по себе экран — без меню консоли: у бизнеса нет её разделов.
 */
export default function CabinetPage() {
  const { overview, isLoading, error, reload } = useCabinet();
  const { user, logout } = useSession();

  return (
    <div className="min-h-full bg-ink-50">
      <header className="bg-surface border-b border-ink-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <CircleDot size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-ink-900 truncate">{overview?.company.name ?? "SellUp"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-ink-500 truncate max-w-[220px]">{user?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-900 px-2 py-1.5 rounded-lg hover:bg-ink-50"
            >
              <LogOut size={14} /> Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {isLoading && !overview && (
          <p className="flex items-center gap-2 text-sm text-ink-500">
            <Loader2 size={16} className="animate-spin" /> Загружаем кабинет…
          </p>
        )}
        {error && !overview && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={reload} className="flex items-center gap-1 text-xs font-medium hover:underline">
              <RefreshCw size={12} /> Повторить
            </button>
          </div>
        )}
        {overview && <Overview overview={overview} />}
      </main>
    </div>
  );
}

function Overview({ overview }: { overview: CabinetOverview }) {
  const { company, plan, onboardingSteps, addresses, user } = overview;
  const stage = STAGE_TEXT[company.stage] ?? STAGE_TEXT.LEAD;
  const launched = company.stage === "ACTIVE";

  return (
    <>
      {!user.emailVerifiedAt && <VerifyEmailBanner email={user.email} />}

      <section className="bg-surface rounded-2xl border border-ink-200 p-5">
        <p className="text-xs text-ink-500">Статус подключения</p>
        <h1 className="text-lg font-semibold text-ink-900 mt-0.5">{stage.title}</h1>
        <p className="text-sm text-ink-600 mt-1">{stage.text}</p>

        {addresses && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <AddressLink label="Магазин" href={addresses.storefront} enabled={launched} />
            <AddressLink label="Админка" href={addresses.admin} enabled={launched} />
          </div>
        )}
        {addresses && !launched && (
          <p className="text-[11px] text-ink-400 mt-2">Адреса закреплены за вами и откроются после запуска.</p>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="md:col-span-2 bg-surface rounded-2xl border border-ink-200 p-5">
          <h2 className="text-sm font-semibold text-ink-900 mb-3">Ход подключения</h2>
          {onboardingSteps.length === 0 ? (
            <p className="text-sm text-ink-500">Этапы появятся, когда менеджер составит план запуска.</p>
          ) : (
            <ol className="space-y-3">
              {onboardingSteps.map((step, i) => (
                <StepRow key={i} step={step} />
              ))}
            </ol>
          )}
        </section>

        <section className="bg-surface rounded-2xl border border-ink-200 p-5">
          <h2 className="text-sm font-semibold text-ink-900 mb-3">Тариф</h2>
          {plan ? (
            <>
              <p className="text-base font-semibold text-ink-900">{plan.name}</p>
              {plan.monthlyPrice != null && <p className="text-sm text-ink-600">{formatAmount(plan.monthlyPrice)} в месяц</p>}
              <p className="text-[11px] text-ink-400 mt-3">
                Первый счёт выставим после согласования запуска. Сменить тариф можно через менеджера.
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-500">Тариф подберём вместе с менеджером.</p>
          )}
        </section>
      </div>

      <section className="bg-surface rounded-2xl border border-ink-200 p-5">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Компания</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Field label="Название" value={company.name} />
          <Field label="Владелец" value={user.fullName} />
          <Field label="Email" value={user.email} />
          <Field label="Телефон" value={user.phone || company.phone || "—"} />
        </dl>
      </section>
    </>
  );
}

function AddressLink({ label, href, enabled }: { label: string; href: string; enabled: boolean }) {
  const host = href.replace(/^https?:\/\//, "");
  const body = (
    <>
      <span className="text-xs text-ink-500 block">{label}</span>
      <span className="text-sm font-medium text-ink-900 break-all">{host}</span>
    </>
  );
  if (!enabled) return <div className="rounded-xl border border-dashed border-ink-200 px-3 py-2.5 opacity-70">{body}</div>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl border border-ink-200 hover:border-brand-400 px-3 py-2.5 flex items-center justify-between gap-2 transition-colors"
    >
      <span>{body}</span>
      <ExternalLink size={14} className="text-ink-400 flex-shrink-0" />
    </a>
  );
}

function StepRow({ step }: { step: CabinetStep }) {
  const icon =
    step.status === "DONE" ? (
      <CheckCircle2 size={16} className="text-emerald-600" />
    ) : step.status === "IN_PROGRESS" ? (
      <Loader2 size={16} className="text-brand-500" />
    ) : (
      <Circle size={16} className="text-ink-300" />
    );
  const note =
    step.status === "DONE" && step.completedAt
      ? `готово ${new Date(step.completedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}`
      : step.status === "IN_PROGRESS"
        ? "в работе"
        : "впереди";
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className={`text-sm ${step.status === "PENDING" ? "text-ink-500" : "text-ink-900"}`}>
          {step.title} <span className="text-[11px] text-ink-400 ml-1">{note}</span>
        </p>
        {step.description && <p className="text-xs text-ink-500 mt-0.5 whitespace-pre-line">{step.description}</p>}
      </div>
    </li>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="text-ink-900 break-words">{value}</dd>
    </div>
  );
}

function VerifyEmailBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | string>("idle");
  const resend = async () => {
    setState("sending");
    const result = await cabinetApi.resendVerification();
    setState(result.ok ? "sent" : describeApiError(result.error));
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
      <Mail size={16} className="flex-shrink-0" />
      <p className="flex-1">
        Подтвердите почту <b>{email}</b> — мы отправили письмо со ссылкой.
        {state !== "idle" && state !== "sending" && state !== "sent" && <span className="block text-xs text-red-600">{state}</span>}
      </p>
      <button
        type="button"
        onClick={resend}
        disabled={state === "sending" || state === "sent"}
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface border border-amber-200 hover:bg-amber-100 disabled:opacity-60 whitespace-nowrap"
      >
        {state === "sent" ? "Отправили ещё раз" : state === "sending" ? "Отправляем…" : "Отправить ещё раз"}
      </button>
    </div>
  );
}
