import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Dice5, 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  Gift, 
  CheckCircle2, 
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { DateScenario } from '../../types/nexus';
import { soundEffects } from '../../utils/soundEffects';

export const DateNightPlanner: React.FC = () => {
  const { dateScenarios, scheduleDateScenario, addWishlistItem } = useNexusStore();
  const [selectedVibe, setSelectedVibe] = useState<'all' | DateScenario['vibe']>('all');
  const [selectedBudget, setSelectedBudget] = useState<'all' | DateScenario['budget']>('all');
  const [isSpinning, setIsSpinning] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  // Default featured scenario is the November 4 Special
  const [currentScenario, setCurrentScenario] = useState<DateScenario>(
    () => dateScenarios.find((s) => s.id === 'date-nov4-ges2') || dateScenarios[0]
  );

  const filteredScenarios = dateScenarios.filter((s) => {
    if (selectedVibe !== 'all' && s.vibe !== selectedVibe) return false;
    if (selectedBudget !== 'all' && s.budget !== selectedBudget) return false;
    return true;
  });

  const handleSpinRoulette = () => {
    if (filteredScenarios.length === 0) return;
    setIsSpinning(true);
    setScheduledSuccess(false);
    soundEffects.playClick();

    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * filteredScenarios.length);
      setCurrentScenario(filteredScenarios[randomIdx]);
      counter++;

      if (counter >= 12) {
        clearInterval(interval);
        setIsSpinning(false);
        soundEffects.playSuccess();
      }
    }, 70);
  };

  const handleScheduleForNov4 = () => {
    scheduleDateScenario(currentScenario, '2026-11-04');
    setScheduledSuccess(true);
    soundEffects.playSuccess();
    setTimeout(() => setScheduledSuccess(false), 4000);
  };

  const handleSendToWishlist = () => {
    addWishlistItem({
      title: `Свидание: ${currentScenario.title}`,
      category: 'Спальня',
      estimatedPrice: currentScenario.estimatedCost,
      notes: `${currentScenario.description} (Локация: ${currentScenario.location})`,
      addedBy: 'egor',
    });
    soundEffects.playSuccess();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[rgba(18,18,21,0.75)] backdrop-blur-[24px] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-rose-400 border border-white/[0.08]">
            <Heart className="h-5 w-5 fill-current" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span>Генератор Свиданий: «Что делаем 4 ноября? 💕»</span>
              <span className="rounded bg-white/[0.05] px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-white/[0.08]">
                Выходной
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Интерактивная рулетка для идеального выходного в Москве или уютного домашнего вечера
            </p>
          </div>
        </div>

        {/* Spin Roulette Button */}
        <button
          type="button"
          disabled={isSpinning}
          onClick={handleSpinRoulette}
          className="flex items-center gap-2 rounded-lg bg-zinc-100 hover:bg-white px-4 py-2 text-xs font-semibold text-zinc-950 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
        >
          <Dice5 className={`h-4 w-4 stroke-[2.5] ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Выбираем...' : 'Крутить рулетку'}</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-white/[0.06] bg-zinc-950/50 p-2.5">
        {/* Vibe filter */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-zinc-500 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Вайб:
          </span>
          {[
            { id: 'all', label: 'Все' },
            { id: 'home', label: 'Дома' },
            { id: 'gastro', label: 'Гастро' },
            { id: 'art', label: 'Арт / ГЭС-2' },
            { id: 'gaming', label: 'Игры' },
            { id: 'walk', label: 'Прогулка' },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVibe(v.id as any)}
              className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                selectedVibe === v.id
                  ? 'bg-white/[0.12] text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Budget filter */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-zinc-500 text-[11px] font-medium mr-1">Бюджет:</span>
          {[
            { id: 'all', label: 'Все' },
            { id: 'free', label: '0 ₽' },
            { id: 'low', label: 'до 1.5k' },
            { id: 'medium', label: 'до 4k' },
            { id: 'high', label: 'премиум' },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBudget(b.id as any)}
              className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                selectedBudget === b.id
                  ? 'bg-white/[0.12] text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
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
          initial={{ opacity: 0, scale: 0.98, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -6 }}
          transition={{ duration: 0.15 }}
          className="rounded-xl border border-white/[0.08] bg-[rgba(24,24,28,0.7)] p-4 sm:p-5 backdrop-blur-[24px]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left Info: Emoji & Header */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-2xl">{currentScenario.emoji}</span>
                <span className="rounded bg-white/[0.05] px-2 py-0.5 text-[11px] text-zinc-300 border border-white/[0.07]">
                  {currentScenario.vibeLabel}
                </span>
                <span className="rounded bg-white/[0.05] px-2 py-0.5 text-[11px] font-mono text-zinc-300 border border-white/[0.07]">
                  {currentScenario.budgetLabel}
                </span>
                <span className="rounded bg-white/[0.05] px-2 py-0.5 text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> {currentScenario.duration}
                </span>
              </div>

              <h3 className="text-base font-semibold text-zinc-100 tracking-tight leading-snug">
                {currentScenario.title}
              </h3>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {currentScenario.description}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                <span>{currentScenario.location}</span>
              </div>

              {/* Recommended Bank Card & Cashback Advice */}
              <div className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                    <CreditCard className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-500 block">
                      Рекомендация по оплате:
                    </span>
                    <strong className="text-xs text-zinc-200">{currentScenario.recommendedCard}</strong>
                  </div>
                </div>

                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-400 border border-emerald-500/20 shrink-0">
                  {currentScenario.cardBonusText}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {currentScenario.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-white/[0.03] px-1.5 py-0.2 text-[10px] text-zinc-500 border border-white/[0.05]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Controls: One-Click Calendar Scheduling */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-2 rounded-lg border border-white/[0.06] bg-zinc-950/40 p-4">
              <span className="text-[11px] font-mono text-zinc-500 uppercase text-center block">
                Выходной: 4 ноября 2026
              </span>

              {scheduledSuccess ? (
                <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-3 text-center space-y-1">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-400" />
                  <span className="block text-xs font-medium text-emerald-300">
                    Запланировано в еженедельник на 4 ноября!
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleScheduleForNov4}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white py-2 text-xs font-semibold text-zinc-950 transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Запланировать на 4 ноября</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSendToWishlist}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] py-1.5 text-xs text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
              >
                <Gift className="h-3 w-3" />
                <span>В вишлист пары</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Grid of Other Date Ideas */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-tight">
          Все идеи свиданий ({filteredScenarios.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredScenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => {
                setCurrentScenario(scenario);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="rounded-lg border border-white/[0.07] bg-[rgba(24,24,28,0.65)] hover:bg-[rgba(32,32,38,0.85)] p-3 space-y-2 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xl">{scenario.emoji}</span>
                <span className="rounded bg-white/[0.04] px-1.5 py-0.2 font-mono text-[10px] text-zinc-400 border border-white/[0.06]">
                  {scenario.budgetLabel}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-medium text-zinc-100 leading-snug">
                  {scenario.title}
                </h4>
                <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2">
                  {scenario.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[10px] text-zinc-500">
                <span>{scenario.vibeLabel}</span>
                <span className="text-zinc-400">{scenario.location.split(',')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
