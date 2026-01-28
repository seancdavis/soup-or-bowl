import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: netlify({
    edgeMiddleware: true,
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
