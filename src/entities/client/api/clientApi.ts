import { apiFetch, err, ok, type Result } from "@/shared/api";
import type { Client, ClientStage, NewClientInput, OnboardingStep } from "../model/types";
import type { ClientDto, OnboardingStepDto } from "./dto";
import { toClient, toCreateClientBody, toOnboardingStep, toStageDto, toStepStatusDto } from "./mapper";

const mapResult = <D, T>(result: Result<D>, map: (dto: D) => T): Result<T> =>
  result.ok ? ok(map(result.data)) : result;

export async function getClients(): Promise<Result<Client[]>> {
  return mapResult(await apiFetch<ClientDto[]>("/clients"), (list) => list.map(toClient));
}

/** Owner/Admin/Manager. Бизнес создаётся «Лидом» в первой колонке воронки. */
export async function createClient(input: NewClientInput): Promise<Result<Client>> {
  return mapResult(await apiFetch<ClientDto>("/clients", { method: "POST", body: toCreateClientBody(input) }), toClient);
}

/** Перемещение в воронке; статус (и попадание в MRR) бэкенд выставляет по колонке. */
export async function moveClientStage(id: string, stage: ClientStage): Promise<Result<Client>> {
  const stageDto = toStageDto(stage);
  if (!stageDto) return err({ code: "bad_request", message: "invalid stage value" });
  return mapResult(await apiFetch<ClientDto>(`/clients/${id}`, { method: "PATCH", body: { stage: stageDto } }), toClient);
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
