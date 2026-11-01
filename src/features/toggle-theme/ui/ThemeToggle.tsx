import { Moon, Sun } from "lucide-react";
import type { ThemeToggleController } from "../model/useThemeToggle";

/** Иконка показывает, во что переключит клик: в светлой теме — луна, в тёмной — солнце. */
export function ThemeToggle({ controller, className = "" }: { controller: ThemeToggleController; className?: string }) {
  const { isDark, toggle } = controller;
  const label = isDark ? "Светлая тема" : "Тёмная тема";

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className={`flex items-center justify-center py-2 text-ink-400 hover:text-ink-600 hover:bg-ink-50 transition-colors ${className}`}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
