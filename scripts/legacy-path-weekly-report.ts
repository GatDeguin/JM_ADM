import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type LegacyPathTelemetry = {
  originalPath: string;
  successorPath: string;
  timestamp: string;
  legacyPrefix: string;
  metricName: "legacy_path_access_total";
};

type WeeklyReportRow = {
  weekStart: string;
  weekEnd: string;
  legacyPrefix: string;
  totalAccesses: number;
};

const DEFAULT_INPUT = resolve(process.cwd(), "apps/api/var/audit/legacy-path-access.ndjson");
const DEFAULT_OUTPUT = resolve(process.cwd(), "docs/reports/legacy-path-usage-weekly.md");

function parseArgs() {
  const inputArg = process.argv.find((arg) => arg.startsWith("--input="));
  const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
  return {
    inputPath: inputArg ? resolve(process.cwd(), inputArg.replace("--input=", "")) : DEFAULT_INPUT,
    outputPath: outputArg ? resolve(process.cwd(), outputArg.replace("--output=", "")) : DEFAULT_OUTPUT,
  };
}

function startOfIsoWeek(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() - day + 1);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function endOfIsoWeek(start: Date): Date {
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

function readTelemetry(filePath: string): LegacyPathTelemetry[] {
  if (!existsSync(filePath)) {
    return [];
  }

  const lines = readFileSync(filePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line) => JSON.parse(line) as LegacyPathTelemetry);
}

function groupByWeekAndPrefix(entries: LegacyPathTelemetry[]): WeeklyReportRow[] {
  const grouped = new Map<string, WeeklyReportRow>();

  for (const entry of entries) {
    const weekStartDate = startOfIsoWeek(new Date(entry.timestamp));
    const weekEndDate = endOfIsoWeek(weekStartDate);
    const weekStart = weekStartDate.toISOString().slice(0, 10);
    const weekEnd = weekEndDate.toISOString().slice(0, 10);
    const key = `${weekStart}|${entry.legacyPrefix}`;

    const previous = grouped.get(key);
    grouped.set(key, {
      weekStart,
      weekEnd,
      legacyPrefix: entry.legacyPrefix,
      totalAccesses: (previous?.totalAccesses ?? 0) + 1,
    });
  }

  return [...grouped.values()].sort((a, b) => {
    if (a.weekStart === b.weekStart) {
      return a.legacyPrefix.localeCompare(b.legacyPrefix);
    }
    return a.weekStart.localeCompare(b.weekStart);
  });
}

function buildMarkdown(rows: WeeklyReportRow[], inputPath: string): string {
  const generatedAt = new Date().toISOString();
  const tableRows = rows
    .map((row) => `| ${row.weekStart} | ${row.weekEnd} | ${row.legacyPrefix} | ${row.totalAccesses} |`)
    .join("\n");

  const body = rows.length
    ? tableRows
    : "| - | - | - | 0 |";

  return `# Reporte semanal de uso residual de rutas legacy\n\n- Generado: ${generatedAt}\n- Fuente: \`${inputPath}\`\n\n| Semana (inicio UTC) | Semana (fin UTC) | Prefijo legacy | Accesos |\n|---|---|---|---|\n${body}\n`;
}

function main() {
  const { inputPath, outputPath } = parseArgs();
  const telemetry = readTelemetry(inputPath);
  const rows = groupByWeekAndPrefix(telemetry);
  const markdown = buildMarkdown(rows, inputPath);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, markdown, "utf8");

  console.log(`Reporte generado: ${outputPath}`);
  console.log(`Eventos procesados: ${telemetry.length}`);
}

main();
