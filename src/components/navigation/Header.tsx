import React from 'react';
import { 
  Sparkles, 
  Settings, 
  Search, 
  Monitor, 
  Plus, 
  CheckCircle2, 
  Cloud, 
  CloudOff,
  Moon,
  Palette,
  Zap,
  Volume2,
  VolumeX,
  Bot,
  Heart
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { DualTimeClock } from '../visual/DualTimeClock';
import { CyberCatMascot } from '../visual/CyberCatMascot';
import { AtmosphereMode } from '../../types/nexus';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewTask: () => void;
  onOpenTelegramBridge: () => void;
  onOpenTamagotchiRoom: () => void;
  isWidgetMode: boolean;
  onToggleWidgetMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenCommandPalette,
  onOpenNewTask,
  onOpenTelegramBridge,
  onOpenTamagotchiRoom,
  isWidgetMode,
  onToggleWidgetMode,
}) => {
  const { 
    tasks, 
    budget, 
    supabaseConfig, 
    telegramConfig,
    isSyncing,
    atmosphereMode,
    setAtmosphereMode,
    gamification,
    equipCosmetic,
    soundAmbiance,
    setSoundAmbiance,
    soundMuted,
    setSoundMuted
  } = useNexusStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const overdueCount = tasks.filter((t) => t.isOverdue && !t.completed).length;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#090714]/85 backdrop-blur-3xl px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-3">
        {/* Brand & Mascot Profile */}
        <div className="flex items-center gap-3">
          {/* Cyber Cat Mascot - Clickable to open Tamagotchi Room */}
          <div 
            onClick={onOpenTamagotchiRoom}
            className="flex items-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title="Открыть Тамагочи-Комнату Котика Нексуса (гардероб, угощения)"
          >
            <CyberCatMascot
              gamification={gamification}
              onEquipCosmetic={equipCosmetic}
              compact
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                NEXUS
              </span>
              <span className="hidden sm:inline-block rounded-md bg-purple-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-purple-300 border border-purple-500/20">
                Couple OS
              </span>

              {/* Couple XP Level Pill */}
              <button 
                type="button"
                onClick={onOpenTamagotchiRoom}
                className="hidden sm:flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer"
                title="Уровень пары и комната котика"
              >
                <Zap className="h-2.5 w-2.5 fill-current" />
                <span>Ур. {gamification.level}</span>
                <span className="text-zinc-400 font-normal">({gamification.xp} XP)</span>
              </button>

              {/* Telegram Bridge Pill */}
              <button
                type="button"
                onClick={onOpenTelegramBridge}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono transition-colors border ${
                  telegramConfig.isConnected
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20'
                    : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
                title="Telegram-Бот Пары (отправка покупок, ЖКХ и синхронизация)"
              >
                <Bot className="h-2.5 w-2.5 text-sky-400" />
                <span className="hidden md:inline">TG Бот</span>
              </button>

              {/* Sync Status Badge */}
              <button 
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono transition-colors border"
                style={{
                  backgroundColor: supabaseConfig.isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: supabaseConfig.isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  color: supabaseConfig.isConnected ? '#86efac' : '#a1a1aa',
                }}
                title={supabaseConfig.isConnected ? 'Supabase подключен' : 'Offline-first режим'}
              >
                {supabaseConfig.isConnected ? (
                  <>
                    <Cloud className="h-2.5 w-2.5 text-emerald-400" />
                    <span className="hidden md:inline">Синхронизировано</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-2.5 w-2.5 text-zinc-400" />
                    <span className="hidden md:inline">Локально</span>
                  </>
                )}
              </button>
            </div>

            {/* Couple Roles Row */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                <strong className="text-zinc-200">Егор</strong>
                <span className="text-[10px] text-zinc-500 hidden xl:inline">(ВШЭ / Dev)</span>
              </span>
              <span className="text-zinc-600">&</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                <strong className="text-zinc-200">Аня</strong>
                <span className="text-[10px] text-zinc-500 hidden xl:inline">(РУДН / Я-Профи)</span>
              </span>
              <span className="hidden md:inline text-zinc-500">•</span>
              <span className="hidden md:inline text-zinc-400">
                Баланс: <span className="font-mono text-emerald-400">{budget.currentBalance.toLocaleString('ru-RU')} ₽</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="hidden lg:flex flex-1 max-w-sm items-center">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs text-zinc-400 shadow-inner hover:border-white/20 hover:text-zinc-200 transition-all"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-purple-400" />
              <span>Поиск или команда...</span>
            </span>
            <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 border border-white/10">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Atmosphere, Audio, Stats, New Task, Settings */}
        <div className="flex items-center gap-2">
          {/* Dual Clock (visible on desktop) */}
          <div className="hidden sm:block">
            <DualTimeClock />
          </div>

          {/* Atmosphere Mode Selector */}
          <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setAtmosphereMode('twilight')}
              className={`rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                atmosphereMode === 'twilight'
                  ? 'bg-purple-600/40 text-purple-200 border border-purple-500/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Атмосфера: Звездные сумерки (Twilight Night)"
            >
              🌌
            </button>
            <button
              type="button"
              onClick={() => setAtmosphereMode('cyber')}
              className={`rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                atmosphereMode === 'cyber'
                  ? 'bg-purple-600/40 text-purple-200 border border-purple-500/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Атмосфера: Cyber Cozy Неон"
            >
              💜
            </button>
            <button
              type="button"
              onClick={() => setAtmosphereMode('transparent')}
              className={`rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                atmosphereMode === 'transparent'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Прозрачный фон (Übersicht Mac Desktop)"
            >
              🪟
            </button>
          </div>

          {/* Procedural UI Sound FX Toggle */}
          <button
            type="button"
            onClick={() => setSoundMuted(!soundMuted)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono border transition-colors ${
              !soundMuted
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-white/[0.04] text-zinc-500 border-white/10 hover:bg-white/10'
            }`}
            title={soundMuted ? 'Включить клики и фанфары' : 'Звуковые эффекты активны'}
          >
            {!soundMuted ? (
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <span className="text-[10px]">🔇</span>
            )}
          </button>

          {/* Sound Ambiance Toggle (Rain) */}
          <button
            type="button"
            onClick={() => setSoundAmbiance(soundAmbiance === 'off' ? 'rain' : 'off')}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono border transition-colors ${
              soundAmbiance !== 'off'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:bg-white/10'
            }`}
            title="Cozy Audio Ambiance (Ночной дождь без внешних файлов)"
          >
            {soundAmbiance !== 'off' ? (
              <Volume2 className="h-3.5 w-3.5" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Quick Stats Pill */}
          <div className="hidden 2xl:flex items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs border border-white/[0.06]">
            <span className="flex items-center gap-1 text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{completedTasks}/{totalTasks}</span>
            </span>
            {overdueCount > 0 && (
              <span className="flex items-center gap-1 rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-red-300 border border-red-500/30">
                {overdueCount} просрочено
              </span>
            )}
          </div>

          {/* Desktop Übersicht Widget Mode Toggle */}
          <button
            type="button"
            onClick={onToggleWidgetMode}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
              isWidgetMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/[0.05] text-zinc-300 border-white/10 hover:bg-white/10'
            }`}
            title="Режим рабочего стола (Übersicht / Desktop Mode)"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Виджет</span>
          </button>

          {/* New Task Button */}
          <button
            type="button"
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-semibold text-black shadow-md shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Задача</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-lg p-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors"
            title="Настройки и синхронизация"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
