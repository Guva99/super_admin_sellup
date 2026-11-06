import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "@/entities/session";
import { useLogin, LoginForm } from "@/features/auth-login";
import { AuthCard } from "@/shared/ui";

/**
 * Разрешаем возвращаться только на внутренние пути: ?from=https://evil.site
 * иначе превратил бы экран входа в открытый редирект.
 */
const safeReturnPath = (from: string | null) =>
  from && from.startsWith("/") && !from.startsWith("//") && !from.startsWith("/login") ? from : "/";

/**
 * Один вход для сотрудников SellUp и для бизнесов: после входа сотрудник
 * попадает в консоль, бизнес — в свой кабинет (см. app/ui/RootApp).
 */
export default function LoginPage() {
  const { status } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("from"));
  const sessionExpired = searchParams.get("reason") === "expired";

  const controller = useLogin(() => navigate(returnTo, { replace: true }));

  if (status === "authenticated") return <Navigate to={returnTo} replace />;

  return (
    <AuthCard
      title="Вход"
      subtitle={sessionExpired ? "Сессия закончилась — войдите снова, чтобы продолжить." : "Войдите, чтобы продолжить."}
      footer={
        <>
          Нет кабинета?{" "}
          <Link to="/signup" className="text-brand-600 hover:underline">
            Зарегистрировать бизнес
          </Link>
          <span className="mx-1.5 text-ink-300">·</span>
          <Link to="/forgot-password" className="text-brand-600 hover:underline">
            Забыли пароль?
          </Link>
        </>
      }
    >
      <LoginForm controller={controller} />
    </AuthCard>
  );
}
