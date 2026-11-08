import { describe, expect, it } from 'vitest';
import {
  type BankRow, applyDecisions, combineMaster, computeStats, DECISION_COLUMNS,
  editRow, exportCSV, isPending, kopeks, MASTER_COLUMNS, parseCSV,
  parseMaster, sources,
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

  it('reports observed bank coverage without inventing missing records', () => {
    const list = sources([sample, { ...sample, transaction_id: 'fixture-2', date: '2026-11-05' }]);
    expect(list).toEqual([{ bank: 'Тестовый банк', count: 2, first: '2026-11-01', last: '2026-11-05' }]);
  });
});
