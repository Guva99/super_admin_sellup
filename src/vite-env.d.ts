/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL бэкенда без завершающего слеша, напр. http://localhost:8080. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
