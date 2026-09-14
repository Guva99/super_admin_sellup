import { useNavigate } from "react-router-dom";
import { useClients } from "@/entities/client";
import { ClientPipelineBoard } from "@/features/move-client-stage";

export default function PipelinePage() {
  const { clients, moveStage } = useClients();
  const navigate = useNavigate();
  const openClient = (id: string) => navigate(`/clients/${id}`);

  const visibleClients = clients.filter((c) => c.status !== "churned" && c.status !== "paused");

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex-shrink-0 flex items-center gap-3">
        <div className="text-xs text-slate-500">{visibleClients.length} клиентов в работе</div>
        <div className="flex items-center gap-2 ml-auto text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
            Перетащите карточку для смены статуса
          </span>
        </div>
      </div>

      <ClientPipelineBoard
        clients={visibleClients}
        onMoveStage={moveStage}
        onOpenClient={openClient}
      />
    </div>
  );
}
