import { Navigate, useLocation } from "react-router-dom";

import { useSession, type SessionEndReason } from "@/entities/session";
import { ClientsProvider } from "@/entities/client";
import { PlansProvider } from "@/entities/plan";
import { UsersProvider } from "@/entities/user";
import { TasksProvider } from "@/entities/task";
import { OnboardingTemplateProvider } from "@/entities/onboarding-template";
import { AppLayout } from "./AppLayout";

/**
 * Всё, что видит только вошедший пользователь. Без сессии — на /login.
 *
 * Сторы данных смонтированы здесь, а не в App.tsx: при выходе они
 * размонтируются, и данные одного пользователя не остаются в памяти для
 * следующего.
 */
export function AuthenticatedApp() {
  const { status, endReason } = useSession();
  const location = useLocation();

  if (status === "anonymous") {
    return <Navigate to={loginPath(endReason, location.pathname + location.search)} replace />;
  }

  return (
    <ClientsProvider>
      <PlansProvider>
        <UsersProvider>
          <TasksProvider>
            <OnboardingTemplateProvider>
              <AppLayout />
            </OnboardingTemplateProvider>
          </TasksProvider>
        </UsersProvider>
      </PlansProvider>
    </ClientsProvider>
  );
}

/**
 * Вышел сам — на чистый /login. Сессия протухла или её не было — запоминаем,
 * куда шёл пользователь, чтобы вернуть его туда после входа.
 */
function loginPath(reason: SessionEndReason, currentPath: string): string {
  if (reason === "logout") return "/login";
  const params = new URLSearchParams();
  if (currentPath !== "/") params.set("from", currentPath);
  if (reason === "expired") params.set("reason", "expired");
  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}
