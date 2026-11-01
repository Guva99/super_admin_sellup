import { useTheme } from "@/shared/lib";

export interface ThemeToggleController {
  isDark: boolean;
  toggle: () => void;
}

/** Две темы — светлая и тёмная. Выбор запоминается в браузере (см. shared/lib/theme). */
export function useThemeToggle(): ThemeToggleController {
  const [theme, setTheme] = useTheme();
  return {
    isDark: theme === "dark",
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
