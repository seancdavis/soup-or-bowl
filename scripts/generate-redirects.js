/**
 * Generate Netlify redirects file at build time.
 * This creates a transparent proxy for Neon Auth requests.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const neonAuthUrl = process.env.NEON_AUTH_URL;

if (!neonAuthUrl) {
  console.warn(
    "[generate-redirects] Warning: NEON_AUTH_URL not set, skipping auth proxy redirect"
  );
}

const redirects = `# Proxy Neon Auth requests through our domain for first-party cookies
${neonAuthUrl ? `/neon-auth/*  ${neonAuthUrl}/:splat  200` : "# NEON_AUTH_URL not configured"}

# Note: Astro handles its own routing, no SPA fallback needed
`;

const distDir = path.join(__dirname, "..", "dist");
const redirectsPath = path.join(distDir, "_redirects");

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(redirectsPath, redirects);
console.log("[generate-redirects] Created", redirectsPath);
console.log("[generate-redirects] Neon Auth proxy:", neonAuthUrl ? "enabled" : "disabled");
