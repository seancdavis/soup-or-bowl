/// <reference path="../.astro/types.d.ts" />

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
