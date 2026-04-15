import { HttpException, HttpStatus } from "@nestjs/common";

export type DomainErrorCode =
  | "RULE_PRICING_CODE_REQUIRED"
  | "RULE_PRICING_NAME_REQUIRED"
  | "RULE_PRICING_START_DATE_REQUIRED"
  | "RULE_PRICING_ARCHIVED_IMMUTABLE"
  | "RULE_INVENTORY_REASON_REQUIRED"
  | "RULE_INVENTORY_QTY_NON_ZERO"
  | "RULE_INVENTORY_TRANSFER_DIFFERENT_LOCATION"
  | "RULE_INVENTORY_TRANSFER_STOCK_AVAILABLE"
  | "RULE_RECEIVABLES_ALLOCATIONS_REQUIRED"
  | "RULE_RECEIVABLES_ALLOCATION_TOTAL"
  | "RULE_RECEIVABLES_SINGLE_CUSTOMER"
  | "RULE_RECEIVABLES_ALLOCATION_BALANCE"
  | "RULE_PAYABLES_ALLOCATIONS_REQUIRED"
  | "RULE_PAYABLES_ALLOCATION_TOTAL"
  | "RULE_PAYABLES_SINGLE_SUPPLIER"
  | "RULE_PAYABLES_ALLOCATION_BALANCE"
  | "RULE_PAYABLES_TRANSFER_DIFFERENT_ACCOUNT"
  | "RULE_SALES_TOTAL_POSITIVE"
  | "RULE_SALES_ITEMS_REQUIRED"
  | "RULE_PRODUCTION_STATUS_TRANSITION";

export type DomainErrorPayload = {
  type: "DOMAIN_RULE_ERROR";
  code: DomainErrorCode;
  message: string;
  ruleId?: string;
};

export function throwDomainError(code: DomainErrorCode, message: string, status: HttpStatus, ruleId?: string): never {
  const payload: DomainErrorPayload = {
    type: "DOMAIN_RULE_ERROR",
    code,
    message,
    ...(ruleId ? { ruleId } : {}),
  };
  throw new HttpException(payload, status);
}
