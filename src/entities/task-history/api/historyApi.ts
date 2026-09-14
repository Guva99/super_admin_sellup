import { apiFetch, ok, type Result } from "@/shared/api";
import type { TaskHistoryEvent, TaskHistoryField } from "../model/types";

/** `TaskHistoryEvent` в Swagger: пустое `field` вместо отсутствующего. */
interface TaskHistoryEventDto {
  id: string;
  actorId: string | null;
  actorName: string;
  type: TaskHistoryEvent["type"];
  field: string;
  oldValue: string;
  newValue: string;
  at: string;
}

const toEvent = (dto: TaskHistoryEventDto): TaskHistoryEvent => ({
  id: dto.id,
  actorId: dto.actorId,
  actorName: dto.actorName,
  type: dto.type,
  field: dto.field ? (dto.field as TaskHistoryField) : undefined,
  oldValue: dto.oldValue,
  newValue: dto.newValue,
  at: dto.at,
});

export const historyApi = {
  /** Любая роль. События от старых к новым. */
  list: async (taskId: string): Promise<Result<TaskHistoryEvent[]>> => {
    const result = await apiFetch<TaskHistoryEventDto[]>(`/tasks/${taskId}/history`);
    return result.ok ? ok(result.data.map(toEvent)) : result;
  },
};
