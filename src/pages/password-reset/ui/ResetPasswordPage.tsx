import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { sessionApi, useSession } from "@/entities/session";
import { describeApiError } from "@/shared/api";
import { AuthCard } from "@/shared/ui";

const INPUT =
  "w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-ink-300";

/** Новый пароль по ссылке из письма. Все сессии пользователя после этого закрываются. */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { status, logout } = useSession();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if ([...password].length < 8) return setError("Пароль — не короче 8 символов");
    if (password !== repeat) return setError("Пароли не совпадают");
    setIsSubmitting(true);
    setError(null);
    const result = await sessionApi.resetPassword(token, password);
    setIsSubmitting(false);
    if (!result.ok) return setError(describeApiError(result.error));
    // Сервер закрыл все сессии — и эту вкладку тоже.
    if (status === "authenticated") logout();
    setDone(true);
  };

  if (!token) {
    return (
      <AuthCard title="Ссылка неполная" subtitle="Откройте ссылку из письма целиком или запросите новую.">
        <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline">
          Запросить новую ссылку
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Новый пароль" subtitle={done ? undefined : "Придумайте пароль не короче 8 символов."}>
      {done ? (
        <div className="space-y-4">
          <p className="flex gap-2 text-sm text-ink-700">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            Пароль изменён. Войдите с новым паролем.
          </p>
          <Link
            to="/login"
            className="block text-center w-full py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold"
          >
            Войти
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="space-y-4"
          noValidate
        >
          <input
            type="password"
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Новый пароль"
            aria-label="Новый пароль"
            className={INPUT}
          />
          <input
            type="password"
            autoComplete="new-password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            placeholder="Повторите пароль"
            aria-label="Повторите пароль"
            className={INPUT}
          />
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
            Сохранить пароль
          </button>
        </form>
      )}
    </AuthCard>
  );
}
