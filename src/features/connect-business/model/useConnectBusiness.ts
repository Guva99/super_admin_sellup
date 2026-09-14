import { useState } from "react";
import type { Client, ClientNiche, NewClientInput } from "@/entities/client";
import type { Plan } from "@/entities/plan";
import type { TemplateStage } from "@/entities/onboarding-template";
import { describeApiError, type Result } from "@/shared/api";

export interface StageDraft {
  id: string;
  title: string;
  description: string;
}

export interface ConnectBusinessDraft {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  niche: ClientNiche;
  planId: string;
  fixedPrice: boolean;
  customPrice: string;
  size: string;
  stages: StageDraft[];
}

export interface ConnectBusinessController {
  isOpen: boolean;
  draft: ConnectBusinessDraft | null;
  /** Тарифы, доступные для выбора. */
  plans: Plan[];
  /** Выбранный тариф; у тарифа с isCustom цена вводится вручную. */
  selectedPlan: Plan | undefined;
  stagesExpanded: boolean;
  isSubmitting: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  patch: (patch: Partial<ConnectBusinessDraft>) => void;
  toggleStages: () => void;
  addStage: () => void;
  removeStage: (id: string) => void;
  updateStage: (id: string, field: "title" | "description", value: string) => void;
  submit: () => Promise<void>;
}

/**
 * Состояние и правила подключения бизнеса. Этапы онбординга берутся из шаблона
 * настроек и могут быть изменены перед созданием. Сохраняет `onSubmit`
 * (стор клиентов → API); проверки здесь — для быстрого отклика, окончательно
 * решает бэкенд.
 */
export function useConnectBusiness(
  template: TemplateStage[],
  plans: Plan[],
  onSubmit: (input: NewClientInput) => Promise<Result<Client>>,
  onCreated: (client: Client) => void,
): ConnectBusinessController {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ConnectBusinessDraft | null>(null);
  const [stagesExpanded, setStagesExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Базовая цена кастомного тарифа: подставляется в поле суммы, 0 — пусто. */
  const basePriceOf = (planId: string): string => {
    const plan = plans.find((p) => p.id === planId);
    return plan?.isCustom && plan.price > 0 ? String(plan.price) : "";
  };

  const open = () => {
    setDraft({
      name: "",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      niche: "retail",
      planId: plans[0]?.id ?? "",
      fixedPrice: false,
      customPrice: basePriceOf(plans[0]?.id ?? ""),
      size: "",
      stages: template.map((stage) => ({
        id: `ns${stage.id}`,
        title: stage.title,
        description: stage.description,
      })),
    });
    setError(null);
    setIsOpen(true);
  };

  const close = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    setDraft(null);
  };

  const patch = (next: Partial<ConnectBusinessDraft>) =>
    setDraft((prev) => {
      if (!prev) return prev;
      // Сменили тариф — подставляем его базовую цену вместо суммы от прошлого.
      const customPrice = next.planId !== undefined ? basePriceOf(next.planId) : prev.customPrice;
      return { ...prev, customPrice, ...next };
    });

  const toggleStages = () => setStagesExpanded((v) => !v);

  const addStage = () =>
    patch({
      stages: [...(draft?.stages ?? []), { id: `ns${Date.now()}`, title: "", description: "" }],
    });

  const removeStage = (id: string) =>
    patch({ stages: (draft?.stages ?? []).filter((stage) => stage.id !== id) });

  const updateStage = (id: string, field: "title" | "description", value: string) =>
    patch({
      stages: (draft?.stages ?? []).map((stage) => (stage.id === id ? { ...stage, [field]: value } : stage)),
    });

  const selectedPlan = plans.find((plan) => plan.id === draft?.planId);

  const submit = async () => {
    if (!draft || isSubmitting) return;
    if (!draft.name.trim()) return setError("Укажите название бизнеса");
    if (!selectedPlan) return setError("Выберите тариф");
    const customPrice = Number(draft.customPrice);
    if (selectedPlan.isCustom && !(customPrice > 0)) return setError("Укажите сумму в месяц для кастомного тарифа");
    if (draft.stages.some((stage) => !stage.title.trim())) return setError("У каждого этапа онбординга должно быть название");

    setIsSubmitting(true);
    setError(null);
    const result = await onSubmit({
      name: draft.name.trim(),
      planId: selectedPlan.id,
      customPrice: selectedPlan.isCustom ? customPrice : undefined,
      ownerName: draft.ownerName.trim(),
      ownerPhone: draft.ownerPhone.trim(),
      ownerEmail: draft.ownerEmail.trim(),
      niche: draft.niche,
      size: draft.size.trim(),
      fixedPrice: selectedPlan.isCustom ? false : draft.fixedPrice,
      stages: draft.stages.map((stage) => ({
        title: stage.title.trim(),
        description: stage.description.trim(),
      })),
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    setIsOpen(false);
    setDraft(null);
    onCreated(result.data);
  };

  return {
    isOpen,
    draft,
    plans,
    selectedPlan,
    stagesExpanded,
    isSubmitting,
    error,
    open,
    close,
    patch,
    toggleStages,
    addStage,
    removeStage,
    updateStage,
    submit,
  };
}
