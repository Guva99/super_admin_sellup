import { apiFetch, err, ok, type Result } from "@/shared/api";
import type { AccessInviteOutcome, Client, ClientStage, NewClientInput, OnboardingStep } from "../model/types";
import type { AccessInviteDto, ClientDto, MovedClientDto, OnboardingStepDto } from "./dto";
import { toClient, toCreateClientBody, toOnboardingStep, toStageDto, toStepStatusDto } from "./mapper";

const mapResult = <D, T>(result: Result<D>, map: (dto: D) => T): Result<T> =>
  result.ok ? ok(map(result.data)) : result;

export async function getClients(): Promise<Result<Client[]>> {
  return mapResult(await apiFetch<ClientDto[]>("/clients"), (list) => list.map(toClient));
}

/** Owner/Admin/Manager. Бизнес создаётся «Лидом» в первой колонке воронки. */
export async function createClient(input: NewClientInput): Promise<Result<Client>> {
  return mapResult(
    await apiFetch<ClientDto>("/clients", {
      method: "POST",
      body: toCreateClientBody(input),
    }),
    toClient,
  );
}

/**
 * Перемещение в воронке; статус (и попадание в MRR) бэкенд выставляет по колонке.
 * Перенос в «Активен» отправляет владельцу письмо доступа — `accessInvite`
 * говорит, ушло ли оно.
 */
export async function moveClientStage(
  id: string,
  stage: ClientStage,
): Promise<Result<{ client: Client; accessInvite?: AccessInviteOutcome }>> {
  const stageDto = toStageDto(stage);
  if (!stageDto) return err({ code: "bad_request", message: "invalid stage value" });
  return mapResult(
    await apiFetch<MovedClientDto>(`/clients/${id}`, {
      method: "PATCH",
      body: { stage: stageDto },
    }),
    (dto) => ({ client: toClient(dto), accessInvite: dto.accessInvite }),
  );
}

/** Адрес магазина на нашем домене. Уходит отдельным запросом: он уникален. */
export async function updateClientSlug(id: string, slug: string): Promise<Result<Client>> {
  return mapResult(await apiFetch<ClientDto>(`/clients/${id}`, { method: "PATCH", body: { slug } }), toClient);
}

/** Письмо «ваш магазин готов» со ссылкой, где владелец задаёт пароль. */
export async function sendAccessInvite(id: string): Promise<Result<AccessInviteDto>> {
  return apiFetch<AccessInviteDto>(`/clients/${id}/access-invite`, { method: "POST" });
}

/** Только владелец. Бизнес и его задачи пропадают из интерфейса. */
export async function deleteClient(id: string): Promise<Result<void>> {
  return apiFetch(`/clients/${id}`, { method: "DELETE" });
}

/**
 * Переименование ключа задач бизнеса. Уходит отдельным запросом: у поля своё
 * правило — пока у бизнеса нет задач ключ меняет любой, кто правит клиентов,
 * дальше только владелец (проверяет бэкенд).
 */
export async function updateClientTaskKey(id: string, taskKey: string): Promise<Result<Client>> {
  return mapResult(
    await apiFetch<ClientDto>(`/clients/${id}`, {
      method: "PATCH",
      body: { taskKey },
    }),
    toClient,
  );
}

export async function updateOnboardingStep(
  clientId: string,
  stepId: string,
  patch: Pick<Partial<OnboardingStep>, "title" | "description" | "status">,
): Promise<Result<OnboardingStep>> {
  const body = {
    title: patch.title,
    description: patch.description,
    status: patch.status ? toStepStatusDto(patch.status) : undefined,
  };
  return mapResult(
    await apiFetch<OnboardingStepDto>(`/clients/${clientId}/onboarding-steps/${stepId}`, { method: "PATCH", body }),
    toOnboardingStep,
  );
}
