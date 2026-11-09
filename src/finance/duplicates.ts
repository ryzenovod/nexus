import { type BankRow, kopeks } from './ledger';

export interface DuplicateEvidenceGroup {
  rows: BankRow[];
  bank: string;
  date: string;
  amountKopeks: number;
}

/**
 * Read-only possible duplicate-origin detection. Compare exact bank, account,
 * operation date, signed integer kopeks and normalized description.
 * Two legitimate identical purchases can still match: never delete or
 * mark them as duplicates automatically.
 */
export function possibleDuplicateImports(rows: BankRow[]): DuplicateEvidenceGroup[] {
  const groups = new Map<string, BankRow[]>();
  for (const r of rows) {
    const description = r.counterparty_description.normalize('NFKC').trim().replace(/\s+/g, ' ');
    const key = JSON.stringify([r.bank, r.account_alias, r.date, kopeks(r.amount_rub), description]);
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()]
    .filter(group => new Set(group.map(r => r.transaction_id)).size > 1)
    .filter(group => group.length > 1)
    .map(group => ({
      rows: group,
      bank: group[0].bank,
      date: group[0].date,
      amountKopeks: kopeks(group[0].amount_rub),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
