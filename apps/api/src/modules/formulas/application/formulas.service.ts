import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { assertRequiredText } from "../../../common/domain-rules/shared-domain-rules";
import { FormulasRepository } from "../infrastructure/formulas.repository";
import { AuditTrailService } from "../../audit/application/audit-trail.service";

const noopAuditTrail = {
  logCreate: async () => undefined,
  logHomologation: async () => undefined,
};

@Injectable()
export class FormulasService {
  constructor(
    private readonly formulasRepository: FormulasRepository,
    private readonly auditTrailService: Pick<AuditTrailService, "logCreate" | "logHomologation"> = noopAuditTrail,
  ) {}

  list() {
    return this.formulasRepository.list();
  }

  async detail(id: string) {
    const formula = await this.formulasRepository.findById(id);
    if (!formula) {
      throw new NotFoundException("Fórmula no encontrada");
    }
    return formula;
  }

  async create(code: string, name: string) {
    assertRequiredText(code, "el código de fórmula");
    assertRequiredText(name, "el nombre de fórmula");

    try {
      const created = await this.formulasRepository.create(code, name);
      await this.auditTrailService.logCreate({
        entity: "FormulaTemplate",
        entityId: created.id,
        origin: "formulas.create",
        after: created,
      });
      return created;
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        throw new ConflictException("El código de fórmula ya existe");
      }
      throw error;
    }
  }

  async approve(id: string) {
    const previous = await this.detail(id);
    const formula = await this.formulasRepository.approve(id);
    await this.auditTrailService.logHomologation({
      entity: "FormulaTemplate",
      entityId: id,
      origin: "formulas.approve",
      before: previous,
      after: formula,
    });
    return { event: "formula.approved", formula };
  }
}
