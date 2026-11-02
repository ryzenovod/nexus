import React, { useState } from 'react';
import { 
  CreditCard, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  ArrowRight, 
  Percent, 
  Gift, 
  Calculator,
  Flame,
  Store
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';

export const CashbackAdvisor: React.FC = () => {
  const { cashbackCards, toggleCashbackClaimed, tasks, toggleTaskCompletion } = useNexusStore();

  const [purchaseQuery, setPurchaseQuery] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('2500');

  // Intelligent card recommendation algorithm
  const getRecommendation = (query: string, amount: number) => {
    const q = query.toLowerCase();

    if (q.includes('wb') || q.includes('вайлдбер') || q.includes('wildberries') || q.includes('посуда') || q.includes('скатерть')) {
      const discount = Math.round(amount * 0.07);
      return {
        cardName: 'WB Банк Егора (Wildberries Кошелек)',
        user: 'Егор',
        percent: 7,
        savings: discount,
        badge: 'Скидка WB Кошелька -7%',
        advice: 'Оплачиваем через WB Банк Егора: прямая скидка 7% списывается сразу в корзине!',
        color: '#9333ea',
      };
    }

    if (q.includes('леруа') || q.includes('ремонт') || q.includes('герметик') || q.includes('плинтус') || q.includes('клей') || q.includes('obi')) {
      const cashback = Math.round(amount * 0.06);
      return {
        cardName: 'Т-Банк (Black) Егора',
        user: 'Егор',
        percent: 6,
        savings: cashback,
        badge: 'Кэшбэк 6% Дом и Ремонт',
        advice: 'Используем Т-Банк Егора: повышенная категория 6% на товары для дома и стройматериалы.',
        color: '#eab308',
      };
    }

    if (q.includes('самокат') || q.includes('доставка') || q.includes('купер') || q.includes('сбермаркет')) {
      const cashback = Math.round(amount * 0.10);
      return {
        cardName: 'Сбер (СберПрайм) Ани',
        user: 'Аня',
        percent: 10,
        savings: cashback,
        badge: 'Кэшбэк 10% Доставка',
        advice: 'Оплачиваем картой Сбер Ани: активна подписка СберПрайм с 10% в Самокате и СберМаркете!',
        color: '#22c55e',
      };
    }

    if (q.includes('вкусвилл') || q.includes('продукты') || q.includes('перекресток') || q.includes('еда')) {
      const cashback = Math.round(amount * 0.05);
      return {
        cardName: 'Сбер Ани или Газпромбанк Егора',
        user: 'Аня / Егор',
        percent: 5,
        savings: cashback,
        badge: 'Кэшбэк 5% Супермаркеты',
        advice: 'Карта Сбер Ани (бонусы Спасибо) или Газпромбанк Егора: обе дают 5% на продукты!',
        color: '#22c55e',
      };
    }

    if (q.includes('золотое яблоко') || q.includes('косметика') || q.includes('кафе') || q.includes('ресторан')) {
      const cashback = Math.round(amount * 0.05);
      return {
        cardName: 'Альфа-Банк Егора',
        user: 'Егор',
        percent: 5,
        savings: cashback,
        badge: 'Кэшбэк 5% Кафе / Красота',
        advice: 'Альфа-Банк Егора: 5% на косметику в Золотом Яблоке и рестораны.',
        color: '#ef4444',
      };
    }

    // Default
    return {
      cardName: 'Т-Банк Егора (Совместный счет)',
      user: 'Вместе',
      percent: 1,
      savings: Math.round(amount * 0.01),
      badge: '1% на все покупки',
      advice: 'Используем совместный счет Т-Банка с 1% базового кэшбэка.',
      color: '#eab308',
    };
  };

  const parsedAmount = parseFloat(purchaseAmount) || 0;
  const currentRecommendation = getRecommendation(purchaseQuery, parsedAmount);

  const gpbTask = tasks.find((t) => t.id === 'task-fin-4');

  return (
    <div className="space-y-4">
      {/* 1. INTERACTIVE ADVISOR SEARCH & CALCULATOR */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#130f24] to-[#0f111a] p-4 sm:p-5 shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <span>Cyber-Cat Cashback Advisor</span>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono text-purple-300 border border-purple-500/30">
                  AI Сплит карт
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Введите покупку — система выберет лучшую карту Егора или Ани с максимальной выгодой!
              </p>
            </div>
          </div>

          {/* Quick task action: Gazprombank Cashback */}
          {gpbTask && (
            <button
              type="button"
              onClick={() => toggleTaskCompletion(gpbTask.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                gpbTask.completed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{gpbTask.completed ? 'Кэшбэк ГПБ забран ✓' : 'Забрать кэшбэк ГПБ!'}</span>
            </button>
          )}
        </div>

        {/* Search Inputs */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Что покупаем?
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
              <input
                type="text"
                value={purchaseQuery}
                onChange={(e) => setPurchaseQuery(e.target.value)}
                placeholder="Полка на WB, ВкусВилл, Леруа Мерлен, Золотое Яблоко, Самокат..."
                className="w-full rounded-xl border border-white/10 bg-black/50 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Сумма покупки (₽)
            </label>
            <div className="relative">
              <input
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                placeholder="2500"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/60 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Recommendation Result Card */}
        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm text-white shadow-md"
              style={{ backgroundColor: currentRecommendation.color }}
            >
              {currentRecommendation.percent}%
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {currentRecommendation.cardName}
                </span>
                <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
                  {currentRecommendation.badge}
                </span>
              </div>
              <p className="text-xs text-purple-200/90 mt-0.5">
                {currentRecommendation.advice}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] uppercase font-mono text-zinc-400">
              Экономия / Кэшбэк
            </span>
            <span className="font-mono text-base font-extrabold text-emerald-400">
              +{currentRecommendation.savings.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* 2. BANK CARDS MATRIX (EGOR & ANYA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {cashbackCards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-white/10 bg-[#0f1117]/80 backdrop-blur-xl p-3.5 space-y-3 relative overflow-hidden group hover:border-white/20 transition-all"
          >
            {/* Top Color Strip */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: card.bankColor }}
            />

            {/* Bank Header */}
            <div className="flex items-start justify-between gap-2 pt-1">
              <div>
                <h4 className="text-xs font-bold text-white">
                  {card.bankName}
                </h4>
                <span className="text-[10px] font-mono text-zinc-400">
                  {card.user === 'egor' ? 'Карта Егора' : 'Карта Ани'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleCashbackClaimed(card.id)}
                className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold border transition-colors ${
                  card.claimed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {card.claimed ? 'Активен ✓' : 'Забрать!'}
              </button>
            </div>

            {/* Special Feature */}
            {card.specialFeature && (
              <div className="rounded bg-white/[0.04] p-1.5 text-[10px] text-purple-300/90 border border-white/[0.04] leading-tight">
                {card.specialFeature}
              </div>
            )}

            {/* Categories */}
            <div className="space-y-1">
              {card.categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded bg-black/40 px-2 py-1 text-[11px] border border-white/[0.03]"
                >
                  <span className="text-zinc-300 truncate max-w-[130px]" title={cat.category}>
                    {cat.category}
                  </span>
                  <span className="font-mono font-bold text-emerald-400 shrink-0">
                    {cat.percent}%
                  </span>
                </div>
              ))}
            </div>

            {card.actionRequired && !card.claimed && (
              <div className="rounded bg-amber-500/10 border border-amber-500/20 p-1.5 text-[10px] text-amber-300">
                {card.actionRequired}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
