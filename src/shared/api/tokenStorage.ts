/**
 * Токены сессии в localStorage.
 *
 * localStorage, а не sessionStorage, потому что он общий для вкладок:
 * refresh-токен одноразовый, и если бы каждая вкладка держала свою копию,
 * первое же обновление в одной вкладке ломало бы все остальные.
 */
export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  /** ISO-время. */
  accessTokenExpiresAt: string;
  /** ISO-время. Абсолютный конец сессии — при ротации не меняется. */
  refreshTokenExpiresAt: string;
}

const STORAGE_KEY = "sellup.session";

// Хранилище может быть недоступно (приватный режим, запрет сайта) — тогда
// сессия живёт только до перезагрузки, но приложение не падает.
function read(): StoredTokens | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    return null;
  }
}

export const tokenStorage = {
  get: read,

  set(tokens: StoredTokens) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    } catch {
      // см. комментарий к read
    }
  },

  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // см. комментарий к read
    }
  },

  /** Истёк ли срок сессии по часам клиента — без запроса на сервер. */
  isSessionExpired(tokens: StoredTokens, now: Date = new Date()): boolean {
    return new Date(tokens.refreshTokenExpiresAt) <= now;
  },
};
