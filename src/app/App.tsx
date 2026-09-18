import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import { SessionProvider } from "@/entities/session";
import { purgeOldDrafts } from "@/shared/lib";

import { router } from "./routes";

/**
 * Корень приложения — сессия и роутер.
 *
 * Сторы данных (клиенты, задачи, шаблон онбординга) смонтированы не здесь, а
 * в AuthenticatedApp: они существуют только пока пользователь вошёл и
 * сбрасываются при выходе. Этот файл не нужно трогать при добавлении раздела
 * или операции.
 */
export default function App() {
  // Черновики форм копятся в браузере; недельной давности уже никому не нужны.
  useEffect(() => {
    purgeOldDrafts();
  }, []);

  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  );
}
