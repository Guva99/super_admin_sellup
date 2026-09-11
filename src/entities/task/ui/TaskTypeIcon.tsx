import { Phone, CheckSquare, RefreshCw, Plug, MessageSquare, Rocket } from "lucide-react";
import type { TaskType } from "../model/types";

export const TASK_TYPE_ICON = {
  call: Phone,
  task: CheckSquare,
  update: RefreshCw,
  integration: Plug,
  support: MessageSquare,
  onboarding: Rocket,
} as const;

export function TaskTypeIcon({ type, size = 9 }: { type: TaskType; size?: number }) {
  const Icon = TASK_TYPE_ICON[type];
  return <Icon size={size} />;
}
