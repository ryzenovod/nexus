import { describe, expect, it } from 'vitest';
import type { BankRow } from './ledger';
import { auditInternalTransferPairs } from './transferPairs';

const row = (id:string, bank:string, date:string, amount:string, flow:BankRow['flow_type']='INTERNAL_TRANSFER'):BankRow => ({
  transaction_id:id, bank, date, amount_rub:amount, flow_type:flow,
  posting_date:'', month:date.slice(0,7), account_alias:'Тестовый счёт', contour:'ЛИЧНЫЙ',
  category:'Переводы', counterparty_description:'Синтетический тест',
  cashback_rub:'0', needs_review:'Нет', review_reason:'', source_file:'test',
  payer:'НЕ УКАЗАН', shared_decision:'НЕ РЕШЕНО', review_confirmed:'Нет', note:'',
});

describe('Safe cross-bank internal transfer reconciliation', () => {
  it('shows exactly matched opposite signed transfers only as candidates', () => {
    const r = auditInternalTransferPairs([
      row('debit','Альфа-Банк','2026-11-01','-1234.56'),
      row('credit','Т-Банк','2026-11-02','1234.56'),
    ]);
    expect(r.pairs).toHaveLength(1);
    expect(r.pairs[0]).toMatchObject({ dayGap: 1, amountKopeks: 123456 });
    expect(r.unmatchedDebits).toHaveLength(0);
    expect(r.unmatchedCredits).toHaveLength(0);
  });
  it('does not claim matching when same amount appears twice on the receiving side', () => {
    const r = auditInternalTransferPairs([
      row('out','Альфа-Банк','2026-11-01','-100'),
      row('in1','Т-Банк','2026-11-01','100'),
      row('in2','ВТБ','2026-11-01','100'),
    ]);
    expect(r.pairs).toHaveLength(0);
    expect(r.ambiguousDebits.map(x=>x.transaction_id)).toEqual(['out']);
  });
  it('does not claim matching when two outgoing operations can match one incoming', () => {
    const r = auditInternalTransferPairs([
      row('out1','Альфа-Банк','2026-11-01','-100'),
      row('out2','ВТБ','2026-11-02','-100'),
      row('in1','Т-Банк','2026-11-01','100'),
    ]);
    expect(r.pairs).toHaveLength(0);
    expect(r.ambiguousDebits).toHaveLength(2);
  });
  it('never pairs payments within one bank, third-party or REVIEW_REQUIRED flows', () => {
    const r = auditInternalTransferPairs([
      row('out','Альфа-Банк','2026-11-01','-100'),
      row('samebank','Альфа-Банк','2026-11-01','100'),
      row('thirdparty','Т-Банк','2026-11-01','100','REVIEW_REQUIRED'),
      row('expense','Сбер','2026-11-01','100','EXPENSE'),
    ]);
    expect(r.pairs).toHaveLength(0);
    expect(r.unmatchedDebits).toHaveLength(1);
  });
  it('requires an exact kopek amount and within-three-days interval', () => {
    const r = auditInternalTransferPairs([
      row('out','Альфа-Банк','2026-11-01','-100.00'),
      row('offamount','Т-Банк','2026-11-01','100.01'),
      row('late','ВТБ','2026-11-05','100.00'),
    ]);
    expect(r.pairs).toHaveLength(0);
    expect(r.unmatchedDebits).toHaveLength(1);
  });
  it('does not change source classifications or flow statistics', () => {
    const rows=[
      row('out','Альфа-Банк','2026-11-01','-100'),
      row('in','Т-Банк','2026-11-01','100'),
    ];
    const original=JSON.stringify(rows);
    auditInternalTransferPairs(rows);
    expect(JSON.stringify(rows)).toBe(original);
    expect(rows.every(x=>x.flow_type==='INTERNAL_TRANSFER')).toBe(true);
  });
  it('rejects unrealistic matching intervals', () => {
    expect(()=>auditInternalTransferPairs([], -1)).toThrow();
    expect(()=>auditInternalTransferPairs([], 100)).toThrow();
  });
});
