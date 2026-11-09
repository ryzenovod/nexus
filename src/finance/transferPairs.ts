import { type BankRow, kopeks } from './ledger';

export interface TransferPairCandidate {
  debit: BankRow;
  credit: BankRow;
  dayGap: number;
  amountKopeks: number;
}
export interface TransferPairAudit {
  pairs: TransferPairCandidate[];
  ambiguousDebits: BankRow[];
  unmatchedDebits: BankRow[];
  unmatchedCredits: BankRow[];
  debitCount: number;
  creditCount: number;
}

/**
 * Read-only reconciliation; matches must remain candidates until bank evidence
 * or the owner confirms the link. No classification or budget total is changed.
 *
 * Candidate: opposite sign, exact integer kopeks, different observed banks,
 * within three calendar days. Excludes third-party transfers, reviews, and
 * duplicate rows. Only one-to-one candidates on BOTH sides are accepted;
 * overlapping candidate groups remain ambiguous.
 */
export function auditInternalTransferPairs(rows: BankRow[], maxDays = 3): TransferPairAudit {
  if (!Number.isInteger(maxDays) || maxDays < 0 || maxDays > 14) throw Error('Некорректный интервал сверки');
  const internal = rows.filter(r => r.flow_type === 'INTERNAL_TRANSFER');
  const debit = internal.filter(r => kopeks(r.amount_rub) < 0);
  const credit = internal.filter(r => kopeks(r.amount_rub) > 0);
  const creditByAmount = new Map<number, BankRow[]>();
  for (const row of credit) {
    const k = kopeks(row.amount_rub);
    creditByAmount.set(k, [...(creditByAmount.get(k) ?? []), row]);
  }
  const dayNumber = (date: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error('Неверная дата операции');
    const parsed = new Date(date + 'T00:00:00Z').getTime();
    if (!Number.isFinite(parsed)) throw Error('Неверная дата операции');
    return Math.floor(parsed / 86_400_000);
  };
  const debitCandidates = new Map<string, { credit: BankRow; gap: number }[]>();
  const creditCandidates = new Map<string, Set<string>>();
  for (const out of debit) {
    const amount = -kopeks(out.amount_rub);
    const matches: { credit: BankRow; gap: number }[] = [];
    for (const incoming of creditByAmount.get(amount) ?? []) {
      if (incoming.transaction_id === out.transaction_id || incoming.bank === out.bank) continue;
      const gap = Math.abs(dayNumber(incoming.date) - dayNumber(out.date));
      if (gap > maxDays) continue;
      matches.push({ credit: incoming, gap });
      const uses = creditCandidates.get(incoming.transaction_id) ?? new Set<string>();
      uses.add(out.transaction_id);
      creditCandidates.set(incoming.transaction_id, uses);
    }
    debitCandidates.set(out.transaction_id, matches);
  }

  const pairs: TransferPairCandidate[] = [];
  const ambiguousDebits: BankRow[] = [];
  const unmatchedDebits: BankRow[] = [];
  for (const out of debit) {
    const options = debitCandidates.get(out.transaction_id) ?? [];
    if (!options.length) { unmatchedDebits.push(out); continue; }
    if (options.length !== 1 || creditCandidates.get(options[0].credit.transaction_id)?.size !== 1) {
      ambiguousDebits.push(out);
      continue;
    }
    pairs.push({
      debit: out,
      credit: options[0].credit,
      dayGap: options[0].gap,
      amountKopeks: -kopeks(out.amount_rub),
    });
  }
  const usedCredits = new Set(pairs.map(p => p.credit.transaction_id));
  const unmatchedCredits = credit.filter(r => !usedCredits.has(r.transaction_id) && !creditCandidates.has(r.transaction_id));
  return {
    pairs: pairs.sort((a, b) => b.debit.date.localeCompare(a.debit.date)),
    ambiguousDebits,
    unmatchedDebits,
    unmatchedCredits,
    debitCount: debit.length,
    creditCount: credit.length,
  };
}
