import { describe, expect, it } from 'vitest';
import { planCsvImport } from './importPlan';
import { exportCSV, type BankRow, MASTER_COLUMNS, DECISION_COLUMNS } from './ledger';

const example:BankRow = {
  transaction_id:'original',date:'2026-11-09',posting_date:'',month:'2026-11',
  bank:'Банк тест',account_alias:'Тест',contour:'ЛИЧНЫЙ',flow_type:'INTERNAL_TRANSFER',
  category:'Переводы',counterparty_description:'Только тест',
  amount_rub:'-20.00',cashback_rub:'0',needs_review:'Нет',review_reason:'',
  source_file:'sample',payer:'НЕ УКАЗАН',shared_decision:'НЕ РЕШЕНО',
  review_confirmed:'Нет',note:'',
};

describe('Safe review-before-import plan',()=>{
  it('counts new and repeated bank rows without touching existing transactions',()=>{
    const existing=[example],original=JSON.stringify(existing);
    const newcomer={...example,transaction_id:'second',flow_type:'REVIEW_REQUIRED' as const,needs_review:'Да' as const};
    const plan=planCsvImport(existing,exportCSV([example,newcomer],MASTER_COLUMNS));
    expect(plan).toMatchObject({kind:'master',sourceCount:2,added:1,repeated:1,pendingNew:1,expenseDeltaKopeks:0});
    expect(plan.result).toHaveLength(2);
    expect(JSON.stringify(existing)).toBe(original);
  });
  it('detects changed bank sums before confirmation and leaves original intact',()=>{
    const existing=[example];
    const csv=exportCSV([{...example,amount_rub:'-21.00'}],MASTER_COLUMNS);
    expect(()=>planCsvImport(existing,csv)).toThrow('Конфликт');
    expect(existing[0].amount_rub).toBe('-20.00');
  });
  it('requires a meaningful nonempty CSV and rejects missing decisions',()=>{
    expect(()=>planCsvImport([example],'')).toThrow('пустой');
    expect(()=>planCsvImport([example],'not,a,bank\n')).toThrow();
    expect(()=>planCsvImport([],exportCSV([example],DECISION_COLUMNS))).toThrow('мастер-реестр');
  });
  it('shows financial impact of an explicitly approved decision without saving it',()=>{
    const pending: BankRow={...example,flow_type:'EXPENSE',contour:'НЕ РАСПРЕДЕЛЕНО',
      category:'Продукты',needs_review:'Да',shared_decision:'НЕ РЕШЕНО'};
    const approved={...pending,shared_decision:'ОБЩАЯ' as const,review_confirmed:'Да' as const,payer:'Егор' as const};
    const plan=planCsvImport([pending],exportCSV([approved],DECISION_COLUMNS));
    expect(plan).toMatchObject({kind:'decisions',changes:1,sourceCount:1,expenseDeltaKopeks:2000});
    expect(pending.needs_review).toBe('Да');
  });
});
