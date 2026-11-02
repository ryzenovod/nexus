import React, { useState } from 'react';
import { 
  Sparkles, 
  Store, 
  Check, 
  CreditCard 
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';

const ContactlessIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-zinc-400/80 shrink-0">
    <path d="M8.5 16.5C9.5 15.5 10 14 10 12.5C10 11 9.5 9.5 8.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 19C13.5 17.5 14.5 15 14.5 12.5C14.5 10 13.5 7.5 12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M15.5 21.5C17.5 19.5 19 16 19 12.5C19 9 17.5 5.5 15.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const EMVChipIcon = () => (
  <svg width="28" height="22" viewBox="0 0 34 26" fill="none" className="shrink-0 drop-shadow-sm">
    <rect x="0.5" y="0.5" width="33" height="25" rx="3.5" fill="#ca8a04" stroke="#eab308" strokeWidth="1" />
    <rect x="1" y="1" width="32" height="24" rx="3" fill="#eab308" />
    <path d="M0 8.5H12M0 17.5H12M22 8.5H34M22 17.5H34M12 4V22M22 4V22" stroke="#713f12" strokeWidth="0.8" opacity="0.85" />
    <rect x="12" y="8.5" width="10" height="9" rx="1.5" stroke="#713f12" strokeWidth="0.8" fill="#ca8a04" opacity="0.6" />
  </svg>
);

const getCardStyle = (cardId: string, bankName: string) => {
  const b = (bankName + cardId).toLowerCase();
  if (b.includes('сбер') || b.includes('sber')) {
    return {
      gradient: 'from-emerald-500/20 via-emerald-950/20 to-zinc-950 border-emerald-500/30',
      accent: 'text-emerald-400',
      tagBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      badge: 'Аня · СберСпасибо',
      ownerName: 'АНЯ',
      chipColor: '#10b981'
    };
  }
  if (b.includes('т-банк') || b.includes('tbank') || b.includes('тинькофф')) {
    return {
      gradient: 'from-amber-400/20 via-zinc-900 to-zinc-950 border-amber-400/30',
      accent: 'text-amber-400',
      tagBg: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
      badge: 'Егор · Общий счет',
      ownerName: 'ЕГОР & АНЯ',
      chipColor: '#f59e0b'
    };
  }
  if (b.includes('wb') || b.includes('вайлдберриз') || b.includes('wildberries')) {
    return {
      gradient: 'from-fuchsia-500/20 via-purple-950/20 to-zinc-950 border-fuchsia-500/30',
      accent: 'text-fuchsia-400',
      tagBg: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
      badge: 'Егор · WB Кошелек',
      ownerName: 'ЕГОР',
      chipColor: '#d946ef'
    };
  }
  if (b.includes('альфа') || b.includes('alfa')) {
    return {
      gradient: 'from-rose-500/20 via-rose-950/20 to-zinc-950 border-rose-500/30',
      accent: 'text-rose-400',
      tagBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      badge: 'Егор · Альфа-Карта',
      ownerName: 'ЕГОР',
      chipColor: '#ef4444'
    };
  }
  if (b.includes('газпром') || b.includes('gpb')) {
    return {
      gradient: 'from-blue-500/20 via-blue-950/20 to-zinc-950 border-blue-500/30',
      accent: 'text-blue-400',
      tagBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      badge: 'Егор · Газпромбанк',
      ownerName: 'ЕГОР',
      chipColor: '#3b82f6'
    };
  }
  return {
    gradient: 'from-zinc-800/40 via-zinc-900 to-zinc-950 border-white/10',
    accent: 'text-zinc-300',
    tagBg: 'bg-white/5 text-zinc-300 border-white/10',
    badge: 'Банк',
    ownerName: 'NEXUS',
    chipColor: '#a1a1aa'
  };
};

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

    if (q.includes('wb') || q.includes('wildberries') || q.includes('вайлдберриз') || q.includes('одежда') || q.includes('кроссовки')) {
      return {
        cardName: 'WB Банк',
        owner: 'Егор',
        percent: 5,
        advice: 'Оплата на Wildberries через WB Кошелек — максимальная скидка и кэшбэк.',
        savings: Math.round(amount * 0.05),
        color: '#d946ef',
        badge: 'WB Кошелек 5%',
      };
    }

    if (q.includes('вкусвилл') || q.includes('еда') || q.includes('продукты') || q.includes('молоко') || q.includes('сыр') || q.includes('перекресток')) {
      return {
        cardName: 'Сбер',
        owner: 'Аня',
        percent: 5,
        advice: 'Супермаркеты и ВкусВилл — повышенные бонусы СберСпасибо 5% у Ани.',
        savings: Math.round(amount * 0.05),
        color: '#22c55e',
        badge: 'Супермаркеты 5%',
      };
    }

    if (q.includes('леруа') || q.includes('петрович') || q.includes('оби') || q.includes('ремонт') || q.includes('герметик') || q.includes('затирка') || q.includes('дом')) {
      return {
        cardName: 'Т-Банк (Общий счет)',
        owner: 'Егор',
        percent: 6,
        advice: 'Товары для дома и ремонта квартиры — повышенная категория 6% по общему счету Т-Банк.',
        savings: Math.round(amount * 0.06),
        color: '#f59e0b',
        badge: 'Дом и ремонт 6%',
      };
    }

    if (q.includes('аптека') || q.includes('лекарства') || q.includes('ригла') || q.includes('еаптека') || q.includes('кафе') || q.includes('ресторан')) {
      return {
        cardName: 'Альфа-Банк',
        owner: 'Егор',
        percent: 5,
        advice: 'Аптеки, кафе и рестораны выгоднее оплачивать картой Альфа-Банка с кэшбэком 5%.',
        savings: Math.round(amount * 0.05),
        color: '#ef4444',
        badge: 'Аптеки / Кафе 5%',
      };
    }

    if (q.includes('гпб') || q.includes('газпром') || q.includes('акция') || q.includes('компенсация') || q.includes('бензин') || q.includes('азс')) {
      return {
        cardName: 'Газпромбанк',
        owner: 'Егор',
        percent: 25,
        advice: 'Акция месяца 25% (компенсация). До 25 числа нужно нажать «Забрать» в приложении!',
        savings: Math.min(5000, Math.round(amount * 0.25)),
        color: '#3b82f6',
        badge: 'Акция месяца 25%',
      };
    }

    return {
      cardName: 'Т-Банк (Общий счет)',
      owner: 'Егор',
      percent: 1,
      advice: 'Базовый кэшбэк 1% на все покупки с совместного счета пары.',
      savings: Math.round(amount * 0.01),
      color: '#f59e0b',
      badge: '1% на все',
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

      {/* 2. BANK CARDS MATRIX (APPLE PAY 2026 METAL CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {cashbackCards.map((card) => {
          const style = getCardStyle(card.id, card.bankName);

          return (
            <div
              key={card.id}
              className={`rounded-[18px] bg-gradient-to-b ${style.gradient} border p-4 flex flex-col justify-between shadow-[0_12px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl transition-all duration-200 relative overflow-hidden group min-h-[300px]`}
            >
              {/* Card Surface Sheen Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-white/[0.05] to-transparent opacity-60" />

              {/* Upper Section: Bank, Waves, Chip & Details */}
              <div className="relative z-10">
                {/* Header: Bank Brand & Contactless Icon */}
                <div className="flex items-center justify-between pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[14px] font-bold tracking-tight text-white font-sans">
                      {card.bankName}
                    </h4>
                  </div>
                  <ContactlessIcon />
                </div>

                {/* EMV Chip & Owner Details */}
                <div className="flex items-center justify-between pt-1 pb-3 border-b border-white/[0.08]">
                  <EMVChipIcon />
                  <div className="text-right">
                    <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-300 block uppercase">
                      {style.ownerName}
                    </span>
                    <span className="text-[9.5px] font-medium text-zinc-400/80">
                      {style.badge}
                    </span>
                  </div>
                </div>

                {/* Special Feature note */}
                {card.specialFeature && (
                  <p className="text-[10.5px] text-zinc-300/80 py-2 border-b border-white/[0.05] leading-snug">
                    {card.specialFeature}
                  </p>
                )}

                {/* Cashback Categories Matrix */}
                <div className="divide-y divide-white/[0.05] pt-1">
                  {card.categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 text-[12px] group/cat"
                    >
                      <span className="text-zinc-200 truncate pr-2 text-[11.5px]" title={cat.category}>
                        {cat.category}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md ${style.tagBg} border`}>
                          {cat.percent}%
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCashbackCategory(card.id, idx)}
                          className="opacity-0 group-hover/cat:opacity-100 text-zinc-500 hover:text-rose-400 text-xs transition-opacity px-0.5 cursor-pointer"
                          title="Удалить категорию"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Category Inline */}
                {addingCardId === card.id ? (
                  <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Категория"
                      className="flex-1 min-w-0 px-2 py-1 rounded-md bg-black/60 border border-white/[0.12] text-[11px] text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={newCatPercent}
                      onChange={(e) => setNewCatPercent(e.target.value)}
                      placeholder="%"
                      className="w-11 px-1.5 py-1 rounded-md bg-black/60 border border-white/[0.12] text-[11px] text-white font-mono focus:outline-none"
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
                      className="px-2 py-1 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-[11px] font-bold cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingCardId(null)}
                      className="text-zinc-400 hover:text-white text-xs px-1 cursor-pointer"
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
                    className="mt-2 text-[10.5px] text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Добавить категорию</span>
                  </button>
                )}
              </div>

              {/* Bottom Footer: Active Status & Action Alert */}
              <div className="relative z-10 mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                  {card.activeMonth || 'Ноябрь 2026'}
                </span>

                <button
                  type="button"
                  onClick={() => toggleCashbackClaimed(card.id)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                    card.claimed
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                  }`}
                >
                  {card.claimed ? 'Активен ✓' : 'Забрать!'}
                </button>
              </div>

              {/* Action alert if not claimed */}
              {card.actionRequired && !card.claimed && (
                <div className="relative z-10 mt-2 text-[10px] text-amber-300/90 leading-tight">
                  {card.actionRequired}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
