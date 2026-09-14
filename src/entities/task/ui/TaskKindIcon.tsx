import { CheckSquare, Diamond } from "lucide-react";
import type { TaskKind } from "../model/types";
import { TASK_KIND_LABEL } from "../model/dictionaries";

/** Метка вида работы, как в Jira: синяя галочка — задача, оранжевый ромб — баг. */
export function TaskKindIcon({ kind, size = 14, className = "" }: { kind: TaskKind; size?: number; className?: string }) {
  const title = TASK_KIND_LABEL[kind];
  if (kind === "bug") {
    return <Diamond size={size} className={`text-orange-500 fill-orange-500 flex-shrink-0 ${className}`} aria-label={title} />;
  }
  return <CheckSquare size={size} className={`text-blue-500 flex-shrink-0 ${className}`} aria-label={title} />;
}
