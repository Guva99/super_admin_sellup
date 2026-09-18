import { useState } from "react";
import { useUsers, type Role } from "@/entities/user";
import { describeApiError } from "@/shared/api";

export interface TeamMemberDraft {
  email: string;
  fullName: string;
  password: string;
  roleId: string;
}

export interface AddTeamMemberController {
  isOpen: boolean;
  /** Форма заполнена, но не отправлена. */
  isDirty: boolean;
  draft: TeamMemberDraft;
  roles: Role[];
  isSubmitting: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  patch: (patch: Partial<TeamMemberDraft>) => void;
  submit: () => void;
}

const emptyDraft = (roleId: string): TeamMemberDraft => ({ email: "", fullName: "", password: "", roleId });

/**
 * Добавление сотрудника. Пароль задаёт тот, кто заводит аккаунт: писем
 * бэкенд не отправляет, поэтому «приглашения» нет — есть готовый вход.
 */
export function useAddTeamMember(): AddTeamMemberController {
  const { roles, addUser } = useUsers();
  const defaultRoleId = roles.find((role) => role.key === "MANAGER")?.id ?? roles[0]?.id ?? "";

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<TeamMemberDraft>(() => emptyDraft(defaultRoleId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setDraft(emptyDraft(defaultRoleId));
    setError(null);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const patch = (next: Partial<TeamMemberDraft>) => setDraft((prev) => ({ ...prev, ...next }));

  const submit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    const result = await addUser({
      email: draft.email.trim(),
      fullName: draft.fullName.trim(),
      password: draft.password,
      roleId: draft.roleId,
    });
    setIsSubmitting(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    setIsOpen(false);
  };

  return {
    isOpen,
    draft,
    isDirty: draft.email.trim() !== "" || draft.fullName.trim() !== "" || draft.password !== "",
    roles,
    isSubmitting,
    error,
    open,
    close,
    patch,
    submit,
  };
}
