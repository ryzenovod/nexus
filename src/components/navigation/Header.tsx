import React from 'react';
import { 
  Sparkles, 
  Settings, 
  Search, 
  Monitor, 
  Plus, 
  CheckCircle2, 
  Cloud, 
  CloudOff
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewTask: () => void;
  isWidgetMode: boolean;
  onToggleWidgetMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenCommandPalette,
  onOpenNewTask,
  isWidgetMode,
  onToggleWidgetMode,
}) => {
  const { tasks, budget, supabaseConfig, isSyncing } = useNexusStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const overdueCount = tasks.filter((t) => t.isOverdue && !t.completed).length;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0b0d11]/80 backdrop-blur-2xl px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4">
        {/* Brand & Couple Profiles */}
        <div className="flex items-center gap-3.5">
          {/* Logo Mark */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-zinc-800 to-indigo-500/20 border border-white/10 shadow-lg shadow-amber-500/10">
            <Sparkles className="h-5 w-5 text-amber-400" />
            {isSyncing && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-tight text-white">
                NEXUS
              </span>
              <span className="hidden sm:inline-block rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-400 border border-white/[0.08]">
                Couple OS
              </span>

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
                    <span>Синхронизировано</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-2.5 w-2.5 text-zinc-400" />
                    <span>Локально</span>
                  </>
                )}
              </button>
            </div>

            {/* Couple Status Row */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                <strong className="text-zinc-200">Егор</strong>
              </span>
              <span className="text-zinc-600">&</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                <strong className="text-zinc-200">Аня</strong>
              </span>
              <span className="hidden md:inline text-zinc-500">•</span>
              <span className="hidden md:inline text-zinc-400">
                Баланс: <span className="font-mono text-emerald-400">{budget.currentBalance.toLocaleString('ru-RU')} ₽</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="hidden md:flex flex-1 max-w-md items-center">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs text-zinc-400 shadow-inner hover:border-white/20 hover:text-zinc-200 transition-all"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <span>Поиск или быстрая команда...</span>
            </span>
            <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 border border-white/10">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs border border-white/[0.06]">
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
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
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
