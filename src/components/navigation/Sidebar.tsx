import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Gift, 
  GraduationCap, 
  Search, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Settings, 
  Monitor,
  Flame
} from 'lucide-react';
import { NexusTab } from './TabNav';
import { useNexusStore } from '../../store/useNexusStore';
import { DualTimeClock } from '../visual/DualTimeClock';

interface SidebarProps {
  activeTab: NexusTab;
  onTabChange: (tab: NexusTab) => void;
  onOpenCommandPalette: () => void;
  onOpenTelegram: () => void;
  onOpenTamagotchi: () => void;
  onOpenSettings: () => void;
  isWidgetMode: boolean;
  onToggleWidgetMode: () => void;
  wishlistPendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenCommandPalette,
  onOpenTelegram,
  onOpenTamagotchi,
  onOpenSettings,
  isWidgetMode,
  onToggleWidgetMode,
  wishlistPendingCount,
}) => {
  const { gamification, soundAmbiance, setSoundAmbiance } = useNexusStore();

  const navItems = [
    {
      id: 'command-center' as NexusTab,
      label: 'Центр управления',
      icon: LayoutDashboard,
    },
    {
      id: 'finances' as NexusTab,
      label: 'Финансы и ЖКХ',
      icon: Wallet,
    },
    {
      id: 'wishlist' as NexusTab,
      label: 'Вишлист и Квартира',
      icon: Gift,
      badge: wishlistPendingCount > 0 ? wishlistPendingCount : undefined,
    },
    {
      id: 'study-work' as NexusTab,
      label: 'Учеба и Я-Профи',
      icon: GraduationCap,
    },
  ];

  const levelProgress = Math.min(100, (gamification.xp / gamification.nextLevelXp) * 100);

  return (
    <aside className="w-[220px] shrink-0 border-r border-white/[0.06] bg-[#09090b]/80 backdrop-blur-2xl flex flex-col justify-between p-3 select-none z-20">
      {/* TOP SECTION: Brand & Navigation */}
      <div className="space-y-4">
        {/* Brand Block */}
        <div className="px-1 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-tight text-white">
                NEXUS
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                OS
              </span>
            </div>

            {/* Quiet couple level indicator */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <span className="text-amber-400 font-semibold">Lv.{gamification.level}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-500">{gamification.xp} XP</span>
            </div>
          </div>

          {/* Thin progress bar */}
          <div className="mt-2 h-[2px] w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-400/80 transition-all duration-300"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Quick Search Trigger (⌘K) */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full text-left px-2.5 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 text-xs flex items-center justify-between transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
            <span className="text-zinc-400 group-hover:text-zinc-300 text-[12px]">Поиск...</span>
          </div>
          <kbd className="font-mono text-[10px] text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Navigation Items (Clean list without borders) */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="font-mono text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM SECTION: Quiet Dual Timezone & Quick Utilities */}
      <div className="space-y-3 pt-3 border-t border-white/[0.05]">
        {/* Quiet Dual Timezone in two clean lines */}
        <div className="px-2">
          <DualTimeClock />
        </div>

        {/* Quick Utility Icons in a single row */}
        <div className="flex items-center justify-between px-1 text-zinc-500">
          <button
            type="button"
            onClick={onOpenTelegram}
            className="p-1.5 rounded-md hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
            title="Telegram Бот & Оповещения"
          >
            <Send className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenTamagotchi}
            className="p-1.5 rounded-md hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
            title="Тамагочи-Кот & Уют"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setSoundAmbiance(soundAmbiance === 'rain' ? 'off' : 'rain')}
            className={`p-1.5 rounded-md transition-colors ${
              soundAmbiance !== 'off' 
                ? 'text-amber-400 bg-amber-500/10' 
                : 'hover:bg-white/[0.06] hover:text-zinc-200'
            }`}
            title={soundAmbiance !== 'off' ? `Звук уюта: ${soundAmbiance}` : 'Включить атмосферный звук'}
          >
            {soundAmbiance !== 'off' ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={onToggleWidgetMode}
            className={`p-1.5 rounded-md transition-colors ${
              isWidgetMode 
                ? 'text-cyan-400 bg-cyan-500/10' 
                : 'hover:bg-white/[0.06] hover:text-zinc-200'
            }`}
            title="Режим Übersicht виджета рабочего стола"
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 rounded-md hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
            title="Настройки & Supabase"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
