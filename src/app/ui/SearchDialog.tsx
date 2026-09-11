import { Search } from "lucide-react";
import { ModalOverlay } from "@/shared/ui";

export function SearchDialog({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
          <Search size={15} className="text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Поиск клиентов, задач..."
            className="flex-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 bg-transparent"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded font-mono text-slate-500">Esc</kbd>
        </div>
        <p className="text-xs text-slate-400 text-center py-8">Начните вводить запрос...</p>
      </div>
    </ModalOverlay>
  );
}
