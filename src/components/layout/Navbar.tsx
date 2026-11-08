import React from 'react';
import {
  CalendarDays, Command, CreditCard, GraduationCap, Heart, Plus,
  RefreshCw, Search, Settings2, ShieldCheck, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const navigation = [
  { id: 'overview', label: 'Обзор', mobile: 'Обзор', icon: CalendarDays },
  { id: 'finances', label: 'Финансы', mobile: 'Финансы', icon: CreditCard },
  { id: 'wishlist', label: 'Дом и покупки', mobile: 'Дом', icon: Heart },
  { id: 'study-work', label: 'Учёба и проекты', mobile: 'Проекты', icon: GraduationCap },
] as const;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, onTabChange, onOpenNewTask, onOpenSearch, onOpenCatRoom, onOpenSettings,
}) => {
  const { isSyncingLive, lastSyncTime, syncWithLivePipeline, wishlist } = useNexusStore();
  const wishlistCount = wishlist.filter(item => item.status === 'pending').length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-zinc-950/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button type="button" variant="outline" size="icon" aria-label="Комната NEXUS"
              onClick={onOpenCatRoom} className="shrink-0 border-white/10 bg-zinc-900">
              <Sparkles className="size-5 text-zinc-100" />
            </Button>
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight">NEXUS</div>
              <div className="hidden text-[11px] text-zinc-500 sm:block">Workspace · Егор и Аня</div>
            </div>
            <Badge variant="outline" className="hidden gap-1 border-white/10 text-[10px] font-normal text-zinc-400 lg:inline-flex">
              <ShieldCheck className="size-3" /> Локальные финансы
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={value => onTabChange(value as DashboardTab)} className="hidden md:block">
            <TabsList className="h-10 gap-1 border border-white/[0.06] bg-zinc-900/70 p-1">
              {navigation.map(item => {
                const Icon = item.icon;
                return <TabsTrigger key={item.id} value={item.id} className="gap-2 px-3.5 py-2 text-xs lg:text-sm">
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                  {item.id === 'wishlist' && wishlistCount > 0 && <Badge variant="secondary" className="px-1.5 text-[10px]">{wishlistCount}</Badge>}
                </TabsTrigger>;
              })}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1.5">
            <Button type="button" size="sm" variant="ghost" className="gap-2 text-zinc-400"
              title="Обновить локальный снимок данных" disabled={isSyncingLive}
              onClick={() => syncWithLivePipeline()}>
              <RefreshCw className={isSyncingLive ? 'size-4 animate-spin' : 'size-4'} />
              <span className="hidden text-xs lg:inline">{isSyncingLive ? 'Обновление' : lastSyncTime ? 'Обновить' : 'Локальный режим'}</span>
            </Button>
            <Separator orientation="vertical" className="mx-1 hidden h-6 bg-white/10 sm:block" />
            <Button type="button" variant="ghost" size="icon" onClick={onOpenSearch} aria-label="Поиск" title="Поиск ⌘K"><Search className="size-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={onOpenSettings} aria-label="Настройки" title="Настройки"><Settings2 className="size-4" /></Button>
            <Button type="button" size="sm" className="ml-1 gap-2 bg-zinc-100 text-zinc-950 hover:bg-white" onClick={onOpenNewTask}>
              <Plus className="size-4" /> <span className="hidden sm:inline">Новая задача</span>
            </Button>
          </div>
        </div>
      </header>

      <nav aria-label="Основные разделы" className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zinc-950/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="grid h-16 grid-cols-4 gap-1">
          {navigation.map(item => {
            const Icon = item.icon;
            const selected = item.id === activeTab;
            return <button key={item.id} type="button" onClick={() => onTabChange(item.id)}
              aria-current={selected ? 'page' : undefined}
              className={selected
                ? 'flex flex-col items-center justify-center gap-1 rounded-lg bg-white/[0.08] text-zinc-100'
                : 'flex flex-col items-center justify-center gap-1 rounded-lg text-zinc-500 hover:text-zinc-200'}>
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{item.mobile}</span>
            </button>;
          })}
        </div>
      </nav>
    </>
  );
};
