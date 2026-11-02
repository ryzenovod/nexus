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
  const { gamification, soundMuted, setSoundMuted } = useNexusStore();

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
    <aside className="w-[224px] shrink-0 bg-[#08080a] px-3 py-3 flex flex-col justify-between select-none z-20">
      {/* TOP SECTION: Linear Workspace Switcher & Navigation */}
      <div className="space-y-3">
        {/* Linear Workspace Header */}
        <div className="px-1.5 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-[18px] h-[18px] rounded-[4px] bg-[#5e6ad2] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                N
              </div>
              <span className="font-sans text-[13px] font-semibold text-[#ededef] tracking-tight">
                NEXUS
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#5e636e] bg-[#14151b] px-1.5 py-0.5 rounded">
              Lv.{gamification.level}
            </span>
          </div>

          {/* Level Progress Line */}
          <div className="mt-2 h-[1.5px] w-full bg-[#1c1d24] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#5e6ad2] transition-all duration-300"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Quick Search Trigger (⌘K) in Linear style */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full text-left px-2.5 h-[28px] rounded-[5px] bg-[#131419] hover:bg-[#181922] text-[#8a8f98] hover:text-[#ededef] text-[12px] flex items-center justify-between transition-colors border border-[#1e2028]"
        >
          <div className="flex items-center gap-2">
            <Search size={13} className="text-[#5e636e]" />
            <span className="text-[12px]">Поиск...</span>
          </div>
          <kbd className="font-mono text-[10px] text-[#5e636e] bg-[#1a1b22] px-1 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Navigation Items (Linear style items) */}
        <nav className="space-y-0.5 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-2 h-[28px] rounded-[5px] text-[13px] transition-colors ${
                  isActive
                    ? 'bg-[#1a1b23] text-[#ededef] font-medium'
                    : 'text-[#8a8f98] hover:text-[#ededef] hover:bg-[#131419] font-normal'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    size={14}
                    strokeWidth={1.8}
                    className={`shrink-0 ${isActive ? 'text-[#5e6ad2]' : 'text-[#8a8f98]'}`}
                  />
                  <span className="truncate text-[12.5px]">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="h-4 min-w-[16px] px-1 rounded-full bg-[#5e6ad2] text-white text-[10px] font-mono flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM SECTION: Dual Clock & Utility Controls */}
      <div className="space-y-2.5 pt-3 border-t border-[#1c1d24]">
        {/* Dual Moscow - DFO Clock */}
        <div className="px-1 text-[11px] text-[#8a8f98]">
          <DualTimeClock compact />
        </div>

        {/* Utility Icon Row */}
        <div className="flex items-center justify-between px-1 text-[#8a8f98]">
          <button
            type="button"
            onClick={onOpenTelegram}
            className="p-1 rounded-[4px] hover:text-[#ededef] hover:bg-[#131419] transition-colors"
            title="Telegram Бот & Оповещения"
          >
            <Send size={13} />
          </button>

          <button
            type="button"
            onClick={onOpenTamagotchi}
            className="p-1 rounded-[4px] hover:text-[#ededef] hover:bg-[#131419] transition-colors"
            title="Котик Нексус (Тамагочи)"
          >
            <Sparkles size={13} />
          </button>

          <button
            type="button"
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-1 rounded-[4px] hover:text-[#ededef] hover:bg-[#131419] transition-colors"
            title={soundMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {soundMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          <button
            type="button"
            onClick={onToggleWidgetMode}
            className={`p-1 rounded-[4px] transition-colors ${
              isWidgetMode
                ? 'text-[#5e6ad2] bg-[#1a1b23]'
                : 'hover:text-[#ededef] hover:bg-[#131419]'
            }`}
            title="Режим виджета рабочего стола"
          >
            <Monitor size={13} />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1 rounded-[4px] hover:text-[#ededef] hover:bg-[#131419] transition-colors"
            title="Настройки & Supabase"
          >
            <Settings size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};
