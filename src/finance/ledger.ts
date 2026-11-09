// Local-only finance ledger: never include these rows in the Supabase-synced Zustand store.
export type Flow = 'EXPENSE'|'INCOME'|'INTERNAL_TRANSFER'|'JOINT_SETTLEMENT'|'REFUND'|'REVIEW_REQUIRED';
export type Contour = 'ЛИЧНЫЙ'|'СОВМЕСТНЫЙ'|'НЕ РАСПРЕДЕЛЕНО';
export type Decision = 'ОБЩАЯ'|'ЛИЧНАЯ'|'НЕ РЕШЕНО';
export type Payer = 'Егор'|'Аня'|'НЕ УКАЗАН';
export interface BankRow {
  transaction_id:string; date:string; posting_date:string; month:string; bank:string; account_alias:string;
  contour:Contour; flow_type:Flow; category:string; counterparty_description:string; amount_rub:string;
  cashback_rub:string; needs_review:'Да'|'Нет'; review_reason:string; source_file:string;
  payer:Payer; shared_decision:Decision; review_confirmed:'Да'|'Нет'; note:string;
}
export const MASTER_COLUMNS:(keyof BankRow)[]=['transaction_id','date','posting_date','month','bank','account_alias','contour','flow_type','category','counterparty_description','amount_rub','cashback_rub','needs_review','review_reason','source_file','payer','shared_decision','review_confirmed','note'];
export const DECISION_COLUMNS:(keyof BankRow)[]=['date','bank','account_alias','counterparty_description','amount_rub','cashback_rub','payer','shared_decision','review_confirmed','category','note','transaction_id'];
export const FLOWS:Flow[]=['EXPENSE','INCOME','INTERNAL_TRANSFER','JOINT_SETTLEMENT','REFUND','REVIEW_REQUIRED'];
export const CONTOURS:Contour[]=['ЛИЧНЫЙ','СОВМЕСТНЫЙ','НЕ РАСПРЕДЕЛЕНО'];
export const DECISIONS:Decision[]=['НЕ РЕШЕНО','ОБЩАЯ','ЛИЧНАЯ'];
export const PAYERS:Payer[]=['НЕ УКАЗАН','Егор','Аня'];
type Raw=Record<string,string>;
export function parseCSV(text:string):Raw[]{
  const lines:string[][]=[]; let fields:string[]=[],cell='',quoted=false;
  const source=text.replace(/^\uFEFF/,'');
  for(let i=0;i<source.length;i++){
    const c=source[i];
    if(quoted){
      if(c==='"' && source[i+1]==='"'){cell+='"';i++}
      else if(c==='"')quoted=false;
      else cell+=c;
    }else if(c==='"')quoted=true;
    else if(c===','){fields.push(cell);cell=''}
    else if(c==='\n'||c==='\r'){
      if(c==='\r'&&source[i+1]==='\n')i++;
      fields.push(cell);lines.push(fields);fields=[];cell='';
    }else cell+=c;
  }
  if(quoted)throw Error('Незакрытая кавычка в CSV');
  if(cell||fields.length){fields.push(cell);lines.push(fields)}
  const headers=lines.shift();
  if(!headers?.length)throw Error('CSV пустой');
  if(new Set(headers).size!==headers.length)throw Error('Дубли названий столбцов');
  return lines.filter(row=>row.some(Boolean)).map((cells,index)=>{
    if(cells.length!==headers.length)throw Error('Неверное число колонок, строка '+(index+2));
    return Object.fromEntries(headers.map((name,j)=>[name,cells[j]]));
  });
}
export function kopeks(value:string):number{
  const val=value.replace(/[\s\u00A0\u202F]/g,'').replace(',','.');
  if(!/^[+-]?\d+(?:\.\d{1,2})?$/.test(val))throw Error('Недопустимая сумма '+value);
  const minus=val[0]==='-',parts=val.replace(/^[+-]/,'').split('.');
  const count=Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));
  if(!Number.isSafeInteger(count))throw Error('Слишком большая сумма '+value);
  return minus?-count:count;
}
export const money=(value:number)=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB'}).format(value/100);
export const isPending=(r:BankRow)=>r.needs_review==='Да'||r.flow_type==='REVIEW_REQUIRED';
const ledgerRequired=['transaction_id','date','bank','flow_type','contour','amount_rub','needs_review'];
export function parseMaster(text:string):BankRow[]{
  const headers=text.replace(/^\uFEFF/,'').split(/\r?\n/,1)[0].split(',');
  if(!ledgerRequired.every(h=>headers.includes(h)))throw Error('Не распознан реестр: нужны поля '+ledgerRequired.filter(h=>!headers.includes(h)).join(', '));
  const seen=new Set<string>();
  return parseCSV(text).map((r,i)=>{
    if(!r.transaction_id||seen.has(r.transaction_id))throw Error('Повторный/пустой ID, строка '+(i+2));
    seen.add(r.transaction_id);
    if(!/^\d{4}-\d\d-\d\d$/.test(r.date)||Number.isNaN(Date.parse(r.date+'T00:00:00Z')))throw Error('Неверная дата '+r.transaction_id);
    if(!FLOWS.includes(r.flow_type as Flow)||!CONTOURS.includes(r.contour as Contour)||!['Да','Нет'].includes(r.needs_review))throw Error('Неизвестный тип, контур или флаг '+r.transaction_id);
    kopeks(r.amount_rub);if(r.cashback_rub)kopeks(r.cashback_rub);
    return {transaction_id:r.transaction_id,date:r.date,posting_date:r.posting_date||'',month:r.month||r.date.slice(0,7),bank:r.bank,account_alias:r.account_alias||'',contour:r.contour as Contour,flow_type:r.flow_type as Flow,category:r.category||'Без категории',counterparty_description:r.counterparty_description||'',amount_rub:r.amount_rub,cashback_rub:r.cashback_rub||'0',needs_review:r.needs_review as 'Да'|'Нет',review_reason:r.review_reason||'',source_file:r.source_file||'',payer:PAYERS.includes(r.payer as Payer)?r.payer as Payer:'НЕ УКАЗАН',shared_decision:DECISIONS.includes(r.shared_decision as Decision)?r.shared_decision as Decision:'НЕ РЕШЕНО',review_confirmed:r.review_confirmed==='Да'?'Да':'Нет',note:r.note||''};
  });
}
export function combineMaster(existing:BankRow[],incoming:BankRow[]){
  const map=new Map(existing.map(r=>[r.transaction_id,r]));let added=0;
  for(const row of incoming){
    const old=map.get(row.transaction_id);
    if(old){
      if(old.date!==row.date||old.bank!==row.bank||old.account_alias!==row.account_alias||old.counterparty_description!==row.counterparty_description||kopeks(old.amount_rub)!==kopeks(row.amount_rub)||kopeks(old.cashback_rub)!==kopeks(row.cashback_rub))throw Error('Конфликт банковского ID '+row.transaction_id);
    }else{map.set(row.transaction_id,row);added++}
  }
  return {rows:[...map.values()].sort((a,b)=>b.date.localeCompare(a.date)),added};
}
export function reconcileVerifiedMaster(
  existing: BankRow[], incoming: BankRow[],
): { rows: BankRow[]; updated: number; confirmed: number; categorized: number } {
  if (existing.length !== incoming.length) {
    throw Error('Для сверки нужна полная версия мастер-реестра с теми же ID. Новые операции загружай через «Импорт CSV».');
  }
  const map = new Map(incoming.map(r => [r.transaction_id, r]));
  if (map.size !== incoming.length || existing.some(r => !map.has(r.transaction_id))) {
    throw Error('Наборы ID мастер-файла и браузера различаются. Сверка остановлена без изменений.');
  }
  let updated = 0, confirmed = 0, categorized = 0;
  const rows = existing.map(current => {
    const fromMaster = map.get(current.transaction_id)!;
    const immutableFields: (keyof BankRow)[] = [
      'date', 'posting_date', 'bank', 'account_alias', 'counterparty_description', 'source_file',
    ];
    if (immutableFields.some(k => current[k] !== fromMaster[k])
      || kopeks(current.amount_rub) !== kopeks(fromMaster.amount_rub)
      || kopeks(current.cashback_rub) !== kopeks(fromMaster.cashback_rub)
      || current.flow_type !== fromMaster.flow_type || current.contour !== fromMaster.contour) {
      throw Error('Конфликт исходных данных, потока или контура операции ' + current.transaction_id);
    }
    const next = { ...current };
    const placeholder = ['', 'На классификацию', 'Без категории'];
    let changed = false;
    if (placeholder.includes(next.category) && !placeholder.includes(fromMaster.category)) {
      next.category = fromMaster.category;
      categorized++;
      changed = true;
    }
    // Only this narrowly audited pre-cohabitation merchant case can clear the flag automatically.
    // Joint/unallocated rows, cash, P2P and wallet transfers remain pending.
    if (current.needs_review === 'Да' && fromMaster.needs_review === 'Нет'
      && current.flow_type === 'EXPENSE' && current.contour === 'ЛИЧНЫЙ'
      && current.date < '2026-10-21' && fromMaster.category === 'Продукты'
      && fromMaster.review_reason === ''
      && /операция по карте:/i.test(current.counterparty_description)
      && /место совершения операции\s*:[^,;\n]*(?:PYATEROCHKA|PEREKRESTOK)/i.test(current.counterparty_description)) {
      next.needs_review = 'Нет';
      next.review_reason = '';
      confirmed++;
      changed = true;
    }
    if (changed) updated++;
    return next;
  });
  return { rows, updated, confirmed, categorized };
}

export function applyDecisions(ledger:BankRow[],text:string){
  const heads=text.replace(/^\uFEFF/,'').split(/\r?\n/,1)[0].split(',');
  if(!['transaction_id','payer','shared_decision'].every(x=>heads.includes(x)))throw Error('Нужен CSV решений: transaction_id, payer, shared_decision');
  const map=new Map(ledger.map(r=>[r.transaction_id,r]));const seen=new Set<string>();let updated=0;
  for(const x of parseCSV(text)){
    const id=x.transaction_id,prev=map.get(id);
    if(!id||seen.has(id))throw Error('Повторный ID решения '+id);
    seen.add(id);
    if(!prev||prev.flow_type!=='EXPENSE')throw Error('Операция не найдена или не покупка: '+id);
    const decision=x.shared_decision||'НЕ РЕШЕНО',payer=x.payer||'НЕ УКАЗАН',confirmed=x.review_confirmed||'Нет';
    if(!DECISIONS.includes(decision as Decision)||!PAYERS.includes(payer as Payer)||!['Да','Нет'].includes(confirmed))throw Error('Некорректное решение '+id);
    const next={...prev,payer:payer as Payer,shared_decision:decision as Decision,review_confirmed:confirmed as 'Да'|'Нет',note:x.note??prev.note,category:x.category||prev.category};
    if(decision==='ОБЩАЯ')next.contour='СОВМЕСТНЫЙ';
    if(decision==='ЛИЧНАЯ')next.contour='ЛИЧНЫЙ';
    if(decision==='НЕ РЕШЕНО'){
      next.review_confirmed='Нет';
      if(prev.shared_decision!=='НЕ РЕШЕНО'||next.contour==='НЕ РАСПРЕДЕЛЕНО')next.needs_review='Да';
    }else if(confirmed==='Да')next.needs_review='Нет';
    else if(decision!==prev.shared_decision || confirmed!==prev.review_confirmed)next.needs_review='Да';
    map.set(id,next);updated++;
  }
  return {rows:ledger.map(r=>map.get(r.transaction_id)!),updated};
}
export function editRow(row:BankRow,patch:Partial<BankRow>):BankRow{
  const next={...row,...patch};
  const decisionChanged=patch.shared_decision!==undefined&&patch.shared_decision!==row.shared_decision;
  const flowChanged=patch.flow_type!==undefined&&patch.flow_type!==row.flow_type;
  if(patch.shared_decision==='ОБЩАЯ')next.contour='СОВМЕСТНЫЙ';
  if(patch.shared_decision==='ЛИЧНАЯ')next.contour='ЛИЧНЫЙ';
  // Changing a previously confirmed decision explicitly reopens review.
  if(decisionChanged||flowChanged||(patch.review_confirmed==='Нет'&&row.review_confirmed==='Да')){
    next.needs_review='Да';
    next.review_confirmed='Нет';
  }
  if(next.flow_type==='REVIEW_REQUIRED'||(next.flow_type==='EXPENSE'&&next.contour==='НЕ РАСПРЕДЕЛЕНО')){
    next.needs_review='Да';
    if(patch.review_confirmed==='Да')next.review_confirmed='Нет';
  }else if(patch.review_confirmed==='Да'&&next.flow_type==='EXPENSE'&&next.shared_decision!=='НЕ РЕШЕНО'){
    next.needs_review='Нет';
    next.review_confirmed='Да';
  }else if(patch.review_confirmed==='Да'){
    next.review_confirmed='Нет';
    next.needs_review='Да';
  }
  return next;
}
export function computeStats(rows:BankRow[]){
  let expense=0,income=0,grossDebits=0,pendingAmount=0,pendingCount=0,transferCount=0;
  const months=new Map<string,number>(),categories=new Map<string,number>();
  const jointPaidBy:Record<Payer,number>={'Егор':0,'Аня':0,'НЕ УКАЗАН':0};
  for(const r of rows){
    const v=kopeks(r.amount_rub);if(v<0)grossDebits+=-v;
    if(isPending(r)){pendingCount++;pendingAmount+=Math.abs(v);continue}
    if(r.flow_type==='INTERNAL_TRANSFER'){transferCount++;continue}
    if(r.flow_type==='INCOME'){income+=v;continue}
    if(r.flow_type==='EXPENSE'){
      const c=Math.abs(v);expense+=c;months.set(r.month,(months.get(r.month)||0)+c);
      categories.set(r.category,(categories.get(r.category)||0)+c);
      if(r.contour==='СОВМЕСТНЫЙ')jointPaidBy[r.payer]+=c;
    }else if(r.flow_type==='REFUND'){const c=Math.abs(v);expense-=c;months.set(r.month,(months.get(r.month)||0)-c)}
  }
  return {count:rows.length,expense,income,grossDebits,pendingAmount,pendingCount,transferCount,jointPaidBy,
    months:[...months].sort(([a],[b])=>a.localeCompare(b)).map(([month,amount])=>({month,amount})),
    categories:[...categories].sort((a,b)=>b[1]-a[1]).map(([category,amount])=>({category,amount}))};
}
export function sources(rows:BankRow[]){
  const map=new Map<string,{bank:string;count:number;first:string;last:string}>();
  for(const r of rows){const s=map.get(r.bank);if(!s)map.set(r.bank,{bank:r.bank,count:1,first:r.date,last:r.date});
  else{s.count++;if(r.date<s.first)s.first=r.date;if(r.date>s.last)s.last=r.date}}
  return [...map.values()].sort((a,b)=>a.bank.localeCompare(b.bank,'ru'));
}
/** Expected sources are configuration, not proof that any bank was imported. */
const expectedBanks = [
  { label: 'Альфа-Банк', aliases: ['Альфа-Банк', 'Альфа'] },
  { label: 'ВБ Банк / WB', aliases: ['ВБ Банк', 'WB Банк', 'WB Кошелёк', 'ВБ Кошелёк'] },
  { label: 'Т-Банк', aliases: ['Т-Банк', 'Тинькофф', 'Тинькофф Банк'] },
  { label: 'Сбер', aliases: ['Сбер', 'Сбербанк', 'СберБанк'] },
  { label: 'ВТБ', aliases: ['ВТБ'] },
  { label: 'Ozon Банк', aliases: ['Ozon Банк', 'Озон Банк', 'Ozon', 'Озон'] },
] as const;

export interface SourceCoverage {
  bank: string;
  count: number;
  first: string | null;
  last: string | null;
  imported: boolean;
}

export function bankCoverage(rows:BankRow[]):SourceCoverage[]{
  const observed=sources(rows);
  const claimed=new Set<string>();
  const expected=expectedBanks.map(entry=>{
    const matches=observed.filter(s=>entry.aliases.some(name=>name.toLocaleLowerCase('ru')===s.bank.toLocaleLowerCase('ru')));
    for(const item of matches)claimed.add(item.bank);
    return {
      bank:entry.label,
      count:matches.reduce((total,item)=>total+item.count,0),
      first:matches.length?matches.map(item=>item.first).sort()[0]:null,
      last:matches.length?matches.map(item=>item.last).sort().at(-1)!:null,
      imported:matches.length>0,
    };
  });
  return [
    ...expected,
    ...observed.filter(item=>!claimed.has(item.bank))
      .map(item=>({bank:item.bank,count:item.count,first:item.first,last:item.last,imported:true})),
  ];
}

export interface BankQuality {
  bank: string;
  total: number;
  reviewed: number;
  pending: number;
  unallocated: number;
  withoutCategory: number;
  unclearTransfer: number;
}

export function auditLedgerQuality(rows: BankRow[]) {
  const bankMap = new Map<string, BankQuality>();
  let reviewed=0, pending=0, unallocated=0, withoutCategory=0, unclearTransfer=0, unresolvedJoint=0;
  const emptyCategories = new Set(['', 'На классификацию', 'Без категории']);
  for (const r of rows) {
    let bank = bankMap.get(r.bank);
    if (!bank) {
      bank={bank:r.bank,total:0,reviewed:0,pending:0,unallocated:0,withoutCategory:0,unclearTransfer:0};
      bankMap.set(r.bank,bank);
    }
    bank.total++;
    const flag=isPending(r);
    if(flag){pending++;bank.pending++} else {reviewed++;bank.reviewed++}
    if(r.contour==='НЕ РАСПРЕДЕЛЕНО'){unallocated++;bank.unallocated++}
    if(r.flow_type==='EXPENSE'&&emptyCategories.has(r.category.trim())){
      withoutCategory++;bank.withoutCategory++;
    }
    if(r.flow_type==='REVIEW_REQUIRED'){unclearTransfer++;bank.unclearTransfer++}
    if(r.flow_type==='EXPENSE'&&r.date>='2026-10-21'
      &&r.shared_decision==='НЕ РЕШЕНО'&&flag)unresolvedJoint++;
  }
  return {
    total:rows.length,reviewed,pending,unallocated,withoutCategory,unclearTransfer,unresolvedJoint,
    reviewedPercent:rows.length?Math.round(reviewed*100/rows.length):0,
    banks:[...bankMap.values()].sort((a,b)=>b.pending-a.pending||a.bank.localeCompare(b.bank,'ru')),
  };
}

export function exportCSV(rows:BankRow[],columns:(keyof BankRow)[]):string{
  const output=[columns.join(',')];
  for(const r of rows)output.push(columns.map(field=>{
    let s=String(r[field]??'');
    if(!['amount_rub','cashback_rub'].includes(field)&&/^[=+\-@\t\r]/.test(s))s="'"+s;
    return '"'+s.replace(/"/g,'""')+'"';
  }).join(','));
  return '\uFEFF'+output.join('\r\n')+'\r\n';
}
