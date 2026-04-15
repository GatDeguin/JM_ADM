ALTER TABLE "ProductBase" ADD COLUMN "activeFormulaVersionId" TEXT;

CREATE INDEX "ProductBase_activeFormulaVersionId_idx" ON "ProductBase"("activeFormulaVersionId");

ALTER TABLE "ProductBase"
  ADD CONSTRAINT "ProductBase_activeFormulaVersionId_fkey"
  FOREIGN KEY ("activeFormulaVersionId") REFERENCES "FormulaVersion"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
