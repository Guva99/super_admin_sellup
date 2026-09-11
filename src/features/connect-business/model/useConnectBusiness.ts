import { useState } from "react";
import type { Client, ClientNiche, ClientPlan, OnboardingStep } from "@/entities/client";
import type { TemplateStage } from "@/entities/onboarding-template";
import { MANAGERS } from "@/shared/api/mock";
import { todayIso } from "@/shared/lib";

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
  plan: ClientPlan;
  fixedPrice: boolean;
  customPrice: string;
  size: string;
  stages: StageDraft[];
}

/** Палитра аватаров: новый клиент получает следующий цвет по кругу. */
const CLIENT_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ec4899", "#0ea5e9", "#f97316", "#84cc16", "#14b8a6",
];

const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "НК";

export interface ConnectBusinessController {
  isOpen: boolean;
  draft: ConnectBusinessDraft | null;
  stagesExpanded: boolean;
  open: () => void;
  close: () => void;
  patch: (patch: Partial<ConnectBusinessDraft>) => void;
  toggleStages: () => void;
  addStage: () => void;
  removeStage: (id: string) => void;
  updateStage: (id: string, field: "title" | "description", value: string) => void;
  submit: () => void;
}

/**
 * Состояние и правила подключения бизнеса.
 * Этапы онбординга берутся из шаблона настроек и могут быть изменены перед созданием.
 */
export function useConnectBusiness(
  template: TemplateStage[],
  clientCount: number,
  onCreated: (client: Client) => void,
): ConnectBusinessController {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ConnectBusinessDraft | null>(null);
  const [stagesExpanded, setStagesExpanded] = useState(true);

  const open = () => {
    setDraft({
      name: "",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      niche: "retail",
      plan: "full",
      fixedPrice: false,
      customPrice: "",
      size: "",
      stages: template.map((stage) => ({
        id: `ns${stage.id}`,
        title: stage.title,
        description: stage.description,
      })),
    });
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setDraft(null);
  };

  const patch = (next: Partial<ConnectBusinessDraft>) =>
    setDraft((prev) => (prev ? { ...prev, ...next } : prev));

  const toggleStages = () => setStagesExpanded((v) => !v);

  const addStage = () =>
    patch({ stages: [...(draft?.stages ?? []), { id: `ns${Date.now()}`, title: "", description: "" }] });

  const removeStage = (id: string) =>
    patch({ stages: (draft?.stages ?? []).filter((stage) => stage.id !== id) });

  const updateStage = (id: string, field: "title" | "description", value: string) =>
    patch({
      stages: (draft?.stages ?? []).map((stage) => (stage.id === id ? { ...stage, [field]: value } : stage)),
    });

  const submit = () => {
    if (!draft || !draft.name.trim()) return;

    const steps: OnboardingStep[] = draft.stages.map((stage, index) => ({
      id: `step_${Date.now()}_${index}`,
      title: stage.title,
      description: stage.description,
      status: "pending",
      assignee: MANAGERS[0],
      hoursSpent: 0,
      dueDate: "",
    }));

    onCreated({
      id: `c${Date.now()}`,
      name: draft.name.trim(),
      initials: initials(draft.name.trim()),
      color: CLIENT_COLORS[clientCount % CLIENT_COLORS.length],
      niche: draft.niche,
      plan: draft.plan,
      fixedPrice: draft.fixedPrice,
      status: "lead",
      stage: "lead",
      mrr: draft.plan === "custom" && draft.customPrice ? parseInt(draft.customPrice, 10) : 0,
      healthScore: 0,
      health: { activity: 0, integrations: 0, payments: 0, support: 0 },
      connectedAt: todayIso(),
      hoursThisMonth: 0,
      manager: MANAGERS[0],
      owner: { name: draft.ownerName, email: draft.ownerEmail, phone: draft.ownerPhone },
      size: draft.size,
      nextAction: "Провести демо",
      daysInStatus: 0,
      notes: "",
      integrations: [],
      onboardingSteps: steps,
      payments: [],
    });

    close();
  };

  return { isOpen, draft, stagesExpanded, open, close, patch, toggleStages, addStage, removeStage, updateStage, submit };
}
