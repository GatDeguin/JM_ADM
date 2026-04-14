import { Injectable } from "@nestjs/common";
import { ReportingRepository } from "../infrastructure/reporting.repository";

@Injectable()
export class ReportingService {
  constructor(private readonly reportingRepository: ReportingRepository) {}

  async dashboard() {
    const openBatches = await this.reportingRepository.countOpenProductionBatches();
    return {
      kpis: [
        { label: "Ventas", value: 1450000 },
        { label: "Margen", value: "41%" },
        { label: "Lotes abiertos", value: openBatches },
      ],
    };
  }

  async dataQuality() {
    const [pendingAliases, skusWithoutPrice, formulasWarnings] = await Promise.all([
      this.reportingRepository.countPendingAliases(),
      this.reportingRepository.countSkusWithoutPrice(),
      this.reportingRepository.countFormulaWarnings(),
    ]);

    return { pendingAliases, skusWithoutPrice, formulasWarnings };
  }
}
