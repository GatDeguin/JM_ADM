import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

type CommandCheck = {
  id: "api_integration" | "e2e_real" | "seed_check";
  label: string;
  command: string;
};

type DodCriterion = {
  id: string;
  description: string;
  critical: boolean;
  checks: CommandCheck["id"][];
};

type CheckResult = {
  id: CommandCheck["id"];
  label: string;
  command: string;
  exitCode: number;
  passed: boolean;
};

type CriterionResult = DodCriterion & {
  passed: boolean;
  failedChecks: CommandCheck["id"][];
};

const commands: CommandCheck[] = [
  {
    id: "api_integration",
    label: "Integración API (Nest + Prisma)",
    command: "pnpm --filter api test",
  },
  {
    id: "e2e_real",
    label: "E2E real (Playwright + API/DB real)",
    command: "pnpm --filter web test:e2e:real --reporter=line",
  },
  {
    id: "seed_check",
    label: "Chequeo seed de datos",
    command: "pnpm db:seed:check",
  },
];

const dodCriteria: DodCriterion[] = [
  {
    id: "DOD-001",
    description: "Autenticación operativa (login + acceso protegido)",
    critical: true,
    checks: ["api_integration", "e2e_real", "seed_check"],
  },
  {
    id: "DOD-002",
    description: "OP/lote (alta y trazabilidad mínima)",
    critical: true,
    checks: ["api_integration", "e2e_real", "seed_check"],
  },
  {
    id: "DOD-003",
    description: "Fraccionamiento con consistencia de stock",
    critical: true,
    checks: ["api_integration", "e2e_real", "seed_check"],
  },
  {
    id: "DOD-004",
    description: "Venta y despacho mínimo trazable",
    critical: true,
    checks: ["api_integration", "e2e_real", "seed_check"],
  },
  {
    id: "DOD-005",
    description: "Cobranza (CxC + recibo)",
    critical: true,
    checks: ["api_integration", "e2e_real", "seed_check"],
  },
  {
    id: "DOD-006",
    description: "Pago (CxP + pago)",
    critical: true,
    checks: ["api_integration", "e2e_real", "seed_check"],
  },
  {
    id: "DOD-007",
    description: "Auditoría verificable",
    critical: true,
    checks: ["api_integration", "e2e_real"],
  },
  {
    id: "DOD-008",
    description: "Snapshot de costos y márgenes",
    critical: false,
    checks: ["api_integration", "seed_check"],
  },
  {
    id: "DOD-009",
    description: "Calidad de catálogo base y homologación pendiente",
    critical: false,
    checks: ["api_integration", "seed_check"],
  },
  {
    id: "DOD-010",
    description: "Bootstrap de entorno de pruebas consistente",
    critical: false,
    checks: ["seed_check"],
  },
];

function runCommand(command: string, dryRun: boolean): { exitCode: number } {
  if (dryRun) {
    console.log(`[dry-run] ${command}`);
    return { exitCode: 0 };
  }

  const result = spawnSync(command, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  return { exitCode: result.status ?? 1 };
}

function createMarkdownReport(
  checkResults: CheckResult[],
  criteriaResults: CriterionResult[],
): string {
  const generatedAt = new Date().toISOString();
  const checkRows = checkResults
    .map(
      (check) =>
        `| ${check.id} | ${check.label} | \`${check.command}\` | ${check.passed ? "✅ PASS" : "❌ FAIL"} |`,
    )
    .join("\n");

  const criteriaRows = criteriaResults
    .map((criterion) => {
      const failedChecks =
        criterion.failedChecks.length > 0 ? criterion.failedChecks.join(", ") : "-";
      return `| ${criterion.id} | ${criterion.description} | ${criterion.critical ? "✅ Sí" : "⛔ No"} | ${criterion.passed ? "✅ PASS" : "❌ FAIL"} | ${failedChecks} |`;
    })
    .join("\n");

  return `# DoD compliance report\n\nGenerado: ${generatedAt}\n\n## Resultados por bloque de prueba\n\n| Check ID | Bloque | Comando | Resultado |\n|---|---|---|---|\n${checkRows}\n\n## Resultado por criterio\n\n| Criterio | Descripción | Crítico | Resultado | Checks fallidos |\n|---|---|---|---|---|\n${criteriaRows}\n`;
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  mkdirSync("artifacts", { recursive: true });

  const checkResults: CheckResult[] = commands.map((command) => {
    const { exitCode } = runCommand(command.command, dryRun);
    return {
      ...command,
      exitCode,
      passed: exitCode === 0,
    };
  });

  const checkStatus = new Map(checkResults.map((item) => [item.id, item.passed]));

  const criteriaResults: CriterionResult[] = dodCriteria.map((criterion) => {
    const failedChecks = criterion.checks.filter((checkId) => !checkStatus.get(checkId));
    return {
      ...criterion,
      passed: failedChecks.length === 0,
      failedChecks,
    };
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    checks: checkResults,
    criteria: criteriaResults,
    totals: {
      criteria: criteriaResults.length,
      passed: criteriaResults.filter((item) => item.passed).length,
      failed: criteriaResults.filter((item) => !item.passed).length,
      criticalFailed: criteriaResults.filter((item) => item.critical && !item.passed).length,
    },
  };

  const jsonOutputPath = join("artifacts", "dod-compliance.json");
  const markdownOutputPath = join("artifacts", "dod-compliance.md");

  writeFileSync(jsonOutputPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  writeFileSync(markdownOutputPath, createMarkdownReport(checkResults, criteriaResults), "utf8");

  const hasCriticalFailures = summary.totals.criticalFailed > 0;

  console.log("\n=== DoD summary ===");
  console.log(`Criteria: ${summary.totals.passed}/${summary.totals.criteria} passing`);
  console.log(`Critical failures: ${summary.totals.criticalFailed}`);
  console.log(`Report JSON: ${jsonOutputPath}`);
  console.log(`Report MD: ${markdownOutputPath}`);
  if (dryRun) {
    console.log("Dry-run mode enabled: commands were not executed.");
  }

  if (hasCriticalFailures) {
    console.error("\n❌ DoD compliance failed: at least one critical criterion is failing.");
    process.exit(1);
  }

  console.log("\n✅ DoD compliance OK");
}

main();
