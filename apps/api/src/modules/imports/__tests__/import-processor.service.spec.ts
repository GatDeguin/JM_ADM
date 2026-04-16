import { describe, expect, it, vi } from "vitest";
import { ImportProcessorService } from "../application/import-processor.service";

describe("ImportProcessorService", () => {
  it("genera resumen detallado por entidad y marca imported_with_warnings", async () => {
    const importsRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "job-1",
        type: "customers",
        originals: [{ code: "C1", name: "Cliente 1" }],
        mapping: {},
      }),
      applyRecord: vi.fn().mockResolvedValue({ entity: "Customer", state: "created", warnings: ["alias sugerido"] }),
      updateJob: vi.fn().mockImplementation(async (_id, data) => ({ id: "job-1", ...data })),
      appendAudit: vi.fn().mockResolvedValue(undefined),
    } as any;

    const importersService = {
      isSupported: vi.fn().mockReturnValue(true),
      process: vi.fn().mockReturnValue({
        records: [
          {
            key: "C1",
            originalValue: { code: "C1", name: "Cliente 1" },
            canonicalValue: { code: "C1", name: "Cliente 1" },
            warnings: [],
            suggestions: [],
            duplicate: false,
            valid: true,
            pendingHomologation: false,
          },
        ],
        summary: { type: "customers", total: 1, valid: 1, invalid: 0, duplicates: 0, pendingHomologation: 0 },
        warnings: [],
      }),
    } as any;

    const importEventsService = { emitFinished: vi.fn() } as any;

    const service = new ImportProcessorService(importsRepository, importersService, importEventsService);
    const result = await service.execute("job-1");

    expect(result.status).toBe("imported_with_warnings");
    expect(result.summary).toMatchObject({
      imported: 1,
      created: 1,
      updated: 0,
      skipped: 0,
      errors: 0,
      entities: {
        Customer: { created: 1, updated: 0, skipped: 0, errors: 0 },
      },
    });
  });

  it("marca failed cuando hay errores aplicando registros", async () => {
    const importsRepository = {
      findById: vi.fn().mockResolvedValue({ id: "job-2", type: "suppliers", originals: [{ code: "S1", name: "Prov" }], mapping: {} }),
      applyRecord: vi.fn().mockRejectedValue(new Error("db down")),
      updateJob: vi.fn().mockImplementation(async (_id, data) => ({ id: "job-2", ...data })),
      appendAudit: vi.fn().mockResolvedValue(undefined),
    } as any;

    const importersService = {
      isSupported: vi.fn().mockReturnValue(true),
      process: vi.fn().mockReturnValue({
        records: [
          {
            key: "S1",
            originalValue: { code: "S1", name: "Prov" },
            canonicalValue: { code: "S1", name: "Prov" },
            warnings: [],
            suggestions: [],
            duplicate: false,
            valid: true,
            pendingHomologation: false,
          },
        ],
        summary: { type: "suppliers", total: 1, valid: 1, invalid: 0, duplicates: 0, pendingHomologation: 0 },
        warnings: [],
      }),
    } as any;

    const service = new ImportProcessorService(importsRepository, importersService, { emitFinished: vi.fn() } as any);
    const result = await service.execute("job-2");

    expect(result.status).toBe("failed");
    expect((result.summary as { errors: number }).errors).toBe(1);
  });
});
