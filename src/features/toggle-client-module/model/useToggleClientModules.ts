import { useState } from "react";
import { ADMIN_MODULES, isModuleOn, useClientModules } from "@/entities/client-module";
import { useSession } from "@/entities/session";
import { canManageClientModules } from "@/entities/user";
import { describeApiError } from "@/shared/api";

export interface ClientModuleRow {
  key: string;
  title: string;
  hint: string;
  on: boolean;
}

export interface ToggleClientModulesController {
  rows: ClientModuleRow[];
  isLoading: boolean;
  /** Ключ модуля, который сейчас сохраняется. */
  savingKey: string | null;
  error: string | null;
  canEdit: boolean;
  toggle: (key: string) => void;
}

/**
 * Модули админки клиента: менеджер включает то, о чём договорились на
 * созвоне. Общая IRP подхватывает изменение из реестра клиентов.
 */
export function useToggleClientModules(clientId: string): ToggleClientModulesController {
  const { states, isLoading, error: loadError, set } = useClientModules(clientId);
  const { user } = useSession();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = ADMIN_MODULES.map((m) => ({ key: m.key, title: m.title, hint: m.hint, on: isModuleOn(states[m.key]) }));

  const toggle = async (key: string) => {
    if (savingKey) return;
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    setSavingKey(key);
    setError(null);
    const result = await set(key, !row.on);
    setSavingKey(null);
    if (!result.ok) setError(describeApiError(result.error));
  };

  return {
    rows,
    isLoading,
    savingKey,
    error: error ?? loadError,
    canEdit: canManageClientModules(user?.roleKey),
    toggle,
  };
}
