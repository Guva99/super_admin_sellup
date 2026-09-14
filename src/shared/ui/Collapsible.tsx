import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Что показать справа в шапке (счётчик, кнопка). */
  aside?: ReactNode;
  className?: string;
  /** Классы шапки; по умолчанию — компактная строка с рамкой снизу. */
  headerClassName?: string;
}

/** Секция с шевроном: свёрнутое состояние помнит только сама секция. */
export function Collapsible({
  title,
  children,
  defaultOpen = true,
  aside,
  className = "",
  headerClassName = "px-4 py-2.5 border-b border-slate-100",
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={className}>
      <div className={`flex items-center gap-2 ${headerClassName}`}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left text-slate-800 hover:text-slate-900"
        >
          <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} />
          <span className="text-sm font-semibold truncate">{title}</span>
        </button>
        {aside}
      </div>
      {open && children}
    </div>
  );
}
