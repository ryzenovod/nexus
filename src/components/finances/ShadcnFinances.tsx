import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  ArrowDownRight, 
  ArrowUpRight,
  Plus, 
  Receipt, 
  Zap, 
  Droplet, 
  Wifi, 
  ExternalLink,
  Sparkles,
  Trash2,
  Edit3,
  History,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineText, InlineNumber } from '@/components/ui/inline-edit';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useNexusStore } from '@/store/useNexusStore';
import { initialCashbackCards } from '@/data/nexusInitialData';
import { CashbackCard, CardGradientPreset } from '@/types/nexus';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// SVG Icons for Apple Wallet 2026 aesthetics
const ContactlessIcon: React.FC<{ className?: string }> = ({ className = 'text-white/80' }) => (
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
  <div className="flex items-center px-1.5 py-0.5 rounded-full bg-white/[0.15] text-[9.5px] font-black tracking-widest text-white/90">
    MIR
  </div>
);

// 6 Metallic Gradient Presets (Revolut / Apple Wallet / Family: zero colored borders)
export const CARD_GRADIENT_PRESETS: Record<CardGradientPreset, {
  name: string;
  gradient: string;
  glowColor: string;
  chipVariant: 'gold' | 'platinum';
  accentText: string;
  badgeBg: string;
}> = {
  emerald: {
    name: 'Изумруд (Сбер)',
    gradient: 'bg-[radial-gradient(circle_at_top_left,#10b981_0%,#047857_45%,#062c22_100%)]',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    chipVariant: 'gold',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500',
  },
  titanium: {
    name: 'Титан Black (Т-Банк)',
    gradient: 'bg-[radial-gradient(circle_at_top_left,#52525b_0%,#27272a_50%,#09090b_100%)]',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    chipVariant: 'platinum',
    accentText: 'text-amber-400',
    badgeBg: 'bg-zinc-800',
  },
  violet: {
    name: 'Фиолетовый (WB Банк)',
    gradient: 'bg-[radial-gradient(circle_at_top_left,#a855f7_0%,#6b21a8_50%,#2e1065_100%)]',
    glowColor: 'rgba(217, 70, 239, 0.4)',
    chipVariant: 'gold',
    accentText: 'text-fuchsia-400',
    badgeBg: 'bg-purple-600',
  },
  ruby: {
    name: 'Рубин (Альфа-Банк)',
    gradient: 'bg-[radial-gradient(circle_at_top_left,#ef4444_0%,#991b1b_50%,#450a0a_100%)]',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    chipVariant: 'gold',
    accentText: 'text-rose-400',
    badgeBg: 'bg-rose-600',
  },
  sapphire: {
    name: 'Сапфир (Газпромбанк)',
    gradient: 'bg-[radial-gradient(circle_at_top_left,#3b82f6_0%,#1d4ed8_50%,#172554_100%)]',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    chipVariant: 'gold',
    accentText: 'text-blue-400',
    badgeBg: 'bg-blue-600',
  },
  amber: {
    name: 'Янтарь / Золото',
    gradient: 'bg-[radial-gradient(circle_at_top_left,#f59e0b_0%,#b45309_50%,#451a03_100%)]',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    chipVariant: 'gold',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-600',
  },
};

// Dynamic Card Metadata Resolvers: Strictly EGOR or ANYA (No family names, no hardcoding)
const getCardTheme = (card: CashbackCard) => {
  if (card.gradientPreset && CARD_GRADIENT_PRESETS[card.gradientPreset]) {
    return CARD_GRADIENT_PRESETS[card.gradientPreset];
  }
  const lower = card.bankName.toLowerCase();
  if (card.id === 'cb-sber' || lower.includes('сбер')) return CARD_GRADIENT_PRESETS.emerald;
  if (card.id === 'cb-tbank' || lower.includes('т-банк') || lower.includes('тиньк')) return CARD_GRADIENT_PRESETS.titanium;
  if (card.id === 'cb-wb' || lower.includes('wb') || lower.includes('вайлд')) return CARD_GRADIENT_PRESETS.violet;
  if (card.id === 'cb-alfa' || lower.includes('альфа')) return CARD_GRADIENT_PRESETS.ruby;
  if (card.id === 'cb-gpb' || lower.includes('газпром')) return CARD_GRADIENT_PRESETS.sapphire;
  return CARD_GRADIENT_PRESETS.amber;
};

const getCardHolder = (card: CashbackCard): string => {
  if (card.user === 'anya' || card.id === 'cb-sber') return 'ANYA';
  return 'EGOR';
};

const getCardDigits = (card: CashbackCard): string => {
  if (card.digits) {
    const clean = card.digits.replace(/\D/g, '');
    return clean ? `•••• ${clean.slice(-4)}` : '•••• ••••';
  }
  return '•••• ••••';
};

const getCardTag = (card: CashbackCard): string => {
  if (card.id === 'cb-tbank' || card.bankName.toLowerCase().includes('т-банк')) {
    return 'Егор · Т-Банк Black';
  }
  if (card.specialFeature && !card.specialFeature.toLowerCase().includes('общий счет') && !card.specialFeature.toLowerCase().includes('совместный счет')) {
    return card.specialFeature;
  }
  const ownerLabel = card.user === 'anya' ? 'Аня' : 'Егор';
  return `${ownerLabel} · ${card.bankName}`;
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
];

export const ShadcnFinances: React.FC = () => {
  const { 
    budget, 
    cashbackCards,
    utilityBills,
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    updateBudget,
    addCashbackCategory,
    removeCashbackCategory,
    updateCashbackCategory,
    addCashbackCard,
    updateCashbackCard,
    deleteCashbackCard,
    claimCashbackForCard,
    updateBudgetBalance,
    updateBudgetContributions,
    addUtilityBill,
    deleteUtilityBill,
    resetUtilityBillsMonth,
    updateUtilityBill,
    payUtilityBill,
    toggleTaskCompletion,
    tasks
  } = useNexusStore();

  const [activeCardId, setActiveCardId] = useState<string>('cb-sber');
  const [cashbackDepositAmount, setCashbackDepositAmount] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryPercent, setCustomCategoryPercent] = useState('5');
  
  // Card modals
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardFormBankName, setCardFormBankName] = useState('');
  const [cardFormUser, setCardFormUser] = useState<'egor' | 'anya' | 'joint'>('egor');
  const [cardFormPreset, setCardFormPreset] = useState<CardGradientPreset>('sapphire');
  const [cardFormDigits, setCardFormDigits] = useState('');
  const [cardFormSpecial, setCardFormSpecial] = useState('');

  // Budget deposit modal for Egor / Anya
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositUser, setDepositUser] = useState<'egor' | 'anya'>('egor');
  const [depositAmount, setDepositAmount] = useState('10000');

  const budgetCollected = budget.currentBalance || 0;
  const budgetTarget = budget.totalTarget || 0;

  const egorTarget = budget.egorTarget ?? (budgetTarget > 0 ? Math.round(budgetTarget / 2) : 0);
  const anyaTarget = budget.anyaTarget ?? (budgetTarget > 0 ? Math.round(budgetTarget / 2) : 0);
  const egorProgress = egorTarget > 0 ? Math.min(100, Math.round((budget.egorContribution / egorTarget) * 100)) : 0;
  const anyaProgress = anyaTarget > 0 ? Math.min(100, Math.round((budget.anyaContribution / anyaTarget) * 100)) : 0;

  const cardsList = (cashbackCards && cashbackCards.length > 0) ? cashbackCards : initialCashbackCards;
  const currentCard = cardsList.find(c => c.id === activeCardId) || cardsList[0] || initialCashbackCards[0];

  const dueBillsAmount = useMemo(() => {
    return (utilityBills || [])
      .filter((b) => b.status === 'due')
      .reduce((sum, b) => sum + (b.amount || 0), 0);
  }, [utilityBills]);

  const totalCreditedCashback = useMemo(() => {
    if (budget.customSavingsAmount !== undefined) return budget.customSavingsAmount;
    return (transactions || [])
      .filter((tx) => tx.type === 'income' && (tx.category === 'Кэшбэк' || tx.title.toLowerCase().includes('кэшбэк') || tx.title.toLowerCase().includes('кэшбек')))
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [transactions, budget.customSavingsAmount]);

  // Recharts data for budget dynamics (real data without fake numbers)
  const chartData = [
    { name: 'Текущий баланс', balance: budgetCollected, utilities: dueBillsAmount },
  ];

  const matchingTasks = useMemo(() => {
    if (!currentCard) return [];
    const bankLower = currentCard.bankName.toLowerCase();
    
    return tasks.filter((t) => {
      if (t.completed) return false;
      const title = t.title.toLowerCase();
      const hasCashbackKeyword = title.includes('кэшбэк') || title.includes('кэшбек') || title.includes('cashback');
      if (!hasCashbackKeyword) return false;

      // Check if task mentions this bank
      const bankWords = bankLower.split(/\s+/).filter(w => w.length >= 3);
      const matchesWord = bankWords.some(w => title.includes(w));
      const matchesSpecial = 
        (bankLower.includes('газпром') && (title.includes('гпб') || title.includes('газпром'))) ||
        (bankLower.includes('т-банк') && (title.includes('тиньк') || title.includes('т-банк') || title.includes('тбанк'))) ||
        (bankLower.includes('сбер') && (title.includes('сбер') || title.includes('спасибо'))) ||
        (bankLower.includes('wb') && (title.includes('wb') || title.includes('вайлд'))) ||
        (bankLower.includes('альфа') && (title.includes('альфа') || title.includes('alfa')));

      return matchesWord || matchesSpecial;
    });
  }, [tasks, currentCard]);

  // Modal Handlers
  const handleOpenAddCard = () => {
    setEditingCardId(null);
    setCardFormBankName('');
    setCardFormUser('egor');
    setCardFormPreset('sapphire');
    setCardFormDigits('');
    setCardFormSpecial('');
    setIsCardModalOpen(true);
  };

  const handleOpenEditCard = (card: CashbackCard) => {
    setEditingCardId(card.id);
    setCardFormBankName(card.bankName);
    setCardFormUser(card.user || 'egor');
    setCardFormPreset(card.gradientPreset || 'sapphire');
    setCardFormDigits(card.digits ? card.digits.replace(/\D/g, '').slice(-4) : '');
    setCardFormSpecial(card.specialFeature || '');
    setIsCardModalOpen(true);
  };

  const handleSaveCardForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormBankName.trim()) return;

    const digitsClean = cardFormDigits.replace(/\D/g, '').slice(-4) || '0000';
    const holder = cardFormUser === 'anya' ? 'ANYA' : 'EGOR';
    const userLabel = cardFormUser === 'anya' ? 'Аня' : 'Егор';
    const special = cardFormSpecial.trim() || `${userLabel} · ${cardFormBankName.trim()}`;

    if (editingCardId) {
      updateCashbackCard(editingCardId, {
        bankName: cardFormBankName.trim(),
        user: cardFormUser,
        gradientPreset: cardFormPreset,
        digits: digitsClean,
        cardHolder: holder,
        specialFeature: special,
      });
    } else {
      const newId = `cb-${Date.now()}`;
      addCashbackCard({
        id: newId,
        bankName: cardFormBankName.trim(),
        user: cardFormUser,
        gradientPreset: cardFormPreset,
        digits: digitsClean,
        cardHolder: holder,
        specialFeature: special,
        activeMonth: 'Ноябрь 2026',
        categories: [
          { category: 'Супермаркеты', percent: 5 },
          { category: '1% на все покупки', percent: 1 },
        ],
        claimed: true,
        claimDeadline: 'Выбран',
      });
      setActiveCardId(newId);
    }

    setIsCardModalOpen(false);
  };

  const handleDeleteCard = (cardId: string) => {
    if (cardsList.length <= 1) {
      alert('Нельзя удалить последнюю оставшуюся карту!');
      return;
    }
    if (confirm('Вы уверены, что хотите удалить эту банковскую карту?')) {
      deleteCashbackCard(cardId);
      if (activeCardId === cardId) {
        const remaining = cardsList.filter(c => c.id !== cardId);
        if (remaining.length > 0) setActiveCardId(remaining[0].id);
      }
    }
  };

  const handleClaimUniversalCashback = (amountOverride?: number, taskTitleOverride?: string) => {
    const val = amountOverride !== undefined ? amountOverride : (parseFloat(cashbackDepositAmount) || 0);
    if (val <= 0) {
      alert('Пожалуйста, укажите корректную сумму кэшбэка!');
      return;
    }
    claimCashbackForCard(currentCard.id, val, taskTitleOverride);
  };

  const handleConfirmDeposit = () => {
    const val = parseFloat(depositAmount) || 0;
    if (val <= 0) return;
    if (depositUser === 'egor') {
      updateBudgetContributions(budget.egorContribution + val, budget.anyaContribution, budgetTarget);
      addTransaction({
        title: 'Вклад в бюджет: Егор',
        amount: val,
        type: 'income',
        category: 'Вклад',
        paidBy: 'egor',
        splitRatio: '50/50',
        date: new Date().toISOString().slice(0, 10),
      });
    } else {
      updateBudgetContributions(budget.egorContribution, budget.anyaContribution + val, budgetTarget);
      addTransaction({
        title: 'Вклад в бюджет: Аня',
        amount: val,
        type: 'income',
        category: 'Вклад',
        paidBy: 'anya',
        splitRatio: '50/50',
        date: new Date().toISOString().slice(0, 10),
      });
    }
    setIsDepositModalOpen(false);
  };

  const handleQuickAddExpense = () => {
    const amountStr = prompt('Сумма расхода (₽):', '');
    if (!amountStr) return;
    const val = parseFloat(amountStr);
    if (!val || val <= 0) return;
    const title = prompt('Описание расхода (напр. Продукты, Быт):', 'Бытовые расходы') || 'Бытовые расходы';
    addTransaction({
      title,
      amount: val,
      type: 'expense',
      category: 'Быт',
      paidBy: 'joint',
      splitRatio: '50/50',
      date: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 max-w-[1400px] mx-auto w-full pb-8">
      {/* ── 1. JOINT BUDGET HEADER CARD (Revolut / Family 2026) ── */}
      <div className="nexus-surface p-7 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Совместный бюджет пары
              </span>
              <span className="rounded-full bg-white/[0.08] text-zinc-300 text-xs px-2.5 py-0.5">
                Ноябрь 2026
              </span>
            </div>
            <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-white tabular-nums mt-2 flex flex-wrap items-baseline gap-2">
              <InlineNumber
                value={budgetCollected}
                onChange={(val) => updateBudgetBalance(val)}
                suffix=" ₽"
                className="text-4xl sm:text-5xl font-semibold tracking-tight text-white tabular-nums"
              />
              <span className="text-zinc-500 font-normal text-2xl sm:text-3xl">/</span>
              <InlineNumber
                value={budgetTarget}
                onChange={(val) => updateBudgetContributions(budget.egorContribution, budget.anyaContribution, val)}
                placeholder="Задать цель"
                suffix=" ₽ цель"
                className="text-lg sm:text-xl font-normal text-zinc-400 hover:text-zinc-200"
              />
            </div>
            <div className="text-xs text-zinc-400 mt-2 flex flex-wrap items-center gap-1.5">
              <span>Взносы:</span>
              <InlineText
                value={budget.depositDates || '10 и 25 числа каждого месяца'}
                onChange={(val) => updateBudget({ depositDates: val })}
                placeholder="Указать даты взносов"
                className="text-zinc-300 font-medium"
              />
              <span className="text-zinc-600">·</span>
              <InlineText
                value={budget.notes || 'Общий баланс и операции пары'}
                onChange={(val) => updateBudget({ notes: val })}
                placeholder="Заметка к бюджету..."
                className="text-zinc-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setDepositUser('egor');
                setIsDepositModalOpen(true);
              }}
              className="rounded-full bg-white/[0.06] hover:bg-white/[0.12] px-4 py-2.5 text-xs font-medium text-white transition-all border-0 cursor-pointer"
            >
              + Внести вклад Егора
            </button>
            <button
              type="button"
              onClick={() => {
                setDepositUser('anya');
                setIsDepositModalOpen(true);
              }}
              className="rounded-full bg-white/[0.06] hover:bg-white/[0.12] px-4 py-2.5 text-xs font-medium text-white transition-all border-0 cursor-pointer"
            >
              + Внести вклад Ани
            </button>
            <button
              type="button"
              onClick={handleQuickAddExpense}
              className="rounded-full bg-white text-zinc-950 hover:bg-zinc-100 px-5 py-2.5 text-xs font-semibold shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all cursor-pointer border-0"
            >
              Записать операцию
            </button>
          </div>
        </div>

        {/* Contributions breakdown: Two seamless subsurfaces without border */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
          {/* Egor Contribution */}
          <div className="rounded-2xl bg-white/[0.025] p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-medium">Вклад Егора</span>
              <div className="flex items-center gap-1 text-white font-medium tabular-nums">
                <InlineNumber
                  value={budget.egorContribution}
                  onChange={(val) => updateBudgetContributions(val, budget.anyaContribution, budgetTarget)}
                  suffix=" ₽"
                  className="text-white font-medium tabular-nums"
                />
                <span className="text-zinc-500">/</span>
                <InlineNumber
                  value={egorTarget}
                  onChange={(val) => updateBudget({ egorTarget: val })}
                  placeholder="Цель"
                  suffix=" ₽"
                  className="text-zinc-400 hover:text-zinc-200 tabular-nums"
                />
                {egorTarget > 0 && (
                  <span className="text-zinc-500 text-[11px] ml-1">({egorProgress}%)</span>
                )}
              </div>
            </div>
            {egorTarget > 0 ? (
              <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
                  style={{ width: `${egorProgress}%` }}
                />
              </div>
            ) : null}
            <div className="text-[11px] text-zinc-500">
              <InlineText
                value={budget.egorNote || 'Вклад зафиксирован'}
                onChange={(val) => updateBudget({ egorNote: val })}
                placeholder="Заметка к вкладу..."
                className="text-zinc-500 hover:text-zinc-300"
              />
            </div>
          </div>

          {/* Anya Contribution */}
          <div className="rounded-2xl bg-white/[0.025] p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-medium">Вклад Ани</span>
              <div className="flex items-center gap-1 text-white font-medium tabular-nums">
                <InlineNumber
                  value={budget.anyaContribution}
                  onChange={(val) => updateBudgetContributions(budget.egorContribution, val, budgetTarget)}
                  suffix=" ₽"
                  className="text-white font-medium tabular-nums"
                />
                <span className="text-zinc-500">/</span>
                <InlineNumber
                  value={anyaTarget}
                  onChange={(val) => updateBudget({ anyaTarget: val })}
                  placeholder="Цель"
                  suffix=" ₽"
                  className="text-zinc-400 hover:text-zinc-200 tabular-nums"
                />
                {anyaTarget > 0 && (
                  <span className="text-zinc-500 text-[11px] ml-1">({anyaProgress}%)</span>
                )}
              </div>
            </div>
            {anyaTarget > 0 ? (
              <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${anyaProgress}%` }}
                />
              </div>
            ) : null}
            <div className="text-[11px] text-zinc-500">
              <InlineText
                value={budget.anyaNote || 'Вклад зафиксирован'}
                onChange={(val) => updateBudget({ anyaNote: val })}
                placeholder="Заметка к вкладу..."
                className="text-zinc-500 hover:text-zinc-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. CARDS SHOWCASE: КАРТЫ ЕГОРА И АНИ (Apple Wallet 2026, Zero Colored Borders) ── */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-semibold tracking-tight text-white">
                Карты Егора и Ани
              </h3>
              <span className="rounded-full bg-white/[0.08] text-zinc-300 text-xs px-2.5 py-0.5 tabular-nums">
                {cardsList.length} {cardsList.length === 1 ? 'карта' : cardsList.length < 5 ? 'карты' : 'карт'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Реальные карты с повышенным кэшбэком месяца. Кликните для выбора и управления.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenAddCard}
              className="rounded-full bg-white/[0.06] hover:bg-white/[0.12] px-4 py-2 text-xs font-semibold text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer border-0"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" />
              <span>+ Добавить карту</span>
            </button>
            <div className="flex items-center text-xs text-amber-300 bg-amber-500/10 gap-1.5 py-1.5 px-3 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Зачислено кэшбэка: <InlineNumber value={totalCreditedCashback} onChange={(val) => updateBudget({ customSavingsAmount: val })} suffix=" ₽" className="font-semibold tabular-nums text-amber-300" /></span>
            </div>
          </div>
        </div>

        {/* Dynamic Cards Grid: Aspect ratio 1.586/1, metal specular highlight, deep shadow, ZERO colored borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {cardsList.map((card) => {
            const theme = getCardTheme(card);
            const isSelected = activeCardId === card.id;
            const holder = getCardHolder(card);
            const digits = getCardDigits(card);
            const tag = getCardTag(card);

            return (
              <div key={card.id} className="relative group">
                <div
                  onClick={() => setActiveCardId(card.id)}
                  className={`aspect-[1.586/1] rounded-[24px] p-5 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] border-0 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.85),inset_0_1px_1px_0_rgba(255,255,255,0.35),inset_0_-1px_1px_0_rgba(0,0,0,0.4)] ${theme.gradient} ${
                    isSelected 
                      ? '-translate-y-2 scale-[1.02] ring-2 ring-white/40 z-10' 
                      : 'opacity-80 hover:opacity-100 hover:-translate-y-1'
                  }`}
                >
                  {/* Specular Radial Glare */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                    style={{
                      background: 'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.8), transparent 60%)'
                    }}
                  />

                  {/* Card Top: Bank Name, Tag & Contactless/MIR */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="font-bold text-[13px] tracking-wider text-white drop-shadow-sm truncate">
                        {card.bankName.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-white/80 tracking-tight truncate mt-0.5">
                        {tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <ContactlessIcon />
                      <MirBadge />
                    </div>
                  </div>

                  {/* Card Center: EMV Chip */}
                  <div className="relative z-10 flex items-center justify-between my-auto">
                    <EMVChipIcon variant={theme.chipVariant} />
                    
                    {/* Active Categories Count Badge */}
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] text-zinc-200 tabular-nums font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{card.categories?.length || 0} категорий</span>
                    </div>
                  </div>

                  {/* Card Bottom: Number, Holder & Expiry */}
                  <div className="relative z-10 flex items-end justify-between text-white drop-shadow-sm">
                    <div>
                      <div className="text-xs tracking-wider text-white/90 tabular-nums font-medium">
                        <InlineText
                          value={digits}
                          onChange={(val) => updateCashbackCard(card.id, { digits: val.replace(/\D/g, '').slice(-4) })}
                          placeholder="•••• 0000"
                          className="text-white/90 font-medium tracking-wider"
                        />
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-white/90 font-semibold truncate max-w-[120px] mt-0.5">
                        <InlineText
                          value={holder}
                          onChange={(val) => updateCashbackCard(card.id, { cardHolder: val.toUpperCase() })}
                          placeholder="HOLDER"
                          className="text-white/90 font-semibold uppercase tracking-wider"
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[8px] uppercase tracking-widest text-white/60">VALID</div>
                      <div className="text-[10px] text-white/90 tabular-nums font-medium">
                        <InlineText
                          value={card.expiry || '12/28'}
                          onChange={(val) => updateCashbackCard(card.id, { expiry: val })}
                          placeholder="MM/YY"
                          className="text-white/90 tabular-nums font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Icons on Card Hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditCard(card);
                    }}
                    className="p-1.5 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white transition-colors cursor-pointer border-0"
                    title="Редактировать карту"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  {cardsList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="p-1.5 rounded-full bg-black/70 hover:bg-rose-950 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer border-0"
                      title="Удалить карту"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 3. SINGLE SEAMLESS INSPECTOR: УПРАВЛЕНИЕ КАРТОЙ (Zero Matryoshka, Zero Inner Borders) ── */}
        {currentCard && (
          <div className="nexus-surface p-6 sm:p-8 space-y-6">
            {/* Card Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                <div>
                  <div className="flex items-center gap-2">
                    <InlineText
                      value={currentCard.bankName}
                      onChange={(val) => updateCashbackCard(currentCard.id, { bankName: val })}
                      className="text-lg font-semibold text-white tracking-tight"
                    />
                    <span className="text-xs text-zinc-400">·</span>
                    <InlineText
                      value={getCardTag(currentCard)}
                      onChange={(val) => updateCashbackCard(currentCard.id, { specialFeature: val })}
                      placeholder="Подпись карты..."
                      className="text-xs text-zinc-400"
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Владелец: {getCardHolder(currentCard)} · {getCardDigits(currentCard)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditCard(currentCard)}
                  className="rounded-full bg-white/[0.06] hover:bg-white/[0.12] px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer border-0"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Настроить карту</span>
                </button>
                {cardsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(currentCard.id)}
                    className="p-2 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-white/[0.06] transition-all cursor-pointer border-0"
                    title="Удалить карту"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Блок «Зачислить полученный кэшбэк»: мягкая капсула-панель БЕЗ рамок */}
            <div className="rounded-2xl bg-white/[0.03] p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-400 shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Зачислить полученный кэшбэк</div>
                  <div className="text-[11px] text-zinc-400">Пополняет общий бюджет и автоматически закрывает задачу в TickTick</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {['500', '1000', '1500', '3000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCashbackDepositAmount(preset)}
                      className={`rounded-full px-3.5 py-1.5 text-xs tabular-nums border-0 transition-all cursor-pointer ${
                        cashbackDepositAmount === preset
                          ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300'
                      }`}
                    >
                      {preset} ₽
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={cashbackDepositAmount}
                    onChange={(e) => setCashbackDepositAmount(e.target.value)}
                    className="w-36 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-xs text-white text-center tabular-nums outline-none focus:ring-1 focus:ring-amber-400/50 border-0 placeholder:text-zinc-500"
                    placeholder="Сумма кэшбэка..."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleClaimUniversalCashback()}
                  className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-4 py-1.5 text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer flex items-center gap-1.5 border-0"
                >
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  <span>Зачислить</span>
                </button>
              </div>
            </div>

            {/* Matching TickTick task alert if any */}
            {matchingTasks.length > 0 && (
              <div className="rounded-2xl bg-amber-500/10 p-4 space-y-2.5">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Найдена активная задача в TickTick:</span>
                </div>
                {matchingTasks.map((matchedTask) => (
                  <div key={matchedTask.id} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-zinc-200 truncate">{matchedTask.title}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const match = matchedTask.title.match(/(\d+[\s\d]*)\s*₽/);
                        const amt = match ? parseInt(match[1].replace(/\s/g, ''), 10) : (parseFloat(cashbackDepositAmount) || 0);
                        toggleTaskCompletion(matchedTask.id);
                        claimCashbackForCard(currentCard.id, amt, matchedTask.title);
                      }}
                      className="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs px-3.5 py-1.5 transition-all cursor-pointer shrink-0 border-0 shadow-xs"
                    >
                      Выполнить и зачислить
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Категории кэшбэка месяца */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Категории кэшбэка в этом месяце
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 hover:text-white px-3 py-1 transition-all flex items-center gap-1 border-0 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Добавить категорию</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {currentCard.categories && currentCard.categories.length > 0 ? (
                  currentCard.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-white/[0.05] hover:bg-white/[0.09] px-3.5 py-1.5 text-xs sm:text-sm flex items-center gap-2 border-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] text-zinc-200"
                    >
                      <InlineText
                        value={cat.category}
                        onChange={(val) => updateCashbackCategory(currentCard.id, idx, { category: val })}
                        className="text-zinc-200"
                      />
                      <InlineNumber
                        value={cat.percent}
                        onChange={(val) => updateCashbackCategory(currentCard.id, idx, { percent: val })}
                        suffix="%"
                        className="text-emerald-400 font-semibold tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => removeCashbackCategory(currentCard.id, idx)}
                        className="text-zinc-500 hover:text-zinc-200 ml-1 p-0.5 cursor-pointer leading-none text-base border-0 bg-transparent"
                        title="Удалить категорию"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">Категории не выбраны</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. ЖКХ МОСКВЫ И СЧЕТА (.nexus-surface & .nexus-row, Zero Table Borders) ── */}
      <div id="utilities-section" className="nexus-surface p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-semibold tracking-tight text-white">
                ЖКХ Москвы и регулярные счета квартиры
              </h3>
              <span className="rounded-full bg-white/[0.08] text-zinc-300 text-xs px-2.5 py-0.5 tabular-nums">
                {utilityBills?.length || 0}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Кликните на сумму или название для быстрого редактирования. Клик на статус переключает «К оплате / Оплачено».
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const name = prompt('Название услуги (напр. Вода Домиленд, Электричество, Интернет):', 'Новый счет');
                if (!name) return;
                const provider = prompt('Провайдер / Сервис (напр. Домиленд, Мосэнергосбыт, МГТС):', name) || name;
                const amountStr = prompt('Сумма счета (₽):', '0');
                const amount = parseFloat(amountStr || '0') || 0;
                addUtilityBill({
                  serviceName: name,
                  provider,
                  amount,
                  status: amount > 0 ? 'due' : 'paid',
                  dueDate: '10-е число',
                  periodText: 'Текущий месяц',
                });
              }}
              className="rounded-full bg-white/[0.06] hover:bg-white/[0.12] px-3.5 py-1.5 text-xs text-zinc-200 transition-all flex items-center gap-1.5 border-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" />
              <span>Добавить счет</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Сбросить все счета на новый месяц? Статусы станут «К оплате» для заполнения новых квитанций.')) {
                  resetUtilityBillsMonth();
                }
              }}
              className="rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 transition-all flex items-center gap-1.5 border-0 cursor-pointer"
              title="Сбросить все счета на новый расчетный месяц"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Новый месяц</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {(utilityBills || []).map((bill) => {
            const isPaid = bill.status === 'paid';
            const billAmount = bill.amount || 0;

            return (
              <div key={bill.id} className="nexus-row flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-full shrink-0 ${isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {bill.serviceName.toLowerCase().includes('электрич') || bill.serviceName.toLowerCase().includes('энерго') ? (
                      <Zap className="h-4 w-4" />
                    ) : bill.serviceName.toLowerCase().includes('вода') || bill.serviceName.toLowerCase().includes('домиленд') ? (
                      <Droplet className="h-4 w-4" />
                    ) : bill.serviceName.toLowerCase().includes('wi-fi') || bill.serviceName.toLowerCase().includes('интернет') ? (
                      <Wifi className="h-4 w-4" />
                    ) : (
                      <Receipt className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white">
                      <InlineText
                        value={bill.serviceName}
                        onChange={(val) => updateUtilityBill(bill.id, { serviceName: val })}
                        className="text-sm font-medium text-white"
                      />
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                      <InlineText
                        value={bill.provider}
                        onChange={(val) => updateUtilityBill(bill.id, { provider: val })}
                        className="text-xs text-zinc-400"
                      />
                      <span>·</span>
                      <InlineText
                        value={bill.periodText || 'Текущий месяц'}
                        onChange={(val) => updateUtilityBill(bill.id, { periodText: val })}
                        className="text-xs text-zinc-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                  {/* Status clickable badge */}
                  <button
                    type="button"
                    onClick={() => updateUtilityBill(bill.id, { status: isPaid ? 'due' : 'paid' })}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer border-0 ${
                      isPaid ? 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    }`}
                    title="Нажмите, чтобы переключить статус (Оплачено / К оплате)"
                  >
                    {isPaid ? 'Оплачено ✓' : `К оплате${bill.dueDate ? ` до ${bill.dueDate}` : ''}`}
                  </button>

                  {/* Inline editable bill amount */}
                  <InlineNumber
                    value={billAmount}
                    onChange={(val) => updateUtilityBill(bill.id, { amount: val, status: val > 0 ? bill.status : 'paid' })}
                    suffix=" ₽"
                    className="text-sm font-semibold text-white hover:text-amber-400 tabular-nums cursor-pointer"
                  />

                  <div className="flex items-center gap-1.5">
                    {bill.linkUrl && (
                      <button
                        type="button"
                        onClick={() => window.open(bill.linkUrl, '_blank')}
                        className="rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-300 hover:text-white px-3 py-1.5 transition-all cursor-pointer border-0 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>ЛК</span>
                      </button>
                    )}

                    {!isPaid && billAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          payUtilityBill(bill.id);
                          if (bill.linkUrl) window.open(bill.linkUrl, '_blank');
                        }}
                        className="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs px-3.5 py-1.5 transition-all cursor-pointer border-0 shadow-xs"
                      >
                        Оплатить
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Удалить счет «${bill.serviceName}»?`)) {
                          deleteUtilityBill(bill.id);
                        }
                      }}
                      className="p-1.5 rounded-full text-zinc-500 hover:text-rose-400 hover:bg-white/[0.06] transition-all cursor-pointer border-0"
                      title="Удалить счет"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. ИСТОРИЯ ОПЕРАЦИЙ И ВЗНОСОВ (.nexus-surface, Zero Table Borders) ── */}
      <div className="nexus-surface p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <History className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xl font-semibold tracking-tight text-white">
                История операций и взносов
              </h3>
              <span className="rounded-full bg-white/[0.08] text-zinc-300 text-xs px-2.5 py-0.5 tabular-nums">
                {transactions?.length || 0}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Все реальные операции пары: пополнения бюджета, расходы и зачисленный кэшбэк. Суммы и названия кликабельны для редактирования.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickAddExpense}
              className="rounded-full bg-white/[0.06] hover:bg-white/[0.12] px-3.5 py-1.5 text-xs text-zinc-200 transition-all flex items-center gap-1.5 border-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-rose-400" />
              <span>+ Записать расход</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {transactions && transactions.length > 0 ? (
            transactions.slice(0, 15).map((tx) => {
              const isIncome = tx.type === 'income';
              const userLabel = tx.paidBy === 'egor' ? 'Егор' : tx.paidBy === 'anya' ? 'Аня' : 'Общий счет';

              return (
                <div key={tx.id} className="nexus-row flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-full shrink-0 ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {isIncome ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">
                        <InlineText
                          value={tx.title}
                          onChange={(val) => updateTransaction(tx.id, { title: val })}
                          className="text-sm font-medium text-white"
                        />
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-zinc-500 tabular-nums">{tx.date}</span>
                        <span>·</span>
                        <span className="rounded-full bg-white/[0.05] px-2 py-0.2 text-[10px] text-zinc-300">
                          {userLabel}
                        </span>
                        {tx.category && (
                          <>
                            <span>·</span>
                            <span className="text-zinc-400">{tx.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-base font-semibold tabular-nums ${isIncome ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      {isIncome ? '+' : '-'}
                      <InlineNumber
                        value={tx.amount}
                        onChange={(val) => updateTransaction(tx.id, { amount: val })}
                        suffix=" ₽"
                        className={`text-base font-semibold tabular-nums ${isIncome ? 'text-emerald-400' : 'text-zinc-200'}`}
                      />
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Удалить операцию «${tx.title}» (${tx.amount} ₽)? Баланс будет скорректирован.`)) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      className="p-1.5 rounded-full text-zinc-500 hover:text-rose-400 hover:bg-white/[0.06] transition-all cursor-pointer border-0"
                      title="Удалить операцию"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">
              Операций пока нет. Внесите вклад Егора или Ани, либо нажмите «+ Записать расход».
            </div>
          )}
        </div>
      </div>

      {/* ── 5. RECHARTS DYNAMICS GRAPH (.nexus-surface) ── */}
      <div className="nexus-surface p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white">
            Динамика бюджета и расходов
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Соотношение баланса и коммунальных расходов по месяцам
          </p>
        </div>

        <div className="h-56 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0D101A', 
                  border: 'none', 
                  borderRadius: '16px', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  fontSize: '12px',
                  color: '#f4f4f5' 
                }} 
              />
              <Area type="monotone" dataKey="balance" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} name="Баланс" />
              <Area type="monotone" dataKey="utilities" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} name="ЖКХ" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CARD ADD / EDIT MODAL DIALOG ── */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0D101A]/95 backdrop-blur-2xl border-white/[0.08] text-zinc-100 rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">
              {editingCardId ? 'Редактировать банковскую карту' : 'Добавить новую банковскую карту'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Карта появится в витрине с металлическим градиентом и категориями кэшбэка
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCardForm} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Название банка
              </label>
              <Input
                required
                placeholder="например: Т-Банк, Сбер, ВТБ, WB Банк"
                value={cardFormBankName}
                onChange={(e) => setCardFormBankName(e.target.value)}
                className="h-9 text-xs rounded-full bg-white/[0.04] border-white/[0.08]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Владелец карты
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['egor', 'anya'] as const).map((userKey) => (
                  <button
                    key={userKey}
                    type="button"
                    onClick={() => setCardFormUser(userKey)}
                    className={`py-2 px-3 rounded-full text-xs font-medium transition-all cursor-pointer border-0 ${
                      cardFormUser === userKey
                        ? 'bg-white text-zinc-950 font-bold shadow-xs'
                        : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {userKey === 'egor' ? 'Егор (EGOR)' : 'Аня (ANYA)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Цветовая тема градиента
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(CARD_GRADIENT_PRESETS) as CardGradientPreset[]).map((key) => {
                  const p = CARD_GRADIENT_PRESETS[key];
                  const isPresetActive = cardFormPreset === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCardFormPreset(key)}
                      className={`flex items-center gap-2 p-2 rounded-2xl text-left text-xs transition-all cursor-pointer border-0 ${
                        isPresetActive
                          ? 'bg-white/[0.15] text-white font-semibold'
                          : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${p.badgeBg} shadow-xs`} />
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Последние 4 цифры
                </label>
                <Input
                  maxLength={4}
                  placeholder="1234 (необязательно)"
                  value={cardFormDigits}
                  onChange={(e) => setCardFormDigits(e.target.value)}
                  className="h-9 text-xs tabular-nums rounded-full bg-white/[0.04] border-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Подпись / Особенность
                </label>
                <Input
                  placeholder="например: Егор · Т-Банк Black"
                  value={cardFormSpecial}
                  onChange={(e) => setCardFormSpecial(e.target.value)}
                  className="h-9 text-xs rounded-full bg-white/[0.04] border-white/[0.08]"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCardModalOpen(false)}
                className="text-xs rounded-full"
              >
                Отмена
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold rounded-full bg-white text-zinc-950 hover:bg-zinc-100">
                {editingCardId ? 'Сохранить изменения' : 'Добавить карту'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── CARD ADD CATEGORY MODAL (Zero Inner Borders) ── */}
      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0D101A]/95 backdrop-blur-2xl border-white/[0.08] text-zinc-100 rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-white">
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Добавить категорию: {currentCard?.bankName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Выберите популярную категорию банка или укажите свою
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">Популярные категории:</label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_QUICK_CATEGORIES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      addCashbackCategory(currentCard.id, preset.name, preset.percent);
                      setIsAddCategoryModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-200 transition-all cursor-pointer border-0"
                  >
                    <span>{preset.name}</span>
                    <span className="text-emerald-400 font-semibold tabular-nums">{preset.percent}%</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-zinc-300">Своя категория:</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Название категории..."
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  className="h-9 text-xs flex-1 rounded-full bg-white/[0.04] border-white/[0.08]"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={customCategoryPercent}
                    onChange={(e) => setCustomCategoryPercent(e.target.value)}
                    className="h-9 w-16 text-xs text-center tabular-nums rounded-full bg-white/[0.04] border-white/[0.08]"
                  />
                  <span className="text-xs text-zinc-400">%</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (customCategoryName.trim()) {
                      addCashbackCategory(
                        currentCard.id,
                        customCategoryName.trim(),
                        parseFloat(customCategoryPercent) || 5
                      );
                      setCustomCategoryName('');
                      setIsAddCategoryModalOpen(false);
                    }
                  }}
                  className="h-9 px-4 text-xs cursor-pointer bg-white text-zinc-950 hover:bg-zinc-100 font-semibold rounded-full"
                >
                  Добавить
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddCategoryModalOpen(false)}
              className="text-xs rounded-full"
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG: DEPOSIT CONTRIBUTION ── */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0D101A]/95 backdrop-blur-2xl border-white/[0.08] text-zinc-100 rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">
              Внести вклад в бюджет: {depositUser === 'egor' ? 'Егор' : 'Аня'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Пополнение общего фонда пары на текущий месяц.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-zinc-300">Сумма вклада (₽)</label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1 text-base tabular-nums rounded-full bg-white/[0.04] border-white/[0.08]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsDepositModalOpen(false)}
              className="rounded-full text-xs"
            >
              Отмена
            </Button>
            <Button 
              onClick={handleConfirmDeposit}
              className="rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-xs"
            >
              Подтвердить вклад
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
