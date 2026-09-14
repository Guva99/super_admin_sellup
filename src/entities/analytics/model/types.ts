export interface MrrPoint {
  month: string;
  mrr: number;
  clients: number;
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
