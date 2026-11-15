/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL бэкенда без завершающего слеша, напр. http://localhost:8080. */
  readonly VITE_API_URL?: string;
  /** Адрес лендинга, на котором выходит блог; по умолчанию https://sellup-system.online. */
  readonly VITE_SITE_URL?: string;
  /** Домен магазинов клиентов (<slug>.<домен>); по умолчанию sellup-system.online. */
  readonly VITE_CLIENT_ROOT_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
