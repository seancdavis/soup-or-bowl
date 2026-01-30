/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly NETLIFY_DATABASE_URL: string;
  readonly NEON_AUTH_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
