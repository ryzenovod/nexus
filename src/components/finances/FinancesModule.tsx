import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Flame, 
  Droplets, 
  Zap, 
  Wifi, 
  Building2, 
  Gift, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { FinanceTransaction } from '../../types/nexus';

export const FinancesModule: React.FC = () => {
  const {
    budget,
    transactions,
    cashbackCards,
    utilityBills,
    addTransaction,
    deleteTransaction,
    toggleCashbackClaimed,
    updateMeterReadings,
    payUtilityBill,
    tasks,
    toggleTaskCompletion,
  } = useNexusStore();

  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState<'expense' | 'transfer'>('expense');
  const [newTxCategory, setNewTxCategory] = useState('Продукты');
  const [newTxPaidBy, setNewTxPaidBy] = useState<'egor' | 'anya' | 'joint'>('joint');
  const [newTxSplit, setNewTxSplit] = useState<'50/50' | 'egor_100' | 'anya_100'>('50/50');
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
      splitRatio: newTxSplit,
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

  // Find cashback task
  const gpbTask = tasks.find((t) => t.id === 'task-fin-4');

  const egorSharePercent = Math.round((budget.egorContribution / budget.totalTarget) * 100);
  const anyaSharePercent = 100 - egorSharePercent;

  return (
    <div className="space-y-6">
      {/* 1. TOP SECTION: JOINT BUDGET DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Joint Balance Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/40 via-[#0f1115]/80 to-black/80 backdrop-blur-2xl p-5 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Совместный баланс
            </span>
            <span className="flex h-6 items-center rounded-full bg-emerald-500/20 px-2 font-mono text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
              Активен
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white tracking-tight">
              {budget.currentBalance.toLocaleString('ru-RU')} ₽
            </span>
            <span className="text-xs text-zinc-400">
              / цель {budget.totalTarget.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          {/* Progress Bar of Target */}
          <div className="mt-4 space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/50 border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (budget.currentBalance / budget.totalTarget) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Целевой фонд месяца</span>
              <span>{Math.round((budget.currentBalance / budget.totalTarget) * 100)}% собрано</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewTxType('transfer');
              setNewTxCategory('Общий счет');
              setShowAddTxModal(true);
            }}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-xs font-medium text-white hover:bg-white/20 transition-all"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Пополнить совместный счет</span>
          </button>
        </div>

        {/* Egor Contribution Card */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0f1115]/80 backdrop-blur-2xl p-5 shadow-glass">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                E
              </span>
              <span className="text-sm font-bold text-zinc-100">Вклад Егора</span>
            </div>
            <span className="font-mono text-xs text-indigo-300">{egorSharePercent}% доли</span>
          </div>

          <div className="mt-3">
            <span className="font-mono text-2xl font-bold text-white">
              {budget.egorContribution.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <p className="mt-2 text-xs text-zinc-400">
            Оплачивает: аренду, интернет, технику, ремонт душевой кабины и закупку в Леруа.
          </p>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <span>Статус за ноябрь:</span>
            <span className="text-emerald-400 font-medium">Переведено в полном объеме</span>
          </div>
        </div>

        {/* Anya Contribution Card */}
        <div className="rounded-2xl border border-rose-500/30 bg-[#0f1115]/80 backdrop-blur-2xl p-5 shadow-glass">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-400">
                A
              </span>
              <span className="text-sm font-bold text-zinc-100">Вклад Ани</span>
            </div>
            <span className="font-mono text-xs text-rose-300">{anyaSharePercent}% доли</span>
          </div>

          <div className="mt-3">
            <span className="font-mono text-2xl font-bold text-white">
              {budget.anyaContribution.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <p className="mt-2 text-xs text-zinc-400">
            Оплачивает: совместные продукты (ВкусВилл), уют дома, текстиль и утварь для кухни.
          </p>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <span>Статус за ноябрь:</span>
            <span className="text-emerald-400 font-medium">Переведено в полном объеме</span>
          </div>
        </div>
      </div>

      {/* 2. ЖКХ-ТЕРМИНАЛ С ДИНАМИКОЙ ПЛАТЕЖЕЙ */}
      <div className="rounded-2xl border border-white/10 bg-[#0f1115]/80 backdrop-blur-2xl p-5 shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight">
                ЖКХ-Терминал квартиры & Счета
              </h2>
              <p className="text-xs text-zinc-400">
                Домиленд, Мосэнергосбыт, ЕПД mos.ru, Wi-Fi с динамикой начислений
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Окно передачи показаний:</span>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono font-semibold text-amber-300 border border-amber-500/30">
              15–26 число
            </span>
          </div>
        </div>

        {/* Grid of Utility Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  borderLeft: bill.status === 'overdue' ? '3.5px solid #ef4444' : '3.5px solid #eab308',
                }}
                className="relative rounded-xl border-y border-r border-white/10 bg-black/30 p-4 space-y-3"
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
                    <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-red-300 border border-red-500/40">
                      ПРОСРОЧЕНО
                    </span>
                  )}
                  {bill.status === 'due' && (
                    <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-yellow-300 border border-yellow-500/40">
                      К ОПЛАТЕ
                    </span>
                  )}
                  {bill.status === 'paid' && (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-300 border border-emerald-500/40">
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

                {/* Readings Info if required */}
                {bill.readingsRequired && (
                  <div className="rounded-lg bg-white/[0.04] p-2 text-[11px] space-y-1 border border-white/[0.06]">
                    <div className="flex justify-between text-zinc-300">
                      <span>Показания ({bill.readingsWindow}):</span>
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

      {/* 3. КЭШБЭК-РАДАР (ГАЗПРОМБАНК, Т-БАНК, АЛЬФА, СБЕР) */}
      <div className="rounded-2xl border border-white/10 bg-[#0f1115]/80 backdrop-blur-2xl p-5 shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight">
                Кэшбэк-радар Егора & Ани (Ноябрь 2026)
              </h2>
              <p className="text-xs text-zinc-400">
                Максимизация выгоды с каждой покупки по картам Газпромбанк, Т-Банк, Альфа, Сбер
              </p>
            </div>
          </div>

          {/* Quick action: Gazprombank Cashback */}
          {gpbTask && (
            <button
              type="button"
              onClick={() => toggleTaskCompletion(gpbTask.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                gpbTask.completed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{gpbTask.completed ? 'Кэшбэк с Газпромбанка забран ✓' : 'Забрать кэшбэк с Газпромбанка!'}</span>
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cashbackCards.map((card) => (
            <div
              key={card.id}
              className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3 relative overflow-hidden"
            >
              {/* Top Bank Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: card.bankColor }}
              />

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {card.bankName}
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    Карта {card.user === 'egor' ? 'Егора' : 'Ани'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCashbackClaimed(card.id)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold border transition-colors ${
                    card.claimed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {card.claimed ? 'Кэшбэк активен ✓' : 'Не забран!'}
                </button>
              </div>

              {/* Categories list */}
              <div className="space-y-1.5">
                {card.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs border border-white/[0.04]"
                  >
                    <div>
                      <span className="text-zinc-200">{cat.category}</span>
                      {cat.note && (
                        <span className="block text-[10px] text-zinc-400">
                          {cat.note}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-emerald-400 ml-2">
                      {cat.percent}%
                    </span>
                  </div>
                ))}
              </div>

              {card.actionRequired && !card.claimed && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-amber-300">
                  {card.actionRequired}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. ИСТОРИЯ ОПЕРАЦИЙ И ТРАТ */}
      <div className="rounded-2xl border border-white/10 bg-[#0f1115]/80 backdrop-blur-2xl p-5 shadow-glass">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h2 className="text-sm font-bold text-white uppercase tracking-tight">
            История операций & Сплит расходов
          </h2>
          <button
            type="button"
            onClick={() => {
              setNewTxType('expense');
              setShowAddTxModal(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
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
