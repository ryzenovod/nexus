import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  RefreshCw, 
  Check, 
  Wallet, 
  Home, 
  GraduationCap, 
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Radio
} from 'lucide-react';
import { NexusTab } from './TabNav';
import { useNexusStore } from '../../store/useNexusStore';

interface DynamicIslandHeaderProps {
  activeTab: NexusTab;
  onTabChange: (tab: NexusTab) => void;
  onOpenCommandPalette: () => void;
  onOpenNewTask: () => void;
  onOpenTamagotchi: () => void;
  wishlistPendingCount: number;
}

export const DynamicIslandHeader: React.FC<DynamicIslandHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenCommandPalette,
  onOpenNewTask,
  onOpenTamagotchi,
  wishlistPendingCount,
}) => {
  const { 
    isSyncingLive, 
    lastSyncTime, 
    syncWithLivePipeline,
    gamification,
    budget 
  } = useNexusStore();

  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [currentTimeMSK, setCurrentTimeMSK] = useState('');
  const [currentTimeDFO, setCurrentTimeDFO] = useState('');

  // Dual clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeMSK(
        now.toLocaleTimeString('ru-RU', {
          timeZone: 'Europe/Moscow',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setCurrentTimeDFO(
        now.toLocaleTimeString('ru-RU', {
          timeZone: 'Asia/Vladivostok',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncStatus('idle');
    const res = await syncWithLivePipeline();
    if (res.success) {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } else {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const navItems: { id: NexusTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'command-center', label: 'Центр управления', icon: <LayoutDashboard size={14} /> },
    { id: 'finances', label: 'Финансы и ЖКХ', icon: <Wallet size={14} /> },
    { id: 'wishlist', label: 'Вишлист и Дом', icon: <Home size={14} />, badge: wishlistPendingCount },
    { id: 'study-work', label: 'Учеба и Я-Профи', icon: <GraduationCap size={14} /> },
  ];

  return (
    <header className="sticky top-4 z-50 mx-auto w-fit max-w-[96vw] px-2.5 py-1.5 rounded-full bg-[#12141c]/75 backdrop-blur-3xl border border-white/[0.09] shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center gap-2 select-none transition-all">
      {/* Brand Pill with Avatar */}
      <button
        type="button"
        onClick={onOpenTamagotchi}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer group"
        title="Питомец NEXUS (Дримтим)"
      >
        <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-400/30 flex items-center justify-center border border-amber-400/30 text-[11px]">
          <span>🐱</span>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#12141c] animate-pulse" />
        </div>
        <div className="flex flex-col text-left leading-none">
          <span className="text-[11.5px] font-bold tracking-tight text-white group-hover:text-amber-200 transition-colors">
            NEXUS
          </span>
          <span className="text-[9px] font-medium text-zinc-400 tabular-nums">
            lvl {gamification.level}
          </span>
        </div>
      </button>

      <div className="h-4 w-[1px] bg-white/[0.08] mx-0.5" />

      {/* Main 4 Space Tabs */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`h-[30px] px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/[0.12] text-white font-semibold border border-white/[0.14] shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <span className={isActive ? 'text-amber-300' : 'text-zinc-400'}>
                {item.icon}
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center border border-amber-500/30">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="h-4 w-[1px] bg-white/[0.08] mx-0.5 hidden sm:block" />

      {/* Dual Time Clock Pill: МСК & ДФО */}
      <div 
        className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[11px] font-mono-num text-zinc-300"
        title="Время МСК (Москва) и ДФО (Дальний Восток)"
      >
        <div className="flex items-center gap-1">
          <span className="text-zinc-500 font-sans text-[10px] font-bold">МСК</span>
          <span className="font-semibold text-white">{currentTimeMSK || '--:--'}</span>
        </div>
        <span className="text-zinc-600">·</span>
        <div className="flex items-center gap-1">
          <span className="text-zinc-500 font-sans text-[10px] font-bold">ДФО</span>
          <span className="text-amber-300/90 font-medium">{currentTimeDFO || '--:--'}</span>
        </div>
      </div>

      {/* Live Data Sync Button */}
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncingLive}
        className={`h-[30px] px-2.5 rounded-full text-[11.5px] font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
          syncStatus === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : syncStatus === 'error'
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06] text-zinc-300 hover:text-white'
        }`}
        title={lastSyncTime ? `Синхронизировано в ${lastSyncTime}. Клик для обновления из TickTick/GCal` : 'Синхронизировать из TickTick и календаря'}
      >
        <RefreshCw 
          size={12} 
          className={isSyncingLive ? 'animate-spin text-amber-400' : syncStatus === 'success' ? 'text-emerald-400' : 'text-zinc-400'} 
        />
        <span className="hidden lg:inline text-[11px]">
          {isSyncingLive ? 'Синхронизация...' : syncStatus === 'success' ? 'Обновлено' : lastSyncTime ? `Live ${lastSyncTime}` : 'Синхронизация'}
        </span>
      </button>

      {/* Command Palette Trigger ⌘K */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="h-[30px] px-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 text-[11.5px] flex items-center gap-1.5 transition-all cursor-pointer"
        title="Командная строка (⌘K)"
      >
        <Search size={12} />
        <span className="font-mono-num text-[10.5px] px-1 py-0.2 rounded bg-white/[0.08] text-zinc-300 border border-white/[0.08]">
          ⌘K
        </span>
      </button>

      {/* Primary Action Button: + Создать */}
      <button
        type="button"
        onClick={onOpenNewTask}
        className="h-[30px] pl-2.5 pr-3 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 text-[12px] font-semibold flex items-center gap-1.5 shadow-[0_2px_10px_rgba(255,255,255,0.15)] transition-all cursor-pointer active:scale-95"
      >
        <Plus size={13} strokeWidth={2.6} />
        <span>Создать</span>
      </button>
    </header>
  );
};
