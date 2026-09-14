import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { createDefaultTemplate, type TemplateStage } from "./types";

/**
 * Шаблон этапов онбординга: редактируется в «Настройках», подставляется при
 * подключении нового бизнеса. Отдельный стор, потому что это отдельная
 * сущность — менять его может страница, к клиентам отношения не имеющая.
 */
export interface OnboardingTemplateStore {
  template: TemplateStage[];
  setTemplate: (template: TemplateStage[]) => void;
}

const OnboardingTemplateContext = createContext<OnboardingTemplateStore | null>(null);

export function OnboardingTemplateProvider({ children }: { children: ReactNode }) {
  const [template, setTemplate] = useState<TemplateStage[]>(createDefaultTemplate);
  const value = useMemo<OnboardingTemplateStore>(() => ({ template, setTemplate }), [template]);
  return <OnboardingTemplateContext.Provider value={value}>{children}</OnboardingTemplateContext.Provider>;
}

export function useOnboardingTemplate(): OnboardingTemplateStore {
  const store = useContext(OnboardingTemplateContext);
  if (!store) throw new Error("useOnboardingTemplate вызван вне <OnboardingTemplateProvider>");
  return store;
}
