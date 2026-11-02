import React, { useState } from 'react';
import { 
  Sparkles, 
  Store, 
  Check, 
  ChevronRight, 
  CreditCard 
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';

export const CashbackAdvisor: React.FC = () => {
  const { cashbackCards, toggleCashbackClaimed, tasks, toggleTaskCompletion } = useNexusStore();
  const [purchaseQuery, setPurchaseQuery] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('2000');

  // Interactive AI cashback search logic
  const getRecommendation = (query: string, amount: number) => {
    const q = query.toLowerCase().trim();

    if (!q) {
      return {
        cardName: 'T-Bank Black (Егор)',
        user: 'egor',
        percent: 1,
        advice: 'Базовый кэшбэк 1% на любые покупки без повышенной категории.',
        savings: Math.round(amount * 0.01),
        color: '#ffdd2d',
        badge: 'По умолчанию',
      };
    }

    if (q.includes('вкусвилл') || q.includes('еда') || q.includes('продукты') || q.includes('молоко') || q.includes('сыр')) {
      return {
        cardName: 'Сбербанк (Аня)',
        user: 'anya',
        percent: 5,
        advice: 'Аня оплачивает во ВкусВилле — действует повышенный кэшбэк 5% бонусами Спасибо!',
        savings: Math.round(amount * 0.05),
        color: '#22c55e',
        badge: 'Супермаркеты 5%',
      };
    }

    if (q.includes('леруа') || q.includes('петрович') || q.includes('оби') || q.includes('ремонт') || q.includes('герметик') || q.includes('затирка')) {
      return {
        cardName: 'T-Bank Black (Егор)',
        user: 'egor',
        percent: 5,
        advice: 'Егор оплачивает товары для ремонта квартиры — категория «Дом и ремонт» 5%!',
        savings: Math.round(amount * 0.05),
        color: '#ffdd2d',
        badge: 'Дом и ремонт 5%',
      };
    }

    if (q.includes('аптека') || q.includes('лекарства') || q.includes('ригла') || q.includes('еаптека')) {
      return {
        cardName: 'Альфа-Банк (Егор)',
        user: 'egor',
        percent: 5,
        advice: 'Покупайте в аптеках по карте Альфа-Банка Егора с кэшбэком 5%.',
        savings: Math.round(amount * 0.05),
        color: '#ef4444',
        badge: 'Аптеки 5%',
      };
    }

    if (q.includes('такси') || q.includes('яндекс') || q.includes('каршеринг') || q.includes('ситидрайв') || q.includes('метро')) {
      return {
        cardName: 'Яндекс Пэй (Аня)',
        user: 'anya',
        percent: 10,
        advice: 'Такси и транспорт выгоднее оплачивать через Яндекс Пэй Ани — до 10% баллами Плюса.',
        savings: Math.round(amount * 0.1),
        color: '#ec4899',
        badge: 'Транспорт 10%',
      };
    }

    if (q.includes('гпб') || q.includes('газпром') || q.includes('акция') || q.includes('компенсация')) {
      return {
        cardName: 'Газпромбанк Привилегии (Егор)',
        user: 'egor',
        percent: 25,
        advice: 'Внимание! До 25 числа нужно нажать «Забрать кэшбэк» в приложении ГПБ, иначе сгорит!',
        savings: 5000,
        color: '#3b82f6',
        badge: 'Акция месяца 25%',
      };
    }

    return {
      cardName: 'T-Bank Black (Егор)',
      user: 'egor',
      percent: 1,
      advice: 'Прямых категорий не найдено. Платите T-Bank Black (1% базовый кэшбэк).',
      savings: Math.round(amount * 0.01),
      color: '#ffdd2d',
      badge: '1% на всё',
    };
  };

  const parsedAmount = parseFloat(purchaseAmount) || 0;
  const currentRecommendation = getRecommendation(purchaseQuery, parsedAmount);

  const gpbTask = tasks.find((t) => t.id === 'task-fin-4');

  return (
    <div className="space-y-3">
      {/* 1. INTERACTIVE ADVISOR SEARCH & CALCULATOR */}
      <div className="rounded-xl border border-white/[0.07] bg-[rgba(18,18,21,0.75)] backdrop-blur-[24px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                <span>Советник кэшбэка & сплит карт</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Введите покупку — система выберет лучшую карту Егора или Ани с максимальной выгодой
              </p>
            </div>
          </div>

          {/* Quick task action: Gazprombank Cashback */}
          {gpbTask && (
            <button
              type="button"
              onClick={() => toggleTaskCompletion(gpbTask.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                gpbTask.completed
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{gpbTask.completed ? 'Кэшбэк ГПБ забран ✓' : 'Забрать кэшбэк ГПБ!'}</span>
            </button>
          )}
        </div>

        {/* Search Inputs */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-zinc-400 mb-1">
              Что покупаем?
            </label>
            <div className="relative">
              <Store className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={purchaseQuery}
                onChange={(e) => setPurchaseQuery(e.target.value)}
                placeholder="Полка на WB, ВкусВилл, Леруа Мерлен, Золотое Яблоко, Самокат..."
                className="w-full rounded border border-white/[0.08] bg-zinc-950/70 pl-8 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Сумма покупки (₽)
            </label>
            <input
              type="number"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              placeholder="2500"
              className="w-full rounded border border-white/[0.08] bg-zinc-950/70 px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono"
            />
          </div>
        </div>

        {/* Recommendation Result Card */}
        <div className="mt-3 rounded-lg border border-white/[0.06] bg-zinc-950/50 p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded font-mono font-bold text-xs text-zinc-950 shadow-sm"
              style={{ backgroundColor: currentRecommendation.color }}
            >
              {currentRecommendation.percent}%
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-100">
                  {currentRecommendation.cardName}
                </span>
                <span className="rounded bg-white/[0.04] px-1.5 py-0.2 font-mono text-[10px] text-zinc-400 border border-white/[0.06]">
                  {currentRecommendation.badge}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {currentRecommendation.advice}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] uppercase font-mono text-zinc-500">
              Экономия / Кэшбэк
            </span>
            <span className="font-mono text-sm font-semibold text-emerald-400">
              +{currentRecommendation.savings.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* 2. BANK CARDS MATRIX (EGOR & ANYA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {cashbackCards.map((card) => (
          <div
            key={card.id}
            className="rounded-lg border border-white/[0.07] bg-[rgba(24,24,28,0.65)] hover:bg-[rgba(32,32,38,0.85)] p-3 space-y-2 relative overflow-hidden transition-colors"
          >
            {/* Top Color Strip */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: card.bankColor }}
            />

            {/* Bank Header */}
            <div className="flex items-start justify-between gap-2 pt-0.5">
              <div>
                <h4 className="text-xs font-semibold text-zinc-100">
                  {card.bankName}
                </h4>
                <span className="text-[10px] font-mono text-zinc-500">
                  {card.user === 'egor' ? 'Егор' : 'Аня'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleCashbackClaimed(card.id)}
                className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-medium border transition-colors ${
                  card.claimed
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                }`}
              >
                {card.claimed ? 'Активен ✓' : 'Забрать!'}
              </button>
            </div>

            {/* Special Feature */}
            {card.specialFeature && (
              <div className="rounded bg-white/[0.03] p-1 text-[10px] text-zinc-400 border border-white/[0.05] leading-tight">
                {card.specialFeature}
              </div>
            )}

            {/* Categories */}
            <div className="space-y-1">
              {card.categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded bg-zinc-950/60 px-1.5 py-0.5 text-[11px] border border-white/[0.03]"
                >
                  <span className="text-zinc-400 truncate max-w-[130px]" title={cat.category}>
                    {cat.category}
                  </span>
                  <span className="font-mono font-medium text-emerald-400 shrink-0">
                    {cat.percent}%
                  </span>
                </div>
              ))}
            </div>

            {card.actionRequired && !card.claimed && (
              <div className="rounded bg-amber-500/10 border border-amber-500/20 p-1 text-[10px] text-amber-300">
                {card.actionRequired}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
