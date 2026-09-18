import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, Equal } from "lucide-react";
import type { TaskPriority } from "../model/types";
import { TASK_PRIORITY_COLOR, TASK_PRIORITY_LABEL } from "../model/dictionaries";

const ICON = {
  highest: ChevronsUp,
  high: ChevronUp,
  medium: Equal,
  low: ChevronDown,
  lowest: ChevronsDown,
} as const;

/**
 * Критичность стрелкой, как в Jira: вверх — срочно, равно — обычно, вниз —
 * подождёт. Стрелка читается и без цвета, поэтому заменила цветную точку.
 */
export function TaskPriorityIcon({ priority, size = 13, className = "" }: { priority: TaskPriority; size?: number; className?: string }) {
  const Icon = ICON[priority];
  return (
    <Icon
      size={size}
      strokeWidth={2.5}
      className={`${TASK_PRIORITY_COLOR[priority]} flex-shrink-0 ${className}`}
      aria-label={`Приоритет: ${TASK_PRIORITY_LABEL[priority]}`}
    />
  );
}
