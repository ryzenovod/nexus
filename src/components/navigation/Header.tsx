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
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-2xl px-4 py-2 sm:px-6">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4">
        {/* Left: Minimalist Vector Cat Logo + NEXUS + Level Badge */}
        <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-100">
              NEXUS
            </span>
            <button
              type="button"
              onClick={onOpenTamagotchiRoom}
              className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Открыть комнату тамагочи"
            >
              Lv.{gamification.level} · {gamification.xp} XP
            </button>
          </div>
        </div>

        {/* Center: Raycast-style Command Bar + Time Informer */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md justify-center">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex w-full max-w-[260px] items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 hover:border-white/20 hover:text-zinc-200 transition-all select-none"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <span>Поиск или команда...</span>
            </span>
            <kbd className="rounded border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
              ⌘K
            </kbd>
          </button>

          {/* Clean Informer: МСК 12:43 · ДФО 19:43 */}
          <DualTimeClock compact />
        </div>

        {/* Right: Sync Indicator, Controls, Widget Toggle & Primary Button */}
        <div className="flex items-center gap-2">
          {/* Quiet Sync Indicator */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="hidden xl:flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Статус облачной синхронизации Supabase"
          >
            {supabaseConfig.isConnected ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Синхронизировано</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                <span>Локально</span>
              </>
            )}
          </button>

          {/* Telegram Bridge Pill */}
          <button
            type="button"
            onClick={onOpenTelegramBridge}
            className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
              telegramConfig.isConnected
                ? 'bg-white/[0.08] text-zinc-200 border-white/15'
                : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.06]'
            }`}
            title="Telegram-Бот Пары"
          >
            <Bot className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden lg:inline">TG Бот</span>
          </button>

          {/* Sound & Ambiance Controls (Grouped Minimalist Pill) */}
          <div className="flex items-center rounded-lg border border-white/[0.06] bg-white/[0.03] p-0.5">
            <button
              type="button"
              onClick={() => setSoundMuted(!soundMuted)}
              className="flex items-center justify-center rounded p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
              title={soundMuted ? 'Включить звуки UI' : 'Заглушить звуки UI'}
            >
              <span className="text-[11px] leading-none">{!soundMuted ? '🔔' : '🔕'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundAmbiance(soundAmbiance === 'off' ? 'rain' : 'off')}
              className={`flex items-center justify-center rounded p-1 text-xs transition-colors ${
                soundAmbiance !== 'off'
                  ? 'bg-white/[0.1] text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Фоновый звук дождя (Web Audio)"
            >
              {soundAmbiance !== 'off' ? (
                <Volume2 className="h-3 w-3" />
              ) : (
                <VolumeX className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* Desktop Übersicht Widget Mode Toggle */}
          <button
            type="button"
            onClick={onToggleWidgetMode}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
              isWidgetMode
                ? 'bg-white/[0.12] text-white border-white/20'
                : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-zinc-200'
            }`}
            title="Режим рабочего стола (Übersicht Desktop Mode)"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Виджет</span>
          </button>

          {/* ONE Primary High-Contrast Button: + Задача (Linear / Vercel style) */}
          <button
            type="button"
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white px-3 py-1 text-xs font-medium text-zinc-950 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Задача</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Настройки и синхронизация"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
