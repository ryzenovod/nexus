import React, { useState } from 'react';
import { Plus, LayoutGrid, Sparkles } from 'lucide-react';
import { NexusTask, Assignee } from '../../types/nexus';
import { BentoTopRow } from './BentoTopRow';
import { AmieWeekCalendar } from './AmieWeekCalendar';
import { BentoSpheresColumns } from './BentoSpheresColumns';
import { InboxGrid } from '../command-center/InboxGrid';

interface BentoDashboardProps {
  tasks: NexusTask[];
  activeWeekOffset: number;
  onOffsetChange: (offset: number) => void;
  onToggleTask: (id: string) => void;
  onTaskClick: (task: NexusTask) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (date?: string, defaultCategory?: string, defaultRoom?: string) => void;
  selectedAssignee: Assignee;
  onAssigneeChange: (assignee: Assignee) => void;
  onNavigateTab: (tab: any) => void;
  onOpenTamagotchi: () => void;
  isWidgetMode?: boolean;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  tasks,
  activeWeekOffset,
  onOffsetChange,
  onToggleTask,
  onTaskClick,
  onDeleteTask,
  onAddTask,
  selectedAssignee,
  onAssigneeChange,
  onNavigateTab,
  onOpenTamagotchi,
  isWidgetMode = false,
}) => {
  const [viewMode, setViewMode] = useState<'bento' | 'flat-grid'>(
    isWidgetMode ? 'flat-grid' : 'bento'
  );

  // Filter tasks by assignee
  const filteredTasks = tasks.filter((t) => {
    if (selectedAssignee !== 'all' && t.assignee !== selectedAssignee) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden select-none">
      {/* Top Bar with Breadcrumbs & Action Button */}
      <div className="h-[46px] px-6 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0c0d11]/80 backdrop-blur-xl">
        {/* Left: Breadcrumbs + Assignee Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-100">
            <span className="text-zinc-400">NEXUS</span>
            <span className="text-zinc-600">›</span>
            <span>Дашборд пары</span>
          </div>

          <div className="h-3 w-[1px] bg-white/[0.08]" />

          {/* Assignee Pills */}
          <div className="flex items-center gap-1">
            {(['all', 'egor', 'anya'] as const).map((a) => {
              const isActive = selectedAssignee === a;
              const label = a === 'all' ? 'Все' : a === 'egor' ? 'Егор' : 'Аня';

              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => onAssigneeChange(a)}
                  className={`h-[24px] px-2.5 rounded-lg text-[11.5px] transition-all ${
                    isActive
                      ? 'bg-white/[0.1] text-white font-medium border border-white/[0.12]'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 border border-white/[0.04]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: View Switcher & + New Task Button */}
        <div className="flex items-center gap-2.5">
          {/* Switcher: Bento Dashboard vs 4-Column Flat Grid */}
          <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setViewMode('bento')}
              className={`h-[24px] px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'bento'
                  ? 'bg-white/[0.1] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Модульный Bento-дашборд Amie"
            >
              <Sparkles size={11} className="text-amber-400" />
              <span>Bento</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('flat-grid')}
              className={`h-[24px] px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'flat-grid'
                  ? 'bg-white/[0.1] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Плоская сетка виджета"
            >
              <LayoutGrid size={11} />
              <span>Сетка</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => onAddTask()}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-[12px] font-semibold h-[26px] px-3 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.4} />
            <span>Новая задача</span>
          </button>
        </div>
      </div>

      {/* Main Content Viewport */}
      {viewMode === 'bento' ? (
        <div className="flex-1 overflow-y-auto [scrollbar-width:thin] p-6 space-y-6">
          <div className="max-w-[1560px] mx-auto space-y-6">
            {/* 1. TOP BENTO ROW (135px height, 3 interactive cards) */}
            <BentoTopRow
              tasks={filteredTasks}
              onOpenDateNight={() => onNavigateTab('wishlist')}
              onNavigateToFinances={() => onNavigateTab('finances')}
              onOpenTamagotchi={onOpenTamagotchi}
            />

            {/* 2. MIDDLE BLOCK: AMIE.SO WEEK CALENDAR */}
            <AmieWeekCalendar
              tasks={filteredTasks}
              activeWeekOffset={activeWeekOffset}
              onOffsetChange={onOffsetChange}
              onTaskClick={onTaskClick}
              onAddTaskForDay={(dateStr) => onAddTask(dateStr)}
            />

            {/* 3. LOWER BLOCK: 3 SMART LIFE SPHERE COLUMNS */}
            <BentoSpheresColumns
              tasks={filteredTasks}
              onToggleTask={onToggleTask}
              onTaskClick={onTaskClick}
              onAddTaskForSphere={(category, room) => onAddTask(undefined, category, room)}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 p-5 overflow-y-auto">
          <InboxGrid
            tasks={filteredTasks}
            searchQuery=""
            onSearchChange={() => {}}
            selectedBracket="all"
            onBracketChange={() => {}}
            selectedAssignee={selectedAssignee}
            onAssigneeChange={onAssigneeChange}
            selectedRoom="Все"
            onRoomChange={() => {}}
            selectedCategory="all"
            onCategoryChange={() => {}}
            isSmartGrouped={false}
            onToggleSmartGrouping={() => {}}
            onToggleTask={onToggleTask}
            onTaskClick={onTaskClick}
            onDeleteTask={onDeleteTask}
            onAddNewTask={() => onAddTask()}
          />
        </div>
      )}
    </div>
  );
};
