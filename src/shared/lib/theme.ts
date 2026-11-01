import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

/**
 * Выбор темы хранится в браузере под этим ключом. Его же читает скрипт в
 * index.html — до загрузки приложения, иначе тёмная тема мигала бы белым на
 * каждом обновлении страницы. Меняете ключ — поменяйте и там.
 */
const STORAGE_KEY = "sellup.theme";

const listeners = new Set<() => void>();

/** Источник правды — атрибут на <html>: при загрузке его уже выставил скрипт в index.html. */
function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  // Элементы с transition (сайдбар, кнопки, строки) иначе перекрашиваются с
  // задержкой, а остальные — мгновенно, и на долю секунды интерфейс «плывёт».
  // Переходы выключаем, применяем стили синхронно и включаем обратно.
  root.classList.add("theme-switching");
  root.dataset.theme = theme;
  void getComputedStyle(root).backgroundColor;
  setTimeout(() => root.classList.remove("theme-switching"), 0);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Хранилище недоступно (приватный режим) — тема сменится, но не запомнится.
  }
  listeners.forEach((listener) => listener());
}

/** Текущая тема и её смена. Провайдер не нужен — работает и на странице входа. */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, readTheme);
  return [theme, setTheme];
}
