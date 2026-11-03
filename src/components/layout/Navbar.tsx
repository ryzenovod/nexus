import React from 'react';
import { 
  Plus, 
  Search, 
  CalendarDays,
  CreditCard,
  Heart,
  GraduationCap,
  Settings
} from 'lucide-react';
import { useNexusStore } from '@/store/useNexusStore';

export type DashboardTab = 'overview' | 'finances' | 'wishlist' | 'study-work';

interface NavbarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onOpenNewTask: () => void;
  onOpenSearch: () => void;
  onOpenCatRoom?: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTask,
  onOpenSearch,
  onOpenCatRoom,
  onOpenSettings,
}) => {
  const { 
    lastSyncTime, 
    isSyncingLive, 
    syncWithLivePipeline, 
    wishlist,
    gamification 
  } = useNexusStore();

  const pendingWishlistCount = wishlist.filter((w) => w.status === 'pending').length;

  const navItems = [
    { id: 'overview' as const, label: 'Обзор и Задачи', icon: CalendarDays },
    { id: 'finances' as const, label: 'Финансы и ЖКХ', icon: CreditCard },
    { 
      id: 'wishlist' as const, 
      label: 'Вишлист и Дом', 
      icon: Heart,
      badge: pendingWishlistCount > 0 ? pendingWishlistCount : undefined 
    },
    { id: 'study-work' as const, label: 'Учеба и Проекты', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-4 z-40 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 mb-4 w-full">
      {/* Floating Glass Dock */}
      <div className="rounded-full bg-[#0D101A]/80 backdrop-blur-2xl px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(255,255,255,0.06)] flex items-center justify-between gap-3">
        {/* ── Left: Brand Capsule with Cat Mascot ── */}
        <button
          type="button"
          onClick={onOpenCatRoom}
          className="flex items-center gap-3 p-1 rounded-full hover:bg-white/[0.04] transition-all cursor-pointer group select-none text-left"
          title="Котик Нексус • Нажмите, чтобы открыть комнату маскота"
        >
          <div className="relative">
            {/* Mascot Vector Cat Icon in glowing circular pill */}
            <div className="h-9 w-9 rounded-full bg-[#121522] flex items-center justify-center overflow-hidden ring-1 ring-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-transform duration-300 group-hover:scale-105">
              <svg
                width="26"
                height="24"
                viewBox="0 0 100 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform group-hover:scale-110 duration-200"
              >
                {/* Left Ear */}
                <polygon points="24,28 32,8 46,24" fill="#27272a" stroke="#71717a" strokeWidth="2.5" strokeLinejoin="round" />
                <polygon points="27,26 33,13 41,23" fill="#3f3f46" />

                {/* Right Ear */}
                <polygon points="54,24 68,8 76,28" fill="#27272a" stroke="#71717a" strokeWidth="2.5" strokeLinejoin="round" />
                <polygon points="59,23 67,13 73,26" fill="#3f3f46" />

                {/* Head */}
                <ellipse cx="50" cy="52" rx="34" ry="28" fill="#18181b" stroke="#71717a" strokeWidth="2" />

                {/* Cyber Neon Band */}
                <path d="M22 46 C32 38, 68 38, 78 46" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity="0.9" />

                {/* Eyes */}
                <circle cx="37" cy="50" r="4.5" fill="#09090b" stroke="#a1a1aa" strokeWidth="1.5" />
                <circle cx="38" cy="49" r="2.5" fill="#f4f4f5" />
                <circle cx="63" cy="50" r="4.5" fill="#09090b" stroke="#a1a1aa" strokeWidth="1.5" />
                <circle cx="64" cy="49" r="2.5" fill="#f4f4f5" />

                {/* Nose */}
                <polygon points="50,56 48,54 52,54" fill="#ec4899" />
              </svg>
            </div>

            {/* Level Pill */}
            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40 text-[9px] font-medium tabular-nums flex items-center justify-center">
              {gamification.level}
            </span>
          </div>

          <div className="flex flex-col text-left pr-1 hidden sm:flex">
            <span className="text-sm font-semibold tracking-tight leading-none text-white flex items-center gap-1.5">
              <span>NEXUS</span>
              <span className="text-[10px] text-amber-400 font-normal">✨</span>
            </span>
            <span className="text-[11px] text-zinc-400 leading-tight mt-1">
              Егор & Аня
            </span>
          </div>
        </button>

        {/* ── Center: Navigation Pills (Desktop & Tablet) ── */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-white/[0.03] p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.11] text-white shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'text-indigo-300 scale-105' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-[11px] tabular-nums font-medium">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Right: Compact Action Block (Zero Harsh Borders) ── */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search ⌘K */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="rounded-full bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5 text-xs text-zinc-400 flex items-center gap-2.5 transition-all cursor-pointer group"
          >
            <Search className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
            <span className="hidden lg:inline group-hover:text-zinc-200 transition-colors">Поиск...</span>
            <kbd className="pointer-events-none select-none rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400 font-medium hidden sm:inline-flex">
              ⌘K
            </kbd>
          </button>

          {/* Network / Sync Status Dot */}
          <button
            type="button"
            onClick={() => syncWithLivePipeline()}
            disabled={isSyncingLive}
            title={
              isSyncingLive 
                ? 'Синхронизация с Mac & Supabase...' 
                : `Синхронизировано (${lastSyncTime || 'онлайн'}). Нажмите для обновления`
            }
            className="flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-300 px-2.5 py-1.5 text-[11px] font-medium transition-all hover:bg-emerald-500/15 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              {isSyncingLive ? (
                <span className="animate-spin h-2 w-2 rounded-full border border-amber-400 border-t-transparent inline-block" />
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>
                </>
              )}
            </span>
            <span className="hidden xl:inline tabular-nums">
              {isSyncingLive ? 'Синхр...' : 'В сети'}
            </span>
          </button>

          {/* Settings Gear ⚙️ */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all cursor-pointer"
              title="Настройки Supabase, импорта и синхронизации"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}

          {/* Primary + Добавить Button */}
          <button
            type="button"
            onClick={onOpenNewTask}
            className="rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-medium text-[13px] px-4 py-2 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Pill Dock (screens < md) ── */}
      <div className="md:hidden mt-2 flex items-center justify-between gap-1 rounded-full bg-[#0D101A]/85 backdrop-blur-2xl p-1 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(255,255,255,0.06)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-full text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-white/[0.12] text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{item.label.split(' ')[0]}</span>
              {item.badge !== undefined && (
                <span className="rounded-full bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 text-[9px] tabular-nums">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
