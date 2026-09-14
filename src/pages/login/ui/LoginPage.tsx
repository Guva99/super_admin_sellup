import { CircleDot } from "lucide-react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "@/entities/session";
import { useLogin, LoginForm } from "@/features/auth-login";

/**
 * Разрешаем возвращаться только на внутренние пути: ?from=https://evil.site
 * иначе превратил бы экран входа в открытый редирект.
 */
const safeReturnPath = (from: string | null) =>
  from && from.startsWith("/") && !from.startsWith("//") && !from.startsWith("/login") ? from : "/";

export default function LoginPage() {
  const { status } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("from"));
  const sessionExpired = searchParams.get("reason") === "expired";

  const controller = useLogin(() => navigate(returnTo, { replace: true }));

  if (status === "authenticated") return <Navigate to={returnTo} replace />;

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-[360px]">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <CircleDot size={16} className="text-white" />
          </div>
          <span className="text-base font-semibold text-slate-900">SellUp Console</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h1 className="text-sm font-semibold text-slate-900">Вход в консоль</h1>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            {sessionExpired ? "Сессия закончилась — войдите снова, чтобы продолжить." : "Войдите, чтобы продолжить."}
          </p>
          <LoginForm controller={controller} />
        </div>
      </div>
    </div>
  );
}
