import React, { useState, useEffect } from 'react';
import { Plus, List, Columns, LayoutGrid, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { NexusTask, Assignee } from '../../types/nexus';
import { LinearWeekRibbon } from '../linear/LinearWeekRibbon';
import { LinearListView } from '../linear/LinearListView';
import { LinearIssueInspector } from '../linear/LinearIssueInspector';
import { InboxGrid } from './InboxGrid';

export type CommandCenterViewMode = 'linear-list' | 'kanban' | 'widget-grid';

interface LinearCommandCenterProps {
  tasks: NexusTask[];
  activeWeekOffset: number;
  onOffsetChange: (offset: number) => void;
  onToggleTask: (id: string) => void;
  onUpdateTask: (task: NexusTask) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (date?: string) => void;
  selectedAssignee: Assignee;
  onAssigneeChange: (assignee: Assignee) => void;
  isWidgetMode?: boolean;
}

export const LinearCommandCenter: React.FC<LinearCommandCenterProps> = ({
  tasks,
  activeWeekOffset,
  onOffsetChange,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  selectedAssignee,
  onAssigneeChange,
  isWidgetMode = false,
}) => {
  const [viewMode, setViewMode] = useState<CommandCenterViewMode>(
    isWidgetMode ? 'widget-grid' : 'linear-list'
  );
  const [selectedTask, setSelectedTask] = useState<NexusTask | null>(null);
  const [isWeekRibbonOpen, setIsWeekRibbonOpen] = useState(true);

  // Keep selectedTask in sync with tasks array updates
  useEffect(() => {
    if (selectedTask) {
      const fresh = tasks.find((t) => t.id === selectedTask.id);
      if (fresh) setSelectedTask(fresh);
    }
  }, [tasks, selectedTask?.id]);

  // Keyboard shortcut to close inspector on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTask) {
        setSelectedTask(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTask]);

  const selectedIndex = selectedTask
    ? tasks.findIndex((t) => t.id === selectedTask.id)
    : -1;

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-[#0f1014] select-none text-[13px] leading-[18px]">
      {/* 1. Linear Sub-header (h-[44px]) */}
      <div className="h-[44px] px-4 border-b border-[#1c1d24] flex items-center justify-between shrink-0 bg-[#0f1014]">
        {/* Left: Breadcrumbs + Assignee filter buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#ededef]">
            <span className="text-[#8a8f98]">NEXUS</span>
            <span className="text-[#5e636e]">›</span>
            <span>Все задачи</span>
          </div>

          <div className="h-3.5 w-[1px] bg-[#262833]" />

          {/* Linear Assignee Pills */}
          <div className="flex items-center gap-1">
            {(['all', 'egor', 'anya', 'together'] as const).map((a) => {
              const isActive = selectedAssignee === a;
              const label =
                a === 'all' ? 'Все' : a === 'egor' ? 'Егор' : a === 'anya' ? 'Аня' : 'Вместе';

              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => onAssigneeChange(a)}
                  className={`h-[26px] px-2.5 rounded-[5px] text-[12px] transition-all ${
                    isActive
                      ? 'bg-[#1e2028] text-[#ededef] font-medium border border-[#303342]'
                      : 'bg-[#16171d] hover:bg-[#1e2028] text-[#8a8f98] border border-[#262833]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Toggle Week Ribbon, View Switcher & + New Task Button */}
        <div className="flex items-center gap-2">
          {/* Toggle Week Ribbon button */}
          <button
            type="button"
            onClick={() => setIsWeekRibbonOpen(!isWeekRibbonOpen)}
            className={`h-[26px] px-2 rounded-[5px] text-[11px] flex items-center gap-1.5 border transition-all ${
              isWeekRibbonOpen
                ? 'bg-[#16171d] text-[#8a8f98] border-[#262833]'
                : 'bg-transparent text-[#5e636e] border-transparent hover:text-[#8a8f98]'
            }`}
            title={isWeekRibbonOpen ? 'Скрыть график недели' : 'Показать график недели'}
          >
            <Calendar size={12} />
            <span>Неделя</span>
            {isWeekRibbonOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>

          {/* View mode switcher */}
          <div className="flex items-center bg-[#131419] p-0.5 rounded-[6px] border border-[#1e2028]">
            <button
              type="button"
              onClick={() => setViewMode('linear-list')}
              className={`h-[24px] px-2 rounded-[4px] text-[11px] flex items-center gap-1 transition-all ${
                viewMode === 'linear-list'
                  ? 'bg-[#1e2028] text-white font-medium shadow-xs'
                  : 'text-[#8a8f98] hover:text-[#ededef]'
              }`}
              title="Список Linear"
            >
              <List size={12} />
              <span className="hidden sm:inline">Список</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('widget-grid')}
              className={`h-[24px] px-2 rounded-[4px] text-[11px] flex items-center gap-1 transition-all ${
                viewMode === 'widget-grid'
                  ? 'bg-[#1e2028] text-white font-medium shadow-xs'
                  : 'text-[#8a8f98] hover:text-[#ededef]'
              }`}
              title="Сетка виджета (4 колонки)"
            >
              <LayoutGrid size={12} />
              <span className="hidden sm:inline">Сетка</span>
            </button>
          </div>

          {/* Primary Action Button (Linear Indigo) */}
          <button
            type="button"
            onClick={() => onAddTask()}
            className="flex items-center gap-1.5 rounded-[5px] bg-[#5e6ad2] hover:bg-[#6872d9] text-white text-[12px] font-medium h-[26px] px-2.5 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            <Plus size={13} strokeWidth={2.4} />
            <span>Новая задача</span>
          </button>
        </div>
      </div>

      {/* 2. Collapsible Week Ribbon (h-[130px]) */}
      {isWeekRibbonOpen && (
        <LinearWeekRibbon
          tasks={tasks}
          activeWeekOffset={activeWeekOffset}
          onOffsetChange={onOffsetChange}
          onTaskClick={(t) => setSelectedTask(t)}
          onAddTaskForDay={(dateStr) => onAddTask(dateStr)}
        />
      )}

      {/* 3. Main Split View: Issues List + Right Inspector Panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {viewMode === 'linear-list' ? (
          <LinearListView
            tasks={tasks}
            selectedAssignee={selectedAssignee}
            selectedTaskId={selectedTask?.id || null}
            onToggleTask={onToggleTask}
            onSelectTask={(t) => setSelectedTask(t)}
          />
        ) : (
          <div className="flex-1 p-4 overflow-y-auto">
            <InboxGrid
              tasks={tasks}
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
              onTaskClick={(t) => setSelectedTask(t)}
              onDeleteTask={onDeleteTask}
              onAddNewTask={() => onAddTask()}
            />
          </div>
        )}

        {/* 4. Right Inspector Panel (Linear Issue Details) */}
        {selectedTask && (
          <LinearIssueInspector
            task={selectedTask}
            issueIndex={selectedIndex >= 0 ? selectedIndex : 0}
            onClose={() => setSelectedTask(null)}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}
          />
        )}
      </div>
    </div>
  );
};
