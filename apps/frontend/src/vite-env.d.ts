/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_FEATURE_NOTIFICATIONS: string
  readonly VITE_FEATURE_SPARE_PARTS: string
  readonly VITE_FEATURE_MESSAGING: string
  readonly VITE_FEATURE_SEARCH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}