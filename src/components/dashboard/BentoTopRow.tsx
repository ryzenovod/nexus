import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  ArrowUpRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { NexusTask } from '../../types/nexus';

interface BentoTopRowProps {
  tasks: NexusTask[];
  onOpenDateNight: () => void;
  onNavigateToFinances: () => void;
  onOpenTamagotchi: () => void;
}

export const BentoTopRow: React.FC<BentoTopRowProps> = ({
  tasks,
  onOpenDateNight,
  onNavigateToFinances,
  onOpenTamagotchi,
}) => {
  const { 
    budget, 
    gamification, 
    pomodoroTimeLeft, 
    pomodoroIsRunning, 
    startPomodoro, 
    pausePomodoro, 
    setSoundAmbiance 
  } = useNexusStore();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time calculations
  const mskHours = currentTime.getHours();
  const mskMinutes = currentTime.getMinutes();
  const formattedMsk = `${String(mskHours).padStart(2, '0')}:${String(mskMinutes).padStart(2, '0')}`;

  const normalizedDfoHours = (mskHours + 7) % 24;
  const formattedDfo = `${String(normalizedDfoHours).padStart(2, '0')}:${String(mskMinutes).padStart(2, '0')}`;

  const isMskDay = mskHours >= 7 && mskHours < 22;
  const isDfoDay = normalizedDfoHours >= 7 && normalizedDfoHours < 22;

  // Today's date calculations
  const todayStr = '2026-11-02';
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const completedTodayTasks = todayTasks.filter((t) => t.completed);
  const completionPercent = todayTasks.length > 0 
    ? Math.round((completedTodayTasks.length / todayTasks.length) * 100) 
    : 45;

  // Pomodoro formatted
  const pomMins = Math.floor(pomodoroTimeLeft / 60);
  const pomSecs = pomodoroTimeLeft % 60;
  const formattedPomodoro = `${String(pomMins).padStart(2, '0')}:${String(pomSecs).padStart(2, '0')}`;

  const handleToggleTimer = () => {
    if (pomodoroIsRunning) {
      pausePomodoro();
    } else {
      startPomodoro();
      setSoundAmbiance('rain'); // Start cozy rain sound automatically on focus
    }
  };

  const budgetGoal = 80000;
  const budgetPercent = Math.min(100, Math.round((budget.currentBalance / budgetGoal) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 select-none">
      {/* CARD 1 (col-span-5): ФОКУС ДНЯ & ТАЙМЛАЙН ПАРЫ */}
      <div className="col-span-1 md:col-span-5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col justify-between relative overflow-hidden backdrop-blur-xl min-h-[140px]">
        {/* Subtle radial glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        {/* Header line: Date & Greeting */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-zinc-100 tracking-tight">
                Понедельник, 2 ноября
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium font-mono">
                Неделя 45
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-zinc-400 mt-0.5 font-normal">
              <Heart size={12} className="text-rose-400 fill-rose-400" />
              <span>Егор & Аня</span>
              <span className="text-zinc-600">·</span>
              <span className="font-mono text-zinc-400">1 142 дня вместе</span>
            </div>
          </div>

          {/* Today Tasks Closed Counter Ring */}
          <div className="flex items-center gap-2 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.06]">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span className="text-[12px] font-mono text-zinc-200">
              {completedTodayTasks.length}/{todayTasks.length} закрыто
            </span>
          </div>
        </div>

        {/* Bottom line: Dual Clock (Moscow ⇄ Vladivostok) without cutting off! */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[12px] font-mono relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11.5px]">Москва</span>
            <span className="text-zinc-100 font-bold tabular-nums">
              {formattedMsk}
            </span>
            <span className="text-[10px] text-amber-400/80 font-sans">
              {isMskDay ? '☀️ День' : '🌙 Ночь'}
            </span>
          </div>

          <span className="text-zinc-600 font-mono">⇄</span>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11.5px]">Владивосток</span>
            <span className="text-zinc-200 font-bold tabular-nums">
              {formattedDfo}
            </span>
            <span className="text-[10px] text-purple-400/80 font-sans">
              {isDfoDay ? '☀️ +7ч' : '🌙 Вечер (+7ч)'}
            </span>
          </div>
        </div>
      </div>

      {/* CARD 2 (col-span-4): ОБЩИЙ БЮДЖЕТ & РАДАР ЖКХ */}
      <div className="col-span-1 md:col-span-4 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col justify-between relative overflow-hidden backdrop-blur-xl min-h-[140px]">
        {/* Subtle amber glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Header: Balance and Goal */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-bold text-zinc-100 tracking-tight">
                {budget.currentBalance.toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                / {budgetGoal.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
              Совместный бюджет пары
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateToFinances}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium transition-colors p-1"
            title="Открыть модуль Финансы & Кэшбэк"
          >
            <span>Кэшбэк</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden my-1 relative z-10">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${budgetPercent}%` }}
          />
        </div>

        {/* Utilities quick status chips */}
        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/[0.06] relative z-10">
          <div className="flex items-center gap-1.5 text-amber-300 truncate">
            <AlertCircle size={12} className="shrink-0 text-amber-400" />
            <span className="truncate">Мосэнерго: передать счетчики!</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300 font-mono shrink-0 pl-2">
            <span className="text-zinc-500 font-sans">Домиленд:</span>
            <span>1 685 ₽</span>
          </div>
        </div>
      </div>

      {/* CARD 3 (col-span-3): АССИСТЕНТ НЕКСУС & ФОКУС-КОМНАТА */}
      <div className="col-span-1 md:col-span-3 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col justify-between relative overflow-hidden backdrop-blur-xl min-h-[140px]">
        {/* Subtle purple glow */}
        <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        {/* Top: Mascot & Level */}
        <div className="flex items-center justify-between relative z-10">
          <button
            type="button"
            onClick={onOpenTamagotchi}
            className="flex items-center gap-2 group text-left"
            title="Погладить котика Нексус"
          >
            <div className="w-7 h-7 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
              <Sparkles size={14} />
            </div>
            <div>
              <span className="text-[12px] font-semibold text-zinc-200 group-hover:text-white transition-colors block leading-tight">
                Котик Нексус
              </span>
              <span className="font-mono text-[10px] text-zinc-400">
                Ур. {gamification.level} · {gamification.xp} XP
              </span>
            </div>
          </button>

          {/* Quick Focus Pomodoro Trigger */}
          <button
            type="button"
            onClick={handleToggleTimer}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11.5px] font-mono transition-all ${
              pomodoroIsRunning
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08]'
            }`}
            title="25 минут фокуса с шумом дождя"
          >
            {pomodoroIsRunning ? <Pause size={11} /> : <Play size={11} />}
            <span>{formattedPomodoro}</span>
          </button>
        </div>

        {/* Date Night Countdown prompt */}
        <button
          type="button"
          onClick={onOpenDateNight}
          className="w-full text-left p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/25 flex items-center justify-between transition-colors relative z-10 mt-2"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-rose-200 truncate">
            <Heart size={12} className="text-rose-400 fill-rose-400 shrink-0" />
            <span className="font-medium truncate">Через 2 дня: Что делаем 4 ноября?</span>
          </div>
          <ArrowUpRight size={12} className="text-rose-400 shrink-0" />
        </button>
      </div>
    </div>
  );
};
