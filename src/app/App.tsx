import { useState } from "react";
import type { Client, ClientStage, HealthLevel } from "@/entities/client";
import type { Task } from "@/entities/task";
import type { TemplateStage } from "@/entities/onboarding-template";
import { createDefaultTemplate } from "@/entities/onboarding-template";

import { useCreateTask, CreateTaskModal } from "@/features/create-task";
import { useConnectBusiness, ConnectBusinessModal } from "@/features/connect-business";
import { useOnboardingActions } from "@/features/manage-onboarding";

import { DashboardPage } from "@/pages/dashboard";
import { ClientsPage } from "@/pages/clients";
import { ClientDetailPage } from "@/pages/client-detail";
import { PipelinePage } from "@/pages/pipeline";
import { TasksPage } from "@/pages/tasks";
import { MetricsPage } from "@/pages/metrics";
import { SettingsPage } from "@/pages/settings";

import { mockClients } from "@/entities/client";
import { mockTasks } from "@/entities/task";
import {
  mrrHistory,
  attentionItems,
  upcomingEvents,
  monthlyHours,
  onboardingDuration,
} from "@/entities/analytics";

import { routeTitle, type PageId } from "./routes";
import { Sidebar } from "./ui/Sidebar";
import { Header } from "./ui/Header";
import { SearchDialog } from "./ui/SearchDialog";

export default function App() {
  /* ── Состояние приложения: единственный источник правды ── */
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [onboardingTemplate, setOnboardingTemplate] = useState<TemplateStage[]>(createDefaultTemplate);

  /* ── Навигация и хром ── */
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [clientsHealthFilter, setClientsHealthFilter] = useState<HealthLevel | null>(null);

  const navigate = (page: PageId) => setCurrentPage(page);

  const openClient = (id: string) => {
    setSelectedClientId(id);
    setCurrentPage("client-detail");
  };

  /* ── Операции над задачами ── */
  const addTask = (task: Task) => setTasks((prev) => [task, ...prev]);
  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  const deleteTask = (id: string) => setTasks((prev) => prev.filter((task) => task.id !== id));

  /* ── Операции над клиентами ── */
  const addClient = (client: Client) => {
    setClients((prev) => [client, ...prev]);
    openClient(client.id);
  };

  const moveClientStage = (clientId: string, stage: ClientStage) =>
    setClients((prev) => prev.map((client) => (client.id === clientId ? { ...client, stage } : client)));

  /* ── Фичи ── */
  const createTask = useCreateTask(addTask);
  const connectBusiness = useConnectBusiness(onboardingTemplate, clients.length, addClient);
  const onboarding = useOnboardingActions(setClients, addTask, deleteTask);

  const highPriorityTasks = tasks.filter((t) => t.status !== "done" && t.priority === "high").length;

  return (
    <div className="flex h-full bg-slate-50 min-w-[1280px]">
      <Sidebar
        currentPage={currentPage}
        collapsed={sidebarCollapsed}
        taskBadge={highPriorityTasks}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        onNavigate={navigate}
        onConnectBusiness={connectBusiness.open}
        onAddTask={() => createTask.open()}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title={routeTitle(currentPage)} onOpenSearch={() => setSearchOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {currentPage === "dashboard" && (
            <DashboardPage
              clients={clients}
              mrrHistory={mrrHistory}
              attentionItems={attentionItems}
              upcomingEvents={upcomingEvents}
              onOpenClient={openClient}
              onNavigateClients={(healthFilter) => {
                setClientsHealthFilter(healthFilter);
                navigate("clients");
              }}
            />
          )}

          {currentPage === "clients" && (
            <ClientsPage
              clients={clients}
              onOpenClient={openClient}
              onConnectBusiness={connectBusiness.open}
              healthFilter={clientsHealthFilter}
              onClearHealthFilter={() => setClientsHealthFilter(null)}
            />
          )}

          {currentPage === "client-detail" && selectedClientId && (
            <ClientDetailPage
              clientId={selectedClientId}
              clients={clients}
              tasks={tasks}
              onBack={() => navigate("clients")}
              onOpenClient={openClient}
              onAddTask={createTask.open}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onUpdateOnboardingStep={onboarding.updateStep}
              onAddStepToTasks={onboarding.addStepToTasks}
              onRemoveStepFromTasks={onboarding.removeStepFromTasks}
            />
          )}

          {currentPage === "pipeline" && (
            <PipelinePage clients={clients} onMoveStage={moveClientStage} onOpenClient={openClient} />
          )}

          {currentPage === "tasks" && (
            <TasksPage
              tasks={tasks}
              clients={clients}
              onAddTask={createTask.open}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onOpenClient={openClient}
            />
          )}

          {currentPage === "metrics" && (
            <MetricsPage
              clients={clients}
              monthlyHours={monthlyHours}
              onboardingDuration={onboardingDuration}
            />
          )}

          {currentPage === "settings" && (
            <SettingsPage onboardingTemplate={onboardingTemplate} onUpdateTemplate={setOnboardingTemplate} />
          )}
        </main>
      </div>

      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
      <CreateTaskModal controller={createTask} clients={clients} />
      <ConnectBusinessModal controller={connectBusiness} />
    </div>
  );
}
