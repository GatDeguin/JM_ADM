export type MonthlyCloseDto = { id: string; month: string; status: string; closedAt: Date | null };
export type CreateMonthlyCloseInput = { month: string; status: string };
export type UpdateMonthlyCloseInput = { status: string };
export type ActionMonthlyCloseInput = Record<string, never>;
