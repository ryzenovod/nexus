import { describe, expect, it } from 'vitest';
import {
  type BankRow, applyDecisions, combineMaster, computeStats, DECISION_COLUMNS,
  auditLedgerQuality, bankCoverage, editRow, exportCSV, isPending, kopeks, MASTER_COLUMNS, parseCSV,
  parseMaster, reconcileVerifiedMaster, sources,
} from './ledger';

const sample: BankRow = {
  transaction_id: 'fixture-1',
  date: '2026-11-01', posting_date: '', month: '2026-11',
  bank: 'Тестовый банк', account_alias: 'Основной',
  contour: 'НЕ РАСПРЕДЕЛЕНО', flow_type: 'EXPENSE', category: 'Продукты',
  counterparty_description: 'Пример магазина', amount_rub: '-150.50',
  cashback_rub: '0.00', needs_review: 'Да', review_reason: 'Проверить цель',
  source_file: 'fixture.csv', payer: 'НЕ УКАЗАН', shared_decision: 'НЕ РЕШЕНО',
  review_confirmed: 'Нет', note: '',
};

describe('NEXUS local finance ledger', () => {
  it('parses signed kopeks exactly and rejects imprecise amounts', () => {
    expect(kopeks('-150.50')).toBe(-15050);
    expect(kopeks('1 234,05')).toBe(123405);
    expect(kopeks('0.01')).toBe(1);
    expect(() => kopeks('2.005')).toThrow();
    expect(() => kopeks('Infinity')).toThrow();
  });

  it('parses multiline/quoted UTF-8 CSV', () => {
    expect(parseCSV('\uFEFFid,note\r\n1,"one\n""two"""')[0].note).toBe('one\n"two"');
    expect(() => parseCSV('id,id\n1,2')).toThrow();
  });

  it('preserves a full master import/export round-trip', () => {
    const parsed = parseMaster(exportCSV([sample], MASTER_COLUMNS));
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(sample);
    expect(() => parseMaster('transaction_id,date\n1,2026-01-01')).toThrow();
  });

  it('is idempotent by bank transaction ID and rejects conflicts', () => {
    expect(combineMaster([sample], [sample]).added).toBe(0);
    expect(combineMaster([sample], [{ ...sample, transaction_id: 'fixture-2' }]).added).toBe(1);
    expect(() => combineMaster([sample], [{ ...sample, amount_rub: '-152.00' }])).toThrow();
  });

  it('excludes all pending expenses from the clean expense total', () => {
    const incoming = { ...sample, transaction_id: 'fixture-income', flow_type: 'INCOME' as const,
      amount_rub: '500.00', contour: 'ЛИЧНЫЙ' as const, needs_review: 'Нет' as const };
    const transfer = { ...sample, transaction_id: 'fixture-transfer', flow_type: 'INTERNAL_TRANSFER' as const,
      amount_rub: '-1000.00', contour: 'ЛИЧНЫЙ' as const, needs_review: 'Нет' as const };
    const summary = computeStats([sample, incoming, transfer]);
    expect(summary.expense).toBe(0);
    expect(summary.income).toBe(50000);
    expect(summary.grossDebits).toBe(115050);
    expect(summary.pendingCount).toBe(1);
    expect(summary.transferCount).toBe(1);
  });

  it('does not approve an expense merely because a joint decision exists', () => {
    const decision = { ...sample, shared_decision: 'ОБЩАЯ' as const, payer: 'Егор' as const };
    const first = applyDecisions([sample], exportCSV([decision], DECISION_COLUMNS)).rows[0];
    expect(first.contour).toBe('СОВМЕСТНЫЙ');
    expect(isPending(first)).toBe(true);
    const approved = applyDecisions([sample], exportCSV([{ ...decision, review_confirmed: 'Да' }], DECISION_COLUMNS)).rows[0];
    expect(approved.needs_review).toBe('Нет');
    expect(computeStats([approved]).jointPaidBy['Егор']).toBe(15050);
  });

  it('never marks a REVIEW_REQUIRED row verified without reclassification', () => {
    const unresolved = { ...sample, flow_type: 'REVIEW_REQUIRED' as const };
    expect(editRow(unresolved, { needs_review: 'Нет' }).needs_review).toBe('Да');
  });

  it('reopens verification when an approved joint purchase is made undecided again', () => {
    const approved = editRow(sample, {
      shared_decision: 'ОБЩАЯ', review_confirmed: 'Да', payer: 'Егор',
    });
    expect(approved.needs_review).toBe('Нет');
    expect(approved.review_confirmed).toBe('Да');
    expect(computeStats([approved]).expense).toBe(15050);
    const reverted = editRow(approved, { shared_decision: 'НЕ РЕШЕНО' });
    expect(reverted.review_confirmed).toBe('Нет');
    expect(reverted.needs_review).toBe('Да');
    expect(computeStats([reverted]).expense).toBe(0);
  });

  it('requires renewed approval when flipping an approved purchase from joint to personal', () => {
    const approved = editRow(sample, { shared_decision: 'ОБЩАЯ', review_confirmed: 'Да' });
    const reverted = editRow(approved, { shared_decision: 'ЛИЧНАЯ' });
    expect(reverted.contour).toBe('ЛИЧНЫЙ');
    expect(reverted.needs_review).toBe('Да');
    expect(reverted.review_confirmed).toBe('Нет');
    const confirmed = editRow(reverted, { review_confirmed: 'Да' });
    expect(confirmed.needs_review).toBe('Нет');
  });

  it('does not accept a confirmation without an explicit shared decision', () => {
    const attempted = editRow(sample, { review_confirmed: 'Да' });
    expect(attempted.needs_review).toBe('Да');
    expect(attempted.review_confirmed).toBe('Нет');
  });

  it('never confirms an expense with unallocated contour by toggling the review flag', () => {
    const unresolved = editRow(sample, { needs_review: 'Нет' });
    expect(unresolved.needs_review).toBe('Да');
    expect(computeStats([unresolved]).expense).toBe(0);
  });

  it('reopening a CSV decision excludes the previously confirmed expense', () => {
    const approved = editRow(sample, { shared_decision: 'ОБЩАЯ', review_confirmed: 'Да' });
    const csv = exportCSV([{ ...approved, shared_decision: 'НЕ РЕШЕНО', review_confirmed: 'Нет' }], DECISION_COLUMNS);
    const reverted = applyDecisions([approved], csv).rows[0];
    expect(reverted.needs_review).toBe('Да');
    expect(reverted.review_confirmed).toBe('Нет');
    expect(computeStats([reverted]).expense).toBe(0);
  });

  it('shows missing bank sources with no fabricated transactions or dates', () => {
    const coverage = bankCoverage([sample]);
    const sber = coverage.find(r => r.bank === 'Сбер');
    const vtb = coverage.find(r => r.bank === 'ВТБ');
    expect(sber).toEqual({ bank: 'Сбер', count: 0, first: null, last: null, imported: false });
    expect(vtb).toMatchObject({ count: 0, imported: false });
    expect(coverage.find(r => r.bank === 'Тестовый банк')).toMatchObject({
      count: 1, imported: true, first: sample.date, last: sample.date,
    });
  });

  it('normalizes known bank labels without double-counting accounts', () => {
    const coverage = bankCoverage([
      { ...sample, transaction_id: 'sber-1', bank: 'Сбер', date: '2026-10-01' },
      { ...sample, transaction_id: 'sber-2', bank: 'Сбербанк', date: '2026-11-01' },
    ]);
    expect(coverage.find(r => r.bank === 'Сбер')).toEqual({
      bank: 'Сбер', count: 2, first: '2026-10-01', last: '2026-11-01', imported: true,
    });
    expect(coverage.filter(r => r.bank === 'Сбер')).toHaveLength(1);
  });

  it('audits missing categories, unresolved contour and review by bank without guessing balances', () => {
    const pending = { ...sample, category: 'На классификацию', flow_type: 'EXPENSE' as const };
    const unclear = { ...sample, transaction_id: 'second', flow_type: 'REVIEW_REQUIRED' as const, bank: 'ВТБ' };
    const reviewed = { ...sample, transaction_id: 'third', bank: 'ВТБ',
      contour: 'ЛИЧНЫЙ' as const, needs_review: 'Нет' as const, shared_decision: 'ЛИЧНАЯ' as const };
    const quality = auditLedgerQuality([pending, unclear, reviewed]);
    expect(quality).toMatchObject({
      total: 3, pending: 2, reviewed: 1, reviewedPercent: 33,
      unallocated: 2, withoutCategory: 1, unclearTransfer: 1, unresolvedJoint: 1,
    });
    expect(quality.banks.find(b => b.bank === 'ВТБ')).toMatchObject({
      total: 2, pending: 1, reviewed: 1, unclearTransfer: 1,
    });
    expect(auditLedgerQuality([])).toMatchObject({ total: 0, reviewedPercent: 0, banks: [] });
  });

  it('reports observed bank coverage without inventing missing records', () => {
    const list = sources([sample, { ...sample, transaction_id: 'fixture-2', date: '2026-11-05' }]);
    expect(list).toEqual([{ bank: 'Тестовый банк', count: 2, first: '2026-11-01', last: '2026-11-05' }]);
  });
});


describe('Reconcile reviewed master classifications without overwriting user decisions', () => {
  const grocery: BankRow = {
    ...sample, bank: 'Альфа-Банк', date: '2026-10-12', month: '2026-10',
    contour: 'ЛИЧНЫЙ', category: 'На классификацию', needs_review: 'Да',
    review_reason: 'На классификацию',
    counterparty_description: 'Операция по карте: тест, место совершения операции: RU/MOSCOW/PYATEROCHKA 102',
  };
  it('applies only verified pre-cohabitation grocery classifications', () => {
    const incoming = { ...grocery, category: 'Продукты', needs_review: 'Нет' as const, review_reason: '' };
    const result = reconcileVerifiedMaster([grocery], [incoming]);
    expect(result).toMatchObject({ updated: 1, confirmed: 1, categorized: 1 });
    expect(result.rows[0].needs_review).toBe('Нет');
    expect(result.rows[0].category).toBe('Продукты');
    expect(reconcileVerifiedMaster(result.rows, [incoming]).updated).toBe(0);
  });
  it('keeps later unallocated shopping pending after category update', () => {
    const later = { ...grocery, date: '2026-10-25', contour: 'НЕ РАСПРЕДЕЛЕНО' as const };
    const imported = { ...later, category: 'Продукты', needs_review: 'Да' as const };
    const result = reconcileVerifiedMaster([later], [imported]);
    expect(result).toMatchObject({ updated: 1, confirmed: 0, categorized: 1 });
    expect(result.rows[0].needs_review).toBe('Да');
    expect(result.rows[0].contour).toBe('НЕ РАСПРЕДЕЛЕНО');
  });
  it('rejects tampered bank-origin amounts and mismatched ID sets atomically', () => {
    expect(() => reconcileVerifiedMaster([grocery], [{ ...grocery, amount_rub: '-1.00' }])).toThrow('Конфликт');
    expect(() => reconcileVerifiedMaster([grocery], [])).toThrow('полная версия');
    expect(() => reconcileVerifiedMaster([grocery], [{ ...grocery, transaction_id: 'other' }])).toThrow('ID');
  });
  it('never approves a P2P transfer disguised as a grocery purchase', () => {
    const p2p = { ...grocery, counterparty_description: 'Перевод CARD2CARD AMOBILE' };
    const incoming = { ...p2p, category: 'Продукты', needs_review: 'Нет' as const, review_reason: '' };
    const result = reconcileVerifiedMaster([p2p], [incoming]);
    expect(result.confirmed).toBe(0);
    expect(result.rows[0].needs_review).toBe('Да');
  });
  it('preserves a more specific human category and browser note', () => {
    const manuallyTagged = { ...grocery, category: 'Дом', note: 'Сохранить локальный комментарий' };
    const incoming = { ...manuallyTagged, category: 'Продукты', note: 'Другой текст' };
    const result = reconcileVerifiedMaster([manuallyTagged], [incoming]);
    expect(result.updated).toBe(0);
    expect(result.rows[0].category).toBe('Дом');
    expect(result.rows[0].note).toBe('Сохранить локальный комментарий');
  });
});
