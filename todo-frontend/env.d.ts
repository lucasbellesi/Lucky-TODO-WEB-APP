/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly ENV?: 'sandbox' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
