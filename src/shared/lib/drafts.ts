import { useEffect, useRef, useState } from "react";

/**
 * Черновики форм в браузере. Нужны для случая, от которого не спасает
 * подтверждение закрытия: перезагрузка страницы, закрытая вкладка, упавший
 * браузер. Лежат в localStorage, у каждого окна свой ключ.
 *
 * Файлы сюда не кладутся — только то, что сериализуется. Вложения новой
 * задачи уже загружены на сервер, поэтому в черновике хранятся их id.
 */
const PREFIX = "sellup.draft.";
/** Через сколько черновик считается протухшим: за неделю о нём забывают. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface StoredDraft<T> {
  value: T;
  savedAt: number;
}

function read<T>(key: string): StoredDraft<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft<T>;
    if (!parsed || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return parsed;
  } catch {
    // Приватный режим или испорченный JSON — черновика просто нет.
    return null;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ value, savedAt: Date.now() } satisfies StoredDraft<T>));
  } catch {
    // Хранилище переполнено или недоступно — молча обходимся без черновика.
  }
}

function drop(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // см. write
  }
}

/** Убирает протухшие черновики; вызывается при входе в приложение. */
export function purgeOldDrafts(now = Date.now()): number {
  try {
    const stale = Object.keys(localStorage).filter((full) => {
      if (!full.startsWith(PREFIX)) return false;
      try {
        const parsed = JSON.parse(localStorage.getItem(full) ?? "") as StoredDraft<unknown>;
        return typeof parsed?.savedAt !== "number" || now - parsed.savedAt > MAX_AGE_MS;
      } catch {
        return true;
      }
    });
    stale.forEach((full) => localStorage.removeItem(full));
    return stale.length;
  } catch {
    return 0;
  }
}

export interface DraftState {
  /** Черновик был найден и подставлен — форма показывает об этом пометку. */
  restored: boolean;
  /** Забыть черновик: после сохранения формы и по кнопке «не восстанавливать». */
  clear: () => void;
}

interface DraftOptions<T> {
  /** null — не хранить (форма закрыта, сущности ещё нет). */
  key: string | null;
  value: T;
  /** Подставить найденный черновик в форму. */
  restore: (saved: T) => void;
  /** Пустую форму не храним, а найденный пустой черновик не предлагаем. */
  isEmpty: (value: T) => boolean;
}

/**
 * Держит черновик формы в браузере: пишет при изменениях (с задержкой, чтобы
 * не дёргать хранилище на каждую букву) и подставляет сохранённое при
 * открытии. Форма остаётся владельцем своего состояния — хук только
 * зеркалит его.
 */
export function useDraft<T>({ key, value, restore, isEmpty }: DraftOptions<T>): DraftState {
  const [restored, setRestored] = useState(false);
  // Колбэки меняются на каждом рендере; восстановление должно случиться
  // ровно один раз на ключ, поэтому читаем их через ref.
  const restoreRef = useRef(restore);
  restoreRef.current = restore;
  const isEmptyRef = useRef(isEmpty);
  isEmptyRef.current = isEmpty;
  const loadedKey = useRef<string | null>(null);
  // Восстановление подставляет значение через setState, то есть в следующем
  // рендере. Без этого флага запись успела бы стереть черновик тем пустым
  // значением, с которым форма открылась.
  const justRestored = useRef(false);

  useEffect(() => {
    // Форма закрыта — ключа нет; при следующем открытии черновик читается заново.
    if (!key) {
      loadedKey.current = null;
      return;
    }
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    setRestored(false);
    const saved = read<T>(key);
    if (saved && !isEmptyRef.current(saved.value)) {
      justRestored.current = true;
      restoreRef.current(saved.value);
      setRestored(true);
    }
  }, [key]);

  useEffect(() => {
    if (!key || loadedKey.current !== key) return;
    if (justRestored.current) {
      justRestored.current = false;
      return;
    }
    if (isEmptyRef.current(value)) {
      drop(key);
      return;
    }
    const timer = setTimeout(() => write(key, value), 400);
    return () => clearTimeout(timer);
  }, [key, value]);

  return {
    restored,
    clear: () => {
      if (key) drop(key);
      loadedKey.current = key;
      justRestored.current = true;
      setRestored(false);
    },
  };
}
