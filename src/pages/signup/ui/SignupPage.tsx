import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "@/entities/session";
import { SignupForm, useSignup } from "@/features/auth-signup";
import { AuthCard } from "@/shared/ui";

/**
 * Регистрация бизнеса. Сюда ведут кнопки лендинга, тариф приходит в
 * ?plan=start|business|pro. После регистрации — сразу в кабинет.
 */
export default function SignupPage() {
  const { status } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const controller = useSignup(searchParams.get("plan"), () => navigate("/", { replace: true }));

  if (status === "authenticated") return <Navigate to="/" replace />;

  return (
    <AuthCard
      wide
      title="Кабинет вашего бизнеса"
      subtitle="Выберите тариф и адрес — менеджер свяжется, чтобы обсудить запуск."
      footer={
        <>
          Уже есть кабинет?{" "}
          <Link to="/login" className="text-brand-600 hover:underline">
            Войти
          </Link>
        </>
      }
    >
      <SignupForm controller={controller} />
    </AuthCard>
  );
}
