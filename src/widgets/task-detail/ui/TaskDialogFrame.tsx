import type { ReactNode } from "react";
import { X } from "lucide-react";
import { ModalOverlay } from "@/shared/ui";

interface TaskDialogFrameProps {
  /** Хлебные крошки слева в шапке. */
  breadcrumb: ReactNode;
  /** Кнопки шапки перед крестиком (удаление задачи). */
  actions?: ReactNode;
  onClose: () => void;
  /** Левая колонка: заголовок, описание, вложения, активность. */
  children: ReactNode;
  /** Правая колонка: поля задачи. */
  aside: ReactNode;
  /** Подвал — только у новой задачи: сохранённая пишется сразу. */
  footer?: ReactNode;
}

/**
 * Каркас окна задачи. Один на создание и на правку: раскладка, ширина и места
 * кнопок не должны различаться — иначе одна и та же задача выглядит по-разному
 * до и после сохранения.
 */
export function TaskDialogFrame({ breadcrumb, actions, onClose, children, aside, footer }: TaskDialogFrameProps) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-[960px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-96px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-100 flex-shrink-0">
          {breadcrumb}
          <span className="flex-1" />
          {actions}
          <button type="button" onClick={onClose} aria-label="Закрыть" className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-[1fr_300px]">
          <div className="min-w-0 overflow-y-auto px-6 py-5 space-y-6">{children}</div>
          <aside className="overflow-y-auto border-l border-slate-100 bg-slate-50/40 px-4 py-5 space-y-4">{aside}</aside>
        </div>

        {footer && <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">{footer}</div>}
      </div>
    </ModalOverlay>
  );
}
