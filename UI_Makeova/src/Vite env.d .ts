/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // Add more env variables here as you use them:
  // readonly VITE_ANOTHER_VAR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}