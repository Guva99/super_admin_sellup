import { CheckCircle2, Circle } from "lucide-react";
import type { OnboardingStep } from "../model/types";

export function StepBadge({ status }: { status: OnboardingStep["status"] }) {
  if (status === "done") return <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />;
  if (status === "in_progress") return <Circle size={15} className="text-brand-500 flex-shrink-0" />;
  return <Circle size={15} className="text-slate-300 flex-shrink-0" />;
}
