import { useState } from "react";
import { useDraft } from "@/shared/lib";
import { usePlans, type Plan, type PlanInput } from "@/entities/plan";
import { describeApiError } from "@/shared/api";

export interface PlanDraft {
  name: string;
  description: string;
  price: string;
  setupPrice: string;
  isCustom: boolean;
}

export interface PlanFormController {
  isOpen: boolean;
  /** Форма изменена, но не сохранена. */
  isDirty: boolean;
  restored: boolean;
  /** Редактируемый тариф; null — создаётся новый. */
  editing: Plan | null;
  draft: PlanDraft;
  isSubmitting: boolean;
  error: string | null;
  openCreate: () => void;
  openEdit: (plan: Plan) => void;
  close: () => void;
  patch: (patch: Partial<PlanDraft>) => void;
  submit: () => Promise<void>;
}

const emptyDraft = (): PlanDraft => ({
  name: "",
  description: "",
  price: "",
  setupPrice: "0",
  isCustom: false,
});

/**
 * Создание и редактирование тарифа. Новая цена действует только для клиентов,
 * которых подключат после сохранения — у подключённых цена зафиксирована.
 */
export function usePlanForm(): PlanFormController {
  const { createPlan, updatePlan } = usePlans();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [draft, setDraft] = useState<PlanDraft>(emptyDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDraft(emptyDraft());
    setError(null);
    setIsOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setDraft({
      name: plan.name,
      description: plan.description,
      price: String(plan.price),
      setupPrice: String(plan.setupPrice),
      isCustom: plan.isCustom,
    });
    setError(null);
    setIsOpen(true);
  };

  // Черновик отдельно у каждого тарифа и отдельно у нового.
  const draftKey = isOpen ? `plan:${editing?.id ?? "new"}` : null;
  const saved: PlanDraft = editing
    ? { name: editing.name, description: editing.description, price: String(editing.price), setupPrice: String(editing.setupPrice), isCustom: editing.isCustom }
    : emptyDraft();
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const { restored, clear: forgetDraft } = useDraft<PlanDraft>({
    key: draftKey,
    value: draft,
    restore: setDraft,
    isEmpty: (value) => JSON.stringify(value) === JSON.stringify(saved),
  });

  const close = () => {
    if (!isSubmitting) setIsOpen(false);
  };

  const patch = (next: Partial<PlanDraft>) => setDraft((prev) => ({ ...prev, ...next }));

  const submit = async () => {
    if (isSubmitting) return;
    // У кастомного тарифа цена — базовая: она подставляется при подключении
    // бизнеса и там же меняется под клиента. Пустая базовая цена — это 0.
    const price = draft.price.trim() === "" && draft.isCustom ? 0 : Number(draft.price);
    const setupPrice = Number(draft.setupPrice || 0);
    if (!draft.name.trim()) return setError("Укажите название тарифа");
    if (!Number.isFinite(price) || price < 0 || (!draft.isCustom && draft.price.trim() === "")) {
      return setError("Укажите цену в месяц — число не меньше 0");
    }
    if (!Number.isFinite(setupPrice) || setupPrice < 0) return setError("Разовая оплата — число не меньше 0");

    const input: PlanInput = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      price,
      setupPrice,
      isCustom: draft.isCustom,
    };

    setIsSubmitting(true);
    setError(null);
    const result = editing ? await updatePlan(editing.id, input) : await createPlan(input);
    setIsSubmitting(false);

    if (result.ok) {
      forgetDraft();
      setIsOpen(false);
    }
    else setError(describeApiError(result.error));
  };

  return {
    isOpen,
    isDirty,
    restored,
    editing,
    draft,
    isSubmitting,
    error,
    openCreate,
    openEdit,
    close,
    patch,
    submit,
  };
}
