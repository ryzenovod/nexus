import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Check, 
  ExternalLink, 
  Droplets, 
  Zap, 
  Wifi, 
  Building2, 
  Calendar,
  Layers
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { CashbackAdvisor } from './CashbackAdvisor';

export const FinancesModule: React.FC = () => {
  const {
    budget,
    transactions,
    utilityBills,
    addTransaction,
    updateMeterReadings,
    payUtilityBill,
  } = useNexusStore();

  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState<'expense' | 'transfer'>('expense');
  const [newTxCategory, setNewTxCategory] = useState('Продукты');
  const [newTxPaidBy, setNewTxPaidBy] = useState<'egor' | 'anya' | 'joint'>('joint');
  const [newTxNotes, setNewTxNotes] = useState('');

  // Selected bill for readings input
  const [editingReadingsBillId, setEditingReadingsBillId] = useState<string | null>(null);
  const [tempHotWater, setTempHotWater] = useState<string>('');
  const [tempColdWater, setTempColdWater] = useState<string>('');
  const [tempElectricity, setTempElectricity] = useState<string>('');

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxTitle.trim() || !newTxAmount) return;

    addTransaction({
      title: newTxTitle.trim(),
      amount: parseFloat(newTxAmount),
      date: new Date().toISOString().slice(0, 10),
      type: newTxType,
      category: newTxCategory,
      paidBy: newTxPaidBy,
      splitRatio: '50/50',
      notes: newTxNotes.trim() || undefined,
    });

    setNewTxTitle('');
    setNewTxAmount('');
    setNewTxNotes('');
    setShowAddTxModal(false);
  };

  const handleSaveReadings = (billId: string) => {
    updateMeterReadings(billId, {
      hotWater: tempHotWater ? parseFloat(tempHotWater) : undefined,
      coldWater: tempColdWater ? parseFloat(tempColdWater) : undefined,
      electricity: tempElectricity ? parseFloat(tempElectricity) : undefined,
    });
    setEditingReadingsBillId(null);
  };

  const egorSharePercent = Math.round((budget.egorContribution / budget.totalTarget) * 100);
  const anyaSharePercent = 100 - egorSharePercent;

  return (
    <div className="space-y-4">
      {/* 1. TOP SECTION: JOINT BUDGET DASHBOARD (SEAMLESS 1PX HAIRLINE BENTO GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-white/[0.06] border border-white/[0.07] rounded-xl overflow-hidden shadow-sm">
        {/* Total Joint Balance Card */}
        <div className="bg-[#0b0b0e] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Совместный бюджет пары
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                Взносы: {budget.depositDates}
              </span>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-zinc-100 tracking-tight">
                {budget.currentBalance.toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-xs text-zinc-500">
                / {budget.totalTarget.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {/* Progress Bar of Target */}
            <div className="mt-3 space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (budget.currentBalance / budget.totalTarget) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>Целевой фонд</span>
                <span>{Math.round((budget.currentBalance / budget.totalTarget) * 100)}% собрано</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewTxType('transfer');
              setNewTxCategory('Общий счет');
              setShowAddTxModal(true);
            }}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-white hover:bg-zinc-200 py-1.5 text-xs font-medium text-zinc-950 transition-colors shadow-sm"
          >
            <ArrowUpRight size={13} strokeWidth={2.2} />
            <span>Пополнить общий счет</span>
          </button>
        </div>

        {/* Egor Contribution Card */}
        <div className="bg-[#0b0b0e] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-xs font-semibold text-zinc-200">Вклад Егора</span>
              </div>
              <span className="font-mono text-[11px] text-zinc-400">{egorSharePercent}% доли</span>
            </div>

            <div className="mt-2.5">
              <span className="font-mono text-xl font-bold text-zinc-100">
                {budget.egorContribution.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Аренда, интернет, техника, ремонт душевой кабины и закупка в Леруа.
            </p>
          </div>

          <div className="mt-4 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500">
            <span>Статус:</span>
            <span className="text-emerald-400 font-medium">Переведено в полном объеме</span>
          </div>
        </div>

        {/* Anya Contribution Card */}
        <div className="bg-[#0b0b0e] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-pink-400" />
                <span className="text-xs font-semibold text-zinc-200">Вклад Ани</span>
              </div>
              <span className="font-mono text-[11px] text-zinc-400">{anyaSharePercent}% доли</span>
            </div>

            <div className="mt-2.5">
              <span className="font-mono text-xl font-bold text-zinc-100">
                {budget.anyaContribution.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Совместные продукты (ВкусВилл по Сберу 5%), уют дома, текстиль и посуда.
            </p>
          </div>

          <div className="mt-4 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500">
            <span>Статус:</span>
            <span className="text-emerald-400 font-medium">Переведено в полном объеме</span>
          </div>
        </div>
      </div>

      {/* 2. CASHBACK ADVISOR (SMART SPLIT) */}
      <CashbackAdvisor />

      {/* 3. ЖКХ-ТЕРМИНАЛ МОСКВЫ (SEAMLESS 1PX HAIRLINE BENTO GRID) */}
      <div className="rounded-xl border border-white/[0.07] bg-[#0b0b0e] p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4 w-4 text-zinc-400" />
            <div>
              <h2 className="text-xs font-semibold text-zinc-100 uppercase tracking-tight">
                ЖКХ-Терминал Москвы & Счета
              </h2>
              <p className="text-[11px] text-zinc-500">
                Домиленд, Мосэнергосбыт, ЕПД mos.ru, Wi-Fi с динамикой начислений
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Окно передачи показаний:</span>
            <span className="font-mono text-zinc-300">
              15–26 число
            </span>
          </div>
        </div>

        {/* 1px Hairline Grid of Utility Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-white/[0.06] border border-white/[0.07] rounded-xl overflow-hidden shadow-sm">
          {utilityBills.map((bill) => {
            const isDomiland = bill.id === 'util-domiland';
            const isMosenergo = bill.id === 'util-mosenergo';
            const isEpd = bill.id === 'util-epd';
            const isWifi = bill.id === 'util-wifi';

            const maxAmount = Math.max(...bill.history.map((h) => h.amount), 1);

            return (
              <div
                key={bill.id}
                style={{
                  borderLeft: bill.status === 'overdue' ? '3px solid #ef4444' : '3px solid #eab308',
                }}
                className="relative bg-[#0b0b0e] hover:bg-[#121217] p-4 space-y-2.5 transition-colors flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isDomiland && <Droplets className="h-4 w-4 text-cyan-400" />}
                    {isMosenergo && <Zap className="h-4 w-4 text-amber-400" />}
                    {isEpd && <Building2 className="h-4 w-4 text-emerald-400" />}
                    {isWifi && <Wifi className="h-4 w-4 text-indigo-400" />}

                    <span className="text-xs font-bold text-zinc-100 line-clamp-1">
                      {bill.serviceName.split(':')[0]}
                    </span>
                  </div>

                  {bill.status === 'overdue' && (
                    <span className="flex items-center gap-1 font-mono text-[10px] font-semibold text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      ПРОСРОЧЕНО
                    </span>
                  )}
                  {bill.status === 'due' && (
                    <span className="flex items-center gap-1 font-mono text-[10px] font-semibold text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      К ОПЛАТЕ
                    </span>
                  )}
                  {bill.status === 'paid' && (
                    <span className="flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      ОПЛАЧЕНО
                    </span>
                  )}
                </div>

                {/* Amount with breakdown */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-xl font-bold text-white">
                      {(bill.amount + bill.commission).toFixed(2)} ₽
                    </span>
                  </div>
                  {bill.commission > 0 && (
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {bill.amount} ₽ + {bill.commission} ₽ (комиссия)
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Срок оплаты: до {bill.dueDate}
                  </p>
                </div>

                {/* Readings Info (Clean typography, NO NESTED BOXES!) */}
                {bill.readingsRequired && (
                  <div className="pt-2 border-t border-white/[0.05] text-[11px] space-y-1">
                    <div className="flex justify-between text-zinc-400 text-[10px] uppercase font-mono">
                      <span>Показания ({bill.readingsWindow})</span>
                    </div>

                    {bill.currentReadings?.hotWater !== undefined && (
                      <div className="flex justify-between text-zinc-400 font-mono">
                        <span>Горячая вода:</span>
                        <strong className="text-zinc-200">{bill.currentReadings.hotWater} м³</strong>
                      </div>
                    )}
                    {bill.currentReadings?.coldWater !== undefined && (
                      <div className="flex justify-between text-zinc-400 font-mono">
                        <span>Холодная вода:</span>
                        <strong className="text-zinc-200">{bill.currentReadings.coldWater} м³</strong>
                      </div>
                    )}
                    {bill.currentReadings?.electricity !== undefined && (
                      <div className="flex justify-between text-zinc-400 font-mono">
                        <span>Электричество Т1:</span>
                        <strong className="text-zinc-200">{bill.currentReadings.electricity} кВт⋅ч</strong>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setEditingReadingsBillId(bill.id);
                        setTempHotWater(bill.currentReadings?.hotWater ? String(bill.currentReadings.hotWater) : '');
                        setTempColdWater(bill.currentReadings?.coldWater ? String(bill.currentReadings.coldWater) : '');
                        setTempElectricity(bill.currentReadings?.electricity ? String(bill.currentReadings.electricity) : '');
                      }}
                      className="mt-1 text-[10px] text-amber-400 hover:underline block"
                    >
                      Ввести свежие показания →
                    </button>
                  </div>
                )}

                {/* SVG Dynamics Graph */}
                <div className="pt-2">
                  <div className="text-[10px] text-zinc-500 mb-1">Динамика по месяцам:</div>
                  <div className="flex items-end gap-1.5 h-12 pt-1">
                    {bill.history.map((h, i) => {
                      const barHeight = Math.max(12, Math.round((h.amount / maxAmount) * 44));
                      const isCurrent = i === bill.history.length - 1;

                      return (
                        <div key={h.month} className="flex-1 flex flex-col items-center gap-1 group">
                          <div
                            style={{ height: `${barHeight}px` }}
                            className={`w-full rounded-t transition-all ${
                              isCurrent
                                ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                                : 'bg-white/20 group-hover:bg-white/40'
                            }`}
                            title={`${h.month}: ${h.amount} ₽`}
                          />
                          <span className="font-mono text-[9px] text-zinc-400">
                            {h.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={bill.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-white/10 py-1.5 text-xs text-zinc-200 hover:bg-white/20 transition-colors"
                  >
                    <span>В ЛК</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {bill.status !== 'paid' && (
                    <button
                      type="button"
                      onClick={() => payUtilityBill(bill.id)}
                      className="rounded-lg bg-emerald-500/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
                      title="Отметить как оплаченную"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ИСТОРИЯ ОПЕРАЦИЙ */}
      <div className="rounded-xl border border-white/[0.07] bg-[#0b0b0e] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h2 className="text-xs font-semibold text-zinc-100 uppercase tracking-tight">
            История операций & Сплит расходов
          </h2>
          <button
            type="button"
            onClick={() => {
              setNewTxType('expense');
              setShowAddTxModal(true);
            }}
            className="flex items-center gap-1.5 rounded-md bg-white text-zinc-950 hover:bg-zinc-200 px-3 py-1.5 text-xs font-medium transition-colors shadow-sm"
          >
            <Plus size={13} strokeWidth={2.2} />
            <span>Добавить расход</span>
          </button>
        </div>

        <div className="mt-3 divide-y divide-white/[0.06] overflow-x-auto">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2.5 px-2 hover:bg-white/[0.02] rounded-lg transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    tx.type === 'expense'
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {tx.type === 'expense' ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <div className="font-medium text-zinc-100">{tx.title}</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span className="text-zinc-300">{tx.category}</span>
                    <span>•</span>
                    <span>
                      Оплатил: {tx.paidBy === 'egor' ? 'Егор' : tx.paidBy === 'anya' ? 'Аня' : 'Общий счет'}
                    </span>
                    {tx.notes && (
                      <>
                        <span>•</span>
                        <span className="italic">{tx.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-mono font-bold text-sm ${
                    tx.type === 'expense' ? 'text-zinc-200' : 'text-emerald-400'
                  }`}
                >
                  {tx.type === 'expense' ? '-' : '+'}
                  {tx.amount.toLocaleString('ru-RU')} ₽
                </span>
                <span className="block text-[10px] text-zinc-500">
                  {tx.splitRatio === '50/50' ? 'Сплит 50/50' : 'Индивидуально'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD TRANSACTION */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12141a] p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">
              Новая операция
            </h3>
            <form onSubmit={handleAddTx} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  required
                  value={newTxTitle}
                  onChange={(e) => setNewTxTitle(e.target.value)}
                  placeholder="ВкусВилл, Леруа, Пополнение..."
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Сумма (₽)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newTxAmount}
                    onChange={(e) => setNewTxAmount(e.target.value)}
                    placeholder="1500"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Тип
                  </label>
                  <select
                    value={newTxType}
                    onChange={(e) => setNewTxType(e.target.value as 'expense' | 'transfer')}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="expense">Расход</option>
                    <option value="transfer">Пополнение счета</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Кто платит
                  </label>
                  <select
                    value={newTxPaidBy}
                    onChange={(e) => setNewTxPaidBy(e.target.value as 'egor' | 'anya' | 'joint')}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="joint">Общий счет</option>
                    <option value="egor">Егор</option>
                    <option value="anya">Аня</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Категория
                  </label>
                  <input
                    type="text"
                    value={newTxCategory}
                    onChange={(e) => setNewTxCategory(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT METER READINGS */}
      {editingReadingsBillId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#12141a] p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Ввод показаний счетчиков
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Окно передачи показаний открыто с 15 по 26 число.
            </p>

            <div className="space-y-3">
              {editingReadingsBillId === 'util-domiland' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-cyan-300 mb-1">
                      Горячая вода (м³)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempHotWater}
                      onChange={(e) => setTempHotWater(e.target.value)}
                      placeholder="Например: 144.2"
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-sky-300 mb-1">
                      Холодная вода (м³)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempColdWater}
                      onChange={(e) => setTempColdWater(e.target.value)}
                      placeholder="Например: 221.5"
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                </>
              )}

              {editingReadingsBillId === 'util-mosenergo' && (
                <div>
                  <label className="block text-xs font-medium text-amber-300 mb-1">
                    Электроэнергия Т1 (кВт⋅ч)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempElectricity}
                    onChange={(e) => setTempElectricity(e.target.value)}
                    placeholder="Например: 1890.0"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingReadingsBillId(null)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveReadings(editingReadingsBillId)}
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
