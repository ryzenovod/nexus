import React from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Cloud, 
  Clock, 
  CalendarDays,
  CreditCard,
  Heart,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNexusStore } from '@/store/useNexusStore';

export type DashboardTab = 'overview' | 'finances' | 'wishlist' | 'study-work';

interface NavbarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onOpenNewTask: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTask,
  onOpenSearch,
}) => {
  const { 
    lastSyncTime, 
    isSyncingLive, 
    syncWithLivePipeline, 
    supabaseConfig,
    wishlist 
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
        {/* Left: Brand / Team Switcher */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 rounded-lg border bg-muted">
              <AvatarFallback className="rounded-lg bg-zinc-900 font-bold text-xs text-zinc-100">
                N
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight leading-none text-foreground">
                NEXUS
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                Егор & Аня
              </span>
            </div>
          </div>

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

          {/* Live Sync Status */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncWithLivePipeline()}
            disabled={isSyncingLive}
            className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            title="Нажмите для принудительной синхронизации"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncingLive ? 'animate-spin text-amber-400' : 'text-emerald-500'}`} />
            <span className="hidden lg:inline">
              {isSyncingLive ? 'Синхронизация...' : `Live ${lastSyncTime || '16:59'}`}
            </span>
          </Button>

          {/* Supabase Status Indicator */}
          <Badge 
            variant="outline" 
            className="hidden xl:flex items-center gap-1 h-8 px-2.5 text-[11px] font-mono text-muted-foreground"
          >
            <Cloud className="h-3 w-3 text-sky-400" />
            <span>Supabase Live</span>
          </Badge>

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
