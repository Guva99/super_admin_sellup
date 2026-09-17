import { useState } from "react";
import { Check, UserX } from "lucide-react";
import type { TaskPerson } from "@/entities/task";
import type { User } from "@/entities/user";
import { Dropdown, DropdownItem, UserAvatar } from "@/shared/ui";
import { useChangeTaskAssignee } from "../model/useChangeTaskAssignee";

interface AssigneePickerProps {
  value: TaskPerson | null;
  onChange: (user: User | null) => void;
}

/**
 * Аватар + имя; клик открывает поиск по сотрудникам. Ниже — «Назначить на
 * себя». Управляемый: в карточке сохраняет на сервер, в форме новой задачи
 * меняет черновик.
 */
export function AssigneePicker({ value, onChange }: AssigneePickerProps) {
  const { users, me } = useChangeTaskAssignee();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matched = needle ? users.filter((u) => u.fullName.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle)) : users;
  const isMine = value?.id === me?.id;

  return (
    <div>
      <Dropdown
        panelClassName="w-64"
        trigger={() => (
          <button type="button" className="flex items-center gap-2 px-1.5 py-1 -mx-1.5 rounded-md hover:bg-slate-100 transition-colors text-left">
            <UserAvatar name={value?.name ?? ""} size="sm" />
            <span className={`text-xs ${value ? "text-slate-800 font-medium" : "text-slate-400"}`}>{value?.name ?? "Не назначен"}</span>
          </button>
        )}
      >
        {(close) => (
          <div>
            <div className="p-2 border-b border-slate-100">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Найти сотрудника…"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md outline-none focus:border-brand-400"
              />
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              <DropdownItem
                active={!value}
                onSelect={() => {
                  onChange(null);
                  close();
                }}
              >
                <UserX size={14} className="text-slate-400" />
                Не назначен
              </DropdownItem>
              {matched.map((user) => (
                <DropdownItem
                  key={user.id}
                  active={value?.id === user.id}
                  onSelect={() => {
                    onChange(user);
                    close();
                  }}
                >
                  <UserAvatar name={user.fullName} size="xs" />
                  <span className="flex-1 truncate">{user.fullName}</span>
                  {value?.id === user.id && <Check size={12} />}
                </DropdownItem>
              ))}
              {matched.length === 0 && <p className="px-3 py-2 text-xs text-slate-400">Никого не найдено</p>}
            </div>
          </div>
        )}
      </Dropdown>
      {!isMine && me && (
        <button
          type="button"
          onClick={() => onChange(users.find((u) => u.id === me.id) ?? null)}
          className="block mt-1 text-[11px] text-brand-500 hover:underline"
        >
          Назначить на себя
        </button>
      )}
    </div>
  );
}
