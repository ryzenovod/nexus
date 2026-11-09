import { describe, expect, it } from 'vitest';
import type { BankRow } from './ledger';
import { possibleDuplicateImports } from './duplicates';

const base: BankRow = {
  transaction_id:'test-1', date:'2026-11-04', posting_date:'', month:'2026-11',
  bank:'Тестовый банк', account_alias:'Счёт', contour:'ЛИЧНЫЙ',
  flow_type:'EXPENSE', category:'Продукты',
  counterparty_description:'Тестовый магазин', amount_rub:'-155.20',
  cashback_rub:'0', needs_review:'Да', review_reason:'',
  source_file:'first.csv', payer:'НЕ УКАЗАН', shared_decision:'НЕ РЕШЕНО',
  review_confirmed:'Нет', note:'',
};

describe('read-only duplicate bank record audit',()=>{
  it('flags distinct IDs that repeat exact bank-origin evidence',()=>{
    const duplicates=possibleDuplicateImports([base,{...base,transaction_id:'test-2',source_file:'second.csv'}]);
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]).toMatchObject({ bank:base.bank,date:base.date,amountKopeks:-15520 });
    expect(duplicates[0].rows.map(r=>r.transaction_id)).toEqual(['test-1','test-2']);
  });
  it('never treats another bank or different signed amount as duplicate',()=>{
    expect(possibleDuplicateImports([
      base, {...base,transaction_id:'t2',bank:'Другой банк'},
      {...base,transaction_id:'t3',amount_rub:'-155.21'},
      {...base,transaction_id:'t4',date:'2026-11-05'},
    ])).toHaveLength(0);
  });
  it('normalizes description whitespace without changing existing rows',()=>{
    const records=[base,{...base,transaction_id:'t2',counterparty_description:'  Тестовый   магазин  '}];
    const original=JSON.stringify(records);
    expect(possibleDuplicateImports(records)).toHaveLength(1);
    expect(JSON.stringify(records)).toEqual(original);
  });
  it('does not flag a single unique imported transaction',()=>{
    expect(possibleDuplicateImports([base])).toHaveLength(0);
  });
});
