import { useEffect, useRef, useState, type ReactNode } from "react";

interface DropdownProps {
  /** Кнопка, открывающая меню. Получает текущее состояние. */
  trigger: (open: boolean) => ReactNode;
  /** Содержимое меню. `close` закрывает его после выбора. */
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  /** Классы всплывающей панели, например ширина. */
  panelClassName?: string;
}

/**
 * Выпадающая панель: закрывается кликом снаружи и Escape. Что внутри —
 * решает потребитель (список статусов, поиск по сотрудникам, фильтры).
 */
export function Dropdown({ trigger, children, align = "left", panelClassName = "min-w-[180px]" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Escape закрывает только меню, а не модалку, в которой оно открыто.
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <div onClick={() => setOpen((v) => !v)}>{trigger(open)}</div>
      {open && (
        <div
          className={`absolute z-30 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden ${align === "right" ? "right-0" : "left-0"} ${panelClassName}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  onSelect: () => void;
  active?: boolean;
  danger?: boolean;
  children: ReactNode;
}

/** Строка меню: подсветка выбранного, красный вариант для удаления. */
export function DropdownItem({ onSelect, active, danger, children }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
        danger ? "text-red-500 hover:bg-red-50" : active ? "bg-brand-50 text-brand-600 font-medium" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
