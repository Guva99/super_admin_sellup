import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { sessionApi, useSession } from "@/entities/session";
import { describeApiError } from "@/shared/api";
import { AuthCard } from "@/shared/ui";

/** Подтверждение почты по ссылке из письма — работает и без входа. */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { status, markEmailVerified } = useSession();
  const [state, setState] = useState<{ kind: "pending" } | { kind: "done" } | { kind: "error"; message: string }>(
    token ? { kind: "pending" } : { kind: "error", message: "Ссылка неполная — откройте её из письма целиком." },
  );
  // StrictMode в разработке монтирует эффект дважды, а ссылка одноразовая.
  const sentRef = useRef(false);

  useEffect(() => {
    if (!token || sentRef.current) return;
    sentRef.current = true;
    sessionApi.verifyEmail(token).then((result) => {
      if (result.ok) {
        markEmailVerified();
        setState({ kind: "done" });
      } else {
        setState({ kind: "error", message: describeApiError(result.error) });
      }
    });
  }, [token, markEmailVerified]);

  const next = status === "authenticated" ? { to: "/", label: "Перейти в кабинет" } : { to: "/login", label: "Войти" };

  return (
    <AuthCard title="Подтверждение почты">
      {state.kind === "pending" && (
        <p className="flex items-center gap-2 text-sm text-ink-600">
          <Loader2 size={16} className="animate-spin" /> Проверяем ссылку…
        </p>
      )}
      {state.kind === "done" && (
        <p className="flex gap-2 text-sm text-ink-700">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" /> Почта подтверждена.
        </p>
      )}
      {state.kind === "error" && (
        <p className="flex gap-2 text-sm text-ink-700">
          <XCircle size={18} className="text-red-500 flex-shrink-0" /> {state.message}
        </p>
      )}
      {state.kind !== "pending" && (
        <Link
          to={next.to}
          className="mt-5 block text-center w-full py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold"
        >
          {next.label}
        </Link>
      )}
    </AuthCard>
  );
}
