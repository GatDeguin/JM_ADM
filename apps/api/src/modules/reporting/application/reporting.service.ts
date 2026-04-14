import { Injectable } from "@nestjs/common";
import { ReportingRepository } from "../infrastructure/reporting.repository";

type ReportFiltersInput = {
  startDate?: string;
  endDate?: string;
  channel?: string;
  line?: string;
  customerId?: string;
};

@Injectable()
export class ReportingService {
  constructor(private readonly reportingRepository: ReportingRepository) {}

  async dashboard(filters: ReportFiltersInput = {}) {
    const parsedFilters = this.parseFilters(filters);
    const [production, stock, sales, finance, margins, quality] = await Promise.all([
      this.reportingRepository.productionReport(parsedFilters),
      this.reportingRepository.stockReport(parsedFilters),
      this.reportingRepository.salesReport(parsedFilters),
      this.reportingRepository.financeReport(parsedFilters),
      this.reportingRepository.marginReport(parsedFilters),
      this.reportingRepository.qualityReport(parsedFilters),
    ]);

    return {
      filters: parsedFilters,
      production,
      stock,
      sales,
      finance,
      margins,
      quality,
      kpis: [
        { label: "Ventas", value: sales.billed },
        { label: "Margen", value: `${margins.grossMarginPct}%` },
        { label: "Lotes abiertos", value: production.open },
        { label: "Stock disponible", value: stock.availableQty },
      ],
    };
  }

  production(filters: ReportFiltersInput = {}) {
    return this.reportingRepository.productionReport(this.parseFilters(filters));
  }

  stock(filters: ReportFiltersInput = {}) {
    return this.reportingRepository.stockReport(this.parseFilters(filters));
  }

  sales(filters: ReportFiltersInput = {}) {
    return this.reportingRepository.salesReport(this.parseFilters(filters));
  }

  finance(filters: ReportFiltersInput = {}) {
    return this.reportingRepository.financeReport(this.parseFilters(filters));
  }

  margins(filters: ReportFiltersInput = {}) {
    return this.reportingRepository.marginReport(this.parseFilters(filters));
  }

  quality(filters: ReportFiltersInput = {}) {
    return this.reportingRepository.qualityReport(this.parseFilters(filters));
  }

  async dataQuality() {
    const [pendingAliases, duplicateAliases, skusWithoutPrice, formulasWarnings, itemsWithoutCost, retainedLots] = await Promise.all([
      this.reportingRepository.countPendingAliases(),
      this.reportingRepository.countDuplicateAliases(),
      this.reportingRepository.countSkusWithoutPrice(),
      this.reportingRepository.countFormulaWarnings(),
      this.reportingRepository.countItemsWithoutCost(),
      this.reportingRepository.qualityReport({}),
    ]);

    return {
      pendingAliases,
      duplicateAliases: Number(duplicateAliases[0]?.count ?? 0),
      skusWithoutPrice,
      formulasWarnings,
      itemsWithoutCost,
      retainedLots: retainedLots.retainedBatches,
    };
  }

  dataQualityLists() {
    return this.reportingRepository.dataQualityLists();
  }

  async generateSnapshots(period: string) {
    const [costPayload, marginPayload] = await Promise.all([this.finance({}), this.margins({})]);

    const [costSnapshot, marginSnapshot, monthlyClose] = await Promise.all([
      this.reportingRepository.createCostSnapshot(period, costPayload),
      this.reportingRepository.createMarginSnapshot(period, marginPayload),
      this.reportingRepository.upsertMonthlyClose(period),
    ]);

    return { period, costSnapshot, marginSnapshot, monthlyClose };
  }

  private parseFilters(filters: ReportFiltersInput) {
    return {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      channel: filters.channel,
      line: filters.line,
      customerId: filters.customerId,
    };
  }
}
