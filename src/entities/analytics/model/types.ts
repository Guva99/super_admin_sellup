export interface MrrPoint {
  month: string;
  mrr: number;
  clients: number;
}

export type AttentionType = "payment" | "health" | "integration" | "onboarding";
export type AttentionSeverity = "high" | "medium" | "low";

export interface AttentionItem {
  id: string;
  type: AttentionType;
  clientId: string;
  client: string;
  message: string;
  severity: AttentionSeverity;
}

export type EventType = "training" | "renewal" | "launch" | "pricing";

export interface UpcomingEvent {
  id: string;
  date: string;
  type: EventType;
  client: string;
  title: string;
}

export interface MonthlyHours {
  month: string;
  avg: number;
  target: number;
}

export interface OnboardingDuration {
  month: string;
  days: number;
}
