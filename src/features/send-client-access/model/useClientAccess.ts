import { useState } from "react";
import { normaliseSlugInput, slugError, useClients, type Client } from "@/entities/client";
import { describeApiError } from "@/shared/api";

/**
 * Доступ клиента в карточке бизнеса: адрес магазина и письмо «ваш магазин
 * готов». Письмо само уходит при переносе в «Активен»; отсюда его шлют
 * вручную — повторно или когда автоматическое не ушло (не было адреса).
 */
export function useClientAccess(client: Client) {
  const { setSlug, inviteOwner } = useClients();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraftRaw] = useState(client.slug ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Куда ушло последнее письмо, отправленное с этой страницы. */
  const [sentTo, setSentTo] = useState<string | null>(null);

  const saveSlug = async () => {
    if (isSaving) return;
    if (draft === (client.slug ?? "")) {
      setIsEditing(false);
      return;
    }
    const problem = slugError(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setIsSaving(true);
    const result = await setSlug(client.id, draft);
    setIsSaving(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    setIsEditing(false);
    setError(null);
  };

  const send = async () => {
    if (isSending) return;
    setIsSending(true);
    setError(null);
    setSentTo(null);
    const result = await inviteOwner(client.id);
    setIsSending(false);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return;
    }
    setSentTo(result.data.email);
  };

  return {
    isEditing,
    draft,
    isSaving,
    isSending,
    error,
    sentTo,
    startEdit: () => {
      setDraftRaw(client.slug ?? "");
      setError(null);
      setIsEditing(true);
    },
    cancelEdit: () => {
      setIsEditing(false);
      setError(null);
    },
    setDraft: (value: string) => setDraftRaw(normaliseSlugInput(value)),
    saveSlug,
    send,
  };
}
