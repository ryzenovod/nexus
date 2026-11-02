import React from 'react';
import { 
  Settings, 
  Search, 
  Monitor, 
  Plus, 
  Cloud, 
  CloudOff,
  Volume2,
  VolumeX,
  Bot
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { DualTimeClock } from '../visual/DualTimeClock';
import { CyberCatMascot } from '../visual/CyberCatMascot';

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
    budget, 
    supabaseConfig, 
    telegramConfig,
    gamification,
    equipCosmetic,
    soundAmbiance,
    setSoundAmbiance,
    soundMuted,
    setSoundMuted
  } = useNexusStore();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#09090b]/85 backdrop-blur-2xl px-4 py-2 sm:px-6">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-3">
        {/* Brand & Unified Typographic Status Line */}
        <div className="flex items-center gap-3">
          {/* Minimalist Cat Mascot Avatar */}
          <div 
            onClick={onOpenTamagotchiRoom}
            className="flex items-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title="Тамагочи-Комната Котика Нексуса"
          >
            <CyberCatMascot
              gamification={gamification}
              onEquipCosmetic={equipCosmetic}
              compact
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-100">
                NEXUS
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                v2.4
              </span>
            </div>

            {/* Unified Calm Typographic Status Line */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-normal">
              <span>Егор & Аня</span>
              <span className="text-zinc-700">•</span>
              <span className="font-mono text-zinc-300">
                {budget.currentBalance.toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-zinc-700 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={onOpenTamagotchiRoom}
                className="hidden sm:inline font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Ур. {gamification.level} ({gamification.xp} XP)
              </button>
              <span className="text-zinc-700 hidden md:inline">•</span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="hidden md:flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {supabaseConfig.isConnected ? (
                  <>
                    <Cloud className="h-3 w-3 text-zinc-400" />
                    <span>Синхронизировано</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-3 w-3 text-zinc-500" />
                    <span>Локально</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Center: Command Palette Trigger (Raycast style) */}
        <div className="hidden lg:flex flex-1 max-w-xs items-center">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 shadow-sm hover:border-white/20 hover:text-zinc-200 transition-all"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <span>Поиск или команда...</span>
            </span>
            <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 border border-white/10">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Dual Clock (Moscow vs DFO) */}
          <div className="hidden sm:block">
            <DualTimeClock />
          </div>

          {/* Telegram Bridge Pill */}
          <button
            type="button"
            onClick={onOpenTelegramBridge}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium border transition-colors ${
              telegramConfig.isConnected
                ? 'bg-white/[0.08] text-zinc-200 border-white/15'
                : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:bg-white/[0.06]'
            }`}
            title="Telegram-Бот Пары (отправка покупок, ЖКХ и синхронизация)"
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden md:inline">TG Бот</span>
          </button>

          {/* UI Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => setSoundMuted(!soundMuted)}
            className="flex items-center rounded-xl p-2 text-xs font-mono border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            title={soundMuted ? 'Включить звуки UI' : 'Заглушить звуки UI'}
          >
            {!soundMuted ? (
              <span className="text-xs">🔔</span>
            ) : (
              <span className="text-xs opacity-40">🔕</span>
            )}
          </button>

          {/* Sound Ambiance Toggle (Rain) */}
          <button
            type="button"
            onClick={() => setSoundAmbiance(soundAmbiance === 'off' ? 'rain' : 'off')}
            className={`flex items-center rounded-xl p-2 text-xs border transition-colors ${
              soundAmbiance !== 'off'
                ? 'bg-white/[0.1] text-zinc-100 border-white/20'
                : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:bg-white/[0.06]'
            }`}
            title="Фоновый звук дождя"
          >
            {soundAmbiance !== 'off' ? (
              <Volume2 className="h-3.5 w-3.5" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Desktop Übersicht Widget Mode Toggle */}
          <button
            type="button"
            onClick={onToggleWidgetMode}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium border transition-colors ${
              isWidgetMode
                ? 'bg-white/[0.15] text-white border-white/25'
                : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:bg-white/[0.06]'
            }`}
            title="Режим рабочего стола (Übersicht / Desktop Mode)"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Виджет</span>
          </button>

          {/* Primary High-Contrast Button: + Задача */}
          <button
            type="button"
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-950 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Задача</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-xl p-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] border border-transparent transition-colors"
            title="Настройки и синхронизация"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
