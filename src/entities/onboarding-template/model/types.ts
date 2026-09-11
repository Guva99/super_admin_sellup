/** Шаблонный этап онбординга: редактируется в настройках, применяется при подключении бизнеса. */
export interface TemplateStage {
  id: string;
  title: string;
  description: string;
}

export const DEFAULT_ONBOARDING_STAGES: { title: string; description: string }[] = [
  { title: "Анализ бизнеса", description: "Аудит процессов, CJM, требования к интеграциям" },
  { title: "Интеграции", description: "Подключение 1С, МойСклад, маркетплейсов, мессенджеров" },
  { title: "Обучение команды", description: "Тренинг по CRM, чат-центру, отчётам" },
  { title: "Запуск", description: "Перевод в боевой режим, финальная проверка" },
];

export const createDefaultTemplate = (): TemplateStage[] =>
  DEFAULT_ONBOARDING_STAGES.map((stage, index) => ({
    id: `tpl${index}`,
    title: stage.title,
    description: stage.description,
  }));
