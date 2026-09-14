/** Задача в том виде, в каком её отдаёт бэкенд (`Task` в Swagger). */
export interface TaskDto {
  id: string;
  number: number;
  key: string;
  clientId: string | null;
  onboardingStepId: string | null;
  title: string;
  description: string;
  type: "CALL" | "TASK" | "UPDATE" | "INTEGRATION" | "SUPPORT" | "ONBOARDING";
  kind: "TASK" | "BUG";
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  labels: string[];
  dueDate: string | null;
  startDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  files: TaskFileDto[];
  comments: TaskCommentDto[];
}

export interface TaskCommentDto {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  editedAt: string | null;
  files: TaskFileDto[];
}

export interface TaskFileDto {
  id: string;
  name: string;
  contentType: string;
  size: number;
}
