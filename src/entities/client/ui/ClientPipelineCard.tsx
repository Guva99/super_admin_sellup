import { Clock, ChevronRight } from "lucide-react";
import type { Client } from "../model/types";
import { CLIENT_NICHE_LABEL } from "../model/dictionaries";
import { ClientAvatar } from "./ClientAvatar";
import type { KanbanCardHandlers } from "@/shared/ui";

interface ClientPipelineCardProps {
  client: Client;
  isDragging: boolean;
  handlers: KanbanCardHandlers;
  onClick: () => void;
}

export function ClientPipelineCard({ client, isDragging, handlers, onClick }: ClientPipelineCardProps) {
  return (
    <div
      {...handlers}
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-lg p-3 cursor-grab active:cursor-grabbing select-none transition-all ${
        isDragging ? "opacity-40 shadow-lg scale-95" : "hover:border-brand-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <ClientAvatar client={client} className="w-6 h-6 rounded-md text-[10px]" />
        <span className="text-xs font-medium text-slate-800 truncate flex-1">{client.name}</span>
        <ChevronRight size={11} className="text-slate-300 flex-shrink-0" />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{CLIENT_NICHE_LABEL[client.niche]}</span>
          <span className="font-mono">{client.mrr > 0 ? `${client.mrr / 1000}k ₽` : "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Clock size={10} />
          <span>{client.daysInStatus} дней в статусе</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400">{client.manager}</span>
          {client.nextAction !== "—" && (
            <span className="text-[10px] text-brand-500 truncate max-w-[100px] text-right">{client.nextAction}</span>
          )}
        </div>
      </div>

      {client.plan === "early_access" && (
        <div className="mt-2 pt-2 border-t border-slate-50">
          <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
            Ранний доступ
          </span>
        </div>
      )}
    </div>
  );
}
