import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { sessionApi } from "@/entities/session";
import { describeApiError } from "@/shared/api";
import { AuthCard } from "@/shared/ui";

const INPUT =
  "w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-ink-300";

/** Восстановление пароля кабинета: письмо со ссылкой на /reset-password. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Укажите корректный email");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const result = await sessionApi.forgotPassword(email.trim());
    setIsSubmitting(false);
    if (result.ok) setSent(true);
    else setError(describeApiError(result.error));
  };

  return (
    <AuthCard
      title="Восстановление пароля"
      subtitle={sent ? undefined : "Пришлём ссылку, по которой можно задать новый пароль."}
      footer={
        <Link to="/login" className="text-brand-600 hover:underline">
          Вернуться ко входу
        </Link>
      }
    >
      {sent ? (
        <div className="flex gap-3 text-sm text-ink-700">
          <MailCheck size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <p>
            Если у <b>{email.trim()}</b> есть кабинет, письмо уже в пути. Ссылка действует 1 час. Не пришло — проверьте «Спам».
          </p>
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
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.ru"
            aria-label="Email"
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
            Прислать ссылку
          </button>
        </form>
      )}
    </AuthCard>
  );
}
