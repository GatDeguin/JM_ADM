import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { assertRequiredText } from "../../../common/domain-rules/shared-domain-rules";
import { FormulasRepository } from "../infrastructure/formulas.repository";
import { AuditTrailService } from "../../audit/application/audit-trail.service";

const noopAuditTrail = {
  logCreate: async () => undefined,
  logHomologation: async () => undefined,
  logUpdate: async () => undefined,
};

type FormulaVersionListItem = { id: string; status: string };
type FormulaComponentDiffItem = { itemId: string; qty: unknown; unitId: string };
type FormulaStepDiffItem = { stepNo: number; instruction: string };

type NewVersionInput = {
  warning?: string;
  components: Array<{ itemId: string; qty: number; unitId: string }>;
  steps: Array<{ stepNo: number; instruction: string }>;
  approvedBy?: string;
};

@Injectable()
export class FormulasService {
  constructor(
    private readonly formulasRepository: FormulasRepository,
    private readonly auditTrailService: Pick<AuditTrailService, "logCreate" | "logHomologation" | "logUpdate"> = noopAuditTrail,
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

  private async validateConsistency(payload: NewVersionInput) {
    if (!payload.components.length) {
      throw new ConflictException("La versión debe incluir al menos un componente.");
    }

    const duplicatedItems = payload.components
      .map((component) => component.itemId)
      .filter((itemId, index, list) => list.indexOf(itemId) !== index);
    if (duplicatedItems.length) {
      throw new ConflictException(`Hay componentes duplicados: ${Array.from(new Set(duplicatedItems)).join(", ")}.`);
    }

    const invalidQty = payload.components.find((component) => Number(component.qty) <= 0);
    if (invalidQty) {
      throw new ConflictException(`La cantidad de ${invalidQty.itemId} debe ser mayor a cero.`);
    }

    const units = await this.formulasRepository.findUnits(payload.components.map((component) => component.unitId));
    const unitMap = new Map(units.map((unit: { id: string; status: string }) => [unit.id, unit.status]));

    const missingUnit = payload.components.find((component) => !unitMap.has(component.unitId));
    if (missingUnit) {
      throw new ConflictException(`La unidad ${missingUnit.unitId} no existe.`);
    }

    const inactiveUnit = payload.components.find((component) => unitMap.get(component.unitId) !== "active");
    if (inactiveUnit) {
      throw new ConflictException(`La unidad ${inactiveUnit.unitId} no está activa.`);
    }

    const stepNumbers = payload.steps.map((step) => step.stepNo);
    const invalidStep = stepNumbers.find((stepNo) => stepNo <= 0);
    if (invalidStep !== undefined) {
      throw new ConflictException("Los pasos deben iniciar en 1.");
    }
  }

  async createVersion(id: string, payload: NewVersionInput) {
    const template = await this.detail(id);
    await this.validateConsistency(payload);

    const createdVersion = await this.formulasRepository.createVersion(id, payload);
    await this.auditTrailService.logCreate({
      entity: "FormulaVersion",
      entityId: createdVersion.id,
      origin: "formulas.createVersion",
      after: createdVersion,
    });

    const approvedBy = payload.approvedBy ?? "USR-SYSTEM";
    const approvedVersion = await this.formulasRepository.approveVersion(id, createdVersion.id, approvedBy);

    await this.auditTrailService.logHomologation({
      entity: "FormulaVersion",
      entityId: createdVersion.id,
      origin: "formulas.createVersion",
      before: createdVersion,
      after: approvedVersion,
    });

    await this.auditTrailService.logUpdate({
      entity: "FormulaTemplate",
      entityId: id,
      origin: "formulas.createVersion",
      before: { status: template.status },
      after: { status: "approved", activeVersionId: approvedVersion.id },
    });

    return { event: "formula.version.created", formulaVersion: approvedVersion };
  }

  async obsoleteVersion(id: string, versionId?: string) {
    const template = await this.detail(id);
    const targetVersion =
      versionId ??
      template.FormulaVersion.find((version: FormulaVersionListItem) => version.status === "approved")?.id;

    if (!targetVersion) {
      throw new ConflictException("No existe una versión aprobada para volver obsoleta.");
    }

    const version = await this.formulasRepository.findVersionById(targetVersion);
    if (!version || version.templateId !== id) {
      throw new NotFoundException("Versión de fórmula no encontrada");
    }

    if (version.status !== "approved") {
      throw new ConflictException("Sólo una versión aprobada puede pasar a obsoleta.");
    }

    const obsolete = await this.formulasRepository.obsoleteVersion(version.id);
    await this.auditTrailService.logUpdate({
      entity: "FormulaVersion",
      entityId: version.id,
      origin: "formulas.obsolete",
      before: version,
      after: obsolete,
    });

    return { event: "formula.version.obsolete", formulaVersion: obsolete };
  }

  async compareVersions(leftId: string, rightId: string) {
    const { left, right } = await this.formulasRepository.compareVersions(leftId, rightId);
    if (!left || !right) {
      throw new NotFoundException("No se pudieron cargar ambas versiones para comparar.");
    }

    const leftComponents = new Map<string, FormulaComponentDiffItem>(
      left.FormulaComponent.map((component) => [component.itemId, component]),
    );
    const rightComponents = new Map<string, FormulaComponentDiffItem>(
      right.FormulaComponent.map((component) => [component.itemId, component]),
    );
    const allItems = Array.from(new Set([...leftComponents.keys(), ...rightComponents.keys()]));

    const components = allItems.map((itemId) => {
      const l = leftComponents.get(itemId);
      const r = rightComponents.get(itemId);
      return {
        itemId,
        status: !l ? "added" : !r ? "removed" : Number(l.qty) !== Number(r.qty) || l.unitId !== r.unitId ? "changed" : "same",
        left: l ? { qty: Number(l.qty), unitId: l.unitId } : null,
        right: r ? { qty: Number(r.qty), unitId: r.unitId } : null,
      };
    });

    const maxStep = Math.max(left.FormulaStep.length, right.FormulaStep.length);
    const steps = Array.from({ length: maxStep }).map((_, index) => {
      const stepNo = index + 1;
      const l = left.FormulaStep.find((step: FormulaStepDiffItem) => step.stepNo === stepNo);
      const r = right.FormulaStep.find((step: FormulaStepDiffItem) => step.stepNo === stepNo);
      return {
        stepNo,
        status: !l ? "added" : !r ? "removed" : l.instruction !== r.instruction ? "changed" : "same",
        left: l?.instruction ?? null,
        right: r?.instruction ?? null,
      };
    });

    return {
      left: { id: left.id, version: left.version, status: left.status },
      right: { id: right.id, version: right.version, status: right.status },
      diff: { components, steps },
    };
  }
}
