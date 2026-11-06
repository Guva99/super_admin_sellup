import { AlertCircle, Check, Loader2 } from "lucide-react";
import { formatAmount } from "@/shared/lib";
import type { SignupController, SlugState } from "../model/useSignup";

const INPUT =
  "w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-ink-300";
const LABEL = "text-xs font-medium text-ink-600 block mb-1.5";

export function SignupForm({ controller }: { controller: SignupController }) {
  const { fields, plans, plansError, slugState, isSubmitting, error, set, submit } = controller;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-4"
      noValidate
    >
      <fieldset>
        <legend className={LABEL}>Тариф</legend>
        {plansError && <p className="text-xs text-red-600">{plansError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {plans.map((plan) => {
            const selected = plan.code === fields.planCode;
            return (
              <label
                key={plan.code}
                className={`relative cursor-pointer rounded-xl border p-3 transition-colors ${
                  selected ? "border-brand-500 bg-brand-50" : "border-ink-200 hover:border-ink-300"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.code}
                  checked={selected}
                  onChange={() => set("planCode", plan.code)}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold text-ink-900">{plan.name}</span>
                <span className="block text-xs text-ink-500 mt-0.5 min-h-[2rem]">{plan.description}</span>
                <span className="block text-sm font-semibold text-ink-900 mt-2">{formatAmount(plan.price)} / мес</span>
                <span className="block text-[11px] text-ink-500">
                  Подключение: {plan.setupOnRequest ? "индивидуально" : formatAmount(plan.setupPrice)}
                </span>
                {selected && <Check size={14} className="absolute top-3 right-3 text-brand-500" />}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="signup-company" className={LABEL}>
          Название бизнеса
        </label>
        <input
          id="signup-company"
          autoComplete="organization"
          value={fields.companyName}
          onChange={(e) => set("companyName", e.target.value)}
          placeholder="Например, Кофейня «Зерно»"
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="signup-slug" className={LABEL}>
          Адрес вашего магазина
        </label>
        <div className="flex items-center border border-ink-200 rounded-lg focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-50 transition-colors overflow-hidden">
          <input
            id="signup-slug"
            value={fields.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="zerno"
            spellCheck={false}
            autoCapitalize="none"
            className="flex-1 min-w-0 px-3 py-2 text-sm outline-none placeholder:text-ink-300"
          />
          <span className="px-3 py-2 text-sm text-ink-400 bg-ink-50 border-l border-ink-200 whitespace-nowrap">.sellup-system.online</span>
        </div>
        <SlugHint state={slugState} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="signup-name" className={LABEL}>
            Ваше имя
          </label>
          <input
            id="signup-name"
            autoComplete="name"
            value={fields.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="signup-phone" className={LABEL}>
            Телефон <span className="text-ink-400 font-normal">— необязательно</span>
          </label>
          <input
            id="signup-phone"
            type="tel"
            autoComplete="tel"
            value={fields.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+7 900 000-00-00"
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label htmlFor="signup-email" className={LABEL}>
          Email — для входа
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@company.ru"
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="signup-password" className={LABEL}>
          Пароль
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={fields.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder="Не короче 8 символов"
          className={INPUT}
        />
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
          <AlertCircle size={13} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        {isSubmitting ? "Создаём кабинет…" : "Создать кабинет"}
      </button>
      <p className="text-[11px] text-ink-400 text-center">
        Бесплатно и ни к чему не обязывает: оплата — только после согласования запуска с менеджером.
      </p>
    </form>
  );
}

function SlugHint({ state }: { state: SlugState }) {
  switch (state.kind) {
    case "checking":
      return <p className="text-[11px] text-ink-400 mt-1">Проверяем…</p>;
    case "free":
      return (
        <p className="text-[11px] text-emerald-600 mt-1">
          Свободен: магазин — {state.storefrontHost}, админка — {state.adminHost}
        </p>
      );
    case "taken":
      return <p className="text-[11px] text-red-600 mt-1">Этот адрес уже занят</p>;
    case "reserved":
      return <p className="text-[11px] text-red-600 mt-1">Этот адрес зарезервирован</p>;
    case "invalid":
      return <p className="text-[11px] text-red-600 mt-1">От 3 до 30 латинских букв, цифр или дефисов</p>;
    default:
      return <p className="text-[11px] text-ink-400 mt-1">Латиница, цифры и дефис. Потом можно подключить свой домен.</p>;
  }
}
