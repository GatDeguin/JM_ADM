import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { assertRequiredText } from "../../../common/domain-rules/shared-domain-rules";
import { FormulasRepository } from "../infrastructure/formulas.repository";

@Injectable()
export class FormulasService {
  constructor(private readonly formulasRepository: FormulasRepository) {}

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
      return await this.formulasRepository.create(code, name);
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        throw new ConflictException("El código de fórmula ya existe");
      }
      throw error;
    }
  }

  async approve(id: string) {
    await this.detail(id);
    const formula = await this.formulasRepository.approve(id);
    return { event: "formula.approved", formula };
  }
}
