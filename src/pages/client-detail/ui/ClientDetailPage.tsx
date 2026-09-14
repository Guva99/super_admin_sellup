import { ArrowLeft, ExternalLink, Mail, Phone, Plus } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ClientAvatar, CLIENT_NICHE_LABEL, StatusBadge, useClient } from "@/entities/client";
import { useTasks } from "@/entities/task";
import { DeleteClientButton } from "@/features/delete-client";
import { ClientTaskKey } from "@/features/edit-client-task-key";
import { useOnboardingActions } from "@/features/manage-onboarding";
import { formatMoney, useUiActions } from "@/shared/lib";
import { ClientOverview } from "@/widgets/client-overview";
import { ClientOnboarding } from "@/widgets/client-onboarding";
import { ClientBilling } from "@/widgets/client-billing";
import { ClientUsage } from "@/widgets/client-usage";
import { ClientTasks } from "@/widgets/client-tasks";
import { ClientHistory } from "@/widgets/client-history";

const TABS = [
  { id: "overview", label: "Обзор" },
  { id: "onboarding", label: "Онбординг" },
  { id: "billing", label: "Биллинг" },
  { id: "usage", label: "Использование" },
  { id: "tasks", label: "Задачи" },
  { id: "history", label: "История" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const DEFAULT_TAB: TabId = "overview";

const isTabId = (value: string | undefined): value is TabId =>
  TABS.some((tab) => tab.id === value);

export default function ClientDetailPage() {
  // Вкладка — часть адреса (/clients/:clientId/:tab), поэтому на конкретную
  // вкладку конкретного клиента можно дать ссылку.
  const { clientId, tab } = useParams<{ clientId: string; tab?: string }>();
  const navigate = useNavigate();
  const client = useClient(clientId);
  const { tasks, updateTask, deleteTask } = useTasks();
  const { openCreateTask } = useUiActions();
  const { updateStep, addStepToTasks, removeStepFromTasks } = useOnboardingActions();

  const activeTab: TabId = isTabId(tab) ? tab : DEFAULT_TAB;
  const goToTab = (next: TabId) =>
    navigate(next === DEFAULT_TAB ? `/clients/${clientId}` : `/clients/${clientId}/${next}`);

  if (!client) return <div className="p-8 text-slate-400">Клиент не найден</div>;

  const clientTasks = tasks.filter((t) => t.clientId === clientId);
  const openTasks = clientTasks.filter((t) => t.status !== "done");

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
        <div className="p-5 border-b border-slate-100">
          <Link
            to="/clients"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-4 transition-colors"
          >
            <ArrowLeft size={13} />
            Все клиенты
          </Link>
          <ClientAvatar client={client} className="w-12 h-12 rounded-xl text-sm mb-3" />
          <h2 className="text-sm font-semibold text-slate-900 leading-snug">{client.name}</h2>
          <div className="mt-2">
            <ClientTaskKey client={client} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge status={client.status} className="text-[10px]" />
            {client.planName && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                client.planCode === "early_access" ? "bg-violet-50 text-violet-700 border border-violet-200" :
                client.planCode === "custom" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
              }`}>
                {client.planName}
              </span>
            )}
            {client.fixedPrice && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-200">Fix</span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4 flex-1">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">MRR</p>
            <p className="text-lg font-semibold text-slate-900 mt-0.5 font-mono">
              {client.mrr > 0 ? formatMoney(client.mrr) : "—"}
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <Row label="Ниша" value={client.niche ? CLIENT_NICHE_LABEL[client.niche] : "—"} />
            <Row label="Размер" value={client.size || "—"} />
            <Row
              label="Подключён"
              value={new Date(client.connectedAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <Row label="Менеджер" value={client.manager || "—"} />
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-2.5">Владелец</p>
            <p className="text-xs font-medium text-slate-700 mb-1.5">{client.owner.name || "—"}</p>
            {client.owner.email && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Mail size={11} />{client.owner.email}
              </div>
            )}
            {client.owner.phone && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Phone size={11} />{client.owner.phone}
              </div>
            )}
          </div>

          {/* Open tasks summary */}
          {openTasks.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <button
                onClick={() => goToTab("tasks")}
                className="flex items-center justify-between w-full group"
              >
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Открытые задачи</p>
                <ExternalLink size={10} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
              </button>
              <div className="mt-2 space-y-1.5">
                {openTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      t.priority === "high" ? "bg-red-400" : t.priority === "medium" ? "bg-amber-400" : "bg-slate-300"
                    }`} />
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}
                {openTasks.length > 3 && (
                  <p className="text-[10px] text-slate-300">+{openTasks.length - 3} ещё</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick add task */}
        <div className="p-4 border-t border-slate-100 space-y-1.5">
          <button
            onClick={() => openCreateTask({ clientId })}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-brand-500 hover:text-brand-600 border border-brand-200 hover:border-brand-300 rounded-lg bg-brand-50/50 hover:bg-brand-50 transition-colors"
          >
            <Plus size={12} />
            Добавить задачу
          </button>
          {/* Кнопки нет ни у кого, кроме владельца. */}
          <DeleteClientButton client={client} onDeleted={() => navigate("/clients")} />
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6">
          <nav className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => goToTab(tab.id)}
                className={`px-4 py-3.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.label}
                {tab.id === "tasks" && openTasks.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-brand-100 text-brand-500 rounded-full font-semibold">{openTasks.length}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && <ClientOverview client={client} />}
          {activeTab === "onboarding" && (
            <ClientOnboarding
              client={client}
              tasks={tasks}
              onUpdateStep={(stepId, patch) => updateStep(client.id, stepId, patch)}
              onAddToTasks={(step) => addStepToTasks(client.id, step)}
              onRemoveFromTasks={removeStepFromTasks}
            />
          )}
          {activeTab === "billing" && <ClientBilling client={client} />}
          {activeTab === "usage" && <ClientUsage client={client} />}
          {activeTab === "tasks" && (
            <ClientTasks
              tasks={clientTasks}
              onAddTask={() => openCreateTask({ clientId })}
              onOpenTask={(id) => navigate(`/tasks/${id}`)}
              onStatusChange={(id, status) => updateTask(id, { status })}
              onDeleteTask={deleteTask}
            />
          )}
          {activeTab === "history" && <ClientHistory client={client} onOpenTask={(id) => navigate(`/tasks/${id}`)} />}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium text-right">{value}</span>
    </div>
  );
}
