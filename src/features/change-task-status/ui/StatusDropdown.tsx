import { ChevronDown } from "lucide-react";
import { TASK_COLUMNS, TASK_STATUS_CLASS, TASK_STATUS_LABEL, type TaskStatus } from "@/entities/task";
import { Dropdown, DropdownItem } from "@/shared/ui";

interface StatusDropdownProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

/**
 * Кнопка-статус, как в Jira: клик открывает список колонок. Управляемая —
 * в карточке ведёт на сервер, в форме новой задачи меняет черновик.
 */
export function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  return (
    <Dropdown
      trigger={(open) => (
        <button
          type="button"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${TASK_STATUS_CLASS[value]} ${open ? "ring-2 ring-brand-100" : "hover:brightness-95"}`}
        >
          {TASK_STATUS_LABEL[value]}
          <ChevronDown size={12} />
        </button>
      )}
    >
      {(close) =>
        TASK_COLUMNS.map((column) => (
          <DropdownItem
            key={column.id}
            active={column.id === value}
            onSelect={() => {
              onChange(column.id);
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
