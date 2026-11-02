import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Sparkles, 
  Dice5, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Clock, 
  Tag, 
  CheckCircle2, 
  Filter,
  Flame,
  Gift
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { DateScenario } from '../../types/nexus';
import { soundEffects } from '../../utils/soundEffects';

export const DateNightPlanner: React.FC = () => {
  const { dateScenarios, scheduleDateScenario, addWishlistItem } = useNexusStore();

  const [selectedVibe, setSelectedVibe] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [currentScenario, setCurrentScenario] = useState<DateScenario>(dateScenarios[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  // Filter scenarios
  const filteredScenarios = dateScenarios.filter((s) => {
    const matchVibe = selectedVibe === 'all' || s.vibe === selectedVibe;
    const matchBudget = selectedBudget === 'all' || s.budget === selectedBudget;
    return matchVibe && matchBudget;
  });

  // Slot machine roulette spin
  const handleSpinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setScheduledSuccess(false);

    let counter = 0;
    const totalTicks = 18;
    const pool = filteredScenarios.length > 0 ? filteredScenarios : dateScenarios;

    const interval = setInterval(() => {
      counter++;
      const randomIndex = Math.floor(Math.random() * pool.length);
      setCurrentScenario(pool[randomIndex]);
      soundEffects.playClick();

      if (counter >= totalTicks) {
        clearInterval(interval);
        setIsSpinning(false);
        soundEffects.playLevelUp();
      }
    }, 90);
  };

  const handleScheduleForNov4 = () => {
    scheduleDateScenario(currentScenario, '2026-11-04');
    setScheduledSuccess(true);
    setTimeout(() => setScheduledSuccess(false), 3500);
  };

  const handleSendToWishlist = () => {
    addWishlistItem({
      title: currentScenario.title,
      category: 'Свидания & Релакс',
      estimatedPrice: currentScenario.estimatedCost,
      notes: `${currentScenario.description}\nЛокация: ${currentScenario.location}`,
      addedBy: 'egor',
    });
    soundEffects.playSuccess();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-[#0d0e19] p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30">
            <Heart className="h-6 w-6 fill-current animate-pulse" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              Генератор Свиданий: «Что делаем 4 ноября? 💕»
              <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-[11px] font-mono font-bold text-pink-300 border border-pink-500/30">
                День народного единства
              </span>
            </h2>
            <p className="text-xs text-zinc-300">
              Интерактивная рулетка для идеального выходного в Москве или уютного домашнего вечера
            </p>
          </div>
        </div>

        {/* Spin Roulette Button */}
        <button
          type="button"
          disabled={isSpinning}
          onClick={handleSpinRoulette}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 px-6 py-3 text-sm font-extrabold text-black shadow-xl shadow-pink-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Dice5 className={`h-5 w-5 stroke-[2.5] ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Выбираем лучшее...' : '🎰 Крутить рулетку свиданий!'}</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0d0e19]/80 p-3.5 backdrop-blur-xl">
        {/* Vibe filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-zinc-500 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Вайб:
          </span>
          {[
            { id: 'all', label: 'Все вайбы' },
            { id: 'home', label: '🏠 Дома' },
            { id: 'gastro', label: '🍜 Гастро' },
            { id: 'art', label: '🎨 Арт/ГЭС-2' },
            { id: 'gaming', label: '🎮 Кооп/Игры' },
            { id: 'walk', label: '🌿 Прогулка' },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVibe(v.id)}
              className={`rounded-xl px-2.5 py-1 transition-all ${
                selectedVibe === v.id
                  ? 'bg-pink-500/25 text-pink-200 border border-pink-500/50 shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-zinc-200'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Budget filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-zinc-500 text-[11px] font-medium mr-1">Бюджет:</span>
          {[
            { id: 'all', label: 'Все' },
            { id: 'free', label: '0-800 ₽' },
            { id: 'low', label: 'до 2 000 ₽' },
            { id: 'medium', label: 'до 5 000 ₽' },
            { id: 'festive', label: 'Праздничный 5k+' },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBudget(b.id)}
              className={`rounded-xl px-2.5 py-1 transition-all ${
                selectedBudget === b.id
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-zinc-200'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Roulette Selection Highlight Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScenario.id}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl border border-pink-500/40 bg-[#0d0a1b]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Info: Emoji & Header */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-4xl">{currentScenario.emoji}</span>
                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold text-pink-300 border border-pink-500/40">
                  {currentScenario.vibeLabel}
                </span>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-mono font-bold text-amber-300 border border-amber-500/40">
                  {currentScenario.budgetLabel}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-zinc-300 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {currentScenario.duration}
                </span>
              </div>

              <h3 className="text-2xl font-black text-zinc-100 tracking-tight leading-snug">
                {currentScenario.title}
              </h3>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {currentScenario.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{currentScenario.location}</span>
              </div>

              {/* Recommended Bank Card & Cashback Advice */}
              <div className="rounded-2xl border border-white/10 bg-black/50 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                      Рекомендация по оплате с кэшбэком:
                    </span>
                    <strong className="text-xs text-zinc-200">{currentScenario.recommendedCard}</strong>
                  </div>
                </div>

                <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300 border border-emerald-500/30 shrink-0">
                  {currentScenario.cardBonusText}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentScenario.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-400 border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Controls: One-Click Calendar Scheduling */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <span className="text-xs font-mono text-zinc-400 uppercase text-center block">
                Выходной: 4 ноября 2026
              </span>

              {scheduledSuccess ? (
                <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-4 text-center space-y-1">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-400" />
                  <span className="block text-xs font-bold text-emerald-200">
                    Ура! Запланировано в еженедельник на 4 ноября!
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleScheduleForNov4}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-98 transition-all"
                >
                  <Calendar className="h-4 w-4" />
                  <span>✨ Запланировать на 4 ноября!</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSendToWishlist}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] py-2.5 text-xs font-semibold text-zinc-300 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Gift className="h-3.5 w-3.5 text-pink-400" />
                <span>Добавить в вишлист пары</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Grid of Other Date Ideas (20+ ideas) */}
      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-bold text-zinc-200 flex items-center justify-between">
          <span>Все идеи для уикенда ({filteredScenarios.length})</span>
          <span className="text-xs text-zinc-400 font-normal">Кликни, чтобы выбрать идею</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenarios.map((scenario) => {
            const isSelected = currentScenario.id === scenario.id;

            return (
              <div
                key={scenario.id}
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentScenario(scenario);
                }}
                className={`rounded-2xl p-4 transition-all cursor-pointer border flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-pink-500/60 bg-pink-500/10 shadow-lg shadow-pink-500/10'
                    : 'border-white/10 bg-[#0d0e19]/80 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{scenario.emoji}</span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                      {scenario.budgetLabel}
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-zinc-100 line-clamp-2">{scenario.title}</h5>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{scenario.description}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-2 border-t border-white/5">
                  <span className="text-pink-300 font-medium">{scenario.vibeLabel}</span>
                  <span>~{scenario.estimatedCost} ₽</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
