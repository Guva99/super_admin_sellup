import { useState } from "react";
import { Plus, Trash2, GripVertical, Info } from "lucide-react";
import type { TemplateStage } from "@/entities/onboarding-template";
import { PLANS } from "@/entities/client";
import { teamMembers } from "@/shared/api/mock";

const SETTINGS_TABS = [
  { id: "plans", label: "Тарифы и скидки" },
  { id: "team", label: "Команда и роли" },
  { id: "templates", label: "Шаблоны онбординга" },
];

interface SettingsPageProps {
  onboardingTemplate: TemplateStage[];
  onUpdateTemplate: (template: TemplateStage[]) => void;
}

export default function SettingsPage({ onboardingTemplate, onUpdateTemplate }: SettingsPageProps) {
  const [tab, setTab] = useState("templates");

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
            <button className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600">
              <Plus size={12} />
              Добавить тариф
            </button>
          </div>
          {PLANS.map((plan) => (
            <div key={plan.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 font-mono">{plan.price.toLocaleString("ru-RU")} ₽/мес</p>
                  {plan.setup > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">+{plan.setup.toLocaleString("ru-RU")} ₽ разово</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "team" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">Команда</h3>
            <button className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600">
              <Plus size={12} />
              Пригласить
            </button>
          </div>
          {teamMembers.map((member) => (
            <div key={member.name} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-brand-600">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{member.name}</p>
                <p className="text-xs text-slate-400">{member.email}</p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{member.role}</span>
              <span className="text-xs text-slate-400">{member.clients} клиентов</span>
              <button className="text-slate-300 hover:text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
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
