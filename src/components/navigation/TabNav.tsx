import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Gift, 
  GraduationCap, 
  Timer,
  Trophy
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
      label: 'Центр управления (Задачи)',
      shortLabel: 'Задачи',
      icon: LayoutDashboard,
    },
    {
      id: 'finances' as NexusTab,
      label: 'Финансы & ЖКХ Москвы',
      shortLabel: 'Финансы',
      icon: CreditCard,
    },
    {
      id: 'wishlist' as NexusTab,
      label: 'Берем или нет? 🐾',
      shortLabel: 'Вишлист',
      icon: Gift,
      badge: wishlistPendingCount > 0 ? wishlistPendingCount : undefined,
    },
    {
      id: 'study-work' as NexusTab,
      label: 'ВШЭ x РУДН x Я-Профи',
      shortLabel: 'Учеба/Я-Профи',
      icon: Trophy,
    },
    {
      id: 'pomodoro' as NexusTab,
      label: 'Cozy Focus Room',
      shortLabel: 'Focus Room',
      icon: Timer,
    },
  ];

  return (
    <div className="border-b border-white/[0.08] bg-[#090714]/60 backdrop-blur-2xl px-4">
      <div className="mx-auto flex max-w-[1720px] items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.shortLabel}</span>

              {tab.badge !== undefined && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/30 px-1 font-mono text-[9px] font-bold text-rose-300 border border-rose-500/40">
                  {tab.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
