import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type ColumnDef, type SortingState, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowDownToLine, FileUp, LockKeyhole, RefreshCw, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShadcnFinances } from './ShadcnFinances';
import {
  applyDecisions, combineMaster, computeStats, CONTOURS, DECISION_COLUMNS, DECISIONS,
  editRow, exportCSV, FLOWS, isPending, kopeks, MASTER_COLUMNS, money, parseMaster, PAYERS, sources,
  type BankRow, type Contour,
} from '@/finance/ledger';
import { loadPrivateLedger, savePrivateLedger } from '@/finance/storage';

type GridMode = 'ledger' | 'joint' | 'review';

const selectStyle = 'h-8 rounded-md border border-white/10 bg-zinc-900 px-2 text-xs text-zinc-100';
const inputStyle = 'h-8 min-w-36 rounded-md border border-white/10 bg-zinc-900 px-2 text-xs text-zinc-100';
const muted = 'text-xs text-zinc-400';
function merchantLabel(description: string) {
  // Alfa statement puts the useful merchant name after a long payment-system prefix.
  const match = description.match(/место совершения операции:\s*([^,\n]+)/i);
  return match ? match[1].replace(/^[A-Z]{2}\//, '').replace(/\//g, ' / ').trim() : description;
}

function InlineSelect({ value, options, onValue }: { value: string; options: string[]; onValue: (v: string) => void }) {
  return <select className={selectStyle} value={value} onChange={e => onValue(e.target.value)}>
    {options.map(v => <option key={v} value={v}>{v}</option>)}
  </select>;
}
function InlineText({ value, onValue }: { value: string; onValue: (v: string) => void }) {
  return <input className={inputStyle} key={value} defaultValue={value} onBlur={e => {
    if (e.target.value !== value) onValue(e.target.value);
  }} aria-label="Редактировать значение" />;
}

function FinanceGrid({ data, mode, onEdit }: {
  data: BankRow[];
  mode: GridMode;
  onEdit: (id: string, patch: Partial<BankRow>) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const columns = useMemo<ColumnDef<BankRow>[]>(() => {
    const core: ColumnDef<BankRow>[] = [
      { accessorKey: 'date', header: 'Дата', cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{row.original.date}</span> },
      { accessorKey: 'bank', header: 'Банк', cell: ({ row }) => <span className="whitespace-nowrap">{row.original.bank}</span> },
      { accessorKey: 'counterparty_description', header: 'Покупка / описание', cell: ({ row }) =>
        <div className="max-w-[370px]" title={row.original.transaction_id}>
          <div className="line-clamp-2 font-medium text-zinc-200" title={row.original.counterparty_description}>{merchantLabel(row.original.counterparty_description) || '—'}</div>
          <div className="line-clamp-1 text-[10px] text-zinc-500">{row.original.account_alias} · {row.original.counterparty_description}</div>
        </div> },
      { id: 'amount', accessorFn: row => kopeks(row.amount_rub), header: 'Сумма', cell: ({ row }) =>
        <span className="whitespace-nowrap tabular-nums font-medium">{money(kopeks(row.original.amount_rub))}</span> },
    ];
    const category: ColumnDef<BankRow> = { accessorKey: 'category', header: 'Категория', cell: ({ row }) =>
      <InlineText value={row.original.category} onValue={v => onEdit(row.original.transaction_id, { category: v })} /> };
    const flow: ColumnDef<BankRow> = { accessorKey: 'flow_type', header: 'Тип потока', cell: ({ row }) =>
      <InlineSelect value={row.original.flow_type} options={FLOWS} onValue={v => onEdit(row.original.transaction_id, { flow_type: v as BankRow['flow_type'] })} /> };
    const contour: ColumnDef<BankRow> = { accessorKey: 'contour', header: 'Контур', cell: ({ row }) =>
      <InlineSelect value={row.original.contour} options={CONTOURS} onValue={v => onEdit(row.original.transaction_id, { contour: v as Contour })} /> };
    const payer: ColumnDef<BankRow> = { accessorKey: 'payer', header: 'Кто оплатил', cell: ({ row }) =>
      <InlineSelect value={row.original.payer} options={PAYERS} onValue={v => onEdit(row.original.transaction_id, { payer: v as BankRow['payer'] })} /> };
    const decision: ColumnDef<BankRow> = { accessorKey: 'shared_decision', header: 'Решение', cell: ({ row }) =>
      <InlineSelect value={row.original.shared_decision} options={DECISIONS} onValue={v => onEdit(row.original.transaction_id, { shared_decision: v as BankRow['shared_decision'] })} /> };
    const confirmed: ColumnDef<BankRow> = { accessorKey: 'review_confirmed', header: 'Подтвердить покупку', cell: ({ row }) =>
      <InlineSelect value={row.original.review_confirmed} options={['Нет', 'Да']} onValue={v => onEdit(row.original.transaction_id, { review_confirmed: v as 'Да' | 'Нет' })} /> };
    const review: ColumnDef<BankRow> = { id: 'status', accessorFn: row => isPending(row) ? 'На проверке' : 'Проверено', header: 'Проверка', cell: ({ row }) =>
      <div className="flex flex-col gap-1">
        <InlineSelect value={row.original.needs_review} options={['Да', 'Нет']} onValue={v => onEdit(row.original.transaction_id, { needs_review: v as 'Да' | 'Нет' })} />
        <span className="text-[10px] text-zinc-500">{isPending(row.original) ? 'Не входит в расходы' : 'Подтверждено'}</span>
      </div> };
    const note: ColumnDef<BankRow> = { accessorKey: 'note', header: 'Комментарий', cell: ({ row }) =>
      <InlineText value={row.original.note} onValue={v => onEdit(row.original.transaction_id, { note: v })} /> };
    return mode === 'joint'
      ? [...core, payer, decision, confirmed, category, note, review]
      : mode === 'review'
        ? [...core, flow, category, contour, review, note]
        : [...core, flow, contour, category, payer, decision, review, note];
  }, [mode, onEdit]);

  const table = useReactTable({
    data, columns, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });
  return <Card>
    <CardContent className="p-0">
      <Table className="min-w-[980px] text-xs">
          <TableHeader className="bg-white/[0.035] text-zinc-400">
            {table.getHeaderGroups().map(group => <TableRow key={group.id}>
              {group.headers.map(h => <TableHead key={h.id} className="whitespace-nowrap border-b border-white/10 px-3 py-3 font-medium">
                {h.isPlaceholder ? null : <button type="button" className="cursor-pointer text-left hover:text-white" onClick={h.column.getToggleSortingHandler()}>
                  {flexRender(h.column.columnDef.header, h.getContext())}{h.column.getIsSorted() === 'asc' ? ' ↑' : h.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                </button>}
              </TableHead>)}
            </TableRow>)}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(r => <TableRow key={r.id} className="border-b border-white/[0.06] hover:bg-white/[0.035]">
              {r.getVisibleCells().map(c => <TableCell key={c.id} className="px-3 py-3 align-top">{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>)}
            </TableRow>)}
          </TableBody>
        </Table>
      {data.length === 0 && <div className="p-7 text-center text-sm text-zinc-400">Нет операций с такими параметрами</div>}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
        <span>{data.length} операций · страница {table.getState().pagination.pageIndex + 1} из {Math.max(1, table.getPageCount())}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Назад</Button>
          <Button size="sm" variant="outline" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Далее</Button>
        </div>
      </div>
    </CardContent>
  </Card>;
}

function Metric({ title, value, hint }: { title: string; value: string; hint: string }) {
  return <Card><CardContent className="space-y-2 p-4">
    <div className={muted}>{title}</div>
    <div className="text-xl font-semibold tabular-nums text-zinc-100">{value}</div>
    <p className="text-[11px] leading-snug text-zinc-500">{hint}</p>
  </CardContent></Card>;
}

function downloadCSV(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const NexusFinanceHub: React.FC = () => {
  const [ledger, setLedger] = useState<BankRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [message, setMessage] = useState('Импортируй transactions.csv из ~/Documents/NEXUS. Сайт не содержит встроенных выписок.');
  const [error, setError] = useState('');
  const [contour, setContour] = useState<Contour | 'ВСЕ'>('ВСЕ');
  const [search, setSearch] = useState('');
  const [bank, setBank] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const saveChain = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    loadPrivateLedger().then(rows => {
      if (active) { setLedger(rows); setStorageAvailable(true); }
    }).catch(e => { if (active) setError('Локальное хранилище недоступно: ' + String(e)); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!loaded || !storageAvailable) return;
    saveChain.current = saveChain.current.catch(() => {}).then(() => savePrivateLedger(ledger))
      .catch(e => setError('Автосохранение не удалось. Экспортируй CSV: ' + String(e)));
  }, [ledger, loaded, storageAvailable]);

  const update = useCallback((id: string, patch: Partial<BankRow>) => {
    setLedger(current => current.map(row => row.transaction_id === id ? editRow(row, patch) : row));
  }, []);

  const visible = useMemo(() => ledger.filter(r => contour === 'ВСЕ' || r.contour === contour), [ledger, contour]);
  const stats = useMemo(() => computeStats(visible), [visible]);
  const jointStats = useMemo(() => computeStats(ledger.filter(r => r.contour === 'СОВМЕСТНЫЙ')), [ledger]);
  const bankList = useMemo(() => sources(ledger), [ledger]);

  const filtered = useCallback((set: BankRow[]) => set.filter(r => {
    const text = (r.counterparty_description + ' ' + r.bank + ' ' + r.category + ' ' + r.transaction_id).toLocaleLowerCase('ru');
    return (!search || text.includes(search.toLocaleLowerCase('ru'))) && (!bank || r.bank === bank);
  }), [search, bank]);

  const importFile = async (file: File) => {
    setError('');
    try {
      const content = await file.text();
      const header = content.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0];
      if (header.includes('flow_type') && header.includes('transaction_id')) {
        const imported = parseMaster(content);
        const merged = combineMaster(ledger, imported);
        setLedger(merged.rows);
        setMessage('Импортировано ' + imported.length + ' строк из ' + file.name + ', новых: ' + merged.added + '. Повторы не добавлены.');
      } else {
        if (ledger.length === 0) throw Error('Сначала загрузи transactions.csv, затем CSV с решениями');
        const merged = applyDecisions(ledger, content);
        setLedger(merged.rows);
        setMessage('Решений из ' + file.name + ' применено: ' + merged.updated + '. Без явного подтверждения они остаются на проверке.');
      }
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };

  const candidates = ledger.filter(r => r.date >= '2026-10-21' && r.flow_type === 'EXPENSE');
  const allForGrid = filtered(visible);
  const jointForGrid = filtered(candidates);
  const reviewForGrid = filtered(ledger.filter(isPending));

  return <div className="space-y-5 pb-12">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500"><Wallet className="size-4" /> NEXUS / Finance <Badge variant="outline" className="border-white/10 text-[10px] font-normal text-zinc-400">Локальный реестр</Badge></div>
        <h1 className="text-2xl font-semibold tracking-tight">Финансовый реестр</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">Личные и совместные финансы без двойного счёта переводов. Выписки остаются в этом браузере, отдельно от облачной синхронизации NEXUS.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={inputRef} type="file" className="hidden" accept=".csv,text/csv" onChange={async e => {
          const file = e.target.files?.[0]; if (file) await importFile(file); e.target.value = '';
        }} />
        <Button disabled={!loaded} onClick={() => inputRef.current?.click()}><FileUp /> Импорт CSV</Button>
        <Button variant="outline" disabled={!ledger.length} onClick={() => downloadCSV('nexus_shared_decisions.csv', exportCSV(candidates, DECISION_COLUMNS))}>
          <ArrowDownToLine /> Решения
        </Button>
        <Button variant="outline" disabled={!ledger.length} onClick={() => downloadCSV('nexus_transactions_edited.csv', exportCSV(ledger, MASTER_COLUMNS))}>
          <ArrowDownToLine /> Реестр
        </Button>
      </div>
    </header>
    <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-zinc-300">
      <LockKeyhole className="mt-0.5 size-4 shrink-0" />
      <span>Данные хранятся в IndexedDB на этом устройстве, без передачи в Supabase. Это не облачный бэкап: обязательно экспортируй CSV после правок. Старые вручную введённые финансы NEXUS учитываются отдельно.</span>
    </div>
    {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-200"><AlertTriangle className="size-4 shrink-0" />{error}</div>}
    {message && <div className="text-xs text-zinc-400">{loaded ? message : 'Чтение локального хранилища…'}</div>}

    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4 h-auto w-full flex-wrap justify-start gap-1 bg-white/[0.03] p-1">
        <TabsTrigger value="overview">Сводка</TabsTrigger>
        <TabsTrigger value="personal">Мои финансы</TabsTrigger>
        <TabsTrigger value="joint">Совместные покупки</TabsTrigger>
        <TabsTrigger value="ledger">Операции</TabsTrigger>
        <TabsTrigger value="sources">Банки</TabsTrigger>
        <TabsTrigger value="review">На проверку ({ledger.filter(isPending).length})</TabsTrigger>
        <TabsTrigger value="old">Карты и ЖКХ</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-5">
        <div className="flex items-center gap-2">
          <span className={muted}>Контур:</span>
          <InlineSelect value={contour} options={['ВСЕ', ...CONTOURS]} onValue={v => setContour(v as Contour | 'ВСЕ')} />
        </div>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric title="Чистые расходы" value={money(stats.expense)} hint="Только подтверждённые покупки минус возвраты" />
          <Metric title="Подтверждённые доходы" value={money(stats.income)} hint="Без переводов между своими счетами" />
          <Metric title="Валовые списания" value={money(stats.grossDebits)} hint="Все отрицательные операции, не показатель потребления" />
          <Metric title="На проверке" value={money(stats.pendingAmount)} hint={stats.pendingCount + ' операций, сумма по модулю; не входит в чистые расходы'} />
        </section>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-base">Подтверждённые расходы по месяцам</CardTitle></CardHeader>
            <CardContent className="h-64">
              {stats.months.length ? <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.months}><CartesianGrid strokeDasharray="3 3" stroke="#303036" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#a1a1aa', fontSize: 11 }} /><YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <Tooltip formatter={value => money(Math.round(Number(value ?? 0)))} />
                  <Bar name="Расходы" dataKey="amount" fill="#a1a1aa" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer> : <p className="pt-8 text-sm text-zinc-500">Пока нет подтверждённых расходов.</p>}
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-base">Категории подтверждённых расходов</CardTitle></CardHeader>
            <CardContent className="space-y-3">{stats.categories.length ? stats.categories.slice(0, 8).map(item =>
              <div key={item.category} className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-1 text-sm">
                <span className="truncate text-zinc-300">{item.category}</span><span className="tabular-nums">{money(item.amount)}</span>
              </div>) : <p className="text-sm text-zinc-500">Сначала классифицируй и подтверди операции из очереди.</p>}
            </CardContent>
          </Card>
        </div>
        <p className={muted}>Внутренние переводы не считаются расходами. По текущему локальному реестру учтено {stats.transferCount} подтверждённых записей перевода. Охват банков может быть неполным.</p>
      </TabsContent>

      <TabsContent value="personal" className="space-y-4">
        <h2 className="text-lg font-medium">Мои финансы</h2>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(() => { const s = computeStats(ledger.filter(r => r.contour === 'ЛИЧНЫЙ')); return <>
            <Metric title="Чистые расходы" value={money(s.expense)} hint="Только без флага проверки" />
            <Metric title="Доходы" value={money(s.income)} hint="Проверенные внешние поступления" />
            <Metric title="На проверке" value={money(s.pendingAmount)} hint={s.pendingCount + ' операций'} />
            <Metric title="Внутренние переводы" value={String(s.transferCount)} hint="Количество записей, не сумма расходов" />
          </>; })()}
        </section>
        <FinanceGrid data={filtered(ledger.filter(r => r.contour === 'ЛИЧНЫЙ'))} mode="ledger" onEdit={update} />
      </TabsContent>

      <TabsContent value="joint" className="space-y-4">
        <div><h2 className="text-lg font-medium">Совместные покупки с 21 октября 2026</h2>
          <p className="mt-1 text-xs text-zinc-400">Здесь покупки-кандидаты, а не автоматически признанные общие траты. Выбери плательщика, «ОБЩАЯ» или «ЛИЧНАЯ», затем явно подтверди расход.</p></div>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric title="Покупок-кандидатов" value={String(candidates.length)} hint="Не все из них общие" />
          <Metric title="Общие подтверждённые" value={money(jointStats.expense)} hint="Без взаиморасчётов и переводов" />
          <Metric title="Оплатил Егор" value={money(jointStats.jointPaidBy['Егор'])} hint="Только подтверждённые общие покупки" />
          <Metric title="Оплатила Аня" value={money(jointStats.jointPaidBy['Аня'])} hint={'Плательщик неизвестен: '+money(jointStats.jointPaidBy['НЕ УКАЗАН'])} />
        </section>
        <div className="flex flex-wrap items-center gap-3">
          <Input className="max-w-sm" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по магазину или описанию" />
          <span className={muted}>Баланс взаиморасчётов не рассчитан: доли участников не согласованы.</span>
        </div>
        <FinanceGrid data={jointForGrid} mode="joint" onEdit={update} />
      </TabsContent>

      <TabsContent value="ledger" className="space-y-4">
        <div><h2 className="text-lg font-medium">Единый реестр операций</h2><p className={muted}>Проверка и классификация редактируются в таблице. Повторный импорт по ID идемпотентен.</p></div>
        <div className="flex flex-wrap gap-2">
          <Input className="max-w-sm" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по всем операциям" />
          <InlineSelect value={bank} options={['', ...bankList.map(s => s.bank)]} onValue={setBank} />
          <Button size="sm" variant="outline" onClick={() => { setSearch(''); setBank(''); }}><RefreshCw /> Сбросить фильтры</Button>
        </div>
        <FinanceGrid data={allForGrid} mode="ledger" onEdit={update} />
      </TabsContent>

      <TabsContent value="sources" className="space-y-4">
        <h2 className="text-lg font-medium">Покрытие банков</h2>
        <p className={muted}>Первая и последняя даты относятся только к загруженным строкам; по ним нельзя утверждать полноту выписки.</p>
        <Card><CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead><tr className="border-b border-white/10 text-zinc-400"><th className="p-3">Банк</th><th className="p-3">Операций</th><th className="p-3">Первая</th><th className="p-3">Последняя</th><th className="p-3">Покрытие</th></tr></thead>
            <tbody>{bankList.map(s => <tr className="border-b border-white/[0.06]" key={s.bank}>
              <td className="p-3">{s.bank}</td><td className="p-3 tabular-nums">{s.count}</td><td className="p-3">{s.first}</td><td className="p-3">{s.last}</td><td className="p-3 text-zinc-400">Не сверено полностью</td>
            </tr>)}</tbody>
          </table>
          {bankList.length === 0 && <div className="p-6 text-sm text-zinc-500">Импортированных банков пока нет.</div>}
        </CardContent></Card>
        <p className={muted}>Неимпортированные источники из плана NEXUS: Сбер, ВТБ, Ozon — до появления их операций в реестре.</p>
      </TabsContent>

      <TabsContent value="review" className="space-y-4">
        <div><h2 className="text-lg font-medium">Очередь проверки</h2><p className={muted}>Неясные СБП-переводы и наличные не становились расходами автоматически. Сначала укажи тип потока и категорию; затем сними флаг проверки.</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <Input className="max-w-sm" value={search} onChange={e => setSearch(e.target.value)} placeholder="Найти спорную операцию" />
          <span className={muted}>{reviewForGrid.length} операций в текущем фильтре</span>
        </div>
        <FinanceGrid data={reviewForGrid} mode="review" onEdit={update} />
      </TabsContent>

      <TabsContent value="old"><ShadcnFinances /></TabsContent>
    </Tabs>
  </div>;
};
