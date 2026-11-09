import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type ColumnDef, type SortingState, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowDownToLine, FileUp, KeyRound, LockKeyhole, RefreshCw, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShadcnFinances } from './ShadcnFinances';
import { auditInternalTransferPairs } from '@/finance/transferPairs';
import {
  applyDecisions, combineMaster, computeStats, CONTOURS, DECISION_COLUMNS, DECISIONS,
  auditLedgerQuality, bankCoverage, editRow, exportCSV, FLOWS, isPending, kopeks, MASTER_COLUMNS, money, parseMaster, PAYERS, reconcileVerifiedMaster, sources,
  type BankRow, type Contour,
} from '@/finance/ledger';
import {
  LedgerLockedError, enablePrivateEncryption, loadPrivateLedger, lockPrivateLedger,
  savePrivateLedger, unlockPrivateLedger, exportEncryptedLedgerBackup, importEncryptedLedgerBackup,
  rebuildLockedLedgerFromCSV, exportPreviousEncryptedLedgerBackup, hasPreviousEncryptedLedgerBackup, changePrivateLedgerPassword,
} from '@/finance/storage';

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

function downloadFile(name: string, contents: string, mime: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const downloadCSV = (name: string, csv: string) => downloadFile(name, csv, 'text/csv;charset=utf-8');

export const NexusFinanceHub: React.FC = () => {
  const [ledger, setLedger] = useState<BankRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [ledgerLocked, setLedgerLocked] = useState(false);
  const [encrypted, setEncrypted] = useState(false);
  const [protecting, setProtecting] = useState(false);
  const [showCsvRecovery, setShowCsvRecovery] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const newPasswordChangeRef = useRef<HTMLInputElement>(null);
  const confirmPasswordChangeRef = useRef<HTMLInputElement>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementAcknowledged, setReplacementAcknowledged] = useState(false);
  const [previousArchiveAvailable, setPreviousArchiveAvailable] = useState(false);
  const newRecoveryPasswordRef = useRef<HTMLInputElement>(null);
  const repeatRecoveryPasswordRef = useRef<HTMLInputElement>(null);
  const recoveryPhraseRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('Импортируй transactions.csv из ~/Documents/NEXUS. Сайт не содержит встроенных выписок.');
  const [error, setError] = useState('');
  const [contour, setContour] = useState<Contour | 'ВСЕ'>('ВСЕ');
  const [financeTab, setFinanceTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [bank, setBank] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const masterSyncRef = useRef<HTMLInputElement>(null);
  const encryptedBackupRef = useRef<HTMLInputElement>(null);
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const saveFailure = useRef<Error | null>(null);
  const ensureSaved = async () => {
    await saveChain.current;
    if (saveFailure.current) throw saveFailure.current;
  };


  useEffect(() => {
    void hasPreviousEncryptedLedgerBackup().then(setPreviousArchiveAvailable).catch(() => {});
    let active = true;
    loadPrivateLedger().then(rows => {
      if (active) { setLedger(rows); setStorageAvailable(true); }
    }).catch(e => {
      if (!active) return;
      if (e instanceof LedgerLockedError) {
        setLedgerLocked(true);
        setEncrypted(true);
        setMessage('Зашифрованный реестр заблокирован. Введи пароль для работы.');
      } else {
        setError('Локальное хранилище недоступно: ' + String(e));
      }
    }).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!loaded || !storageAvailable) return;
    saveChain.current = saveChain.current.then(() => savePrivateLedger(ledger))
      .then(() => { saveFailure.current = null; })
      .catch(e => {
        saveFailure.current = e instanceof Error ? e : new Error(String(e));
        setError('Автосохранение не удалось. Не закрывай вкладку; экспортируй CSV: ' + saveFailure.current.message);
      });
  }, [ledger, loaded, storageAvailable]);

  const protect = async () => {
    setError('');
    setProtecting(true);
    try {
      await ensureSaved();
      await enablePrivateEncryption(ledger, passwordRef.current?.value || '');
      setEncrypted(true);
      setMessage('Реестр зашифрован AES-GCM. После обновления страницы потребуется пароль.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (passwordRef.current) passwordRef.current.value = '';
      setProtecting(false);
    }
  };

  const unlock = async () => {
    setError('');
    setProtecting(true);
    try {
      const rows = await unlockPrivateLedger(passwordRef.current?.value || '');
      setLedger(rows);
      setStorageAvailable(true);
      setLedgerLocked(false);
      setEncrypted(true);
      setMessage('Зашифрованный реестр открыт. Все правки сохраняются в зашифрованном виде.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (passwordRef.current) passwordRef.current.value = '';
      setProtecting(false);
    }
  };

  const changePassword = async () => {
    setError('');
    setProtecting(true);
    try {
      if (ledgerLocked || !storageAvailable || !encrypted) throw Error('Сначала разблокируй реестр');
      const chosen = newPasswordChangeRef.current?.value || '';
      if (chosen.length < 12) throw Error('Пароль должен содержать минимум 12 символов');
      if (chosen !== confirmPasswordChangeRef.current?.value) throw Error('Новые пароли не совпадают');
      await ensureSaved();
      await changePrivateLedgerPassword(ledger, chosen);
      setShowPasswordChange(false);
      setMessage('Пароль реестра изменён. Сохрани новый пароль в своём менеджере паролей и выгрузи новую «Шифр. копию». Прежние копии открываются только старым паролем.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (newPasswordChangeRef.current) newPasswordChangeRef.current.value = '';
      if (confirmPasswordChangeRef.current) confirmPasswordChangeRef.current.value = '';
      setProtecting(false);
    }
  };

  const lock = async () => {
    setError('');
    try {
      await ensureSaved();
      setStorageAvailable(false);
      lockPrivateLedger();
      setLedger([]);
      setLedgerLocked(true);
      setMessage('Реестр заблокирован на этой вкладке.');
    } catch (e) {
      setError('Нельзя заблокировать реестр до окончания записи: ' + String(e));
    }
  };

  const update = useCallback((id: string, patch: Partial<BankRow>) => {
    setLedger(current => current.map(row => row.transaction_id === id ? editRow(row, patch) : row));
  }, []);

  const visible = useMemo(() => ledger.filter(r => contour === 'ВСЕ' || r.contour === contour), [ledger, contour]);
  const stats = useMemo(() => computeStats(visible), [visible]);
  const jointStats = useMemo(() => computeStats(ledger.filter(r => r.contour === 'СОВМЕСТНЫЙ')), [ledger]);
  const bankList = useMemo(() => sources(ledger), [ledger]);
  const coverage = useMemo(() => bankCoverage(ledger), [ledger]);
  const quality = useMemo(() => auditLedgerQuality(ledger), [ledger]);
  const transferAudit = useMemo(() => auditInternalTransferPairs(ledger), [ledger]);

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

  const syncReviewedMaster = async (file: File) => {
    setError('');
    try {
      if (!loaded || ledgerLocked || !storageAvailable) throw Error('Сначала разблокируй локальный реестр');
      const incoming = parseMaster(await file.text());
      const reconciliation = reconcileVerifiedMaster(ledger, incoming);
      if (reconciliation.updated) setLedger(reconciliation.rows);
      setMessage(
        'Сверка с ' + file.name + ': обновлено ' + reconciliation.updated +
        ', подтверждено покупок ' + reconciliation.confirmed +
        ', уточнено категорий ' + reconciliation.categorized +
        '. Неопределённые совместные покупки остаются на проверке.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const downloadEncryptedBackup = async () => {
    setError('');
    try {
      // Do not export a stale revision while recent edits are still being saved.
      await ensureSaved();
      const contents = await exportEncryptedLedgerBackup();
      const today = new Date().toISOString().slice(0, 10);
      downloadFile('nexus-finance-encrypted-' + today + '.nexus', contents, 'application/json;charset=utf-8');
      setMessage('Зашифрованная копия сохранена в загрузки. Для восстановления нужен тот же пароль.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const restoreEncryptedBackup = async (file: File) => {
    setError('');
    try {
      if (!loaded || ledgerLocked || !storageAvailable || ledger.length) {
        throw Error('Восстановление возможно только в пустом локальном реестре');
      }
      if (file.size > 15 * 1024 * 1024) throw Error('Файл резервной копии слишком большой');
      await ensureSaved();
      await importEncryptedLedgerBackup(await file.text());
      setEncrypted(true);
      setStorageAvailable(false);
      setLedgerLocked(true);
      setMessage('Зашифрованный реестр восстановлен. Введи исходный пароль для разблокировки.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const recoverFromMasterCSV = async () => {
    setError('');
    setProtecting(true);
    try {
      if (!loaded || !ledgerLocked || !encrypted) throw Error('Этот способ доступен только для заблокированного реестра');
      if (!replacementAcknowledged || recoveryPhraseRef.current?.value.trim() !== 'ВОССТАНОВИТЬ') {
        throw Error('Подтверди архивацию и введи слово ВОССТАНОВИТЬ');
      }
      if (!replacementFile || replacementFile.size > 15 * 1024 * 1024) {
        throw Error('Выбери корректный мастер-CSV размером не более 15 МБ');
      }
      const chosen = newRecoveryPasswordRef.current?.value ?? '';
      if (chosen.length < 12) throw Error('Новый пароль должен содержать не менее 12 символов');
      if (chosen !== repeatRecoveryPasswordRef.current?.value) throw Error('Новые пароли не совпадают');
      const rows = parseMaster(await replacementFile.text());
      await rebuildLockedLedgerFromCSV(rows, chosen);
      setPreviousArchiveAvailable(true);
      setLedger(rows);
      setStorageAvailable(true);
      setLedgerLocked(false);
      setEncrypted(true);
      setShowCsvRecovery(false);
      setReplacementFile(null);
      setReplacementAcknowledged(false);
      setMessage('Новый зашифрованный реестр восстановлен из CSV: ' + rows.length +
        ' операций. Старый шифротекст сохранён отдельно. Новый пароль известен только тебе.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (newRecoveryPasswordRef.current) newRecoveryPasswordRef.current.value = '';
      if (repeatRecoveryPasswordRef.current) repeatRecoveryPasswordRef.current.value = '';
      if (recoveryPhraseRef.current) recoveryPhraseRef.current.value = '';
      setProtecting(false);
    }
  };

  const downloadPreviousEncryptedArchive = async () => {
    setError('');
    try {
      const archive = await exportPreviousEncryptedLedgerBackup();
      downloadFile('nexus-original-encrypted-archive.nexus', archive, 'application/json;charset=utf-8');
      setMessage('Старый зашифрованный реестр экспортирован. Для его расшифровки нужен прежний пароль.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
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
        <input ref={masterSyncRef} type="file" className="hidden" accept=".csv,text/csv" onChange={async e => {
          const file = e.target.files?.[0]; if (file) await syncReviewedMaster(file); e.target.value = '';
        }} />
        <input ref={encryptedBackupRef} type="file" className="hidden" accept=".nexus,.json,application/json" onChange={async e => {
          const file = e.target.files?.[0]; if (file) await restoreEncryptedBackup(file); e.target.value = '';
        }} />
        <Button disabled={!loaded || ledgerLocked || !storageAvailable} onClick={() => inputRef.current?.click()}><FileUp /> Импорт CSV</Button>
        {loaded && encrypted && <Button variant="outline" onClick={() => void downloadEncryptedBackup()}>
          <ArrowDownToLine /> Шифр. копия
        </Button>}
        {loaded && !encrypted && !ledgerLocked && storageAvailable && !ledger.length && (
          <Button variant="outline" onClick={() => encryptedBackupRef.current?.click()}>
            <FileUp /> Восстановить .nexus
          </Button>
        )}
        <Button variant="outline" disabled={!loaded || ledgerLocked || !storageAvailable || !ledger.length}
          title="Загрузить мастер-CSV с проверенными категориями, не изменяя банковские суммы или локальные решения"
          onClick={() => masterSyncRef.current?.click()}><RefreshCw /> Сверить мастер</Button>
        <Button variant="outline" disabled={ledgerLocked || !ledger.length} onClick={() => downloadCSV('nexus_shared_decisions.csv', exportCSV(candidates, DECISION_COLUMNS))}>
          <ArrowDownToLine /> Решения
        </Button>
        <Button variant="outline" disabled={ledgerLocked || !ledger.length} onClick={() => downloadCSV('nexus_transactions_edited.csv', exportCSV(ledger, MASTER_COLUMNS))}>
          <ArrowDownToLine /> Реестр
        </Button>
      </div>
    </header>
    <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-zinc-300">
      <LockKeyhole className="mt-0.5 size-4 shrink-0" />
      <span>Данные хранятся в IndexedDB на этом устройстве, без передачи в Supabase. Это не облачный бэкап: обязательно экспортируй CSV после правок. Старые вручную введённые финансы NEXUS учитываются отдельно.</span>
    </div>
    {loaded && (ledgerLocked ? (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><LockKeyhole className="size-4" /> Финансовый реестр заблокирован</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-zinc-400">Операции зашифрованы в браузере. Пароль не отправляется на сервер и не хранится в NEXUS. Без него расшифровать данные нельзя.</p>
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
            Старый пароль находится в системном приложении Mac <strong>«Связка ключей» (Keychain Access)</strong>:
            связка <strong>login</strong>, элемент «NEXUS encrypted private finance ledger — GitHub Pages».
            Открой элемент и выбери «Показать пароль» (macOS может запросить подтверждение владельца).
            <strong> Это не Safari «Пароли» и не запись nexus для supabase.com.</strong>
            Автоматическая подстановка из Safari для этого ключа не настроена.
          </p>
          <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); void unlock(); }}>
            <Input ref={passwordRef} type="password" autoComplete="current-password" aria-label="Пароль для финансового реестра" placeholder="Пароль для разблокировки" className="max-w-sm" />
            <Button type="submit" disabled={protecting}><KeyRound className="size-4" /> Разблокировать</Button>
          </form>
          <div className="border-t border-white/10 pt-4">
            <Button type="button" variant="outline" size="sm"
              onClick={() => setShowCsvRecovery(v => !v)} disabled={protecting}>
              <FileUp className="size-4" /> Нет доступа к паролю? Восстановить из CSV
            </Button>
            {showCsvRecovery && <div className="mt-4 max-w-3xl space-y-4">
              <p className="text-sm text-amber-200">
                Это не расшифровка старой копии. Новый реестр будет создан из выбранного мастер-CSV,
                а прежний зашифрованный реестр сохранится как отдельный архив в этом браузере.
                Правки, сделанные только в старом браузерном реестре после последнего CSV, могут отсутствовать.
              </p>
              <p className="text-xs text-zinc-400">
                На этом Mac актуальный мастер-файл: Documents/NEXUS/transactions.csv.
                Перед восстановлением сохрани отдельную «Шифр. копию» старого реестра.
              </p>
              <label className="block space-y-2 text-sm text-zinc-300">
                <span>Мастер-реестр CSV</span>
                <Input type="file" accept=".csv,text/csv" className="max-w-lg"
                  onChange={e => setReplacementFile(e.target.files?.[0] ?? null)} />
              </label>
              {replacementFile && <p className="text-xs text-zinc-400">Выбран: {replacementFile.name}</p>}
              <p className="text-xs text-zinc-400">Придумай и сохрани новый пароль самостоятельно. Он не будет отправлен в Supabase или сохранён в NEXUS; старые правки, отсутствующие в CSV, можно прочитать только с прежним паролем.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input ref={newRecoveryPasswordRef} type="password" autoComplete="new-password"
                  aria-label="Новый пароль финансового реестра" placeholder="Новый пароль (от 12 символов)" />
                <Input ref={repeatRecoveryPasswordRef} type="password" autoComplete="new-password"
                  aria-label="Повтори новый пароль" placeholder="Повтори новый пароль" />
              </div>
              <label className="flex items-start gap-2 text-xs text-zinc-300">
                <Checkbox checked={replacementAcknowledged}
                  onCheckedChange={value => setReplacementAcknowledged(value === true)}
                  aria-label="Подтверждение сохранения старого зашифрованного реестра" />
                <span>Понимаю, что старые данные останутся только в зашифрованном архиве, и мне нужен прежний пароль для их чтения.</span>
              </label>
              <Input ref={recoveryPhraseRef} placeholder="Напиши ВОССТАНОВИТЬ"
                aria-label="Подтверждение восстановления реестра" className="max-w-sm" />
              <Button type="button" variant="destructive"
                disabled={protecting || !replacementFile || !replacementAcknowledged}
                onClick={() => void recoverFromMasterCSV()}>
                <LockKeyhole className="size-4" /> Создать новый зашифрованный реестр
              </Button>
            </div>}
          </div>
        </CardContent>
      </Card>
    ) : storageAvailable && (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4">
        {encrypted ? (
          <>
            <Badge variant="outline" className="border-emerald-800/60 text-emerald-300">AES-GCM · зашифровано</Badge>
            <span className="min-w-52 flex-1 text-xs text-zinc-400">Данные на устройстве зашифрованы. Не забудь пароль — восстановить его нельзя.</span>
            <Button variant="outline" disabled={protecting} onClick={() => setShowPasswordChange(v => !v)}>
              <KeyRound className="size-4" /> Изменить пароль
            </Button>
            <Button variant="outline" disabled={protecting} onClick={() => void lock()}><LockKeyhole className="size-4" /> Заблокировать</Button>
          </>
        ) : (
          <>
            <span className="min-w-52 flex-1 text-xs text-zinc-400">Сейчас банковские операции хранятся в браузере без прикладного шифрования. Можно включить защиту паролем (от 12 символов).</span>
            <Input ref={passwordRef} type="password" autoComplete="new-password" aria-label="Новый пароль для шифрования" placeholder="Придумай пароль от 12 символов" className="max-w-xs" />
            <Button variant="outline" disabled={protecting || ledger.length === 0} onClick={() => void protect()}><KeyRound className="size-4" /> Зашифровать</Button>
          </>
        )}
      </div>
    ))}
    {loaded && !ledgerLocked && encrypted && storageAvailable && showPasswordChange && (
      <Card>
        <CardHeader><CardTitle className="text-base">Новый пароль финансового реестра</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-zinc-400">Текущая вкладка уже разблокирована, поэтому старый пароль вводить не нужно. Новый пароль будет действовать после перезагрузки Safari. Запиши его в менеджер паролей; старые зашифрованные резервные копии по-прежнему требуют прежний пароль.</p>
          <form onSubmit={e => { e.preventDefault(); void changePassword(); }} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input ref={newPasswordChangeRef} type="password" autoComplete="new-password"
                aria-label="Новый пароль открытого финансового реестра" placeholder="Новый пароль от 12 символов" />
              <Input ref={confirmPasswordChangeRef} type="password" autoComplete="new-password"
                aria-label="Повтор нового пароля реестра" placeholder="Повтори новый пароль" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={protecting}><KeyRound className="size-4" /> Сохранить новый пароль</Button>
              <Button type="button" variant="outline" onClick={() => setShowPasswordChange(false)}>Отмена</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )}
    {loaded && previousArchiveAvailable && <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" size="sm" onClick={() => void downloadPreviousEncryptedArchive()}>
        <ArrowDownToLine className="size-4" /> Скачать архив прежнего зашифрованного реестра
      </Button>
      <span className="text-xs text-zinc-400">Архив читается только с прежним паролем.</span>
    </div>}
    {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-200"><AlertTriangle className="size-4 shrink-0" />{error}</div>}
    {message && <div className="text-xs text-zinc-400">{loaded ? message : 'Чтение локального хранилища…'}</div>}

    {!ledgerLocked && <Tabs value={financeTab} onValueChange={setFinanceTab} className="w-full">
      <TabsList className="mb-4 h-auto w-full flex-wrap justify-start gap-1 bg-white/[0.03] p-1">
        <TabsTrigger value="overview">Сводка</TabsTrigger>
        <TabsTrigger value="personal">Мои финансы</TabsTrigger>
        <TabsTrigger value="joint">Совместные покупки</TabsTrigger>
        <TabsTrigger value="ledger">Операции</TabsTrigger>
        <TabsTrigger value="sources">Банки</TabsTrigger>
        <TabsTrigger value="quality">Контроль качества</TabsTrigger>
        <TabsTrigger value="transfers">Связки переводов</TabsTrigger>
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-medium">Покрытие банков</h2>
            <p className={muted}>Даты получены только из импортированных операций; наличие строк не подтверждает полноту выписки.</p>
          </div>
          <span className="text-xs text-zinc-400">
            {coverage.filter(item=>item.imported).length} из {coverage.length} источников представлены
          </span>
        </div>
        <Card><CardContent className="p-0">
          <Table className="min-w-[540px] text-sm">
            <TableHeader><TableRow>
              <TableHead>Банк / источник</TableHead>
              <TableHead>Операций</TableHead>
              <TableHead>Первая дата</TableHead>
              <TableHead>Последняя дата</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow></TableHeader>
            <TableBody>{coverage.map(item=><TableRow key={item.bank}>
              <TableCell className="font-medium">{item.bank}</TableCell>
              <TableCell className="tabular-nums">{item.count}</TableCell>
              <TableCell className="tabular-nums">{item.first ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{item.last ?? '—'}</TableCell>
              <TableCell className={item.imported?'text-zinc-300':'text-zinc-500'}>
                {item.imported?'Строки загружены':'Нет загруженных строк'}
              </TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </CardContent></Card>
        <p className={muted}>Список ожидаемых источников — контроль загрузки, а не подтверждение наличия счетов или их остатков. Отсутствующие банки не участвуют в сводных суммах.</p>
      </TabsContent>

      <TabsContent value="quality" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">Контроль качества данных</h2>
            <p className={muted}>Проверка классификации и неполных источников без выдуманных остатков и скрытого пересчёта операций.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setFinanceTab('review')}>Разобрать спорные</Button>
            <Button variant="outline" size="sm" onClick={() => setFinanceTab('sources')}>Покрытие банков</Button>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Обработка операций</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-zinc-300">Без флага проверки: {quality.reviewed} из {quality.total}</span>
              <span className="font-medium tabular-nums">{quality.reviewedPercent}%</span>
            </div>
            <Progress value={quality.reviewedPercent} aria-label="Доля операций без флага проверки" />
            <p className={muted}>Это доля классифицированных записей, а не показатель полноты загруженных банковских выписок.</p>
          </CardContent>
        </Card>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric title="На проверке" value={String(quality.pending)} hint="Не входят в подтверждённое потребление" />
          <Metric title="Контур не указан" value={String(quality.unallocated)} hint="Нужны личное или совместное назначение" />
          <Metric title="Без категории" value={String(quality.withoutCategory)} hint="Покупки с неопределённой категорией" />
          <Metric title="Тип не определён" value={String(quality.unclearTransfer)} hint="Потоки REVIEW_REQUIRED" />
        </section>
        <p className={muted}>Кандидаты в совместные покупки без решения: {quality.unresolvedJoint}. Их нельзя автоматически считать общими расходами.</p>
        <Card>
          <CardHeader><CardTitle className="text-base">Очередь проверки по банкам</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Банк</TableHead>
                <TableHead className="text-right">Всего</TableHead>
                <TableHead className="text-right">Проверить</TableHead>
                <TableHead className="text-right">Без контура</TableHead>
                <TableHead className="text-right">Без категории</TableHead>
              </TableRow></TableHeader>
              <TableBody>{quality.banks.map(item => <TableRow key={item.bank}>
                <TableCell className="font-medium">{item.bank}</TableCell>
                <TableCell className="text-right tabular-nums">{item.total}</TableCell>
                <TableCell className="text-right tabular-nums">{item.pending}</TableCell>
                <TableCell className="text-right tabular-nums">{item.unallocated}</TableCell>
                <TableCell className="text-right tabular-nums">{item.withoutCategory}</TableCell>
              </TableRow>)}</TableBody>
            </Table>
            {quality.banks.length===0 && <div className="p-6 text-sm text-zinc-500">Нет импортированных операций. Сначала добавь мастер-CSV.</div>}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="transfers" className="space-y-5">
        <div>
          <h2 className="text-lg font-medium">Сверка внутренних переводов</h2>
          <p className={muted}>Кандидаты на связку по двум банковским выпискам: точное совпадение суммы до копейки, разные банки, противоположные направления и даты в пределах трёх суток. Только одна возможная пара для каждой стороны. Это не подтверждение факта перевода.</p>
        </div>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric title="Пар-кандидатов" value={String(transferAudit.pairs.length)} hint="Требуют подтверждения по банковским выпискам" />
          <Metric title="Неоднозначных списаний" value={String(transferAudit.ambiguousDebits.length)} hint="Несколько возможных встречных поступлений" />
          <Metric title="Без встречного поступления" value={String(transferAudit.unmatchedDebits.length)} hint="Могут быть отсутствующие выписки" />
          <Metric title="Без встречного списания" value={String(transferAudit.unmatchedCredits.length)} hint="Сведения об источнике отсутствуют" />
        </section>
        <Card>
          <CardHeader><CardTitle className="text-base">Уникальные пары-кандидаты</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Списание</TableHead>
                <TableHead>Поступление</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead className="text-right">Разница дат</TableHead>
                <TableHead>Вывод</TableHead>
              </TableRow></TableHeader>
              <TableBody>{transferAudit.pairs.map(pair=><TableRow key={pair.debit.transaction_id + ':' + pair.credit.transaction_id}>
                <TableCell className="text-xs">{pair.debit.bank} · {pair.debit.date}</TableCell>
                <TableCell className="text-xs">{pair.credit.bank} · {pair.credit.date}</TableCell>
                <TableCell className="text-right tabular-nums">{money(pair.amountKopeks)}</TableCell>
                <TableCell className="text-right tabular-nums">{pair.dayGap} дн.</TableCell>
                <TableCell><Badge variant="outline">Кандидат, не подтверждено</Badge></TableCell>
              </TableRow>)}</TableBody>
            </Table>
            {!transferAudit.pairs.length && <div className="p-6 text-sm text-zinc-400">Нет однозначных пар при текущем неполном покрытии банков. Это не означает, что переводов не было.</div>}
          </CardContent>
        </Card>
        <p className={muted}>В учёте найдено {transferAudit.debitCount} списаний и {transferAudit.creditCount} поступлений с типом INTERNAL_TRANSFER. Поиск ничего не меняет в мастер-реестре, не признаёт доход и не уменьшает расходы. Для окончательного подтверждения нужны обе банковские операции.</p>
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
    </Tabs>}
  </div>;
};
