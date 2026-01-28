/// <reference path="../.astro/types.d.ts" />

// Environment variable types
interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly NEON_AUTH_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type NetlifyLocals = import("@astrojs/netlify").NetlifyLocals;

declare namespace App {
  interface Locals extends NetlifyLocals {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
    } | null;
    isApproved: boolean;
  }
}
