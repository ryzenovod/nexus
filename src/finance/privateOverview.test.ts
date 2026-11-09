import { afterEach, describe, expect, it } from 'vitest';
import type { BankRow } from './ledger';
import {
  clearPrivateFinance, getPrivateFinanceSnapshot, publishPrivateFinance, subscribePrivateFinance,
} from './privateOverview';

const transaction = (id: string, contour: BankRow['contour'], flow: BankRow['flow_type'], amount: string, review: 'Да'|'Нет'): BankRow => ({
  transaction_id:id, date:'2026-11-09', posting_date:'', month:'2026-11',
  bank:'Synthetic bank', account_alias:'Synthetic', contour, flow_type:flow,
  category:'Продукты', counterparty_description:'Test', amount_rub:amount,
  cashback_rub:'0', needs_review:review, review_reason:'',
  source_file:'test-fixture', payer:'НЕ УКАЗАН', shared_decision:'НЕ РЕШЕНО',
  review_confirmed:'Нет', note:'',
});

afterEach(() => clearPrivateFinance());

describe('Private overview projection', () => {
  it('shows no financial details until vault explicitly publishes', () => {
    expect(getPrivateFinanceSnapshot()).toBeNull();
  });
  it('excludes transfers and pending payments from confirmed expenses', () => {
    publishPrivateFinance([
      transaction('personal','ЛИЧНЫЙ','EXPENSE','-123.45','Нет'),
      transaction('joint','СОВМЕСТНЫЙ','EXPENSE','-40.00','Нет'),
      transaction('transfer','ЛИЧНЫЙ','INTERNAL_TRANSFER','-5000','Нет'),
      transaction('pending','ЛИЧНЫЙ','EXPENSE','-20.00','Да'),
      transaction('income','ЛИЧНЫЙ','INCOME','6000','Нет'),
    ]);
    expect(getPrivateFinanceSnapshot()).toEqual({
      transactionCount:5, personalExpenseKopeks:12345, jointExpenseKopeks:4000,
      confirmedIncomeKopeks:600000, pendingCount:1, pendingAmountKopeks:2000,
    });
  });
  it('signals listeners on write and clears on lock', () => {
    const events: number[] = [];
    const off=subscribePrivateFinance(() => events.push(getPrivateFinanceSnapshot()?.transactionCount ?? -1));
    publishPrivateFinance([]);
    clearPrivateFinance();
    off();
    publishPrivateFinance([transaction('a','ЛИЧНЫЙ','INTERNAL_TRANSFER','-2','Нет')]);
    expect(events).toEqual([0,-1]);
  });
});
