/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the MatchPoint Django API, baked in at build time.
   * Leave empty to talk to the same origin (nginx proxies /api/ in the Docker image).
   */
  readonly VITE_API_URL?: string;
  /** '1' seeds demo mode ON for a fresh visitor. Dev-only convenience; off in production builds. */
  readonly VITE_DEMO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
