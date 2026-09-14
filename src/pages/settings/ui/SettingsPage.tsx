import { useState } from "react";
import { Plus, Trash2, GripVertical, Info, Pencil } from "lucide-react";
import { useOnboardingTemplate } from "@/entities/onboarding-template";
import { usePlans } from "@/entities/plan";
import { usePlanForm, PlanFormModal } from "@/features/edit-plan";
import { useAddTeamMember, AddTeamMemberModal } from "@/features/add-team-member";
import { useSession } from "@/entities/session";
import { canManageTeam, ROLE_LABEL, useUsers } from "@/entities/user";
import { describeApiError } from "@/shared/api";

const SETTINGS_TABS = [
  { id: "plans", label: "Тарифы и скидки" },
  { id: "team", label: "Команда и роли" },
  { id: "templates", label: "Шаблоны онбординга" },
];

export default function SettingsPage() {
  const { template: onboardingTemplate, setTemplate: onUpdateTemplate } = useOnboardingTemplate();
  const { activePlans, isLoading: plansLoading, error: plansError } = usePlans();
  const { users, removeUser } = useUsers();
  const { user: currentUser } = useSession();
  const planForm = usePlanForm();
  const addMember = useAddTeamMember();

  const [tab, setTab] = useState("templates");
  const [teamError, setTeamError] = useState<string | null>(null);

  const canEditTeam = canManageTeam(currentUser?.roleKey);

  const deleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Удалить сотрудника «${name}»? Он больше не сможет войти в консоль.`)) return;
    setTeamError(null);
    const result = await removeUser(id);
    if (!result.ok) setTeamError(describeApiError(result.error));
  };

  const addStage = () => {
    onUpdateTemplate([
      ...onboardingTemplate,
      { id: `tpl${Date.now()}`, title: "", description: "" },
    ]);
  };

  const removeStage = (id: string) => {
    onUpdateTemplate(onboardingTemplate.filter((s) => s.id !== id));
  };

  const updateStage = (id: string, field: "title" | "description", value: string) => {
    onUpdateTemplate(onboardingTemplate.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="p-6 max-w-[900px]">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit">
        {SETTINGS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">Тарифные планы</h3>
            <button onClick={planForm.openCreate} className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600">
              <Plus size={12} />
              Добавить тариф
            </button>
          </div>
          {plansLoading && <p className="text-xs text-slate-400">Загрузка тарифов…</p>}
          {plansError && <p className="text-xs text-red-600">Не удалось загрузить тарифы: {plansError}</p>}
          {activePlans.map((plan) => (
            <div key={plan.id} className="group bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 font-mono">
                      {plan.isCustom ? "Цена для каждого клиента" : `${plan.price.toLocaleString("ru-RU")} ₽/мес`}
                    </p>
                    {plan.setupPrice > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">+{plan.setupPrice.toLocaleString("ru-RU")} ₽ разово</p>
                    )}
                  </div>
                  <button
                    onClick={() => planForm.openEdit(plan)}
                    title="Редактировать тариф"
                    aria-label={`Редактировать тариф ${plan.name}`}
                    className="text-slate-300 hover:text-brand-500 transition-colors mt-0.5"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <PlanFormModal controller={planForm} />
        </div>
      )}

      {tab === "team" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">Команда</h3>
            {canEditTeam && (
              <button onClick={addMember.open} className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600">
                <Plus size={12} />
                Добавить сотрудника
              </button>
            )}
          </div>
          {teamError && <p className="text-xs text-red-600">{teamError}</p>}
          {users.map((member) => (
            <div key={member.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-brand-600">
                  {member.fullName.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {member.fullName}
                  {member.id === currentUser?.id && <span className="ml-1.5 text-[10px] text-slate-400">— это вы</span>}
                </p>
                <p className="text-xs text-slate-400 truncate">{member.email}</p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded flex-shrink-0">{ROLE_LABEL[member.roleKey]}</span>
              {/* Себя удалить нельзя — бэкенд такой запрос отклоняет. */}
              {canEditTeam && member.id !== currentUser?.id && (
                <button
                  onClick={() => deleteMember(member.id, member.fullName)}
                  title={`Удалить сотрудника ${member.fullName}`}
                  className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
          <AddTeamMemberModal controller={addMember} />
        </div>
      )}

      {tab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Шаблон онбординга</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Info size={11} className="text-brand-400" />
                <p className="text-xs text-slate-500">
                  Этапы автоматически подставляются при нажатии <strong className="text-brand-500">«Подключить бизнес»</strong> в боковом меню.
                  Можно редактировать перед созданием клиента.
                </p>
              </div>
            </div>
            <button
              onClick={addStage}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600 flex-shrink-0 ml-4 px-3 py-1.5 rounded-lg border border-brand-200 hover:border-brand-300 bg-brand-50 transition-colors"
            >
              <Plus size={12} />
              Добавить этап
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {onboardingTemplate.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-400">Нет этапов. Нажмите «Добавить этап».</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {onboardingTemplate.map((stage, i) => (
                  <li key={stage.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors group">
                    <div className="flex items-center gap-1 pt-2 flex-shrink-0">
                      <GripVertical size={13} className="text-slate-200 group-hover:text-slate-300 transition-colors cursor-grab" />
                      <span className="text-[11px] font-mono text-slate-300 w-5 text-right">{i + 1}.</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1 pt-1">
                      <input
                        type="text"
                        value={stage.title}
                        onChange={(e) => updateStage(stage.id, "title", e.target.value)}
                        placeholder="Название этапа *"
                        className="w-full text-sm font-medium text-slate-800 px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-50 outline-none bg-transparent focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-normal"
                      />
                      <input
                        type="text"
                        value={stage.description}
                        onChange={(e) => updateStage(stage.id, "description", e.target.value)}
                        placeholder="Описание (необязательно)"
                        className="w-full text-xs text-slate-500 px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-50 outline-none bg-transparent focus:bg-white transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <button
                      onClick={() => removeStage(stage.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all pt-2 flex-shrink-0"
                      title="Удалить этап"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" />
            Изменения применяются к новым подключениям. Существующие клиенты не затрагиваются.
          </p>
        </div>
      )}
    </div>
  );
}
