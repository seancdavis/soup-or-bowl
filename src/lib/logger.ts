/**
 * A colorful, configurable logging utility.
 *
 * Control via environment variables:
 * - LOG_LEVEL: "debug" | "info" | "warn" | "error" | "silent" (default: "info")
 * - LOG_COLORS: "true" | "false" (default: "true")
 *
 * Usage:
 *   import { logger } from "./logger";
 *   logger.debug("AUTH", "Checking session...");
 *   logger.info("DB", "Connected to database");
 *   logger.warn("CACHE", "Cache miss for key:", key);
 *   logger.error("API", "Request failed:", error);
 *
 * Or create a scoped logger:
 *   const log = logger.scope("AUTH");
 *   log.debug("Checking session...");
 *   log.info("User authenticated:", user.email);
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

interface LoggerConfig {
  level: LogLevel;
  colors: boolean;
}

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",

  // Foreground colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Bright foreground colors
  brightBlack: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",

  // Background colors
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgYellow: "\x1b[43m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
};

// Level configurations with colors and priority
const levelConfig: Record<
  Exclude<LogLevel, "silent">,
  { priority: number; color: string; bgColor: string; label: string }
> = {
  debug: {
    priority: 0,
    color: colors.brightMagenta,
    bgColor: colors.bgMagenta,
    label: "DEBUG",
  },
  info: {
    priority: 1,
    color: colors.brightCyan,
    bgColor: colors.bgCyan,
    label: " INFO",
  },
  warn: {
    priority: 2,
    color: colors.brightYellow,
    bgColor: colors.bgYellow,
    label: " WARN",
  },
  error: {
    priority: 3,
    color: colors.brightRed,
    bgColor: colors.bgRed,
    label: "ERROR",
  },
};

// Scope colors - cycle through these for different scopes
const scopeColors = [
  colors.cyan,
  colors.green,
  colors.yellow,
  colors.blue,
  colors.magenta,
  colors.brightCyan,
  colors.brightGreen,
  colors.brightYellow,
  colors.brightBlue,
  colors.brightMagenta,
];

// Keep track of scope color assignments
const scopeColorMap = new Map<string, string>();
let scopeColorIndex = 0;

function getScopeColor(scope: string): string {
  if (!scopeColorMap.has(scope)) {
    scopeColorMap.set(scope, scopeColors[scopeColorIndex % scopeColors.length]);
    scopeColorIndex++;
  }
  return scopeColorMap.get(scope)!;
}

function getConfig(): LoggerConfig {
  const level = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
  const colorsEnabled = process.env.LOG_COLORS !== "false";

  return {
    level: ["debug", "info", "warn", "error", "silent"].includes(level)
      ? level
      : "info",
    colors: colorsEnabled,
  };
}

function shouldLog(level: Exclude<LogLevel, "silent">): boolean {
  const config = getConfig();
  if (config.level === "silent") return false;
  return levelConfig[level].priority >= levelConfig[config.level].priority;
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatMessage(
  level: Exclude<LogLevel, "silent">,
  scope: string,
  args: unknown[]
): string {
  const config = getConfig();
  const { color, bgColor, label } = levelConfig[level];
  const scopeColor = getScopeColor(scope);
  const timestamp = formatTimestamp();

  if (config.colors) {
    const levelBadge = `${bgColor}${colors.black}${colors.bold} ${label} ${colors.reset}`;
    const scopeBadge = `${scopeColor}${colors.bold}[${scope}]${colors.reset}`;
    const time = `${colors.dim}${timestamp}${colors.reset}`;
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      )
      .join(" ");

    return `${levelBadge} ${scopeBadge} ${time} ${color}${message}${colors.reset}`;
  }

  // No colors - plain text
  const message = args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg) : String(arg)
    )
    .join(" ");

  return `[${label}] [${scope}] ${timestamp} ${message}`;
}

function log(
  level: Exclude<LogLevel, "silent">,
  scope: string,
  ...args: unknown[]
): void {
  if (!shouldLog(level)) return;

  const message = formatMessage(level, scope, args);

  switch (level) {
    case "error":
      console.error(message);
      break;
    case "warn":
      console.warn(message);
      break;
    default:
      console.log(message);
  }
}

/**
 * Scoped logger - pre-binds a scope for convenience
 */
interface ScopedLogger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

function createScopedLogger(scope: string): ScopedLogger {
  return {
    debug: (...args: unknown[]) => log("debug", scope, ...args),
    info: (...args: unknown[]) => log("info", scope, ...args),
    warn: (...args: unknown[]) => log("warn", scope, ...args),
    error: (...args: unknown[]) => log("error", scope, ...args),
  };
}

/**
 * Main logger export
 */
export const logger = {
  /**
   * Log a debug message (lowest priority, most verbose)
   */
  debug: (scope: string, ...args: unknown[]) => log("debug", scope, ...args),

  /**
   * Log an info message (general information)
   */
  info: (scope: string, ...args: unknown[]) => log("info", scope, ...args),

  /**
   * Log a warning message (potential issues)
   */
  warn: (scope: string, ...args: unknown[]) => log("warn", scope, ...args),

  /**
   * Log an error message (highest priority)
   */
  error: (scope: string, ...args: unknown[]) => log("error", scope, ...args),

  /**
   * Create a scoped logger with pre-bound scope name
   *
   * @example
   * const log = logger.scope("AUTH");
   * log.debug("Checking session...");
   * log.info("User authenticated");
   */
  scope: createScopedLogger,
};

export type { LogLevel, ScopedLogger };
