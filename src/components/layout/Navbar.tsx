import React from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Cloud, 
  CalendarDays,
  CreditCard,
  Heart,
  GraduationCap,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    supabaseConfig,
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
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 gap-4">
        {/* Left: Brand & Animated Cat Mascot Avatar */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onOpenCatRoom}
            className="flex items-center gap-2.5 p-1 -ml-1 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer group"
            title="Котик Нексус • Нажмите, чтобы открыть комнату маскота"
          >
            <div className="relative">
              {/* Mascot Vector Cat Icon */}
              <div className="h-9 w-9 rounded-lg border bg-zinc-900/90 flex items-center justify-center overflow-hidden shadow-xs group-hover:border-primary/50 transition-colors">
                <svg
                  width="28"
                  height="26"
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
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold leading-none flex items-center justify-center shadow-xs">
                {gamification.level}
              </span>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold tracking-tight leading-none text-foreground flex items-center gap-1.5">
                <span>NEXUS</span>
                <span className="text-[10px] text-amber-400 font-normal">🐱</span>
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                Егор & Аня
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-secondary text-secondary-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative hidden sm:block w-48 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск задач (⌘K)..."
              onClick={onOpenSearch}
              readOnly
              className="h-8 pl-8 pr-12 text-xs bg-muted/40 cursor-pointer"
            />
            <kbd className="pointer-events-none absolute right-2 top-2 hidden h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              ⌘K
            </kbd>
          </div>

          {/* Clean Tiny Sync Status Dot Indicator */}
          <button
            onClick={() => syncWithLivePipeline()}
            disabled={isSyncingLive}
            title={
              isSyncingLive 
                ? 'Синхронизация с Mac & Supabase...' 
                : `Синхронизировано (${lastSyncTime || 'онлайн'}). Нажмите для обновления`
            }
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-zinc-400 cursor-pointer transition-colors"
          >
            <span className="relative flex h-2 w-2">
              {isSyncingLive ? (
                <span className="animate-spin h-2 w-2 rounded-full border border-amber-400 border-t-transparent inline-block" />
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              )}
            </span>
            <span className="hidden xl:inline font-mono text-[11px] text-zinc-400">
              {isSyncingLive ? 'Синхронизация' : 'В сети'}
            </span>
          </button>

          {/* Settings Button (⚙️) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] rounded-lg"
            title="Настройки Supabase, импорта и синхронизации"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Add Task Button */}
          <Button 
            size="sm" 
            onClick={onOpenNewTask}
            className="h-8 px-3 text-xs font-medium gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Добавить</span>
          </Button>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar (screens < md) */}
      <div className="flex md:hidden items-center justify-around border-t py-1.5 px-2 bg-background/95">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
