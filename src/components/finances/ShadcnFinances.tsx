import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Check, 
  Receipt, 
  Zap, 
  Droplet, 
  Flame, 
  Wifi, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  X,
  Trash2,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
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
const ContactlessIcon: React.FC<{ className?: string }> = ({ className = 'text-white/70' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8.5 16.5C9.5 15.5 10 14 10 12.5C10 11 9.5 9.5 8.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 19C13.5 17.5 14.5 15 14.5 12.5C14.5 10 13.5 7.5 12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M15.5 21.5C17.5 19.5 19 16 19 12.5C19 9 17.5 5.5 15.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const EMVChipIcon: React.FC<{ variant?: 'gold' | 'platinum' }> = ({ variant = 'gold' }) => (
  <svg width="30" height="22" viewBox="0 0 34 26" fill="none" className="shrink-0 drop-shadow-md">
    <rect x="0.5" y="0.5" width="33" height="25" rx="4" fill={variant === 'gold' ? '#d97706' : '#52525b'} stroke={variant === 'gold' ? '#fbbf24' : '#a1a1aa'} strokeWidth="1" />
    <rect x="1.5" y="1.5" width="31" height="23" rx="3.5" fill={variant === 'gold' ? '#f59e0b' : '#71717a'} />
    <path d="M0 8.5H12M0 17.5H12M22 8.5H34M22 17.5H34M12 4V22M22 4V22" stroke={variant === 'gold' ? '#92400e' : '#27272a'} strokeWidth="1" opacity="0.9" />
    <rect x="12" y="8.5" width="10" height="9" rx="1.5" stroke={variant === 'gold' ? '#92400e' : '#27272a'} strokeWidth="1" fill={variant === 'gold' ? '#b45309' : '#3f3f46'} opacity="0.75" />
  </svg>
);

const MirBadge: React.FC = () => (
  <div className="flex items-center px-1.5 py-0.5 rounded bg-white/[0.12] text-[9.5px] font-black tracking-widest text-white/90">
    MIR
  </div>
);

// 6 Metallic Gradient Presets for Apple Wallet 2026
export const CARD_GRADIENT_PRESETS: Record<CardGradientPreset, {
  name: string;
  gradient: string;
  glowColor: string;
  borderClass: string;
  chipVariant: 'gold' | 'platinum';
  accentText: string;
  badgeBg: string;
}> = {
  emerald: {
    name: 'Изумруд (Сбер)',
    gradient: 'from-[#064e3b] via-[#047857] to-[#022c22]',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400/70',
    chipVariant: 'gold',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500',
  },
  titanium: {
    name: 'Титан Black (Т-Банк)',
    gradient: 'from-[#27272a] via-[#18181b] to-[#09090b]',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    borderClass: 'border-amber-400/40 hover:border-amber-300/70',
    chipVariant: 'platinum',
    accentText: 'text-amber-400',
    badgeBg: 'bg-zinc-800',
  },
  violet: {
    name: 'Фиолетовый (WB Банк)',
    gradient: 'from-[#581c87] via-[#3b0764] to-[#701a75]',
    glowColor: 'rgba(217, 70, 239, 0.35)',
    borderClass: 'border-fuchsia-500/40 hover:border-fuchsia-400/70',
    chipVariant: 'gold',
    accentText: 'text-fuchsia-400',
    badgeBg: 'bg-purple-600',
  },
  ruby: {
    name: 'Рубин (Альфа-Банк)',
    gradient: 'from-[#7f1d1d] via-[#450a0a] to-[#991b1b]',
    glowColor: 'rgba(244, 63, 94, 0.35)',
    borderClass: 'border-rose-500/40 hover:border-rose-400/70',
    chipVariant: 'gold',
    accentText: 'text-rose-400',
    badgeBg: 'bg-rose-600',
  },
  sapphire: {
    name: 'Сапфир (Газпромбанк)',
    gradient: 'from-[#1e3a8a] via-[#0f172a] to-[#1d4ed8]',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    borderClass: 'border-blue-500/40 hover:border-blue-400/70',
    chipVariant: 'gold',
    accentText: 'text-blue-400',
    badgeBg: 'bg-blue-600',
  },
  amber: {
    name: 'Янтарь / Золото',
    gradient: 'from-[#78350f] via-[#92400e] to-[#451a03]',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    borderClass: 'border-amber-500/40 hover:border-amber-400/70',
    chipVariant: 'gold',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-600',
  },
};

// Dynamic Card Metadata Resolvers (Zero "BELOUSOV", strictly EGOR or ANYA)
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
  if (card.id === 'cb-tbank') return 'EGOR';
  if (card.cardHolder && card.cardHolder !== 'EGOR & ANYA') return card.cardHolder;
  if (card.user === 'anya') return 'ANYA';
  return 'EGOR';
};

const getCardDigits = (card: CashbackCard): string => {
  if (card.digits) {
    const clean = card.digits.replace(/\D/g, '');
    return `•••• ${clean ? clean.slice(-4) : '0000'}`;
  }
  if (card.id === 'cb-sber') return '•••• 7714';
  if (card.id === 'cb-tbank') return '•••• 5529';
  if (card.id === 'cb-wb') return '•••• 8831';
  if (card.id === 'cb-alfa') return '•••• 1409';
  if (card.id === 'cb-gpb') return '•••• 9276';
  return '•••• 0000';
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
    transactions, 
    utilityBills, 
    cashbackCards,
    addCashbackCategory,
    removeCashbackCategory,
    toggleCashbackClaimed,
    addCashbackCard,
    updateCashbackCard,
    deleteCashbackCard,
    claimCashbackForCard,
    updateBudgetBalance,
    updateBudgetContributions,
    toggleTaskCompletion,
    tasks
  } = useNexusStore();

  const [activeCardId, setActiveCardId] = useState<string>('cb-sber');
  const [cashbackDepositAmount, setCashbackDepositAmount] = useState('1500');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryPercent, setCustomCategoryPercent] = useState('5');
  
  // Card modals
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCardCashbackModalOpen, setIsCardCashbackModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardFormBankName, setCardFormBankName] = useState('');
  const [cardFormUser, setCardFormUser] = useState<'egor' | 'anya' | 'joint'>('joint');
  const [cardFormPreset, setCardFormPreset] = useState<CardGradientPreset>('sapphire');
  const [cardFormDigits, setCardFormDigits] = useState('');
  const [cardFormSpecial, setCardFormSpecial] = useState('');

  // Budget deposit modal for Egor / Anya
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositUser, setDepositUser] = useState<'egor' | 'anya'>('egor');
  const [depositAmount, setDepositAmount] = useState('10000');

  const budgetCollected = budget.currentBalance;
  const budgetTarget = budget.totalTarget || 80000;
  const budgetProgress = Math.min(100, Math.round((budgetCollected / budgetTarget) * 100));

  const egorTarget = 40000;
  const anyaTarget = 40000;
  const egorProgress = Math.min(100, Math.round((budget.egorContribution / egorTarget) * 100));
  const anyaProgress = Math.min(100, Math.round((budget.anyaContribution / anyaTarget) * 100));

  const cardsList = (cashbackCards && cashbackCards.length > 0) ? cashbackCards : initialCashbackCards;
  const currentCard = cardsList.find(c => c.id === activeCardId) || cardsList[0] || initialCashbackCards[0];
  const currentTheme = getCardTheme(currentCard);

  // Recharts data for budget dynamics
  const chartData = [
    { name: 'Июл', balance: 52000, utilities: 2100 },
    { name: 'Авг', balance: 64000, utilities: 1850 },
    { name: 'Сен', balance: 78000, utilities: 2400 },
    { name: 'Окт', balance: 80000, utilities: 1950 },
    { name: 'Ноя', balance: budgetCollected, utilities: 1685 },
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
    setCardFormUser('joint');
    setCardFormPreset('sapphire');
    setCardFormDigits('');
    setCardFormSpecial('');
    setIsCardModalOpen(true);
  };

  const handleOpenEditCard = (card: CashbackCard) => {
    setEditingCardId(card.id);
    setCardFormBankName(card.bankName);
    setCardFormUser(card.user || 'joint');
    setCardFormPreset(card.gradientPreset || 'sapphire');
    setCardFormDigits(card.digits ? card.digits.replace(/\D/g, '').slice(-4) : '');
    setCardFormSpecial(card.specialFeature || '');
    setIsCardModalOpen(true);
  };

  const handleSaveCardForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormBankName.trim()) return;

    const digitsClean = cardFormDigits.replace(/\D/g, '').slice(-4) || '0000';
    const holder = cardFormUser === 'anya' ? 'ANYA' : cardFormUser === 'egor' ? 'EGOR' : 'EGOR & ANYA';
    const userLabel = cardFormUser === 'anya' ? 'Аня' : cardFormUser === 'egor' ? 'Егор' : 'Общий счет';
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
    if (depositUser === 'egor') {
      updateBudgetContributions(budget.egorContribution + val, budget.anyaContribution, budgetTarget);
    } else {
      updateBudgetContributions(budget.egorContribution, budget.anyaContribution + val, budgetTarget);
    }
    setIsDepositModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-[1600px] mx-auto w-full pb-8">
      {/* ── 1. JOINT BUDGET HEADER CARD ── */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Совместный бюджет пары
              </span>
              <Badge variant="secondary" className="text-xs">
                Ноябрь 2026
              </Badge>
            </div>
            <div className="text-3xl font-bold tracking-tight mt-1 font-mono-num">
              {budgetCollected.toLocaleString('ru-RU')} ₽
              <span className="text-base font-normal text-muted-foreground ml-2">
                / {budgetTarget.toLocaleString('ru-RU')} ₽ цель
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Взносы: 10 и 25 числа каждого месяца. Аренда, супермаркеты, ЖКХ и быт.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDepositUser('egor');
                setIsDepositModalOpen(true);
              }}
              className="text-xs cursor-pointer"
            >
              + Внести вклад Егора
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDepositUser('anya');
                setIsDepositModalOpen(true);
              }}
              className="text-xs cursor-pointer"
            >
              + Внести вклад Ани
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const amount = prompt('Сумма расхода (₽):', '1500');
                if (amount) {
                  const val = parseFloat(amount);
                  if (val > 0) updateBudgetBalance(budgetCollected - val);
                }
              }}
              className="text-xs cursor-pointer"
            >
              Записать операцию
            </Button>
          </div>
        </div>

        {/* Contributions breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Вклад Егора</span>
              <span className="font-mono-num font-medium">
                {budget.egorContribution.toLocaleString('ru-RU')} ₽ / {egorTarget.toLocaleString('ru-RU')} ₽ ({egorProgress}%)
              </span>
            </div>
            <Progress value={egorProgress} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Аренда, интернет, техника, сантехника, Леруа Мерлен
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Вклад Ани</span>
              <span className="font-mono-num font-medium">
                {budget.anyaContribution.toLocaleString('ru-RU')} ₽ / {anyaTarget.toLocaleString('ru-RU')} ₽ ({anyaProgress}%)
              </span>
            </div>
            <Progress value={anyaProgress} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Совместные продукты (ВкусВилл по Сберу 5%), уют, текстиль, посуда
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. APPLE WALLET 2026: DYNAMIC METALLIC CARDS WITH FULL CRUD ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold leading-none tracking-tight">
                Apple Wallet 2026 · Карты Егора и Ани
              </h3>
              <Badge variant="secondary" className="text-[10px] font-mono-num font-bold">
                {cardsList.length} {cardsList.length === 1 ? 'карта' : cardsList.length < 5 ? 'карты' : 'карт'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Реальные карты с повышенным кэшбэком месяца. Кликните для выбора и управления.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddCard}
              className="h-8 px-3 rounded-full text-xs font-semibold gap-1.5 cursor-pointer bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 transition flex items-center"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" />
              <span>+ Добавить карту</span>
            </button>
            <div className="flex items-center text-xs text-amber-400 bg-amber-500/10 gap-1.5 py-1 px-2.5 rounded-full">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Экономия: <strong className="font-mono-num font-semibold">~4 850 ₽/мес</strong></span>
            </div>
          </div>
        </div>

        {/* Dynamic Cards Grid (100% Uniform, Zero Hardcoding, Zero "BELOUSOV") */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
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
                  style={{
                    boxShadow: isSelected 
                      ? `0 12px 30px ${theme.glowColor}, inset 0 1px 0 rgba(255,255,255,0.3)` 
                      : '0 4px 16px rgba(0,0,0,0.35)',
                  }}
                  className={`relative aspect-[1.586/1] rounded-[16px] p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 overflow-hidden border bg-gradient-to-br ${theme.gradient} ${theme.borderClass} ${
                    isSelected ? 'scale-[1.02] ring-2 ring-white/40 z-10' : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'
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
                      <span className="font-bold text-[12.5px] tracking-wider text-white drop-shadow-sm font-sans truncate">
                        {card.bankName.toUpperCase()}
                      </span>
                      <span className="text-[9.5px] text-white/75 font-mono tracking-tight truncate">
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
                    <div className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full text-[9.5px] font-mono-num text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{card.categories?.length || 0} категорий</span>
                    </div>
                  </div>

                  {/* Card Bottom: Number, Holder & Expiry */}
                  <div className="relative z-10 flex items-end justify-between text-white drop-shadow-sm">
                    <div>
                      <div className="font-mono text-[11px] tracking-wider text-white/90">
                        {digits}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-white/85 font-medium truncate max-w-[120px]">
                        {holder}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[7.5px] uppercase tracking-widest text-white/60 font-mono">VALID</div>
                      <div className="font-mono text-[9.5px] text-white/90">12/28</div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Icons on Card Hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditCard(card);
                    }}
                    className="p-1 rounded bg-black/70 hover:bg-black text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Редактировать карту"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  {cardsList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="p-1 rounded bg-black/70 hover:bg-red-950 text-red-300 hover:text-red-200 transition-colors cursor-pointer"
                      title="Удалить карту"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Card Minimalist Inspector (Zero Inner Borders) */}
        {currentCard && (
          <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl p-4 space-y-3 shadow-xs">
            {/* Row 1: Title and quiet text actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-medium text-zinc-100">{currentCard.bankName}</span>
                <span className="text-xs text-zinc-400">· {getCardTag(currentCard)}</span>
                <span className="text-[11px] text-zinc-500 ml-1">● Активна</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCardCashbackModalOpen(true)}
                  className="bg-white/[0.06] hover:bg-white/[0.1] text-xs text-zinc-200 px-3 py-1.5 rounded-full transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>+ Зачислить кэшбэк</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditCard(currentCard)}
                  className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-full transition cursor-pointer"
                  title="Редактировать карту"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                {cardsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(currentCard.id)}
                    className="text-zinc-500 hover:text-red-400 p-1.5 rounded-full transition cursor-pointer"
                    title="Удалить карту"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Flat category capsules + single + Добавить button */}
            <div className="flex items-center gap-2 flex-wrap">
              {currentCard.categories && currentCard.categories.length > 0 ? (
                currentCard.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] text-xs text-zinc-200"
                  >
                    <span>{cat.category}</span>
                    <span className="text-emerald-400 font-semibold">{cat.percent}%</span>
                    <button
                      type="button"
                      onClick={() => removeCashbackCategory(currentCard.id, idx)}
                      className="text-zinc-500 hover:text-zinc-200 ml-0.5 p-0.5 cursor-pointer leading-none"
                      title="Удалить категорию"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500 italic">Категории не выбраны</span>
              )}

              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Добавить</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CARD ADD / EDIT MODAL DIALOG ── */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingCardId ? 'Редактировать банковскую карту' : 'Добавить новую банковскую карту'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Карта появится в Apple Wallet 2026 с металлическим градиентом и категориями кэшбэка
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCardForm} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Название банка
              </label>
              <Input
                required
                placeholder="например: Т-Банк, Сбер, ВТБ, WB Банк"
                value={cardFormBankName}
                onChange={(e) => setCardFormBankName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Владелец карты
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['egor', 'anya', 'joint'] as const).map((userKey) => (
                  <button
                    key={userKey}
                    type="button"
                    onClick={() => setCardFormUser(userKey)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      cardFormUser === userKey
                        ? 'bg-white/[0.15] text-white font-bold shadow-xs'
                        : 'bg-white/[0.04] text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {userKey === 'egor' ? 'Егор' : userKey === 'anya' ? 'Аня' : 'Общая (Пара)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Цветовая тема градиента (6 пресетов Apple Wallet)
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
                      className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                        isPresetActive
                          ? 'bg-white/[0.15] text-white font-semibold'
                          : 'bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]'
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
                <label className="block text-xs font-medium text-foreground mb-1">
                  Последние 4 цифры
                </label>
                <Input
                  maxLength={4}
                  placeholder="7714"
                  value={cardFormDigits}
                  onChange={(e) => setCardFormDigits(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Подпись / Особенность
                </label>
                <Input
                  placeholder="например: Егор · Т-Банк Black"
                  value={cardFormSpecial}
                  onChange={(e) => setCardFormSpecial(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCardModalOpen(false)}
                className="text-xs"
              >
                Отмена
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                {editingCardId ? 'Сохранить изменения' : 'Добавить карту'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── CARD CASHBACK CLAIM MODAL (Zero Inner Borders) ── */}
      <Dialog open={isCardCashbackModalOpen} onOpenChange={setIsCardCashbackModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Зачислить кэшбэк: {currentCard?.bankName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Пополнение общего бюджета накопленным кэшбэком по карте
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {matchingTasks.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 space-y-2">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Найдена задача в TickTick:</span>
                </div>
                {matchingTasks.map((matchedTask) => (
                  <div key={matchedTask.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-200 truncate">{matchedTask.title}</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        const match = matchedTask.title.match(/(\d+[\s\d]*)\s*₽/);
                        const amt = match ? parseInt(match[1].replace(/\s/g, ''), 10) : (parseFloat(cashbackDepositAmount) || 1500);
                        toggleTaskCompletion(matchedTask.id);
                        claimCashbackForCard(currentCard.id, amt, matchedTask.title);
                        setIsCardCashbackModalOpen(false);
                      }}
                      className="h-7 text-[11px] bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold cursor-pointer shrink-0"
                    >
                      Выполнить и зачислить
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">Сумма кэшбэка (₽)</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="1500"
                  value={cashbackDepositAmount}
                  onChange={(e) => setCashbackDepositAmount(e.target.value)}
                  className="font-mono font-semibold pr-8"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">₽</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {['500', '1000', '1500', '3000'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCashbackDepositAmount(preset)}
                  className={`flex-1 py-1 text-xs font-mono rounded-md transition cursor-pointer ${
                    cashbackDepositAmount === preset
                      ? 'bg-white/[0.12] text-white font-semibold'
                      : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]'
                  }`}
                >
                  {preset} ₽
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCardCashbackModalOpen(false)}
              className="text-xs"
            >
              Отмена
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                handleClaimUniversalCashback();
                setIsCardCashbackModalOpen(false);
              }}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer gap-1.5"
            >
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>Зачислить в бюджет</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CARD ADD CATEGORY MODAL (Zero Inner Borders) ── */}
      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Добавить категорию: {currentCard?.bankName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Выберите популярную категорию банка или укажите свою
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-foreground">Популярные категории:</label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_QUICK_CATEGORIES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      addCashbackCategory(currentCard.id, preset.name, preset.percent);
                      setIsAddCategoryModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-200 transition cursor-pointer"
                  >
                    <span>{preset.name}</span>
                    <span className="text-emerald-400 font-semibold">{preset.percent}%</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-foreground">Своя категория:</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Название категории..."
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  className="h-8 text-xs flex-1"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={customCategoryPercent}
                    onChange={(e) => setCustomCategoryPercent(e.target.value)}
                    className="h-8 w-14 text-xs font-mono text-center"
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
                  className="h-8 px-3 text-xs cursor-pointer bg-zinc-100 text-zinc-950 hover:bg-white font-medium"
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
              className="text-xs"
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 3. ЖКХ МОСКВЫ И СЧЕТА TABLE ── */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl shadow-xs">
        <div className="p-5">
          <h3 className="text-base font-semibold leading-none">
            ЖКХ Москвы и регулярные счета квартиры
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Мосэнергосбыт, управляющая компания Домиленд, ЕПД mos.ru и интернет
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Услуга / Поставщик</TableHead>
              <TableHead>Лицевой счет / Сервис</TableHead>
              <TableHead>Период и статус</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead className="text-right w-[140px]">Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Мосэнергосбыт</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                ЛС: 84392-104-55 (lk.mosenergosbyt.ru)
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                  Показания переданы (день: 1420 / ночь: 680)
                </span>
              </TableCell>
              <TableCell className="text-right font-mono-num text-xs">0 ₽</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alert('Показания за текущий месяц уже успешно переданы!')}
                  className="h-7 text-xs"
                >
                  Квитанция
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-sky-400" />
                  <span>Домиленд (УК)</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                Вода гор, хол, отопление, комм. услуги
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                  К оплате до 10-го числа
                </span>
              </TableCell>
              <TableCell className="text-right font-mono-num font-semibold text-xs text-amber-400">
                1 685 ₽
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    alert('Открытие ЛК Домиленд для оплаты...');
                    window.open('https://domiland.ru', '_blank');
                  }}
                  className="h-7 text-xs"
                >
                  Оплатить
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-purple-400" />
                  <span>ЕПД mos.ru</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                Кап.ремонт, ТКО (вывоз мусора)
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  Оплачено (сентябрь 779,86 ₽)
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono-num text-xs">0 ₽</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://www.mos.ru', '_blank')}
                  className="h-7 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  mos.ru
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-emerald-400" />
                  <span>Wi-Fi (Формула Связи)</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                Личный кабинет lk.formula-start.ru
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  Оплачено до 15 ноября (550 ₽/мес)
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono-num text-xs">550 ₽</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('http://lk.formula-start.ru', '_blank')}
                  className="h-7 text-xs"
                >
                  ЛК Wi-Fi
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* ── 4. RECHARTS DYNAMICS GRAPH ── */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl shadow-xs p-6">
        <h3 className="text-base font-semibold leading-none">
          Динамика бюджета и расходов
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Соотношение баланса и коммунальных расходов по месяцам
        </p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: 'none', 
                  borderRadius: '8px', 
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

      {/* ── DIALOG: DEPOSIT CONTRIBUTION ── */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Внести вклад в бюджет: {depositUser === 'egor' ? 'Егор' : 'Аня'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Пополнение общего фонда пары на текущий месяц.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Сумма вклада (₽)</label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1 font-mono text-base"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleConfirmDeposit}>
              Подтвердить вклад
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
