import { Logger } from "@nestjs/common";
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { LEGACY_DOMAIN_REDIRECTS } from "../config/api-routes";

export type LegacyPathTelemetry = {
  originalPath: string;
  successorPath: string;
  timestamp: string;
  legacyPrefix: string;
  metricName: "legacy_path_access_total";
};

const telemetryLogger = new Logger("LegacyPathTelemetry");
const DEFAULT_TELEMETRY_FILE = join(process.cwd(), "apps/api/var/audit/legacy-path-access.ndjson");

export function resolveLegacyPrefix(pathname: string): string {
  const orderedPrefixes = Object.keys(LEGACY_DOMAIN_REDIRECTS).sort((a, b) => b.length - a.length);
  for (const prefix of orderedPrefixes) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return prefix;
    }
  }
  return "unknown";
}

export function resolveLegacyTelemetryFilePath(): string {
  return process.env.LEGACY_PATH_AUDIT_LOG_FILE ?? DEFAULT_TELEMETRY_FILE;
}

export function recordLegacyPathAccess(originalPath: string, successorPath: string): LegacyPathTelemetry {
  const entry: LegacyPathTelemetry = {
    originalPath,
    successorPath,
    timestamp: new Date().toISOString(),
    legacyPrefix: resolveLegacyPrefix(originalPath),
    metricName: "legacy_path_access_total",
  };

  const filePath = resolveLegacyTelemetryFilePath();
  mkdirSync(dirname(filePath), { recursive: true });
  appendFileSync(filePath, `${JSON.stringify(entry)}\n`, { encoding: "utf8" });

  telemetryLogger.warn(
    `legacy.path.access metric=${entry.metricName} prefix=${entry.legacyPrefix} original=${entry.originalPath} successor=${entry.successorPath} ts=${entry.timestamp}`,
  );

  return entry;
}
