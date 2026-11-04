/**
 * Structured server logging on pino (AGENTS.md "Security minimums").
 *
 * The root logger is built on first use, never at import, so `next build`
 * passes with no env. It writes JSON lines straight to stdout in-process: no
 * transports or worker threads, which break under Next's bundler.
 */
import { randomUUID } from "node:crypto";

import pino, { type DestinationStream, type Logger, type LoggerOptions } from "pino";

import { getEnv, type LogLevel } from "./config/env.ts";

export type { Logger };

export const REDACTED = "[REDACTED]";

/** pino `redact` paths: top-level keys, one level down (`*.x`) and request/response headers. */
export const REDACT_PATHS = [
  "password",
  "passwordHash",
  "token",
  "authorization",
  "cookie",
  "jwt",
  "apiKey",
  "*.password",
  "*.passwordHash",
  "*.token",
  "*.authorization",
  "*.cookie",
  "*.jwt",
  "*.apiKey",
  'headers["set-cookie"]',
  "req.headers.authorization",
  "req.headers.cookie",
  'res.headers["set-cookie"]',
] as const;

export const REQUEST_ID_HEADER = "x-request-id";
export const MAX_REQUEST_ID_LENGTH = 128;
// Letters, digits and `._:-` cover UUIDs and common proxy/tracing formats
// while keeping log-injection characters (spaces, quotes, newlines) out.
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;

export interface CreateLoggerOptions {
  level?: LogLevel;
  /** Where JSON lines go; defaults to stdout. Tests pass an in-memory stream. */
  destination?: DestinationStream;
}

export function createLogger({ level, destination }: CreateLoggerOptions = {}): Logger {
  const options: LoggerOptions = {
    level: level ?? getEnv().logLevel,
    redact: { paths: [...REDACT_PATHS], censor: REDACTED },
  };
  return destination ? pino(options, destination) : pino(options);
}

let rootLogger: Logger | undefined;

/** The process-wide logger, created on first call with `LOG_LEVEL` from the env. */
export function getLogger(): Logger {
  rootLogger ??= createLogger();
  return rootLogger;
}

/** Returns the client-sent id when it's safe to log and echo, otherwise a fresh UUID. */
export function resolveRequestId(candidate: string | null | undefined): string {
  const isValid =
    typeof candidate === "string" &&
    candidate.length <= MAX_REQUEST_ID_LENGTH &&
    REQUEST_ID_PATTERN.test(candidate);
  return isValid ? candidate : randomUUID();
}

export interface RequestLogger {
  logger: Logger;
  requestId: string;
}

/** A child logger tagged with the request's `requestId`, which the caller echoes in `x-request-id`. */
export function createRequestLogger(
  headers?: Pick<Headers, "get">,
  parent: Logger = getLogger(),
): RequestLogger {
  const requestId = resolveRequestId(headers?.get(REQUEST_ID_HEADER));
  return { logger: parent.child({ requestId }), requestId };
}
