import { Module } from "@nestjs/common";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesPermissionsModule } from "./modules/roles_permissions/roles_permissions.module";
import { MastersModule } from "./modules/masters/masters.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { FormulasModule } from "./modules/formulas/formulas.module";
import { ProductionModule } from "./modules/production/production.module";
import { PackagingModule } from "./modules/packaging/packaging.module";
import { QualityModule } from "./modules/quality/quality.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { PurchasingModule } from "./modules/purchasing/purchasing.module";
import { ExpensesModule } from "./modules/expenses/expenses.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { PricingModule } from "./modules/pricing/pricing.module";
import { SalesModule } from "./modules/sales/sales.module";
import { ReceivablesModule } from "./modules/receivables/receivables.module";
import { PayablesTreasuryModule } from "./modules/payables_treasury/payables_treasury.module";
import { CostingModule } from "./modules/costing/costing.module";
import { ReportingModule } from "./modules/reporting/reporting.module";
import { ImportsModule } from "./modules/imports/imports.module";
import { AuditModule } from "./modules/audit/audit.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesPermissionsModule,
    MastersModule,
    CatalogModule,
    FormulasModule,
    ProductionModule,
    PackagingModule,
    QualityModule,
    InventoryModule,
    PurchasingModule,
    ExpensesModule,
    CustomersModule,
    PricingModule,
    SalesModule,
    ReceivablesModule,
    PayablesTreasuryModule,
    CostingModule,
    ReportingModule,
    ImportsModule,
    AuditModule,
  ],
})
export class AppModule {}
