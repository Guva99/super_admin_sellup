import { ChevronDown } from "lucide-react";
import { TASK_COLUMNS, TASK_STATUS_CLASS, TASK_STATUS_LABEL, type Task } from "@/entities/task";
import { Dropdown, DropdownItem } from "@/shared/ui";
import { useChangeTaskStatus } from "../model/useChangeTaskStatus";

/** Кнопка-статус, как в Jira: клик открывает список колонок. */
export function StatusDropdown({ task }: { task: Task }) {
  const { change } = useChangeTaskStatus();
  return (
    <Dropdown
      trigger={(open) => (
        <button
          type="button"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${TASK_STATUS_CLASS[task.status]} ${open ? "ring-2 ring-brand-100" : "hover:brightness-95"}`}
        >
          {TASK_STATUS_LABEL[task.status]}
          <ChevronDown size={12} />
        </button>
      )}
    >
      {(close) =>
        TASK_COLUMNS.map((column) => (
          <DropdownItem
            key={column.id}
            active={column.id === task.status}
            onSelect={() => {
              change(task.id, column.id);
              close();
            }}
          >
            <span className={`w-2 h-2 rounded-full ${column.accent}`} />
            {column.label}
          </DropdownItem>
        ))
      }
    </Dropdown>
  );
}
