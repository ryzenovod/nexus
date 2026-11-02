import React, { useState } from 'react';
import { Plus, LayoutGrid, Sparkles, Calendar, Layers } from 'lucide-react';
import { NexusTask, Assignee } from '../../types/nexus';
import { BentoTopRow } from './BentoTopRow';
import { SpatialWeekTimeline } from './SpatialWeekTimeline';
import { SpatialInboxGrid } from './SpatialInboxGrid';
import { BentoSpheresColumns } from './BentoSpheresColumns';
import { useNexusStore } from '../../store/useNexusStore';

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
  const { gcalEvents } = useNexusStore();
  const [viewMode, setViewMode] = useState<'spatial' | 'bento'>(
    isWidgetMode ? 'spatial' : 'spatial'
  );

  // Filter tasks by assignee
  const filteredTasks = tasks.filter((t) => {
    if (selectedAssignee !== 'all' && t.assignee !== selectedAssignee && t.assignee !== 'together') {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden select-none">
      {/* Top Bar with Breadcrumbs & View Switcher */}
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
                  className={`h-[24px] px-2.5 rounded-lg text-[11.5px] transition-all cursor-pointer ${
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
          {/* Switcher: Spatial Timeline vs Bento Modules */}
          <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setViewMode('spatial')}
              className={`h-[24px] px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'spatial'
                  ? 'bg-white/[0.1] text-white shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Spatial Glass Дашборд (Timeline + Inbox)"
            >
              <Calendar size={11} className="text-amber-400" />
              <span>Таймлайн</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('bento')}
              className={`h-[24px] px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'bento'
                  ? 'bg-white/[0.1] text-white shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Модульный Bento-дашборд Amie"
            >
              <Sparkles size={11} className="text-purple-400" />
              <span>Bento</span>
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
      {viewMode === 'spatial' ? (
        <div className="flex-1 overflow-y-auto [scrollbar-width:thin] p-4 sm:p-6 space-y-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* 1. Spatial 7-Day Timeline (GCal + TickTick) */}
            <SpatialWeekTimeline
              tasks={filteredTasks}
              gcalEvents={gcalEvents}
              activeWeekOffset={activeWeekOffset}
              onOffsetChange={onOffsetChange}
              onToggleTask={onToggleTask}
              onTaskClick={onTaskClick}
              onAddTaskForDay={(dateStr) => onAddTask(dateStr)}
            />

            {/* 2. Spatial Inbox & Undated Grid (TickTick Tasks with Room Filter) */}
            <SpatialInboxGrid
              tasks={filteredTasks}
              onToggleTask={onToggleTask}
              onTaskClick={onTaskClick}
              onAddNewTask={() => onAddTask()}
              selectedAssignee={selectedAssignee}
              onAssigneeChange={onAssigneeChange}
              isWidgetMode={isWidgetMode}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto [scrollbar-width:thin] p-6 space-y-6">
          <div className="max-w-[1560px] mx-auto space-y-6">
            {/* Top Bento Row */}
            <BentoTopRow
              tasks={filteredTasks}
              onOpenDateNight={() => onNavigateTab('wishlist')}
              onNavigateToFinances={() => onNavigateTab('finances')}
              onOpenTamagotchi={onOpenTamagotchi}
            />

            {/* Life Spheres Columns */}
            <BentoSpheresColumns
              tasks={filteredTasks}
              onToggleTask={onToggleTask}
              onTaskClick={onTaskClick}
              onAddTaskForSphere={(category, room) => onAddTask(undefined, category, room)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
