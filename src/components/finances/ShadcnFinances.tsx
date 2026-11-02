import React, { useState } from 'react';
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
  X
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
  <div className="flex items-center px-1.5 py-0.5 rounded bg-white/[0.12] border border-white/[0.15] text-[9.5px] font-black tracking-widest text-white/90">
    MIR
  </div>
);

// Card visual definitions for Apple Wallet 2026 (Strictly without "(Belousova)")
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
    glowColor: 'rgba(16, 185, 129, 0.35)',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400/70',
    chipVariant: 'gold',
    accentText: 'text-emerald-400',
  },
  'cb-tbank': {
    name: 'T-BANK BLACK',
    holder: 'EGOR & ANYA (JOINT)',
    number: '•••• 5529',
    exp: '04/30',
    tag: 'Егор · Общий счет',
    gradient: 'from-[#27272a] via-[#18181b] to-[#09090b]',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    borderClass: 'border-amber-400/40 hover:border-amber-300/70',
    chipVariant: 'platinum',
    accentText: 'text-amber-400',
  },
  'cb-wb': {
    name: 'WB БАНК',
    holder: 'EGOR BELOUSOV',
    number: '•••• 8831',
    exp: '08/29',
    tag: 'Егор · WB Кошелек',
    gradient: 'from-[#581c87] via-[#3b0764] to-[#701a75]',
    glowColor: 'rgba(217, 70, 239, 0.35)',
    borderClass: 'border-fuchsia-500/40 hover:border-fuchsia-400/70',
    chipVariant: 'gold',
    accentText: 'text-fuchsia-400',
  },
  'cb-alfa': {
    name: 'АЛЬФА-БАНК',
    holder: 'EGOR BELOUSOV',
    number: '•••• 1409',
    exp: '02/29',
    tag: 'Егор · Альфа-Карта',
    gradient: 'from-[#7f1d1d] via-[#450a0a] to-[#991b1b]',
    glowColor: 'rgba(244, 63, 94, 0.35)',
    borderClass: 'border-rose-500/40 hover:border-rose-400/70',
    chipVariant: 'gold',
    accentText: 'text-rose-400',
  },
  'cb-gpb': {
    name: 'ГАЗПРОМБАНК',
    holder: 'EGOR BELOUSOV',
    number: '•••• 9276',
    exp: '12/28',
    tag: 'Егор · Сапфир & Акция',
    gradient: 'from-[#1e3a8a] via-[#0f172a] to-[#1d4ed8]',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    borderClass: 'border-blue-500/40 hover:border-blue-400/70',
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
    updateBudgetBalance,
    updateBudgetContributions,
    claimGpbCashback,
    gpbCashbackClaimed,
    toggleTaskCompletion,
    tasks
  } = useNexusStore();

  const [activeCardId, setActiveCardId] = useState<string>('cb-sber');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryPercent, setCustomCategoryPercent] = useState('5');
  const [isGpbModalOpen, setIsGpbModalOpen] = useState(false);
  const [gpbAmount, setGpbAmount] = useState('3000');
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
  const currentCard = cardsList.find(c => c.id === activeCardId) || cardsList[0];
  const currentTheme = CARD_METALLIC_THEMES[currentCard?.id || 'cb-sber'] || CARD_METALLIC_THEMES['cb-sber'];

  const handleConfirmGpbClaim = () => {
    const val = parseFloat(gpbAmount) || 3000;
    claimGpbCashback(val);

    // Find and complete the GPB task in TickTick
    const gpbTask = tasks.find(t => 
      t.id === '6ad8cacebf00032b8b10c84f' || 
      t.title.toLowerCase().includes('газпром')
    );
    if (gpbTask) {
      toggleTaskCompletion(gpbTask.id);
    }
    setIsGpbModalOpen(false);
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

  // Recharts demo data for budget dynamics
  const chartData = [
    { name: 'Июл', balance: 52000, utilities: 2100 },
    { name: 'Авг', balance: 64000, utilities: 1850 },
    { name: 'Сен', balance: 78000, utilities: 2400 },
    { name: 'Окт', balance: 80000, utilities: 1950 },
    { name: 'Ноя', balance: budgetCollected, utilities: 1685 },
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-[1600px] mx-auto w-full pb-8">
      {/* ── 1. JOINT BUDGET HEADER CARD ── */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b">
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
              className="text-xs"
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
              className="text-xs"
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
              className="text-xs"
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

      {/* ── 2. APPLE WALLET 2026: 5 LUXURY METALLIC CARDS OF EGOR & ANYA ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold leading-none tracking-tight">
                Apple Wallet 2026 · Карты Егора и Ани
              </h3>
              <Badge variant="secondary" className="text-[10px] font-mono-num font-bold">
                5 реальных карт
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Сбер (Аня), Т-Банк Black (Общий счет), WB Банк, Альфа-Банк и Газпромбанк с кэшбэком Ноября
            </p>
          </div>
          <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/30 gap-1.5 self-start sm:self-auto py-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Экономия по матрице кэшбэка: <strong className="font-mono-num font-semibold">~4 850 ₽/мес</strong></span>
          </Badge>
        </div>

        {/* 5 Cards Row (Realistic Metallic Apple Wallet Aesthetics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
          {cardsList.map((card) => {
            const theme = CARD_METALLIC_THEMES[card.id] || CARD_METALLIC_THEMES['cb-sber'];
            const isSelected = activeCardId === card.id;
            const isGpb = card.id === 'cb-gpb';

            return (
              <div key={card.id} className="flex flex-col gap-2">
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

                  {/* Card Top: Bank Name, Chip & Contactless */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-[12.5px] tracking-wider text-white drop-shadow-sm font-sans">
                        {theme.name}
                      </span>
                      <span className="text-[9.5px] text-white/75 font-mono tracking-tight">
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
                    <div className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9.5px] font-mono-num text-zinc-300">
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
                      <div className="text-[7.5px] uppercase tracking-widest text-white/60 font-mono">VALID</div>
                      <div className="font-mono text-[9.5px] text-white/90">{theme.exp}</div>
                    </div>
                  </div>
                </div>

                {/* Dedicated Action Button UNDER Gazprombank card (Zero overlap with bank title or MIR!) */}
                {isGpb && (
                  <div className="w-full">
                    {gpbCashbackClaimed ? (
                      <div className="w-full py-1.5 px-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Кэшбэк ГПБ получен (+3 000 ₽)</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsGpbModalOpen(true);
                        }}
                        className="w-full h-8 text-xs font-semibold text-amber-300 border-amber-400/40 hover:bg-amber-400/10 gap-1.5 bg-amber-500/10 cursor-pointer shadow-xs"
                      >
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span>⚡ Забрать кэшбэк ГПБ (до 25-го)</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Card Inspector & Category Manager */}
        {currentCard && (
          <div className="rounded-xl border bg-card text-card-foreground p-4 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Категории повышенного кэшбэка на {currentCard.activeMonth}: {currentTheme.name} ({currentTheme.tag})
                </h4>
              </div>

              {/* Status Pill */}
              <Button
                variant={currentCard.claimed ? "outline" : "default"}
                size="sm"
                onClick={() => toggleCashbackClaimed(currentCard.id)}
                className={`h-7 text-xs gap-1.5 cursor-pointer ${
                  currentCard.claimed 
                    ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' 
                    : 'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>{currentCard.claimed ? 'Категории активированы в банке ✓' : 'Выбрать категории в приложении'}</span>
              </Button>
            </div>

            {/* Active Categories Pills for this card */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">Активные категории карты (нажмите ✕ для удаления):</div>
              <div className="flex flex-wrap gap-2">
                {currentCard.categories.map((cat, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="h-7 pl-2.5 pr-1.5 text-xs font-medium gap-1.5 bg-muted/60 hover:bg-muted/90"
                  >
                    <span>{cat.category}</span>
                    <span className="font-mono-num font-bold text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                      {cat.percent}%
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCashbackCategory(currentCard.id, idx)}
                      className="ml-0.5 rounded-full hover:bg-white/10 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Удалить категорию"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quick Add Popular Bank Categories */}
            <div className="pt-2 border-t space-y-2">
              <div className="text-xs text-muted-foreground">Добавить в 1 клик популярную категорию банка:</div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_QUICK_CATEGORIES.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addCashbackCategory(currentCard.id, preset.name, preset.percent)}
                    className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Plus className="h-2.5 w-2.5" />
                    <span>{preset.name}</span>
                    <span className="text-amber-400 font-mono-num">{preset.percent}%</span>
                  </Button>
                ))}
              </div>

              {/* Custom Category Input */}
              <div className="flex items-center gap-2 pt-2 max-w-md">
                <Input
                  placeholder="Своя категория..."
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  className="h-7 text-xs bg-muted/20"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={customCategoryPercent}
                    onChange={(e) => setCustomCategoryPercent(e.target.value)}
                    className="h-7 w-14 text-xs font-mono text-center bg-muted/20"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
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
                    }
                  }}
                  className="h-7 px-3 text-xs cursor-pointer"
                >
                  Добавить
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. ЖКХ МОСКВЫ И СЧЕТА TABLE ── */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
        <div className="p-5 border-b">
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
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs">
                  Показания переданы (день: 1420 / ночь: 680)
                </Badge>
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
                <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs">
                  К оплате до 10-го числа
                </Badge>
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
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6">
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
                  borderColor: '#27272a', 
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

      {/* ── DIALOG 1: CLAIM GPB CASHBACK ── */}
      <Dialog open={isGpbModalOpen} onOpenChange={setIsGpbModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>Забрать кэшбэк Газпромбанк</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Акция 25% по карте «Сапфир». Полученная сумма пополнит совместный баланс пары, а задача в TickTick будет автоматически выполнена.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Сумма начисленного кэшбэка (₽)
              </label>
              <Input
                type="number"
                value={gpbAmount}
                onChange={(e) => setGpbAmount(e.target.value)}
                className="mt-1 font-mono text-base"
              />
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground space-y-1">
              <p>• Начисление поступит на совместный счет пары.</p>
              <p>• Задача «Получить кэшбек с газпромбанка» закроется в TickTick.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGpbModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleConfirmGpbClaim} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold">
              Зачислить в бюджет
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG 2: DEPOSIT CONTRIBUTION ── */}
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
