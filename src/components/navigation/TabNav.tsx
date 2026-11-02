import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Gift, 
  Trophy 
} from 'lucide-react';

export type NexusTab = 
  | 'command-center' 
  | 'finances' 
  | 'wishlist' 
  | 'study-work';

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
      label: 'Финансы и ЖКХ',
      shortLabel: 'Финансы',
      icon: CreditCard,
    },
    {
      id: 'wishlist' as NexusTab,
      label: 'Вишлист и Дом',
      shortLabel: 'Вишлист',
      icon: Gift,
      badge: wishlistPendingCount > 0 ? wishlistPendingCount : undefined,
    },
    {
      id: 'study-work' as NexusTab,
      label: 'Учеба и Проекты',
      shortLabel: 'Учеба',
      icon: Trophy,
    },
  ];

  return (
    <div className="border-b border-white/[0.07] bg-[#09090b]/80 backdrop-blur-2xl px-4 sm:px-6">
      <div className="mx-auto flex max-w-[1720px] items-center gap-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white/[0.08] text-zinc-100 border border-white/[0.1] shadow-sm'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>

              {tab.badge !== undefined && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/10 px-1 font-mono text-[9px] font-semibold text-zinc-300 border border-white/10">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
