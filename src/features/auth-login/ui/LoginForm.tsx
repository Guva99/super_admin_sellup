import { AlertCircle, Loader2 } from "lucide-react";
import type { LoginController } from "../model/useLogin";

export function LoginForm({ controller }: { controller: LoginController }) {
  const { email, password, isSubmitting, error, setEmail, setPassword, submit } = controller;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-4"
      noValidate
    >
      <div>
        <label htmlFor="login-email" className="text-xs font-medium text-slate-600 block mb-1.5">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@sellup.ru"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-slate-300"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="text-xs font-medium text-slate-600 block mb-1.5">
          Пароль
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors"
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
        {isSubmitting ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
