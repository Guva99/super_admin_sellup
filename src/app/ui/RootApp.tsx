import { lazy, Suspense } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isClientUser, useSession } from "@/entities/session";
import { AuthenticatedApp } from "./AuthenticatedApp";

const CabinetPage = lazy(() => import("@/pages/cabinet").then((m) => ({ default: m.CabinetPage })));

/**
 * Кто вошёл — то и показываем. Сотрудник SellUp получает консоль со всеми
 * разделами, человек бизнеса — свой кабинет: у него нет разделов консоли,
 * и их адреса уводят его на главную кабинета. Доступ всё равно решает
 * бэкенд: токен бизнеса консольные ручки не пускают.
 */
export function RootApp() {
  const { status, user } = useSession();
  const location = useLocation();

  if (status === "authenticated" && isClientUser(user)) {
    if (location.pathname !== "/") return <Navigate to="/" replace />;
    return (
      <Suspense fallback={null}>
        <CabinetPage />
      </Suspense>
    );
  }
  return <AuthenticatedApp />;
}
