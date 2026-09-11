import type { Client, ClientStage } from "@/entities/client";
import { ClientPipelineCard, PIPELINE_STAGES, CLIENT_STAGE_ACCENT } from "@/entities/client";
import { KanbanBoard } from "@/shared/ui";

interface ClientPipelineBoardProps {
  clients: Client[];
  onMoveStage: (clientId: string, stage: ClientStage) => void;
  onOpenClient: (id: string) => void;
}

/** Доска воронки подключения. Стадия хранится в модели клиента, не в состоянии доски. */
export function ClientPipelineBoard({ clients, onMoveStage, onOpenClient }: ClientPipelineBoardProps) {
  return (
    <KanbanBoard<Client, ClientStage>
      columns={PIPELINE_STAGES}
      items={clients}
      getItemId={(client) => client.id}
      getItemColumn={(client) => client.stage}
      onMove={(clientId, stage) => onMoveStage(clientId, stage)}
      columnClassName="w-64"
      boardClassName="gap-3"
      listClassName="px-2 pb-2 min-h-[80px]"
      renderColumnHeader={(col, count) => (
        <div className="flex items-center justify-between px-3.5 py-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">{col.label}</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-white text-slate-500 rounded-full border border-slate-200">
                {count}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{col.description}</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${CLIENT_STAGE_ACCENT[col.id]}`} />
        </div>
      )}
      renderEmptyColumn={(_col, isDragOver) => (
        <div
          className={`h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-[11px] transition-colors ${
            isDragOver ? "border-brand-300 text-brand-400 bg-brand-50" : "border-slate-200 text-slate-300"
          }`}
        >
          Перетащите сюда
        </div>
      )}
      renderCard={(client, handlers, isDragging) => (
        <ClientPipelineCard
          client={client}
          handlers={handlers}
          isDragging={isDragging}
          onClick={() => onOpenClient(client.id)}
        />
      )}
    />
  );
}
