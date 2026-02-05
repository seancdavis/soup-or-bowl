#!/usr/bin/env node

/**
 * Production Database Migration Script
 *
 * This script runs database migrations against the PRODUCTION database.
 * It includes multiple safeguards to prevent accidental execution.
 *
 * Requirements:
 * 1. Must pass --production flag
 * 2. Must type "PRODUCTION" to confirm
 * 3. Requires NETLIFY_PRODUCTION_DATABASE_URL environment variable
 *
 * Usage:
 *   npm run db:migrate:prod
 *
 * Or directly:
 *   node scripts/migrate-production.js --production
 */

import { execSync } from "child_process";
import readline from "readline";

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function error(message) {
  console.error(`${RED}${BOLD}ERROR:${RESET} ${message}`);
  process.exit(1);
}

function warn(message) {
  console.log(`${YELLOW}${BOLD}WARNING:${RESET} ${message}`);
}

function success(message) {
  console.log(`${GREEN}${BOLD}SUCCESS:${RESET} ${message}`);
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  // Check for --production flag
  if (!process.argv.includes("--production")) {
    error(
      "Missing --production flag.\n\n" +
        "  This script runs migrations against the PRODUCTION database.\n" +
        "  If you meant to migrate development, use: npm run db:migrate\n\n" +
        "  To migrate production, run: npm run db:migrate:prod"
    );
  }

  // Check for production database URL
  const productionDbUrl = process.env.NETLIFY_PRODUCTION_DATABASE_URL;
  if (!productionDbUrl) {
    error(
      "NETLIFY_PRODUCTION_DATABASE_URL environment variable is not set.\n\n" +
        "  Set it in your shell or .env file:\n" +
        "    export NETLIFY_PRODUCTION_DATABASE_URL=postgres://...\n\n" +
        "  You can get this value from the Netlify dashboard or with:\n" +
        "    netlify env:get NETLIFY_DATABASE_URL --context production"
    );
  }

  // Show warning and database info
  console.log("");
  console.log(
    `${RED}${BOLD}═══════════════════════════════════════════════════════════════${RESET}`
  );
  console.log(
    `${RED}${BOLD}                    PRODUCTION DATABASE MIGRATION               ${RESET}`
  );
  console.log(
    `${RED}${BOLD}═══════════════════════════════════════════════════════════════${RESET}`
  );
  console.log("");
  warn("You are about to run migrations on the PRODUCTION database.");
  console.log("");

  // Show a masked version of the connection string for verification
  const maskedUrl = productionDbUrl.replace(
    /(:\/\/)([^:]+):([^@]+)(@)/,
    "$1$2:****$4"
  );
  console.log(`  Database: ${maskedUrl}`);
  console.log("");

  // Require confirmation
  const confirmation = await prompt(
    `${BOLD}Type "PRODUCTION" to confirm: ${RESET}`
  );

  if (confirmation !== "PRODUCTION") {
    console.log("");
    error("Confirmation did not match. Aborting.");
  }

  console.log("");
  console.log("Running migrations...");
  console.log("");

  try {
    // Run drizzle-kit migrate with the production database URL
    execSync("npx drizzle-kit migrate", {
      stdio: "inherit",
      env: {
        ...process.env,
        NETLIFY_DATABASE_URL: productionDbUrl,
      },
    });

    console.log("");
    success("Production database migrations completed.");
  } catch (err) {
    console.log("");
    error("Migration failed. Check the output above for details.");
  }
}

main();
