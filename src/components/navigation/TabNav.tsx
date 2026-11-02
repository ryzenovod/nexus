import React from 'react';
import { motion } from 'framer-motion';
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
      label: 'Вишлист дома',
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
    <nav className="border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-2xl px-4 sm:px-6">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between py-2">
        {/* Raycast-style Segmented Control Container */}
        <div className="inline-flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors select-none ${
                  isActive
                    ? 'text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-md border border-white/[0.08] bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>

                  {tab.badge !== undefined && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/10 px-1 font-mono text-[9px] font-semibold text-zinc-300 border border-white/10">
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subtle keyboard hint */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
          <span>Навигация:</span>
          <div className="flex items-center gap-1">
            <kbd className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px]">1</kbd>
            <kbd className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px]">2</kbd>
            <kbd className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px]">3</kbd>
            <kbd className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px]">4</kbd>
          </div>
        </div>
      </div>
    </nav>
  );
};
