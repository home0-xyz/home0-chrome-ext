/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_USE_CLERK_AUTH?: string
  readonly VITE_USE_MOCK_AUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}