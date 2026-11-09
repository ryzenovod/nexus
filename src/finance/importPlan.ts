import {
  applyDecisions, combineMaster, computeStats, isPending, parseCSV, parseMaster,
  type BankRow,
} from './ledger';

export interface ImportPlan {
  kind: 'master'|'decisions';
  sourceCount: number;
  added: number;
  repeated: number;
  changes: number;
  pendingNew: number;
  result: BankRow[];
  expenseDeltaKopeks: number;
}

/**
 * Validation + dry-run only. Caller must explicitly confirm before persisting.
 * Does not modify the original ledger, even on invalid or conflicting CSVs.
 */
export function planCsvImport(existing: BankRow[], content: string): ImportPlan {
  if (!content || content.length > 15 * 1024 * 1024) {
    throw Error('CSV пустой или превышает 15 МБ');
  }
  const normalized = content.replace(/^\uFEFF/, '');
  const header = normalized.split(/\r?\n/, 1)[0].split(',');
  const initial = computeStats(existing);

  if (header.includes('flow_type') && header.includes('transaction_id')) {
    const imported = parseMaster(content);
    if (!imported.length) throw Error('В выписке нет операций');
    const merged = combineMaster(existing, imported);
    const originalIds = new Set(existing.map(r => r.transaction_id));
    return {
      kind:'master',
      sourceCount:imported.length,
      added:merged.added,
      repeated:imported.length - merged.added,
      changes:0,
      pendingNew:imported.filter(r => !originalIds.has(r.transaction_id) && isPending(r)).length,
      result:merged.rows,
      expenseDeltaKopeks:computeStats(merged.rows).expense - initial.expense,
    };
  }
  if (!existing.length) throw Error('Для импорта решений сначала нужен мастер-реестр');
  const decisions = parseCSV(content);
  if (!decisions.length) throw Error('CSV решений пустой');
  const merged = applyDecisions(existing, content);
  const original = new Map(existing.map(r => [r.transaction_id,r]));
  let changes = 0;
  for (const r of merged.rows) {
    const prev = original.get(r.transaction_id)!;
    if (JSON.stringify(r) !== JSON.stringify(prev)) changes++;
  }
  return {
    kind:'decisions',
    sourceCount:decisions.length,
    added:0, repeated:0, changes, pendingNew:0,
    result:merged.rows,
    expenseDeltaKopeks:computeStats(merged.rows).expense-initial.expense,
  };
}
