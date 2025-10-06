/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_VERSION: string
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_S3_REGION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
