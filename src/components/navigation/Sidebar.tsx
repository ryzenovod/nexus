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
  Monitor
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

  const levelProgress = Math.min(100, (gamification.xp / (gamification.nextLevelXp || 1000)) * 100);

  return (
    <aside className="w-[220px] shrink-0 border-r border-white/[0.06] bg-[#08080a] flex flex-col justify-between p-3 select-none z-20">
      {/* TOP SECTION: Brand & Navigation */}
      <div className="space-y-3.5">
        {/* Brand Block without loud colors */}
        <div className="px-1.5 pt-1">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-200">
              NEXUS
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              Уровень {gamification.level} · {gamification.xp} XP
            </span>
          </div>

          {/* Minimal 1px Hairline progress */}
          <div className="mt-2 h-[1.5px] w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div 
              className="h-full bg-zinc-400 transition-all duration-300"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Quick Search Trigger (⌘K) */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full text-left px-2.5 py-1.5 rounded-md bg-white/[0.02] hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-200 text-xs flex items-center justify-between transition-colors group border border-white/[0.04]"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            <span className="text-zinc-400 group-hover:text-zinc-200 text-[12px]">Поиск...</span>
          </div>
          <kbd className="font-mono text-[10px] text-zinc-500 bg-white/[0.04] px-1 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Navigation Items (Clean 13px typography without borders) */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                  isActive
                    ? 'bg-white/[0.07] text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02] font-normal'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon size={15} strokeWidth={1.75} className={`shrink-0 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.06] px-1.5 py-0.2 rounded shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM SECTION: Quiet Dual Timezone & Minimal Utility Row */}
      <div className="space-y-3 pt-3 border-t border-white/[0.05]">
        <div className="px-1.5">
          <DualTimeClock />
        </div>

        {/* Quick Utility Icons in a single row */}
        <div className="flex items-center justify-between px-1 text-zinc-500">
          <button
            type="button"
            onClick={onOpenTelegram}
            className="p-1.5 rounded hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
            title="Telegram Бот"
          >
            <Send size={14} strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onOpenTamagotchi}
            className="p-1.5 rounded hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
            title="Талисман Кот"
          >
            <Sparkles size={14} strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={() => setSoundAmbiance(soundAmbiance === 'rain' ? 'off' : 'rain')}
            className={`p-1.5 rounded transition-colors ${
              soundAmbiance !== 'off' 
                ? 'text-zinc-200 bg-white/[0.08]' 
                : 'hover:bg-white/[0.06] hover:text-zinc-200'
            }`}
            title="Фоновый звук"
          >
            {soundAmbiance !== 'off' ? <Volume2 size={14} strokeWidth={1.75} /> : <VolumeX size={14} strokeWidth={1.75} />}
          </button>

          <button
            type="button"
            onClick={onToggleWidgetMode}
            className={`p-1.5 rounded transition-colors ${
              isWidgetMode 
                ? 'text-zinc-100 bg-white/[0.1]' 
                : 'hover:bg-white/[0.06] hover:text-zinc-200'
            }`}
            title="Виджет рабочего стола"
          >
            <Monitor size={14} strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 rounded hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
            title="Настройки"
          >
            <Settings size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
};
