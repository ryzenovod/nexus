import React, { useState, useMemo } from 'react';
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
  Sparkles,
  CreditCard,
  Copy,
  SlidersHorizontal,
  TrendingUp,
  X,
  AlertCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { CashbackCard, CashbackCategory } from '../../types/nexus';

// SVG Icons for Apple Wallet 2026 aesthetics
const ContactlessIcon: React.FC<{ className?: string }> = ({ className = 'text-white/70' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8.5 16.5C9.5 15.5 10 14 10 12.5C10 11 9.5 9.5 8.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 19C13.5 17.5 14.5 15 14.5 12.5C14.5 10 13.5 7.5 12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M15.5 21.5C17.5 19.5 19 16 19 12.5C19 9 17.5 5.5 15.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const EMVChipIcon: React.FC<{ variant?: 'gold' | 'platinum' }> = ({ variant = 'gold' }) => (
  <svg width="32" height="24" viewBox="0 0 34 26" fill="none" className="shrink-0 drop-shadow-md">
    <rect x="0.5" y="0.5" width="33" height="25" rx="4" fill={variant === 'gold' ? '#d97706' : '#52525b'} stroke={variant === 'gold' ? '#fbbf24' : '#a1a1aa'} strokeWidth="1" />
    <rect x="1.5" y="1.5" width="31" height="23" rx="3.5" fill={variant === 'gold' ? '#f59e0b' : '#71717a'} />
    <path d="M0 8.5H12M0 17.5H12M22 8.5H34M22 17.5H34M12 4V22M22 4V22" stroke={variant === 'gold' ? '#92400e' : '#27272a'} strokeWidth="1" opacity="0.9" />
    <rect x="12" y="8.5" width="10" height="9" rx="1.5" stroke={variant === 'gold' ? '#92400e' : '#27272a'} strokeWidth="1" fill={variant === 'gold' ? '#b45309' : '#3f3f46'} opacity="0.75" />
  </svg>
);

const MirBadge: React.FC = () => (
  <div className="flex items-center px-1.5 py-0.5 rounded bg-white/[0.12] border border-white/[0.15] text-[9.5px] font-black tracking-widest text-white/90">
    MIR
  </div>
);

// Card visual definitions for Apple Wallet 2026
const CARD_METALLIC_THEMES: Record<string, {
  name: string;
  holder: string;
  number: string;
  exp: string;
  tag: string;
  gradient: string;
  glowColor: string;
  borderClass: string;
  chipVariant: 'gold' | 'platinum';
  accentText: string;
}> = {
  'cb-sber': {
    name: 'СБЕР',
    holder: 'ANYA',
    number: '•••• 7714',
    exp: '10/28',
    tag: 'Аня · СберСпасибо',
    gradient: 'from-[#064e3b] via-[#047857] to-[#022c22]',
    glowColor: 'rgba(16, 185, 129, 0.28)',
    borderClass: 'border-emerald-500/35 hover:border-emerald-400/60',
    chipVariant: 'gold',
    accentText: 'text-emerald-400',
  },
  'cb-tbank': {
    name: 'T-BANK BLACK',
    holder: 'EGOR',
    number: '•••• 5529',
    exp: '04/30',
    tag: 'Егор · Общий счет',
    gradient: 'from-[#27272a] via-[#18181b] to-[#09090b]',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    borderClass: 'border-amber-400/35 hover:border-amber-300/60',
    chipVariant: 'platinum',
    accentText: 'text-amber-400',
  },
  'cb-wb': {
    name: 'WB БАНК',
    holder: 'EGOR',
    number: '•••• 8831',
    exp: '08/29',
    tag: 'Егор · WB Кошелек',
    gradient: 'from-[#581c87] via-[#3b0764] to-[#701a75]',
    glowColor: 'rgba(217, 70, 239, 0.3)',
    borderClass: 'border-fuchsia-500/35 hover:border-fuchsia-400/60',
    chipVariant: 'gold',
    accentText: 'text-fuchsia-400',
  },
  'cb-alfa': {
    name: 'АЛЬФА-БАНК',
    holder: 'EGOR',
    number: '•••• 1409',
    exp: '02/29',
    tag: 'Егор · Альфа-Карта',
    gradient: 'from-[#7f1d1d] via-[#450a0a] to-[#991b1b]',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    borderClass: 'border-rose-500/35 hover:border-rose-400/60',
    chipVariant: 'gold',
    accentText: 'text-rose-400',
  },
  'cb-gpb': {
    name: 'ГАЗПРОМБАНК',
    holder: 'EGOR',
    number: '•••• 9276',
    exp: '12/28',
    tag: 'Егор · Сапфир & Акция',
    gradient: 'from-[#1e3a8a] via-[#0f172a] to-[#1d4ed8]',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    borderClass: 'border-blue-500/35 hover:border-blue-400/60',
    chipVariant: 'gold',
    accentText: 'text-blue-400',
  },
};

const POPULAR_QUICK_CATEGORIES = [
  { name: 'Супермаркеты', percent: 5 },
  { name: 'ВкусВилл', percent: 5 },
  { name: 'Дом и ремонт', percent: 6 },
  { name: 'Аптеки', percent: 5 },
  { name: 'Рестораны и доставка', percent: 5 },
  { name: 'АЗС & Топливо', percent: 5 },
  { name: 'Такси & Каршеринг', percent: 5 },
  { name: 'Wildberries (WB Кошелек)', percent: 5 },
  { name: 'Одежда и обувь', percent: 3 },
  { name: 'Транспорт', percent: 3 },
  { name: '1% на все покупки', percent: 1 },
  { name: 'Акция месяца (компенсация)', percent: 25 },
];

export const FinancesModule: React.FC = () => {
  const {
    budget,
    transactions,
    utilityBills,
    cashbackCards,
    tasks,
    completedTaskIds,
    gpbCashbackClaimed,
    claimGpbCashback,
    addTransaction,
    updateBudgetBalance,
    addCashbackCategory,
    removeCashbackCategory,
    toggleCashbackClaimed,
    toggleTaskCompletion,
    payUtilityBill,
  } = useNexusStore();

  // Local UI States
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(String(budget.currentBalance));
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showGpbModal, setShowGpbModal] = useState(false);
  const [gpbClaimAmount, setGpbClaimAmount] = useState('1500');
  const [copiedPayerCode, setCopiedPayerCode] = useState(false);
  const [copiedWifiPw, setCopiedWifiPw] = useState(false);

  // Active Apple Wallet Card for detail inspector
  const [activeCardId, setActiveCardId] = useState<string>('cb-sber');
  const [customCatName, setCustomCatName] = useState('');
  const [customCatPercent, setCustomCatPercent] = useState('5');
  const [purchaseQuery, setPurchaseQuery] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('3000');

  // Multi-Month Utility Calculator state
  const [selectedCalcMonth, setSelectedCalcMonth] = useState<'nov' | 'oct' | 'sep'>('nov');
  const [meterInputs, setMeterInputs] = useState({
    nov: {
      coldWater: 224.2,
      hotWater: 147.0,
      t1: 1940.0,
      t2: 860.0,
      t3: 410.0,
      prevColdWater: 221.5,
      prevHotWater: 144.2,
      prevT1: 1890.0,
      prevT2: 835.0,
      prevT3: 395.0,
      domiland: 1685.41,
      epd: 981.34,
      wifi: 740.00,
    },
    oct: {
      coldWater: 221.5,
      hotWater: 144.2,
      t1: 1890.0,
      t2: 835.0,
      t3: 395.0,
      prevColdWater: 218.1,
      prevHotWater: 141.0,
      prevT1: 1835.0,
      prevT2: 805.0,
      prevT3: 378.0,
      domiland: 1685.41,
      epd: 981.34,
      wifi: 740.00,
    },
    sep: {
      coldWater: 218.1,
      hotWater: 141.0,
      t1: 1835.0,
      t2: 805.0,
      t3: 378.0,
      prevColdWater: 215.0,
      prevHotWater: 138.0,
      prevT1: 1780.0,
      prevT2: 780.0,
      prevT3: 360.0,
      domiland: 1650.00,
      epd: 981.34,
      wifi: 740.00,
    },
  });

  // New Transaction Form state
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState<'expense' | 'transfer'>('expense');
  const [newTxCategory, setNewTxCategory] = useState('Продукты');
  const [newTxPaidBy, setNewTxPaidBy] = useState<'egor' | 'anya' | 'joint'>('joint');
  const [newTxNotes, setNewTxNotes] = useState('');

  // Find linked TickTick tasks
  const gpbTask = tasks.find(
    (t) => t.id === '6ad8cacebf00032b8b10c84f' || t.title.toLowerCase().includes('газпром')
  );
  const mosenergoTask = tasks.find(
    (t) => t.id === '6ade5432e9a77a0000000f93' || t.title.toLowerCase().includes('мосэнерго')
  );
  const domilandTask = tasks.find(
    (t) => t.id === '6ade5413e9a77a0000000f7f' || t.title.toLowerCase().includes('домиленд')
  );
  const epdTask = tasks.find(
    (t) => t.id === '6ade543ae9a77a0000000f9a' || t.title.toLowerCase().includes('епд')
  );
  const wifiTask = tasks.find(
    (t) => t.id === '6ade54e9e9a77a0000000fb6' || t.title.toLowerCase().includes('wi-fi')
  );

  // Honest budget calculation from real operations
  const egorTransfers = transactions
    .filter((t) => t.paidBy === 'egor' && (t.type === 'transfer' || t.category === 'Общий счет'))
    .reduce((sum, t) => sum + t.amount, 0);
  const anyaTransfers = transactions
    .filter((t) => t.paidBy === 'anya' && (t.type === 'transfer' || t.category === 'Общий счет'))
    .reduce((sum, t) => sum + t.amount, 0);

  const egorAmount = budget.egorContribution > 0 ? budget.egorContribution : egorTransfers;
  const anyaAmount = budget.anyaContribution > 0 ? budget.anyaContribution : anyaTransfers;
  const totalTarget = budget.totalTarget || 80000;
  const targetHalf = Math.round(totalTarget / 2);

  const egorSharePercent = totalTarget > 0 ? Math.round((egorAmount / totalTarget) * 100) : 0;
  const anyaSharePercent = totalTarget > 0 ? Math.round((anyaAmount / totalTarget) * 100) : 0;

  // Selected card reference
  const currentCard = cashbackCards.find((c) => c.id === activeCardId) || cashbackCards[0];
  const currentTheme = CARD_METALLIC_THEMES[currentCard?.id || 'cb-sber'];

  // Smart cashback advisor logic
  const recommendation = useMemo(() => {
    const q = purchaseQuery.toLowerCase().trim();
    const amt = parseFloat(purchaseAmount) || 0;

    if (!q) {
      return {
        cardId: 'cb-tbank',
        cardName: 'Т-Банк Black (Общий счет)',
        owner: 'Егор & Аня',
        percent: 1,
        advice: 'Базовый кэшбэк 1% на любые траты общего бюджета без повышенной категории.',
        savings: Math.round(amt * 0.01),
        color: '#f59e0b',
      };
    }

    if (q.includes('wb') || q.includes('wildberries') || q.includes('вайлдберриз')) {
      return {
        cardId: 'cb-wb',
        cardName: 'WB Банк (WB Кошелек)',
        owner: 'Егор',
        percent: 5,
        advice: 'Оплата на Wildberries через привязанный WB Кошелек дает 5% прямой скидки/кэшбэка.',
        savings: Math.round(amt * 0.05),
        color: '#d946ef',
      };
    }

    if (q.includes('вкусвилл') || q.includes('еда') || q.includes('продукты') || q.includes('молоко') || q.includes('перекресток')) {
      return {
        cardId: 'cb-sber',
        cardName: 'Сбер (Аня)',
        owner: 'Аня',
        percent: 5,
        advice: 'Супермаркеты и ВкусВилл — максимальные бонусы СберСпасибо 5% по карте Ани.',
        savings: Math.round(amt * 0.05),
        color: '#10b981',
      };
    }

    if (q.includes('леруа') || q.includes('петрович') || q.includes('ремонт') || q.includes('затирка') || q.includes('герметик') || q.includes('дом') || q.includes('сантехник')) {
      return {
        cardId: 'cb-tbank',
        cardName: 'Т-Банк (Общий счет)',
        owner: 'Егор & Аня',
        percent: 6,
        advice: 'Товары для дома и ремонт — повышенная категория 6% по общему счету пары.',
        savings: Math.round(amt * 0.06),
        color: '#f59e0b',
      };
    }

    if (q.includes('аптек') || q.includes('диаскин') || q.includes('лекарств')) {
      return {
        cardId: 'cb-tbank',
        cardName: 'Т-Банк / Альфа-Банк',
        owner: 'Егор',
        percent: 5,
        advice: 'Аптеки и здоровье — повышенный кэшбэк 5%.',
        savings: Math.round(amt * 0.05),
        color: '#ef4444',
      };
    }

    if (q.includes('бензин') || q.includes('азс') || q.includes('лукойл') || q.includes('такси') || q.includes('каршеринг')) {
      return {
        cardId: 'cb-gpb',
        cardName: 'Газпромбанк',
        owner: 'Егор',
        percent: 5,
        advice: 'АЗС и топливо — 5% кэшбэка по карте Газпромбанка.',
        savings: Math.round(amt * 0.05),
        color: '#3b82f6',
      };
    }

    if (q.includes('ресторан') || q.includes('кафе') || q.includes('кофе') || q.includes('доставка') || q.includes('пицц') || q.includes('суши')) {
      return {
        cardId: 'cb-tbank',
        cardName: 'Т-Банк Black',
        owner: 'Егор & Аня',
        percent: 5,
        advice: 'Кафе, рестораны и фастфуд — 5% кэшбэка с общего счета.',
        savings: Math.round(amt * 0.05),
        color: '#f59e0b',
      };
    }

    return {
      cardId: 'cb-alfa',
      cardName: 'Альфа-Банк / Т-Банк',
      owner: 'Егор',
      percent: 1,
      advice: 'Базовая категория 1% на всё.',
      savings: Math.round(amt * 0.01),
      color: '#ef4444',
    };
  }, [purchaseQuery, purchaseAmount]);

  // Utility calculator math for selected month
  const activeMonthData = meterInputs[selectedCalcMonth];
  const coldWaterDiff = Math.max(0, +(activeMonthData.coldWater - activeMonthData.prevColdWater).toFixed(2));
  const hotWaterDiff = Math.max(0, +(activeMonthData.hotWater - activeMonthData.prevHotWater).toFixed(2));
  const t1Diff = Math.max(0, +(activeMonthData.t1 - activeMonthData.prevT1).toFixed(1));
  const t2Diff = Math.max(0, +(activeMonthData.t2 - activeMonthData.prevT2).toFixed(1));
  const t3Diff = Math.max(0, +(activeMonthData.t3 - activeMonthData.prevT3).toFixed(1));

  // Moscow tariffs (2026 standard)
  const TARIFF_COLD = 59.80; // ₽/м³
  const TARIFF_HOT = 272.14; // ₽/м³
  const TARIFF_T1 = 8.87;    // ₽/кВт⋅ч (пик)
  const TARIFF_T2 = 2.80;    // ₽/кВт⋅ч (ночь)
  const TARIFF_T3 = 6.42;    // ₽/кВт⋅ч (полупик)

  const coldWaterCost = +(coldWaterDiff * TARIFF_COLD).toFixed(2);
  const hotWaterCost = +(hotWaterDiff * TARIFF_HOT).toFixed(2);
  const electricityCost = +(t1Diff * TARIFF_T1 + t2Diff * TARIFF_T2 + t3Diff * TARIFF_T3).toFixed(2);

  // 10th of Month Split (Domiland + EPD mos.ru)
  const split10thTotal = +(activeMonthData.domiland + activeMonthData.epd).toFixed(2);
  const split10thPerPerson = +(split10thTotal / 2).toFixed(2);

  // 25th of Month Split (Electricity + Wi-Fi)
  const split25thTotal = +(electricityCost + activeMonthData.wifi).toFixed(2);
  const split25thPerPerson = +(split25thTotal / 2).toFixed(2);

  // Grand total utility cost for month
  const monthGrandTotal = +(split10thTotal + split25thTotal).toFixed(2);
  const monthGrandTotalPerPerson = +(monthGrandTotal / 2).toFixed(2);

  // History totals for SVG spline graph
  const graphTotals = useMemo(() => {
    return [
      { month: 'Сентябрь', total: 4480.00, domiland: 1650.00, epd: 981.34, elec: 1108.66, wifi: 740 },
      { month: 'Октябрь', total: 4610.50, domiland: 1685.41, epd: 981.34, elec: 1203.75, wifi: 740 },
      { month: 'Ноябрь', total: monthGrandTotal, domiland: activeMonthData.domiland, epd: activeMonthData.epd, elec: electricityCost, wifi: activeMonthData.wifi },
    ];
  }, [monthGrandTotal, activeMonthData, electricityCost]);

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCatName.trim() || !activeCardId) return;
    addCashbackCategory(activeCardId, customCatName.trim(), parseFloat(customCatPercent) || 5);
    setCustomCatName('');
  };

  const handleQuickAddCategory = (name: string, percent: number) => {
    if (!activeCardId) return;
    addCashbackCategory(activeCardId, name, percent);
  };

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

  const handleRecordSplitToBudget = (splitDate: '10' | '25') => {
    const amount = splitDate === '10' ? split10thTotal : split25thTotal;
    const title = splitDate === '10' ? 'ЖКХ: Взнос 10 числа (Домиленд + ЕПД)' : 'ЖКХ: Взнос 25 числа (Электричество + Wi-Fi)';
    
    addTransaction({
      title,
      amount,
      date: new Date().toISOString().slice(0, 10),
      type: 'expense',
      category: 'ЖКХ & Квартира',
      paidBy: 'joint',
      splitRatio: '50/50',
      notes: `Сплит пары 50/50: по ${(amount / 2).toFixed(2)} ₽ с Егора и Ани`,
    });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      {/* ========================================================= */}
      {/* 1. TOP SECTION: JOINT BUDGET DASHBOARD (SEAMLESS LINEAR BENTO) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-[#1c1d24] border border-[#1e2028] rounded-[14px] overflow-hidden shadow-xs">
        {/* Total Joint Balance Card */}
        <div className="bg-[#131419] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Совместный бюджет пары
              </span>
              <span className="font-mono text-[11px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Взносы: {budget.depositDates}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              {isEditingBalance ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = parseFloat(balanceInput) || 0;
                    updateBudgetBalance(val);
                    setIsEditingBalance(false);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="number"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value)}
                    autoFocus
                    className="w-32 px-2 py-1 rounded bg-zinc-900 border border-amber-500/50 text-white font-mono text-xl font-bold focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingBalance(false)}
                    className="px-1.5 py-1 text-zinc-500 text-xs hover:text-white"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <div
                  onClick={() => {
                    setBalanceInput(String(budget.currentBalance));
                    setIsEditingBalance(true);
                  }}
                  className="cursor-pointer group flex items-baseline gap-2"
                  title="Кликните, чтобы изменить баланс"
                >
                  <span className="font-mono text-3xl font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                    {budget.currentBalance.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-300">
                    ✎
                  </span>
                </div>
              )}
              <span className="text-xs text-zinc-500 font-mono">
                / {totalTarget.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {/* Progress Bar of Target */}
            <div className="mt-3.5 space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (budget.currentBalance / totalTarget) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] text-zinc-400 font-mono">
                <span>Целевой фонд месяца</span>
                <span>{Math.round((budget.currentBalance / totalTarget) * 100)}% собрано</span>
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
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white py-2 text-xs font-semibold text-zinc-950 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowUpRight size={13} strokeWidth={2.4} />
            <span>+ Внести вклад / Записать операцию</span>
          </button>
        </div>

        {/* Egor Contribution Card */}
        <div className="bg-[#131419] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-xs font-semibold text-zinc-200">Вклад Егора</span>
              </div>
              <span className="font-mono text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {egorSharePercent}% цели
              </span>
            </div>

            <div className="mt-3">
              <span className="font-mono text-2xl font-bold text-zinc-100">
                {egorAmount.toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-xs text-zinc-500 ml-1.5 font-mono">
                / {targetHalf.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Аренда, интернет, техника, ремонт сантехники и закупка в Леруа.
            </p>
          </div>

          <div>
            <div className="mt-4 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Статус:</span>
              <span className={egorAmount >= targetHalf ? 'text-emerald-400 font-medium' : egorAmount > 0 ? 'text-amber-400 font-medium' : 'text-zinc-500'}>
                {egorAmount >= targetHalf ? 'Внесено в полном объеме ✓' : egorAmount > 0 ? `Внесено ${egorAmount.toLocaleString('ru-RU')} ₽` : 'Ожидает внесения (0 ₽)'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewTxType('transfer');
                setNewTxCategory('Общий счет');
                setNewTxPaidBy('egor');
                setShowAddTxModal(true);
              }}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11.5px] text-zinc-300 hover:text-white border border-white/[0.08] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={11} />
              <span>Внести вклад Егора</span>
            </button>
          </div>
        </div>

        {/* Anya Contribution Card */}
        <div className="bg-[#131419] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-400" />
                <span className="text-xs font-semibold text-zinc-200">Вклад Ани</span>
              </div>
              <span className="font-mono text-[11px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                {anyaSharePercent}% цели
              </span>
            </div>

            <div className="mt-3">
              <span className="font-mono text-2xl font-bold text-zinc-100">
                {anyaAmount.toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-xs text-zinc-500 ml-1.5 font-mono">
                / {targetHalf.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Совместные продукты (ВкусВилл по Сберу 5%), уют дома, текстиль и посуда.
            </p>
          </div>

          <div>
            <div className="mt-4 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Статус:</span>
              <span className={anyaAmount >= targetHalf ? 'text-emerald-400 font-medium' : anyaAmount > 0 ? 'text-pink-400 font-medium' : 'text-zinc-500'}>
                {anyaAmount >= targetHalf ? 'Внесено в полном объеме ✓' : anyaAmount > 0 ? `Внесено ${anyaAmount.toLocaleString('ru-RU')} ₽` : 'Ожидает внесения (0 ₽)'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewTxType('transfer');
                setNewTxCategory('Общий счет');
                setNewTxPaidBy('anya');
                setShowAddTxModal(true);
              }}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11.5px] text-zinc-300 hover:text-white border border-white/[0.08] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={11} />
              <span>Внести вклад Ани</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. APPLE WALLET 2026: 5 LUXURY METALLIC CARDS OF EGOR & ANYA */}
      {/* ========================================================= */}
      <div className="rounded-[14px] border border-white/[0.08] bg-[#121620]/75 backdrop-blur-2xl p-5 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white">
              <CreditCard size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Apple Wallet 2026 · Карты Егора и Ани
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono-num font-bold border border-emerald-500/30">
                  5 реальных карт
                </span>
              </div>
              <p className="text-[11.5px] text-zinc-400">
                Сбер (Аня), Т-Банк Black (Общий счет), WB Банк, Альфа-Банк и Газпромбанк с кэшбэком Ноября
              </p>
            </div>
          </div>

          {/* Potential Savings Banner */}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-xl text-amber-300 text-xs font-medium">
            <Sparkles size={14} className="text-amber-400" />
            <span>Экономия по матрице кэшбэка: <strong>~4 850 ₽ / мес</strong></span>
          </div>
        </div>

        {/* 5 Cards Row (Apple Wallet 2026 aesthetic) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
          {cashbackCards.map((card) => {
            const theme = CARD_METALLIC_THEMES[card.id] || CARD_METALLIC_THEMES['cb-sber'];
            const isSelected = activeCardId === card.id;
            const isGpb = card.id === 'cb-gpb';
            const isGpbClaimed = gpbCashbackClaimed || (gpbTask ? gpbTask.completed : false);

            return (
              <div key={card.id} className="flex flex-col gap-2">
                <div
                  onClick={() => setActiveCardId(card.id)}
                  style={{
                    boxShadow: isSelected ? `0 12px 32px ${theme.glowColor}, inset 0 1px 0 rgba(255,255,255,0.25)` : '0 4px 16px rgba(0,0,0,0.3)',
                  }}
                  className={`relative aspect-[1.586/1] rounded-[14px] p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 overflow-hidden border bg-gradient-to-br ${theme.gradient} ${theme.borderClass} ${
                    isSelected ? 'scale-[1.02] ring-2 ring-white/30 z-10' : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                >
                  {/* Specular Radial Glare */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                    style={{
                      background: 'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.8), transparent 60%)'
                    }}
                  />

                  {/* Card Top: Bank Name, Chip & Contactless */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-[12.5px] tracking-wider text-white drop-shadow-sm font-sans">
                        {theme.name}
                      </span>
                      <span className="text-[9.5px] text-white/70 font-mono tracking-tight">
                        {theme.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ContactlessIcon />
                      <MirBadge />
                    </div>
                  </div>

                  {/* Card Center: EMV Chip */}
                  <div className="relative z-10 flex items-center justify-between my-auto">
                    <EMVChipIcon variant={theme.chipVariant} />
                    
                    {/* Active Month Status Badge */}
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/[0.1] text-[9.5px] font-mono-num text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{card.categories.length} категорий</span>
                    </div>
                  </div>

                  {/* Card Bottom: Number, Holder & Expiry */}
                  <div className="relative z-10 flex items-end justify-between text-white drop-shadow-sm">
                    <div>
                      <div className="font-mono text-[11px] tracking-wider text-white/90">
                        {theme.number}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-white/85 font-medium truncate max-w-[120px]">
                        {theme.holder}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[7.5px] uppercase tracking-widest text-white/60">VALID</div>
                      <div className="font-mono text-[9.5px] text-white/90">{theme.exp}</div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Selected Card Inspector & Category Manager */}
        {currentCard && (
          <div className="mt-3 p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Категории повышенного кэшбэка на {currentCard.activeMonth}: {currentTheme.name} ({currentTheme.tag})
                </h3>
              </div>

              {/* Status Pill */}
              <button
                type="button"
                onClick={() => toggleCashbackClaimed(currentCard.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentCard.claimed
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                <Check size={12} />
                <span>{currentCard.claimed ? 'Категории активированы в банке ✓' : 'Выбрать категории в приложении'}</span>
              </button>
            </div>

            {/* Active Categories Pills for this card */}
            <div>
              <div className="text-[11px] text-zinc-400 mb-2">Активные категории карты (нажмите ✕ для удаления):</div>
              <div className="flex flex-wrap gap-2">
                {currentCard.categories.map((cat, idx) => (
                  <div
                    key={`${cat.category}-${idx}`}
                    className="flex items-center gap-2 pl-3 pr-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs text-white transition-all group"
                  >
                    <span className="font-medium">{cat.category}</span>
                    <span className="font-mono-num font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30 text-[11px]">
                      {cat.percent}%
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCashbackCategory(currentCard.id, idx)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                      title="Удалить категорию"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick 1-Click Popular Category Picker */}
            <div className="pt-2 border-t border-white/[0.05]">
              <div className="text-[11px] text-zinc-400 mb-2">
                Добавить в 1 клик популярную категорию банка:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_QUICK_CATEGORIES.map((item) => {
                  const alreadyHas = currentCard.categories.some((c) => c.category === item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      disabled={alreadyHas}
                      onClick={() => handleQuickAddCategory(item.name, item.percent)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 cursor-pointer ${
                        alreadyHas
                          ? 'bg-white/[0.02] border-white/[0.04] text-zinc-600 cursor-not-allowed'
                          : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08] text-zinc-300 hover:text-white'
                      }`}
                    >
                      <span>+</span>
                      <span>{item.name}</span>
                      <span className="font-mono-num text-amber-300/80">{item.percent}%</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Category Form */}
            <form onSubmit={handleAddCustomCategory} className="pt-2 flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={customCatName}
                onChange={(e) => setCustomCatName(e.target.value)}
                placeholder="Своя категория (например: Цветы, Кино, Озон)..."
                className="flex-1 min-w-[200px] h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/50"
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  value={customCatPercent}
                  onChange={(e) => setCustomCatPercent(e.target.value)}
                  className="w-16 h-8 px-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-center text-white focus:outline-none focus:border-amber-400/50"
                />
                <span className="text-zinc-400 text-xs font-mono">%</span>
              </div>
              <button
                type="submit"
                disabled={!customCatName.trim()}
                className="h-8 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/35 text-amber-300 text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer"
              >
                Добавить в карту
              </button>
            </form>
          </div>
        )}

        {/* Smart Cashback Advisor (Interactive search) */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-bold text-white">Калькулятор лучшей карты для оплаты:</div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={purchaseQuery}
                  onChange={(e) => setPurchaseQuery(e.target.value)}
                  placeholder="ВкусВилл, Леруа, Wildberries, Аптека, Бензин..."
                  className="h-7 w-[200px] sm:w-[260px] px-2.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/50"
                />
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="h-7 w-20 px-2 rounded-lg bg-black/40 border border-white/[0.08] text-xs font-mono text-white text-center"
                />
                <span className="text-zinc-400 text-xs font-mono">₽</span>
              </div>
            </div>
          </div>

          {/* Result Card Pill */}
          <div className="w-full md:w-auto p-2.5 rounded-lg bg-black/50 border border-white/[0.08] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <span>Платить картой:</span>
                <span style={{ color: recommendation.color }} className="font-bold">
                  {recommendation.cardName}
                </span>
                <span className="text-[10px] text-zinc-400">({recommendation.owner})</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">{recommendation.advice}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-zinc-500 uppercase block">Кэшбэк {recommendation.percent}%</span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                +{recommendation.savings} ₽
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ЖКХ-ТЕРМИНАЛ МОСКВЫ С РЕАЛЬНЫМИ ЗАДАЧАМИ TICKTICK */}
      {/* ========================================================= */}
      <div className="rounded-[14px] border border-white/[0.08] bg-[#121620]/75 backdrop-blur-2xl p-5 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  ЖКХ-Терминал Москвы & Счета
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono-num font-bold border border-amber-500/30">
                  4 реальных сервиса из TickTick
                </span>
              </div>
              <p className="text-[11.5px] text-zinc-400">
                Мосэнергосбыт, Домиленд, ЕПД mos.ru и ЛК Wi-Fi с прямыми ссылками и реквизитами
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Окно передачи показаний:</span>
            <span className="font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
              15–26 число
            </span>
          </div>
        </div>

        {/* 4 Real Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Мосэнергосбыт */}
          <div className="p-4 rounded-xl bg-black/40 border-l-[3px] border-amber-400 border-white/[0.06] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Мосэнергосбыт</span>
                </div>
                {mosenergoTask && (
                  <button
                    type="button"
                    onClick={() => toggleTaskCompletion(mosenergoTask.id)}
                    className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                    title="Статус в TickTick"
                  >
                    {mosenergoTask.completed ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                    <span>{mosenergoTask.completed ? 'Передано ✓' : 'К передаче'}</span>
                  </button>
                )}
              </div>

              <div className="mt-2.5">
                <div className="font-mono text-lg font-bold text-white">
                  {electricityCost.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Т1: {activeMonthData.t1} кВт⋅ч · Т2: {activeMonthData.t2} · Т3: {activeMonthData.t3}
                </div>
              </div>

              <div className="mt-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[10.5px] text-zinc-300 space-y-0.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Пик Т1 ({t1Diff} кВт):</span>
                  <span>+{(t1Diff * TARIFF_T1).toFixed(2)} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ночь Т2 ({t2Diff} кВт):</span>
                  <span>+{(t2Diff * TARIFF_T2).toFixed(2)} ₽</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <a
                href="https://my.mosenergosbyt.ru"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-center text-zinc-200 transition-colors flex items-center justify-center gap-1"
              >
                <span>ЛК Мосэнерго</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* 2. Домиленд */}
          <div className="p-4 rounded-xl bg-black/40 border-l-[3px] border-cyan-400 border-white/[0.06] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">УК Домиленд</span>
                </div>
                <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  До 10-го числа
                </span>
              </div>

              <div className="mt-2.5">
                <div className="font-mono text-lg font-bold text-white">
                  {activeMonthData.domiland.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[10.5px] text-zinc-400 font-mono mt-0.5">
                  1 668.72 ₽ + 16.69 ₽ (комиссия)
                </div>
              </div>

              <div className="mt-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[10.5px] text-zinc-300 space-y-0.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">ХВС ({coldWaterDiff} м³):</span>
                  <span>{coldWaterCost} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ГВС ({hotWaterDiff} м³):</span>
                  <span>{hotWaterCost} ₽</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <a
                href="https://domiland.ru"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-center text-zinc-200 transition-colors flex items-center justify-center gap-1"
              >
                <span>ЛК Домиленд</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* 3. ЕПД mos.ru */}
          <div className="p-4 rounded-xl bg-black/40 border-l-[3px] border-emerald-400 border-white/[0.06] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">ЕПД mos.ru</span>
                </div>
                <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  До 10-го числа
                </span>
              </div>

              <div className="mt-2.5">
                <div className="font-mono text-lg font-bold text-white">
                  {activeMonthData.epd.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[10.5px] text-zinc-400 font-mono mt-0.5">
                  Капремонт 779.86 ₽ + ТКО 201.48 ₽
                </div>
              </div>

              {/* Payer Code 1-Click Copy */}
              <div className="mt-2 p-2 rounded-lg bg-black/50 border border-white/[0.08] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase font-mono">Код плательщика:</div>
                  <div className="font-mono text-[11px] font-bold text-amber-300">4191105056</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('4191105056');
                    setCopiedPayerCode(true);
                    setTimeout(() => setCopiedPayerCode(false), 2000);
                  }}
                  className="px-2 py-1 rounded bg-white/[0.08] hover:bg-white/[0.15] text-[10px] text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy size={10} />
                  <span>{copiedPayerCode ? 'Скопировано ✓' : 'Копировать'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <a
                href="https://www.mos.ru/pay/"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-center text-zinc-200 transition-colors flex items-center justify-center gap-1"
              >
                <span>Оплата на mos.ru</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* 4. Wi-Fi (Формула Связи) */}
          <div className="p-4 rounded-xl bg-black/40 border-l-[3px] border-indigo-400 border-white/[0.06] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">ЛК Wi-Fi</span>
                </div>
                <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  До 25-го числа
                </span>
              </div>

              <div className="mt-2.5">
                <div className="font-mono text-lg font-bold text-white">
                  {activeMonthData.wifi.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[10.5px] text-zinc-400 font-mono mt-0.5">
                  Формула Связи · 100 Мбит/с
                </div>
              </div>

              {/* Wi-Fi Credential safe box */}
              <div className="mt-2 p-2 rounded-lg bg-black/50 border border-white/[0.08] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase font-mono">Логин: F-908944-160926</div>
                  <div className="font-mono text-[11px] text-amber-300 tracking-wider">••••••••</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('WhbgVopu');
                    setCopiedWifiPw(true);
                    setTimeout(() => setCopiedWifiPw(false), 2000);
                  }}
                  className="px-2 py-1 rounded bg-white/[0.08] hover:bg-white/[0.15] text-[10px] text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy size={10} />
                  <span>{copiedWifiPw ? 'Пароль скопирован ✓' : 'Копировать'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <a
                href="https://lk.formula-start.ru"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-center text-zinc-200 transition-colors flex items-center justify-center gap-1"
              >
                <span>ЛК Wi-Fi</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. ИНТЕРАКТИВНЫЙ КАЛЬКУЛЯТОР КВИТАНЦИЙ ПО МЕСЯЦАМ И СПЛИТ 10/25 */}
      {/* ========================================================= */}
      <div className="rounded-[14px] border border-white/[0.08] bg-[#121620]/75 backdrop-blur-2xl p-5 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        {/* Month Tabs & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Калькулятор квитанций & Сплит 10 и 25 числа
              </h3>
              <p className="text-[11.5px] text-zinc-400">
                Внесите показания счетчиков — калькулятор рассчитает суммы и доли Егора и Ани 50/50
              </p>
            </div>
          </div>

          {/* Month Tabs */}
          <div className="flex items-center bg-white/[0.03] p-0.5 rounded-xl border border-white/[0.06]">
            {(
              [
                { id: 'nov', label: 'Ноябрь 2026 (Текущий)' },
                { id: 'oct', label: 'Октябрь 2026' },
                { id: 'sep', label: 'Сентябрь 2026' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedCalcMonth(m.id)}
                className={`h-7 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCalcMonth === m.id
                    ? 'bg-white/[0.12] text-amber-300 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form for Meters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
          {/* Cold Water */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-cyan-300 block">
              Холодная вода (ХВС, м³)
            </label>
            <input
              type="number"
              step="0.1"
              value={activeMonthData.coldWater}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setMeterInputs((prev) => ({
                  ...prev,
                  [selectedCalcMonth]: { ...prev[selectedCalcMonth], coldWater: val },
                }));
              }}
              className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-cyan-500/30 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="text-[10px] text-zinc-400 font-mono">
              Расход: <strong className="text-cyan-300">{coldWaterDiff} м³</strong> ({coldWaterCost} ₽)
            </div>
          </div>

          {/* Hot Water */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-rose-300 block">
              Горячая вода (ГВС, м³)
            </label>
            <input
              type="number"
              step="0.1"
              value={activeMonthData.hotWater}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setMeterInputs((prev) => ({
                  ...prev,
                  [selectedCalcMonth]: { ...prev[selectedCalcMonth], hotWater: val },
                }));
              }}
              className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-rose-500/30 text-xs font-mono text-white focus:outline-none focus:border-rose-400"
            />
            <div className="text-[10px] text-zinc-400 font-mono">
              Расход: <strong className="text-rose-300">{hotWaterDiff} м³</strong> ({hotWaterCost} ₽)
            </div>
          </div>

          {/* Power T1 */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-amber-300 block">
              Электричество Т1 (Пик, кВт)
            </label>
            <input
              type="number"
              step="1"
              value={activeMonthData.t1}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setMeterInputs((prev) => ({
                  ...prev,
                  [selectedCalcMonth]: { ...prev[selectedCalcMonth], t1: val },
                }));
              }}
              className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-amber-500/30 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
            <div className="text-[10px] text-zinc-400 font-mono">
              Расход: <strong className="text-amber-300">{t1Diff} кВт</strong> (+{(t1Diff * TARIFF_T1).toFixed(1)} ₽)
            </div>
          </div>

          {/* Power T2 */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-indigo-300 block">
              Электричество Т2 (Ночь, кВт)
            </label>
            <input
              type="number"
              step="1"
              value={activeMonthData.t2}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setMeterInputs((prev) => ({
                  ...prev,
                  [selectedCalcMonth]: { ...prev[selectedCalcMonth], t2: val },
                }));
              }}
              className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-indigo-500/30 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
            />
            <div className="text-[10px] text-zinc-400 font-mono">
              Расход: <strong className="text-indigo-300">{t2Diff} кВт</strong> (+{(t2Diff * TARIFF_T2).toFixed(1)} ₽)
            </div>
          </div>

          {/* Power T3 */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-emerald-300 block">
              Электричество Т3 (Полупик)
            </label>
            <input
              type="number"
              step="1"
              value={activeMonthData.t3}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setMeterInputs((prev) => ({
                  ...prev,
                  [selectedCalcMonth]: { ...prev[selectedCalcMonth], t3: val },
                }));
              }}
              className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-emerald-500/30 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
            />
            <div className="text-[10px] text-zinc-400 font-mono">
              Расход: <strong className="text-emerald-300">{t3Diff} кВт</strong> (+{(t3Diff * TARIFF_T3).toFixed(1)} ₽)
            </div>
          </div>
        </div>

        {/* Dynamic Monthly Expenses Spline SVG Graph */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-400" />
              <span>Динамика общих расходов на ЖКХ (Сентябрь – Ноябрь 2026):</span>
            </div>
            <span className="font-mono text-amber-300">
              Итого за Ноябрь: {monthGrandTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          {/* Smooth SVG Area Spline */}
          <div className="relative h-28 w-full pt-2">
            <svg viewBox="0 0 600 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="utilityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

              {/* Area fill under spline: 3 points: (80, 52), (300, 42), (520, 36) */}
              <path
                d="M 80 55 Q 190 48, 300 45 T 520 38 L 520 95 L 80 95 Z"
                fill="url(#utilityGrad)"
              />

              {/* Spline curve stroke */}
              <path
                d="M 80 55 Q 190 48, 300 45 T 520 38"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Point 1 (Sep) */}
              <circle cx="80" cy="55" r="4.5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
              {/* Point 2 (Oct) */}
              <circle cx="300" cy="45" r="4.5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
              {/* Point 3 (Nov) */}
              <circle cx="520" cy="38" r="5.5" fill="#10b981" stroke="#fff" strokeWidth="2" />
            </svg>

            {/* Labels under graph */}
            <div className="flex justify-between px-10 text-[10.5px] font-mono text-zinc-400 mt-1">
              <div>Сентябрь: <strong>4 480 ₽</strong></div>
              <div>Октябрь: <strong>4 610.50 ₽</strong></div>
              <div className="text-emerald-400 font-bold">Ноябрь: <strong>{monthGrandTotal} ₽</strong></div>
            </div>
          </div>
        </div>

        {/* 10th and 25th Payment Split Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Split 10th of Month */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Взнос 10 числа (Аванс)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Домиленд + ЕПД
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-zinc-400">Общая сумма:</span>
                  <div className="font-mono text-2xl font-bold text-white">
                    {split10thTotal.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400">С каждого (50/50):</span>
                  <div className="font-mono text-xl font-bold text-amber-300">
                    {split10thPerPerson.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>

              <div className="mt-2.5 space-y-1 text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/[0.04]">
                <div className="flex justify-between">
                  <span>Домиленд (ЖКХ, вода, тепло):</span>
                  <span className="text-zinc-200">{activeMonthData.domiland} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>ЕПД mos.ru (Капремонт + ТКО):</span>
                  <span className="text-zinc-200">{activeMonthData.epd} ₽</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRecordSplitToBudget('10')}
              className="w-full py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/35 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check size={13} />
              <span>Записать взнос 10-го числа в общий счет</span>
            </button>
          </div>

          {/* Split 25th of Month */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Взнос 25 числа (Зарплата)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Электричество + Wi-Fi
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-zinc-400">Общая сумма:</span>
                  <div className="font-mono text-2xl font-bold text-white">
                    {split25thTotal.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400">С каждого (50/50):</span>
                  <div className="font-mono text-xl font-bold text-amber-300">
                    {split25thPerPerson.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>

              <div className="mt-2.5 space-y-1 text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/[0.04]">
                <div className="flex justify-between">
                  <span>Мосэнергосбыт (Т1/Т2/Т3 свет):</span>
                  <span className="text-zinc-200">{electricityCost} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Wi-Fi (Формула Связи 100 Мбит):</span>
                  <span className="text-zinc-200">{activeMonthData.wifi} ₽</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRecordSplitToBudget('25')}
              className="w-full py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/35 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check size={13} />
              <span>Записать взнос 25-го числа в общий счет</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. ИСТОРИЯ ОПЕРАЦИЙ & СПЛИТ РАСХОДОВ */}
      {/* ========================================================= */}
      <div className="rounded-[14px] border border-white/[0.08] bg-[#121620]/75 backdrop-blur-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              История операций & Сплит расходов пары
            </h2>
            <p className="text-[11px] text-zinc-400">
              Пополнения счета, покупки во ВкусВилле, Леруа Мерлен и платежи по ЖКХ
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setNewTxType('expense');
              setShowAddTxModal(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-zinc-100 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.4} />
            <span>Добавить расход</span>
          </button>
        </div>

        <div className="divide-y divide-white/[0.06] overflow-x-auto">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2.5 px-2 hover:bg-white/[0.02] rounded-lg transition-colors text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
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

                <div className="min-w-0">
                  <div className="font-semibold text-zinc-100 truncate">{tx.title}</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2 flex-wrap">
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
                        <span className="italic truncate max-w-[200px]">{tx.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
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
      {/* MODAL: CLAIM GPB CASHBACK */}
      {showGpbModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowGpbModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl border border-blue-500/30 bg-[#121622] p-5 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/35 flex items-center justify-center text-blue-400">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Забрать кэшбэк Газпромбанк
                  </h3>
                  <span className="text-[10px] text-blue-300 font-mono">
                    Акция месяца · Компенсация 25%
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGpbModal(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(gpbClaimAmount) || 0;
                if (amt > 0) {
                  claimGpbCashback(amt);
                  setShowGpbModal(false);
                }
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Сумма полученного кэшбэка (₽)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="10"
                    required
                    autoFocus
                    value={gpbClaimAmount}
                    onChange={(e) => setGpbClaimAmount(e.target.value)}
                    placeholder="1500"
                    className="w-full h-10 px-3 pr-8 rounded-xl bg-black/50 border border-blue-500/30 text-lg font-mono font-bold text-white focus:outline-none focus:border-blue-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-zinc-400 text-sm">
                    ₽
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Эта сумма будет реально прибавлена к балансу совместного бюджета пары, записана в историю операций и зафиксирует выполнение задачи в TickTick.
                </p>
              </div>

              {/* Quick amount presets */}
              <div className="flex gap-2">
                {['1000', '1500', '2000', '3000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGpbClaimAmount(preset)}
                    className={`flex-1 py-1 rounded-lg text-xs font-mono transition-all ${
                      gpbClaimAmount === preset
                        ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40 font-bold'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 border border-white/[0.06]'
                    }`}
                  >
                    {preset} ₽
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGpbModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-zinc-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  Зачислить на баланс
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
