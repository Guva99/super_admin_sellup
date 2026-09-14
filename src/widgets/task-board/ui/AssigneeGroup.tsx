import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { UserAvatar } from "@/shared/ui";
import type { TaskGroup } from "@/features/group-tasks";

interface AssigneeGroupProps {
  group: TaskGroup;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** Секция доски: шеврон, аватар, имя, счётчик; внутри — колонки. */
export function AssigneeGroup({ group, collapsed, onToggle, children }: AssigneeGroupProps) {
  return (
    <section className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="w-full flex items-center gap-2.5 px-5 py-3 text-left hover:bg-slate-100/60 transition-colors"
      >
        <ChevronDown size={15} className={`text-slate-400 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
        <UserAvatar name={group.assignee?.name ?? ""} size="md" />
        <span className="text-sm font-semibold text-slate-800">{group.title}</span>
        <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-200 text-slate-600 rounded-full">{group.tasks.length}</span>
      </button>
      {!collapsed && children}
    </section>
  );
}
