import { createContext, useContext } from "react";

/**
 * Глобальные действия, доступные из любого места интерфейса: подключить
 * бизнес и создать задачу.
 *
 * Здесь лежит только контракт и хук. Реализацию (модалки из features)
 * подставляет `app/model/ui-actions.tsx`. Так страницы вызывают действия,
 * не импортируя слой app — импорты в FSD идут только вниз.
 */
/**
 * Что предзаполнить в форме новой задачи. Статус — строкой, а не типом из
 * entities/task: shared не знает сущностей; фича сама сверит значение.
 */
export interface CreateTaskPreset {
  clientId?: string;
  status?: string;
  assigneeId?: string;
}

export interface UiActions {
  openConnectBusiness: () => void;
  openCreateTask: (preset?: CreateTaskPreset) => void;
}

export const UiActionsContext = createContext<UiActions | null>(null);

export function useUiActions(): UiActions {
  const actions = useContext(UiActionsContext);
  if (!actions) throw new Error("useUiActions вызван вне <UiActionsProvider>");
  return actions;
}
