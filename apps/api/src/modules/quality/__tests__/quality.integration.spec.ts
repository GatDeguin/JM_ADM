import { ConflictException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { QualityService } from "../application/quality.service";

describe("quality integration", () => {
  it("falla si no encuentra familia para checklist", async () => {
    const repo = { findBatchQualityContext: vi.fn(async () => null) };
    const service = new QualityService(repo as never);
    await expect(service.getChecklistForBatch("batch-1")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("falla si se intenta crear QC sin checklist", async () => {
    const repo = { findBatch: vi.fn(), createWithChecklist: vi.fn(), list: vi.fn(), get: vi.fn(), update: vi.fn(), remove: vi.fn(), runAction: vi.fn() };
    const service = new QualityService(repo as never);

    await expect(service.create({ batchId: "b-1", decision: "approved", checklistItems: [] })).rejects.toBeInstanceOf(ConflictException);
  });

  it("exige lote en qc_pending para decidir calidad", async () => {
    const repo = {
      findBatch: vi.fn(async () => ({ id: "b-1", status: "in_process" })),
      createWithChecklist: vi.fn(),
      list: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      runAction: vi.fn(),
    };
    const service = new QualityService(repo as never);

    await expect(
      service.create({ batchId: "b-1", decision: "approved", checklistItems: [{ checklistItem: "ph", passed: true }] }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rechaza decision approved con items fallidos", async () => {
    const repo = {
      findBatch: vi.fn(async () => ({ id: "b-1", status: "qc_pending" })),
      createWithChecklist: vi.fn(),
      list: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      runAction: vi.fn(),
    };
    const service = new QualityService(repo as never);

    await expect(
      service.create({ batchId: "b-1", decision: "approved", checklistItems: [{ checklistItem: "viscosidad", passed: false }] }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
