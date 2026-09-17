export type {
  Client,
  ClientStatus,
  ClientNiche,
  ClientStage,
  ClientHealth,
  ClientOwner,
  Integration,
  NewClientInput,
  OnboardingStep,
} from "./model/types";

export {
  healthLevel,
  healthTextClass,
  healthBadgeClass,
  HEALTH_THRESHOLDS,
  HEALTH_LEVEL_LABEL,
  HEALTH_TEXT_CLASS,
  HEALTH_BADGE_CLASS,
  HEALTH_BAR_CLASS,
  HEALTH_HEX,
  type HealthLevel,
} from "./model/health";

export {
  CLIENT_STATUS_LABEL,
  CLIENT_STATUS_CLASS,
  CLIENT_NICHE_LABEL,
  CLIENT_STAGE_LABEL,
  CLIENT_STAGE_ACCENT,
  PIPELINE_STAGES,
  STEP_STATUS_CYCLE,
  STEP_STATUS_LABEL,
} from "./model/dictionaries";

export { stageFromDto, clientStatusFromDto, stepStatusFromDto } from "./api/mapper";

export { ClientAvatar } from "./ui/ClientAvatar";
export { StatusBadge } from "./ui/StatusBadge";
export { HealthBar } from "./ui/HealthBar";
export { StepBadge } from "./ui/StepBadge";
export { ClientPipelineCard } from "./ui/ClientPipelineCard";

export { stepHoursSpent, onboardingHoursSpent } from "./model/onboardingTime";
export { MAX_TASK_KEY_LENGTH, INTERNAL_TASK_KEY, normaliseTaskKeyInput, taskKeyError } from "./model/taskKey";
export { ClientsProvider, useClients, useClient, type ClientsStore } from "./model/store";
