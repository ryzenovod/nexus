import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Gift, 
  Trophy, 
  Plus, 
  Search 
} from 'lucide-react';
import { NexusTab } from './TabNav';

interface MobileBottomBarProps {
  activeTab: NexusTab;
  onTabChange: (tab: NexusTab) => void;
  onOpenNewTask: () => void;
  onOpenCommandPalette: () => void;
  wishlistBadge?: number;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTask,
  onOpenCommandPalette,
  wishlistBadge = 0,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-zinc-950/95 backdrop-blur-2xl px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around gap-1">
        <button
          type="button"
          onClick={() => onTabChange('command-center')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-colors ${
            activeTab === 'command-center' ? 'text-zinc-100 font-medium' : 'text-zinc-500'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Задачи</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('finances')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-colors ${
            activeTab === 'finances' ? 'text-zinc-100 font-medium' : 'text-zinc-500'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>ЖКХ/Счет</span>
        </button>

        {/* Floating Quick Action Button */}
        <button
          type="button"
          onClick={onOpenNewTask}
          className="flex -mt-4 h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => onTabChange('wishlist')}
          className={`relative flex flex-col items-center gap-1 p-1 text-[10px] transition-colors ${
            activeTab === 'wishlist' ? 'text-zinc-100 font-medium' : 'text-zinc-500'
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>Дом</span>
          {wishlistBadge > 0 && (
            <span className="absolute -top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-zinc-100 text-[8px] font-bold text-zinc-950 px-0.5">
              {wishlistBadge}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('study-work')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-colors ${
            activeTab === 'study-work' ? 'text-zinc-100 font-medium' : 'text-zinc-500'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Учеба</span>
        </button>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex flex-col items-center gap-1 p-1 text-[10px] text-zinc-500 hover:text-zinc-300"
        >
          <Search className="h-4 w-4" />
          <span>Поиск</span>
        </button>
      </div>
    </div>
  );
};
