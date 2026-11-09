import { computeStats, type BankRow } from './ledger';

/**
 * Private in-memory overview projection. Never store in Zustand, localStorage,
 * Supabase, URL/query params, service workers, or persistent app state.
 * Nothing is exposed while the finance vault is locked or after a reload.
 */
export interface PrivateFinanceSnapshot {
  transactionCount: number;
  personalExpenseKopeks: number;
  jointExpenseKopeks: number;
  confirmedIncomeKopeks: number;
  pendingCount: number;
  pendingAmountKopeks: number;
}

let snapshot: PrivateFinanceSnapshot | null = null;
const listeners = new Set<() => void>();

export const getPrivateFinanceSnapshot = (): PrivateFinanceSnapshot | null => snapshot;

export function subscribePrivateFinance(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function publishPrivateFinance(rows: BankRow[]): void {
  const all = computeStats(rows);
  const personal = computeStats(rows.filter(r => r.contour === 'ЛИЧНЫЙ'));
  const joint = computeStats(rows.filter(r => r.contour === 'СОВМЕСТНЫЙ'));
  snapshot = Object.freeze({
    transactionCount: all.count,
    personalExpenseKopeks: personal.expense,
    jointExpenseKopeks: joint.expense,
    confirmedIncomeKopeks: all.income,
    pendingCount: all.pendingCount,
    pendingAmountKopeks: all.pendingAmount,
  });
  for (const listener of listeners) listener();
}

export function clearPrivateFinance(): void {
  if (snapshot === null) return;
  snapshot = null;
  for (const listener of listeners) listener();
}
