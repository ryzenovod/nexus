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
  const { gcalEvents, updateTask } = useNexusStore();
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
      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin] p-4 sm:p-6 space-y-6">
        <div className="max-w-[1600px] mx-auto space-y-5">
          {/* Integrated Control Strip: View Mode & Assignee Filter (No duplicate top bars or redundant + buttons) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            {/* View Switcher: Spatial Timeline vs Bento Modules */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode('spatial')}
                className={`h-7 px-3 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'spatial'
                    ? 'bg-white/[0.12] text-white shadow-xs font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Spatial Glass Дашборд (Timeline + Inbox)"
              >
                <Calendar size={12} className="text-amber-400" />
                <span>Таймлайн & Входящие</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('bento')}
                className={`h-7 px-3 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'bento'
                    ? 'bg-white/[0.12] text-white shadow-xs font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Модульный Bento-дашборд Amie"
              >
                <Sparkles size={12} className="text-purple-400" />
                <span>Bento Сферы</span>
              </button>
            </div>

            {/* Assignee Filter Pills */}
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
              {(['all', 'egor', 'anya'] as const).map((a) => {
                const isActive = selectedAssignee === a;
                const label = a === 'all' ? 'Все задачи' : a === 'egor' ? 'Егор' : 'Аня';

                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => onAssigneeChange(a)}
                    className={`h-6 px-3 rounded-lg text-[11.5px] transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/[0.12] text-white font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Dashboard Views */}
          {viewMode === 'spatial' ? (
            <>
              {/* 1. Spatial 7-Day Timeline (GCal + TickTick) */}
              <SpatialWeekTimeline
                tasks={filteredTasks}
                gcalEvents={gcalEvents}
                activeWeekOffset={activeWeekOffset}
                onOffsetChange={onOffsetChange}
                onToggleTask={onToggleTask}
                onTaskClick={onTaskClick}
                onAddTaskForDay={(dateStr) => onAddTask(dateStr)}
                onScheduleTask={(taskId, dateStr) => updateTask(taskId, { date: dateStr })}
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
