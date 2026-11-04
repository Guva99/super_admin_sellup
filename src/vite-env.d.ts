/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL бэкенда без завершающего слеша, напр. http://localhost:8080. */
  readonly VITE_API_URL?: string;
  /** Адрес лендинга, на котором выходит блог; по умолчанию https://sellup-system.online. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
