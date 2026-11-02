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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500/20 bg-[#090714]/90 backdrop-blur-3xl px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around gap-1">
        <button
          type="button"
          onClick={() => onTabChange('command-center')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-colors ${
            activeTab === 'command-center' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Задачи</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('finances')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-colors ${
            activeTab === 'finances' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <CreditCard className="h-5 w-5" />
          <span>ЖКХ/Счет</span>
        </button>

        {/* Floating Quick Action Button */}
        <button
          type="button"
          onClick={onOpenNewTask}
          className="flex -mt-4 h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-500 text-black shadow-lg shadow-purple-500/40 active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6 stroke-[3] text-white" />
        </button>

        <button
          type="button"
          onClick={() => onTabChange('wishlist')}
          className={`relative flex flex-col items-center gap-1 p-1 text-[10px] transition-colors ${
            activeTab === 'wishlist' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Gift className="h-5 w-5" />
          <span>Берем?</span>
          {wishlistBadge > 0 && (
            <span className="absolute -top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-0.5">
              {wishlistBadge}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('study-work')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-colors ${
            activeTab === 'study-work' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Trophy className="h-5 w-5" />
          <span>Учеба</span>
        </button>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex flex-col items-center gap-1 p-1 text-[10px] text-zinc-400 hover:text-zinc-200"
        >
          <Search className="h-5 w-5" />
          <span>Поиск</span>
        </button>
      </div>
    </div>
  );
};
