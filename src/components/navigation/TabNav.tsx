import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Gift, 
  GraduationCap, 
  Timer
} from 'lucide-react';

export type NexusTab = 'command-center' | 'finances' | 'wishlist' | 'study-work' | 'pomodoro';

interface TabNavProps {
  activeTab: NexusTab;
  onTabChange: (tab: NexusTab) => void;
  wishlistPendingCount?: number;
}

export const TabNav: React.FC<TabNavProps> = ({
  activeTab,
  onTabChange,
  wishlistPendingCount = 0,
}) => {
  const tabs = [
    {
      id: 'command-center' as NexusTab,
      label: 'Центр управления',
      shortLabel: 'Задачи',
      icon: LayoutDashboard,
    },
    {
      id: 'finances' as NexusTab,
      label: 'Финансы & ЖКХ',
      shortLabel: 'Финансы',
      icon: CreditCard,
    },
    {
      id: 'wishlist' as NexusTab,
      label: 'Берем или нет?',
      shortLabel: 'Вишлист',
      icon: Gift,
      badge: wishlistPendingCount > 0 ? wishlistPendingCount : undefined,
    },
    {
      id: 'study-work' as NexusTab,
      label: 'Учеба & Работа',
      shortLabel: 'Учеба',
      icon: GraduationCap,
    },
    {
      id: 'pomodoro' as NexusTab,
      label: 'Фокус-таймер',
      shortLabel: 'Pomodoro',
      icon: Timer,
    },
  ];

  return (
    <div className="border-b border-white/[0.08] bg-[#0b0d11]/40 px-4">
      <div className="mx-auto flex max-w-[1720px] items-center gap-1 overflow-x-auto py-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white/[0.1] text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.shortLabel}</span>

              {tab.badge !== undefined && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/20 px-1 font-mono text-[9px] font-bold text-amber-300 border border-amber-500/40">
                  {tab.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
