import type { Task } from "../model/types";

export const mockTasks: Task[] = [
  { id: "t1", title: "Созвон по ошибке Wildberries API", clientId: "2", type: "call", priority: "high", status: "todo", dueDate: "2026-09-08", assignee: "Андрей К.", createdAt: "2026-09-05" },
  { id: "t2", title: "Починить подключение 1С", clientId: "3", type: "integration", priority: "high", status: "in_progress", dueDate: "2026-09-10", assignee: "Дмитрий Л.", createdAt: "2026-09-04" },
  { id: "t3", title: "Созвон по просроченному платежу", clientId: "4", type: "call", priority: "high", status: "todo", dueDate: "2026-09-07", assignee: "Андрей К.", createdAt: "2026-09-06" },
  { id: "t4", title: "Обучение команды по CRM", clientId: "5", type: "onboarding", priority: "medium", status: "in_progress", dueDate: "2026-09-10", assignee: "Мария С.", createdAt: "2026-09-03" },
  { id: "t5", title: "Выяснить причину паузы", clientId: "7", type: "call", priority: "high", status: "todo", dueDate: "2026-09-08", assignee: "Мария С.", createdAt: "2026-09-06" },
  { id: "t6", title: "Отправить обновлённый договор", clientId: "9", type: "task", priority: "medium", status: "todo", dueDate: "2026-09-15", assignee: "Мария С.", createdAt: "2026-09-05" },
  { id: "t7", title: "Провести демо", clientId: "8", type: "call", priority: "medium", status: "todo", dueDate: "2026-09-09", assignee: "Андрей К.", createdAt: "2026-09-05" },
  { id: "t8", title: "Настроить интеграцию Wildberries", clientId: "11", type: "integration", priority: "high", status: "in_progress", dueDate: "2026-09-10", assignee: "Дмитрий Л.", createdAt: "2026-09-02" },
  { id: "t9", title: "Ежеквартальный отзыв — подготовить отчёт", clientId: "6", type: "update", priority: "low", status: "review", dueDate: "2026-09-20", assignee: "Андрей К.", createdAt: "2026-09-01" },
  { id: "t10", title: "Записать обучающее видео по отчётам", clientId: "1", type: "task", priority: "low", status: "done", dueDate: "2026-09-03", assignee: "Мария С.", createdAt: "2026-08-28" },
  { id: "t11", title: "Обновить договор до 70k ₽/мес", clientId: "6", type: "update", priority: "medium", status: "todo", dueDate: "2026-11-30", assignee: "Андрей К.", createdAt: "2026-09-06" },
  { id: "t12", title: "Проверить данные 1С после обновления", clientId: "10", type: "support", priority: "low", status: "review", dueDate: "2026-09-12", assignee: "Дмитрий Л.", createdAt: "2026-09-05" },
];
