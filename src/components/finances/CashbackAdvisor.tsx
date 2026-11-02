import React, { useState } from 'react';
import { 
  Sparkles, 
  Store, 
  Check, 
  CreditCard 
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';

export const CashbackAdvisor: React.FC = () => {
  const { 
    cashbackCards, 
    toggleCashbackClaimed, 
    addCashbackCategory, 
    removeCashbackCategory 
  } = useNexusStore();
  const [purchaseQuery, setPurchaseQuery] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('2000');
  const [addingCardId, setAddingCardId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatPercent, setNewCatPercent] = useState('5');

  // Interactive AI cashback search logic
  const getRecommendation = (query: string, amount: number) => {
    const q = query.toLowerCase().trim();

    if (!q) {
      return {
        cardName: 'T-Bank Black',
        owner: 'Егор',
        percent: 1,
        advice: 'Базовый кэшбэк 1% на любые покупки без повышенной категории.',
        savings: Math.round(amount * 0.01),
        color: '#ffdd2d',
        badge: 'По умолчанию',
      };
    }

    if (q.includes('вкусвилл') || q.includes('еда') || q.includes('продукты') || q.includes('молоко') || q.includes('сыр')) {
      return {
        cardName: 'Сбербанк',
        owner: 'Аня',
        percent: 5,
        advice: 'Оплата во ВкусВилле — действует повышенный кэшбэк 5% бонусами Спасибо.',
        savings: Math.round(amount * 0.05),
        color: '#22c55e',
        badge: 'Супермаркеты 5%',
      };
    }

    if (q.includes('леруа') || q.includes('петрович') || q.includes('оби') || q.includes('ремонт') || q.includes('герметик') || q.includes('затирка')) {
      return {
        cardName: 'T-Bank Black',
        owner: 'Егор',
        percent: 5,
        advice: 'Товары для ремонта квартиры — повышенная категория «Дом и ремонт» 5%.',
        savings: Math.round(amount * 0.05),
        color: '#ffdd2d',
        badge: 'Дом и ремонт 5%',
      };
    }

    if (q.includes('аптека') || q.includes('лекарства') || q.includes('ригла') || q.includes('еаптека')) {
      return {
        cardName: 'Альфа-Банк',
        owner: 'Егор',
        percent: 5,
        advice: 'Покупки в аптеках по карте Альфа-Банка с кэшбэком 5%.',
        savings: Math.round(amount * 0.05),
        color: '#ef4444',
        badge: 'Аптеки 5%',
      };
    }

    if (q.includes('такси') || q.includes('яндекс') || q.includes('каршеринг') || q.includes('ситидрайв') || q.includes('метро')) {
      return {
        cardName: 'Яндекс Пэй',
        owner: 'Аня',
        percent: 10,
        advice: 'Такси и каршеринг выгоднее оплачивать через Яндекс Пэй — до 10% баллами Плюса.',
        savings: Math.round(amount * 0.1),
        color: '#ec4899',
        badge: 'Транспорт 10%',
      };
    }

    if (q.includes('гпб') || q.includes('газпром') || q.includes('акция') || q.includes('компенсация')) {
      return {
        cardName: 'Газпромбанк',
        owner: 'Егор',
        percent: 25,
        advice: 'До 25 числа нужно нажать «Забрать кэшбэк» в приложении банка.',
        savings: 5000,
        color: '#3b82f6',
        badge: 'Акция месяца 25%',
      };
    }

    return {
      cardName: 'T-Bank Black',
      owner: 'Егор',
      percent: 1,
      advice: 'Прямых повышенных категорий не найдено. Базовый кэшбэк 1%.',
      savings: Math.round(amount * 0.01),
      color: '#ffdd2d',
      badge: '1% на всё',
    };
  };

  const parsedAmount = parseFloat(purchaseAmount) || 0;
  const currentRecommendation = getRecommendation(purchaseQuery, parsedAmount);

  return (
    <div className="space-y-4">
      {/* 1. INTERACTIVE ADVISOR SEARCH & SMART SPLIT (NO INNER BOX CLUTTER) */}
      <div className="rounded-xl border border-white/[0.07] bg-[rgba(18,18,21,0.75)] backdrop-blur-[24px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-4 w-4 text-zinc-400" />
            <h3 className="text-xs font-semibold text-zinc-200 tracking-tight">
              Советник кэшбэка & сплит карт
            </h3>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            Ноябрь 2026 · Москва
          </span>
        </div>

        {/* Search Inputs */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Store className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={purchaseQuery}
              onChange={(e) => setPurchaseQuery(e.target.value)}
              placeholder="Полка на WB, ВкусВилл, Леруа, Золотое Яблоко, аптека, такси..."
              className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <input
              type="number"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              placeholder="Сумма покупки (₽)"
              className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono"
            />
          </div>
        </div>

        {/* Recommendation Result Line (Clean typography, no nested box frames) */}
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: currentRecommendation.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-zinc-100">
                  {currentRecommendation.cardName} · {currentRecommendation.owner}
                </span>
                <span className="font-mono text-xs text-emerald-400 font-medium">
                  {currentRecommendation.percent}%
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-400">
                  {currentRecommendation.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {currentRecommendation.advice}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] uppercase font-mono text-zinc-500">
              Экономия
            </span>
            <span className="font-mono text-sm font-semibold text-emerald-400">
              +{currentRecommendation.savings.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* 2. BANK CARDS MATRIX (SEAMLESS LINEAR BENTO GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-[1px] bg-[#1c1d24] border border-[#1e2028] rounded-[8px] overflow-hidden shadow-xs">
        {cashbackCards.map((card) => (
          <div
            key={card.id}
            className="bg-[#131419] hover:bg-[#181920] p-4 flex flex-col justify-between transition-colors relative"
          >
            {/* Top Info */}
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/[0.05]">
                <div>
                  <h4 className="text-[13px] font-semibold text-zinc-100">
                    {card.bankName}
                  </h4>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {card.user === 'egor' ? 'Егор' : 'Аня'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCashbackClaimed(card.id)}
                  className={`text-[11px] font-medium transition-colors ${
                    card.claimed
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-amber-400 hover:text-amber-300 underline'
                  }`}
                >
                  {card.claimed ? 'Активен ✓' : 'Забрать!'}
                </button>
              </div>

              {/* Special Feature note (clean typography) */}
              {card.specialFeature && (
                <p className="text-[11px] text-zinc-400 py-2 border-b border-white/[0.04] leading-relaxed">
                  {card.specialFeature}
                </p>
              )}

              {/* Clean List of Categories with Divide-y (NO INNER BOXES!) */}
              <div className="divide-y divide-white/[0.04]">
                {card.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 text-[13px] group"
                  >
                    <span className="text-zinc-300 truncate pr-2" title={cat.category}>
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-zinc-100 font-semibold">
                        {cat.percent}%
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCashbackCategory(card.id, idx)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 text-xs transition-opacity px-1"
                        title="Удалить категорию"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add category inline */}
              {addingCardId === card.id ? (
                <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Категория"
                    className="flex-1 min-w-0 px-2 py-1 rounded bg-zinc-950 border border-white/[0.1] text-xs text-white"
                  />
                  <input
                    type="number"
                    value={newCatPercent}
                    onChange={(e) => setNewCatPercent(e.target.value)}
                    placeholder="%"
                    className="w-12 px-1.5 py-1 rounded bg-zinc-950 border border-white/[0.1] text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCatName.trim()) {
                        addCashbackCategory(card.id, newCatName.trim(), parseFloat(newCatPercent) || 5);
                        setNewCatName('');
                        setAddingCardId(null);
                      }
                    }}
                    className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingCardId(null)}
                    className="text-zinc-500 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAddingCardId(card.id);
                    setNewCatName('');
                    setNewCatPercent('5');
                  }}
                  className="mt-2 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                >
                  <span>+ Добавить категорию</span>
                </button>
              )}
            </div>

            {/* Action required alert (clean minimal text) */}
            {card.actionRequired && !card.claimed && (
              <div className="mt-3 pt-2 border-t border-white/[0.05] text-[11px] text-amber-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{card.actionRequired}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
