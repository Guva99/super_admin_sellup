import { useState } from "react";
import { CheckCircle2, Circle, Clock, FileText, Plus, Rocket, Users, X } from "lucide-react";
import { STEP_STATUS_CYCLE, onboardingHoursSpent, stepHoursSpent, type Client, type OnboardingStep } from "@/entities/client";
import type { Task } from "@/entities/task";
import { formatDateTimeMoscow, formatHours } from "@/shared/lib";

interface ClientOnboardingProps {
  client: Client;
  tasks: Task[];
  onUpdateStep: (stepId: string, patch: Partial<OnboardingStep>) => void;
  onAddToTasks: (step: OnboardingStep) => void;
  onRemoveFromTasks: (taskId: string) => void;
}

export function ClientOnboarding({
  client,
  tasks,
  onUpdateStep,
  onAddToTasks,
  onRemoveFromTasks,
}: ClientOnboardingProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Календарное время этапов (от взятия в работу до закрытия), не рабочие часы.
  const totalHours = onboardingHoursSpent(client.onboardingSteps);
  const doneCount = client.onboardingSteps.filter((s) => s.status === "done").length;

  if (client.onboardingSteps.length === 0) {
    return (
      <div className="max-w-[800px]">
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center gap-2 text-slate-300">
          <Rocket size={28} />
          <p className="text-sm font-medium">Этапы онбординга не заданы</p>
          <p className="text-xs text-center max-w-xs">Этапы задаются при подключении бизнеса через кнопку «Подключить бизнес»</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[800px]">
      {/* Progress bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Прогресс</h3>
          <div className="text-xs text-slate-500 font-mono">{doneCount}/{client.onboardingSteps.length} этапов</div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${(doneCount / Math.max(client.onboardingSteps.length, 1)) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span title="Сумма календарного времени этапов: от взятия в работу до закрытия, у открытых — до сейчас (по Москве)">
            Потрачено: <strong className="text-slate-700">{formatHours(totalHours)}</strong>
          </span>
          <span title="Календарных дней с последнего перемещения по воронке, по Москве">{client.daysInStatus} дней в статусе</span>
        </div>
      </div>

      {/* Stage cards */}
      <div className="space-y-2">
        {client.onboardingSteps.map((step, i) => {
          const isEditing = editingId === step.id;
          const linkedTask = tasks.find((t) => t.onboardingStepId === step.id) ?? null;
          const statusBg = step.status === "done" ? "border-emerald-200 bg-emerald-50/20" :
                           step.status === "in_progress" ? "border-brand-200 bg-brand-50/20" :
                           "border-slate-200 bg-white";
          return (
            <div key={step.id} className={`border rounded-xl transition-all ${statusBg}`}>
              <div className="flex items-start gap-3 p-4">
                {/* Clickable status icon */}
                <button
                  onClick={() => onUpdateStep(step.id, { status: STEP_STATUS_CYCLE[step.status] })}
                  className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
                  title="Нажмите для смены статуса"
                >
                  {step.status === "done" ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : step.status === "in_progress" ? (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-indigo-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                    </div>
                  ) : (
                    <Circle size={18} className="text-slate-300" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={step.title}
                          onBlur={(e) => { onUpdateStep(step.id, { title: e.target.value }); setEditingId(null); }}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEditingId(null); }}
                          className="text-sm font-medium text-slate-900 w-full border-b border-brand-300 outline-none bg-transparent pb-0.5"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 font-mono text-xs">{i + 1}.</span>
                          <span className={`text-sm font-medium ${step.status === "done" ? "line-through text-slate-400" : "text-slate-900"}`}>
                            {step.title}
                          </span>
                        </div>
                      )}
                      {/* Description */}
                      {step.description && !isEditing && (
                        <p className="text-xs text-slate-500 mt-0.5 ml-4">{step.description}</p>
                      )}
                    </div>

                    {/* Status badge + actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Linked task badge */}
                      {linkedTask && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-medium">
                          <Rocket size={9} />
                          <span>В задачах</span>
                          <button
                            onClick={() => onRemoveFromTasks(linkedTask.id)}
                            className="ml-0.5 text-emerald-400 hover:text-red-400 transition-colors"
                            title="Убрать из задач"
                          >
                            <X size={9} />
                          </button>
                        </div>
                      )}

                      {/* Status badge — click to cycle */}
                      <button
                        onClick={() => onUpdateStep(step.id, { status: STEP_STATUS_CYCLE[step.status] })}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          step.status === "done" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                          step.status === "in_progress" ? "bg-brand-100 text-brand-600 hover:bg-brand-200" :
                          "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                        title="Нажмите для смены статуса"
                      >
                        {step.status === "done" ? "Готово" : step.status === "in_progress" ? "В работе" : "Ожидает"}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingId(isEditing ? null : step.id)}
                        className="text-slate-300 hover:text-brand-500 transition-colors"
                        title="Редактировать"
                      >
                        <FileText size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    {step.assignee && <span className="flex items-center gap-1"><Users size={10} />{step.assignee}</span>}
                    {step.startedAt && (
                      <span
                        className="flex items-center gap-1"
                        title={`${step.completedAt ? "Заняло" : "В работе"}: с ${formatDateTimeMoscow(step.startedAt)}${step.completedAt ? ` до ${formatDateTimeMoscow(step.completedAt)}` : ""} (МСК)`}
                      >
                        <Clock size={10} />{formatHours(stepHoursSpent(step))}
                      </span>
                    )}
                    {step.dueDate && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        до {new Date(step.dueDate).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                      </span>
                    )}

                    {/* Add to tasks button */}
                    {!linkedTask && (
                      <button
                        onClick={() => onAddToTasks(step)}
                        className="ml-auto flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-500 transition-colors font-medium"
                        title="Создать задачу из этапа"
                      >
                        <Plus size={10} />
                        <Rocket size={10} />
                        В задачи
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <p className="text-[11px] text-slate-400 flex items-center gap-1">
        <span className="text-brand-400">←</span>
        Нажмите на иконку статуса или кнопку «Ожидает / В работе / Готово» для смены этапа
      </p>
    </div>
  );
}
