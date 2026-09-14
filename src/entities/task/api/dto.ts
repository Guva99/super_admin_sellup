/** Задача в том виде, в каком её отдаёт бэкенд (`Task` в Swagger). */
export interface TaskDto {
  id: string;
  clientId: string | null;
  onboardingStepId: string | null;
  title: string;
  description: string;
  type: "CALL" | "TASK" | "UPDATE" | "INTEGRATION" | "SUPPORT" | "ONBOARDING";
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
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
