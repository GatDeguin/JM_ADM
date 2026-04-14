-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('draft', 'active', 'inactive', 'pending_homologation', 'archived');

-- CreateEnum
CREATE TYPE "FormulaStatus" AS ENUM ('draft', 'in_review', 'approved', 'obsolete');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('draft', 'planned', 'reserved', 'in_process', 'qc_pending', 'released', 'retained', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "SalesStatus" AS ENUM ('draft', 'confirmed', 'reserved', 'picking', 'dispatched', 'delivered', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('open', 'partial', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('uploaded', 'mapping', 'validating', 'ready_to_import', 'imported', 'imported_with_warnings', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "origin" TEXT,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Line" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CashAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseLocation" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "WarehouseLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NumberSequence" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "next" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "NumberSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityAlias" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "canonicalId" TEXT,
    "alias" TEXT NOT NULL,
    "canonicalName" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "originalValue" TEXT,

    CONSTRAINT "EntityAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBase" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "familyId" TEXT,
    "variantId" TEXT,
    "lineId" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "ProductBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presentation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitId" TEXT,
    "factor" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Presentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SKU" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "productBaseId" TEXT NOT NULL,
    "presentationId" TEXT NOT NULL,
    "barcode" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SKU_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingSpec" (
    "id" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PackagingSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboPack" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "ComboPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboPackItem" (
    "id" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ComboPackItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaTemplate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "familyId" TEXT,
    "status" "FormulaStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "FormulaTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "FormulaStatus" NOT NULL DEFAULT 'draft',
    "warning" TEXT,

    CONSTRAINT "FormulaVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaComponent" (
    "id" TEXT NOT NULL,
    "formulaVersionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "unitId" TEXT NOT NULL,

    CONSTRAINT "FormulaComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaStep" (
    "id" TEXT NOT NULL,
    "formulaVersionId" TEXT NOT NULL,
    "stepNo" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,

    CONSTRAINT "FormulaStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaApproval" (
    "id" TEXT NOT NULL,
    "formulaVersionId" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormulaApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOrder" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "productBaseId" TEXT NOT NULL,
    "formulaVersionId" TEXT NOT NULL,
    "plannedQty" DECIMAL(65,30) NOT NULL,
    "status" "ProductionStatus" NOT NULL DEFAULT 'planned',

    CONSTRAINT "ProductionOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOrderMaterialPlan" (
    "id" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "reservedQty" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "ProductionOrderMaterialPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "productionOrderId" TEXT,
    "status" "ProductionStatus" NOT NULL DEFAULT 'in_process',
    "responsibleUserId" TEXT,
    "outputQty" DECIMAL(65,30),

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchMaterialConsumption" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "plannedQty" DECIMAL(65,30) NOT NULL,
    "actualQty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "BatchMaterialConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchOutput" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "BatchOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchWaste" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "BatchWaste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingOrder" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "parentBatchId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "status" "ProductionStatus" NOT NULL DEFAULT 'planned',

    CONSTRAINT "PackagingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingMaterialConsumption" (
    "id" TEXT NOT NULL,
    "packagingOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PackagingMaterialConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildBatch" (
    "id" TEXT NOT NULL,
    "packagingOrderId" TEXT NOT NULL,
    "lotCode" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ChildBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCChecklist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "QCChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCRecord" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QCRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCRecordItem" (
    "id" TEXT NOT NULL,
    "qcRecordId" TEXT NOT NULL,
    "checklistItem" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "note" TEXT,

    CONSTRAINT "QCRecordItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCNonConformity" (
    "id" TEXT NOT NULL,
    "qcRecordId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "QCNonConformity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLot" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "lotCode" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "StockLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockBalance" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "locationId" TEXT,
    "qty" DECIMAL(65,30) NOT NULL,
    "reservedQty" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "StockBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "lotId" TEXT,
    "type" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockReservation" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CycleCount" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "CycleCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAdjustment" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequestItem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PurchaseRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "unitCost" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceipt" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "GoodsReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceiptItem" (
    "id" TEXT NOT NULL,
    "goodsReceiptId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "acceptedQty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "GoodsReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseSubcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ExpenseSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplierId" TEXT,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'open',

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerContact" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "CustomerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPriceList" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,

    CONSTRAINT "CustomerPriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceList" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceListItem" (
    "id" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PriceListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,
    "status" "SalesStatus" NOT NULL DEFAULT 'draft',
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispatchOrder" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "status" "SalesStatus" NOT NULL DEFAULT 'confirmed',

    CONSTRAINT "DispatchOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispatchItem" (
    "id" TEXT NOT NULL,
    "dispatchOrderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "DispatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturn" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "SalesReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountsReceivable" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'open',

    CONSTRAINT "AccountsReceivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "cashAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptAllocation" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "receivableId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ReceiptAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountsPayable" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'open',

    CONSTRAINT "AccountsPayable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "cashAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "payableId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryMovement" (
    "id" TEXT NOT NULL,
    "cashAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,

    CONSTRAINT "TreasuryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankReconciliation" (
    "id" TEXT NOT NULL,
    "cashAccountId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "BankReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostSnapshot" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,

    CONSTRAINT "CostSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarginSnapshot" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,

    CONSTRAINT "MarginSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyClose" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "MonthlyClose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'uploaded',
    "sourceName" TEXT NOT NULL,
    "mapping" JSONB,
    "summary" JSONB,
    "warnings" JSONB,
    "originals" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_status_idx" ON "Role"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_code_key" ON "Unit"("code");

-- CreateIndex
CREATE INDEX "Unit_status_idx" ON "Unit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Family_name_key" ON "Family"("name");

-- CreateIndex
CREATE INDEX "Family_status_idx" ON "Family"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Line_name_key" ON "Line"("name");

-- CreateIndex
CREATE INDEX "Line_status_idx" ON "Line"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_name_key" ON "Variant"("name");

-- CreateIndex
CREATE INDEX "Variant_status_idx" ON "Variant"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_name_key" ON "PaymentMethod"("name");

-- CreateIndex
CREATE INDEX "PaymentMethod_status_idx" ON "PaymentMethod"("status");

-- CreateIndex
CREATE INDEX "CashAccount_status_idx" ON "CashAccount"("status");

-- CreateIndex
CREATE INDEX "Warehouse_status_idx" ON "Warehouse"("status");

-- CreateIndex
CREATE INDEX "WarehouseLocation_warehouseId_status_idx" ON "WarehouseLocation"("warehouseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseLocation_warehouseId_name_key" ON "WarehouseLocation"("warehouseId", "name");

-- CreateIndex
CREATE INDEX "CostCenter_status_idx" ON "CostCenter"("status");

-- CreateIndex
CREATE UNIQUE INDEX "NumberSequence_key_key" ON "NumberSequence"("key");

-- CreateIndex
CREATE INDEX "EntityAlias_entityType_status_idx" ON "EntityAlias"("entityType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EntityAlias_entityType_alias_key" ON "EntityAlias"("entityType", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "Item_code_key" ON "Item"("code");

-- CreateIndex
CREATE INDEX "Item_status_idx" ON "Item"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBase_code_key" ON "ProductBase"("code");

-- CreateIndex
CREATE INDEX "ProductBase_familyId_idx" ON "ProductBase"("familyId");

-- CreateIndex
CREATE INDEX "ProductBase_lineId_idx" ON "ProductBase"("lineId");

-- CreateIndex
CREATE INDEX "ProductBase_variantId_idx" ON "ProductBase"("variantId");

-- CreateIndex
CREATE INDEX "ProductBase_status_idx" ON "ProductBase"("status");

-- CreateIndex
CREATE INDEX "Presentation_unitId_idx" ON "Presentation"("unitId");

-- CreateIndex
CREATE INDEX "Presentation_status_idx" ON "Presentation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SKU_code_key" ON "SKU"("code");

-- CreateIndex
CREATE INDEX "SKU_status_idx" ON "SKU"("status");

-- CreateIndex
CREATE INDEX "SKU_productBaseId_idx" ON "SKU"("productBaseId");

-- CreateIndex
CREATE INDEX "SKU_presentationId_idx" ON "SKU"("presentationId");

-- CreateIndex
CREATE INDEX "PackagingSpec_skuId_idx" ON "PackagingSpec"("skuId");

-- CreateIndex
CREATE INDEX "PackagingSpec_itemId_idx" ON "PackagingSpec"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "PackagingSpec_skuId_componentType_itemId_key" ON "PackagingSpec"("skuId", "componentType", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ComboPack_code_key" ON "ComboPack"("code");

-- CreateIndex
CREATE INDEX "ComboPack_status_idx" ON "ComboPack"("status");

-- CreateIndex
CREATE INDEX "ComboPackItem_comboId_idx" ON "ComboPackItem"("comboId");

-- CreateIndex
CREATE INDEX "ComboPackItem_skuId_idx" ON "ComboPackItem"("skuId");

-- CreateIndex
CREATE UNIQUE INDEX "ComboPackItem_comboId_skuId_key" ON "ComboPackItem"("comboId", "skuId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulaTemplate_code_key" ON "FormulaTemplate"("code");

-- CreateIndex
CREATE INDEX "FormulaTemplate_familyId_idx" ON "FormulaTemplate"("familyId");

-- CreateIndex
CREATE INDEX "FormulaTemplate_status_idx" ON "FormulaTemplate"("status");

-- CreateIndex
CREATE INDEX "FormulaVersion_templateId_status_idx" ON "FormulaVersion"("templateId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FormulaVersion_templateId_version_key" ON "FormulaVersion"("templateId", "version");

-- CreateIndex
CREATE INDEX "FormulaComponent_formulaVersionId_idx" ON "FormulaComponent"("formulaVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulaComponent_formulaVersionId_itemId_key" ON "FormulaComponent"("formulaVersionId", "itemId");

-- CreateIndex
CREATE INDEX "FormulaStep_formulaVersionId_idx" ON "FormulaStep"("formulaVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulaStep_formulaVersionId_stepNo_key" ON "FormulaStep"("formulaVersionId", "stepNo");

-- CreateIndex
CREATE INDEX "FormulaApproval_formulaVersionId_idx" ON "FormulaApproval"("formulaVersionId");

-- CreateIndex
CREATE INDEX "FormulaApproval_approvedAt_idx" ON "FormulaApproval"("approvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionOrder_code_key" ON "ProductionOrder"("code");

-- CreateIndex
CREATE INDEX "ProductionOrder_status_idx" ON "ProductionOrder"("status");

-- CreateIndex
CREATE INDEX "ProductionOrder_productBaseId_idx" ON "ProductionOrder"("productBaseId");

-- CreateIndex
CREATE INDEX "ProductionOrderMaterialPlan_productionOrderId_idx" ON "ProductionOrderMaterialPlan"("productionOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionOrderMaterialPlan_productionOrderId_itemId_key" ON "ProductionOrderMaterialPlan"("productionOrderId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_code_key" ON "Batch"("code");

-- CreateIndex
CREATE INDEX "Batch_status_idx" ON "Batch"("status");

-- CreateIndex
CREATE INDEX "Batch_productionOrderId_idx" ON "Batch"("productionOrderId");

-- CreateIndex
CREATE INDEX "BatchMaterialConsumption_batchId_idx" ON "BatchMaterialConsumption"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchMaterialConsumption_batchId_itemId_key" ON "BatchMaterialConsumption"("batchId", "itemId");

-- CreateIndex
CREATE INDEX "BatchOutput_batchId_idx" ON "BatchOutput"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchOutput_batchId_itemId_key" ON "BatchOutput"("batchId", "itemId");

-- CreateIndex
CREATE INDEX "BatchWaste_batchId_idx" ON "BatchWaste"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "PackagingOrder_code_key" ON "PackagingOrder"("code");

-- CreateIndex
CREATE INDEX "PackagingOrder_status_idx" ON "PackagingOrder"("status");

-- CreateIndex
CREATE INDEX "PackagingOrder_parentBatchId_idx" ON "PackagingOrder"("parentBatchId");

-- CreateIndex
CREATE INDEX "PackagingMaterialConsumption_packagingOrderId_idx" ON "PackagingMaterialConsumption"("packagingOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PackagingMaterialConsumption_packagingOrderId_itemId_key" ON "PackagingMaterialConsumption"("packagingOrderId", "itemId");

-- CreateIndex
CREATE INDEX "ChildBatch_packagingOrderId_idx" ON "ChildBatch"("packagingOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildBatch_packagingOrderId_lotCode_key" ON "ChildBatch"("packagingOrderId", "lotCode");

-- CreateIndex
CREATE INDEX "QCChecklist_active_idx" ON "QCChecklist"("active");

-- CreateIndex
CREATE INDEX "QCRecord_batchId_idx" ON "QCRecord"("batchId");

-- CreateIndex
CREATE INDEX "QCRecord_createdAt_idx" ON "QCRecord"("createdAt");

-- CreateIndex
CREATE INDEX "QCRecordItem_qcRecordId_idx" ON "QCRecordItem"("qcRecordId");

-- CreateIndex
CREATE INDEX "QCNonConformity_qcRecordId_idx" ON "QCNonConformity"("qcRecordId");

-- CreateIndex
CREATE INDEX "StockLot_status_idx" ON "StockLot"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StockLot_itemId_warehouseId_lotCode_key" ON "StockLot"("itemId", "warehouseId", "lotCode");

-- CreateIndex
CREATE INDEX "StockBalance_warehouseId_idx" ON "StockBalance"("warehouseId");

-- CreateIndex
CREATE INDEX "StockBalance_locationId_idx" ON "StockBalance"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "StockBalance_itemId_warehouseId_locationId_key" ON "StockBalance"("itemId", "warehouseId", "locationId");

-- CreateIndex
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_itemId_idx" ON "StockMovement"("itemId");

-- CreateIndex
CREATE INDEX "StockReservation_itemId_idx" ON "StockReservation"("itemId");

-- CreateIndex
CREATE INDEX "StockReservation_referenceType_referenceId_idx" ON "StockReservation"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "CycleCount_warehouseId_idx" ON "CycleCount"("warehouseId");

-- CreateIndex
CREATE INDEX "CycleCount_status_idx" ON "CycleCount"("status");

-- CreateIndex
CREATE INDEX "CycleCount_date_idx" ON "CycleCount"("date");

-- CreateIndex
CREATE INDEX "InventoryAdjustment_itemId_idx" ON "InventoryAdjustment"("itemId");

-- CreateIndex
CREATE INDEX "InventoryAdjustment_createdAt_idx" ON "InventoryAdjustment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- CreateIndex
CREATE INDEX "Supplier_status_idx" ON "Supplier"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseRequest_code_key" ON "PurchaseRequest"("code");

-- CreateIndex
CREATE INDEX "PurchaseRequest_status_idx" ON "PurchaseRequest"("status");

-- CreateIndex
CREATE INDEX "PurchaseRequestItem_requestId_idx" ON "PurchaseRequestItem"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseRequestItem_requestId_itemId_key" ON "PurchaseRequestItem"("requestId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_code_key" ON "PurchaseOrder"("code");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_purchaseOrderId_idx" ON "PurchaseOrderItem"("purchaseOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrderItem_purchaseOrderId_itemId_key" ON "PurchaseOrderItem"("purchaseOrderId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "GoodsReceipt_code_key" ON "GoodsReceipt"("code");

-- CreateIndex
CREATE INDEX "GoodsReceipt_status_idx" ON "GoodsReceipt"("status");

-- CreateIndex
CREATE INDEX "GoodsReceipt_purchaseOrderId_idx" ON "GoodsReceipt"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "GoodsReceiptItem_goodsReceiptId_idx" ON "GoodsReceiptItem"("goodsReceiptId");

-- CreateIndex
CREATE UNIQUE INDEX "GoodsReceiptItem_goodsReceiptId_itemId_key" ON "GoodsReceiptItem"("goodsReceiptId", "itemId");

-- CreateIndex
CREATE INDEX "ExpenseSubcategory_categoryId_idx" ON "ExpenseSubcategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseSubcategory_categoryId_name_key" ON "ExpenseSubcategory"("categoryId", "name");

-- CreateIndex
CREATE INDEX "Expense_status_idx" ON "Expense"("status");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "Expense_supplierId_idx" ON "Expense"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE INDEX "CustomerAddress_customerId_idx" ON "CustomerAddress"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerAddress_customerId_label_key" ON "CustomerAddress"("customerId", "label");

-- CreateIndex
CREATE INDEX "CustomerContact_customerId_idx" ON "CustomerContact"("customerId");

-- CreateIndex
CREATE INDEX "CustomerPriceList_customerId_idx" ON "CustomerPriceList"("customerId");

-- CreateIndex
CREATE INDEX "CustomerPriceList_priceListId_idx" ON "CustomerPriceList"("priceListId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPriceList_customerId_priceListId_key" ON "CustomerPriceList"("customerId", "priceListId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_code_key" ON "PriceList"("code");

-- CreateIndex
CREATE INDEX "PriceList_startsAt_idx" ON "PriceList"("startsAt");

-- CreateIndex
CREATE INDEX "PriceList_status_idx" ON "PriceList"("status");

-- CreateIndex
CREATE INDEX "PriceListItem_priceListId_idx" ON "PriceListItem"("priceListId");

-- CreateIndex
CREATE INDEX "PriceListItem_skuId_idx" ON "PriceListItem"("skuId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceListItem_priceListId_skuId_key" ON "PriceListItem"("priceListId", "skuId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_code_key" ON "SalesOrder"("code");

-- CreateIndex
CREATE INDEX "SalesOrder_status_idx" ON "SalesOrder"("status");

-- CreateIndex
CREATE INDEX "SalesOrder_customerId_idx" ON "SalesOrder"("customerId");

-- CreateIndex
CREATE INDEX "SalesOrderItem_salesOrderId_idx" ON "SalesOrderItem"("salesOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrderItem_salesOrderId_skuId_key" ON "SalesOrderItem"("salesOrderId", "skuId");

-- CreateIndex
CREATE UNIQUE INDEX "DispatchOrder_code_key" ON "DispatchOrder"("code");

-- CreateIndex
CREATE INDEX "DispatchOrder_status_idx" ON "DispatchOrder"("status");

-- CreateIndex
CREATE INDEX "DispatchOrder_salesOrderId_idx" ON "DispatchOrder"("salesOrderId");

-- CreateIndex
CREATE INDEX "DispatchItem_dispatchOrderId_idx" ON "DispatchItem"("dispatchOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "DispatchItem_dispatchOrderId_skuId_key" ON "DispatchItem"("dispatchOrderId", "skuId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesReturn_code_key" ON "SalesReturn"("code");

-- CreateIndex
CREATE INDEX "SalesReturn_salesOrderId_idx" ON "SalesReturn"("salesOrderId");

-- CreateIndex
CREATE INDEX "AccountsReceivable_status_idx" ON "AccountsReceivable"("status");

-- CreateIndex
CREATE INDEX "AccountsReceivable_dueDate_idx" ON "AccountsReceivable"("dueDate");

-- CreateIndex
CREATE INDEX "AccountsReceivable_customerId_idx" ON "AccountsReceivable"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_code_key" ON "Receipt"("code");

-- CreateIndex
CREATE INDEX "Receipt_createdAt_idx" ON "Receipt"("createdAt");

-- CreateIndex
CREATE INDEX "Receipt_customerId_idx" ON "Receipt"("customerId");

-- CreateIndex
CREATE INDEX "ReceiptAllocation_receiptId_idx" ON "ReceiptAllocation"("receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptAllocation_receiptId_receivableId_key" ON "ReceiptAllocation"("receiptId", "receivableId");

-- CreateIndex
CREATE INDEX "AccountsPayable_status_idx" ON "AccountsPayable"("status");

-- CreateIndex
CREATE INDEX "AccountsPayable_dueDate_idx" ON "AccountsPayable"("dueDate");

-- CreateIndex
CREATE INDEX "AccountsPayable_supplierId_idx" ON "AccountsPayable"("supplierId");

-- CreateIndex
CREATE INDEX "AccountsPayable_sourceType_sourceId_idx" ON "AccountsPayable"("sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_code_key" ON "Payment"("code");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_supplierId_idx" ON "Payment"("supplierId");

-- CreateIndex
CREATE INDEX "PaymentAllocation_paymentId_idx" ON "PaymentAllocation"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_payableId_key" ON "PaymentAllocation"("paymentId", "payableId");

-- CreateIndex
CREATE INDEX "TreasuryMovement_type_idx" ON "TreasuryMovement"("type");

-- CreateIndex
CREATE INDEX "TreasuryMovement_date_idx" ON "TreasuryMovement"("date");

-- CreateIndex
CREATE INDEX "TreasuryMovement_cashAccountId_idx" ON "TreasuryMovement"("cashAccountId");

-- CreateIndex
CREATE INDEX "BankReconciliation_status_idx" ON "BankReconciliation"("status");

-- CreateIndex
CREATE INDEX "BankReconciliation_cashAccountId_idx" ON "BankReconciliation"("cashAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "BankReconciliation_cashAccountId_period_key" ON "BankReconciliation"("cashAccountId", "period");

-- CreateIndex
CREATE INDEX "CostSnapshot_key_idx" ON "CostSnapshot"("key");

-- CreateIndex
CREATE INDEX "CostSnapshot_date_idx" ON "CostSnapshot"("date");

-- CreateIndex
CREATE INDEX "MarginSnapshot_key_idx" ON "MarginSnapshot"("key");

-- CreateIndex
CREATE INDEX "MarginSnapshot_date_idx" ON "MarginSnapshot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyClose_month_key" ON "MonthlyClose"("month");

-- CreateIndex
CREATE INDEX "MonthlyClose_status_idx" ON "MonthlyClose"("status");

-- CreateIndex
CREATE INDEX "ImportJob_status_idx" ON "ImportJob"("status");

-- CreateIndex
CREATE INDEX "ImportJob_createdAt_idx" ON "ImportJob"("createdAt");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseLocation" ADD CONSTRAINT "WarehouseLocation_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBase" ADD CONSTRAINT "ProductBase_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBase" ADD CONSTRAINT "ProductBase_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBase" ADD CONSTRAINT "ProductBase_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presentation" ADD CONSTRAINT "Presentation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_productBaseId_fkey" FOREIGN KEY ("productBaseId") REFERENCES "ProductBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingSpec" ADD CONSTRAINT "PackagingSpec_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingSpec" ADD CONSTRAINT "PackagingSpec_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboPackItem" ADD CONSTRAINT "ComboPackItem_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "ComboPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboPackItem" ADD CONSTRAINT "ComboPackItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaTemplate" ADD CONSTRAINT "FormulaTemplate_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaVersion" ADD CONSTRAINT "FormulaVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormulaTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaComponent" ADD CONSTRAINT "FormulaComponent_formulaVersionId_fkey" FOREIGN KEY ("formulaVersionId") REFERENCES "FormulaVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaComponent" ADD CONSTRAINT "FormulaComponent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaComponent" ADD CONSTRAINT "FormulaComponent_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaStep" ADD CONSTRAINT "FormulaStep_formulaVersionId_fkey" FOREIGN KEY ("formulaVersionId") REFERENCES "FormulaVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaApproval" ADD CONSTRAINT "FormulaApproval_formulaVersionId_fkey" FOREIGN KEY ("formulaVersionId") REFERENCES "FormulaVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaApproval" ADD CONSTRAINT "FormulaApproval_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_productBaseId_fkey" FOREIGN KEY ("productBaseId") REFERENCES "ProductBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_formulaVersionId_fkey" FOREIGN KEY ("formulaVersionId") REFERENCES "FormulaVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrderMaterialPlan" ADD CONSTRAINT "ProductionOrderMaterialPlan_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrderMaterialPlan" ADD CONSTRAINT "ProductionOrderMaterialPlan_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchMaterialConsumption" ADD CONSTRAINT "BatchMaterialConsumption_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchMaterialConsumption" ADD CONSTRAINT "BatchMaterialConsumption_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchOutput" ADD CONSTRAINT "BatchOutput_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchOutput" ADD CONSTRAINT "BatchOutput_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchWaste" ADD CONSTRAINT "BatchWaste_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingOrder" ADD CONSTRAINT "PackagingOrder_parentBatchId_fkey" FOREIGN KEY ("parentBatchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingOrder" ADD CONSTRAINT "PackagingOrder_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingMaterialConsumption" ADD CONSTRAINT "PackagingMaterialConsumption_packagingOrderId_fkey" FOREIGN KEY ("packagingOrderId") REFERENCES "PackagingOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingMaterialConsumption" ADD CONSTRAINT "PackagingMaterialConsumption_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildBatch" ADD CONSTRAINT "ChildBatch_packagingOrderId_fkey" FOREIGN KEY ("packagingOrderId") REFERENCES "PackagingOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCRecord" ADD CONSTRAINT "QCRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCRecordItem" ADD CONSTRAINT "QCRecordItem_qcRecordId_fkey" FOREIGN KEY ("qcRecordId") REFERENCES "QCRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCNonConformity" ADD CONSTRAINT "QCNonConformity_qcRecordId_fkey" FOREIGN KEY ("qcRecordId") REFERENCES "QCRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "StockLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleCount" ADD CONSTRAINT "CycleCount_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PurchaseRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptItem" ADD CONSTRAINT "GoodsReceiptItem_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES "GoodsReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptItem" ADD CONSTRAINT "GoodsReceiptItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseSubcategory" ADD CONSTRAINT "ExpenseSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerContact" ADD CONSTRAINT "CustomerContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPriceList" ADD CONSTRAINT "CustomerPriceList_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPriceList" ADD CONSTRAINT "CustomerPriceList_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchOrder" ADD CONSTRAINT "DispatchOrder_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchItem" ADD CONSTRAINT "DispatchItem_dispatchOrderId_fkey" FOREIGN KEY ("dispatchOrderId") REFERENCES "DispatchOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchItem" ADD CONSTRAINT "DispatchItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountsReceivable" ADD CONSTRAINT "AccountsReceivable_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountsReceivable" ADD CONSTRAINT "AccountsReceivable_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptAllocation" ADD CONSTRAINT "ReceiptAllocation_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptAllocation" ADD CONSTRAINT "ReceiptAllocation_receivableId_fkey" FOREIGN KEY ("receivableId") REFERENCES "AccountsReceivable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountsPayable" ADD CONSTRAINT "AccountsPayable_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_payableId_fkey" FOREIGN KEY ("payableId") REFERENCES "AccountsPayable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasuryMovement" ADD CONSTRAINT "TreasuryMovement_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliation" ADD CONSTRAINT "BankReconciliation_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

