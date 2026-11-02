import React, { useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  NexusTask, 
  BracketColor, 
  Assignee, 
  RoomArea, 
  TaskCategory 
} from '../../types/nexus';
import { SortableGlassCard } from '../visual/SortableGlassCard';

interface InboxGridProps {
  tasks: NexusTask[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBracket: 'all' | BracketColor;
  onBracketChange: (bracket: 'all' | BracketColor) => void;
  selectedAssignee: Assignee;
  onAssigneeChange: (assignee: Assignee) => void;
  selectedRoom: RoomArea;
  onRoomChange: (room: RoomArea) => void;
  selectedCategory: 'all' | TaskCategory;
  onCategoryChange: (cat: 'all' | TaskCategory) => void;
  isSmartGrouped: boolean;
  onToggleSmartGrouping: (grouped: boolean) => void;
  onToggleTask: (id: string) => void;
  onTaskClick: (task: NexusTask) => void;
  onDeleteTask: (id: string) => void;
  onAddNewTask: () => void;
}

type QuickFilter = 'all' | 'home' | 'finances' | 'bathroom' | 'balcony' | 'kitchen' | 'room';

const isHubZoneHeader = (task: NexusTask): boolean => {
  const title = (task.title || '').toLowerCase().trim();
  return ['ванная', 'балкон', 'комната', 'кухня', 'доп.', 'дополнительно', 'прихожая'].includes(title);
};

export const InboxGrid: React.FC<InboxGridProps> = ({
  tasks,
  selectedAssignee,
  onAssigneeChange,
  onToggleTask,
  onTaskClick,
  onDeleteTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'droppable-inbox',
    data: { targetDate: 'inbox' },
  });

  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all');

  // Filter tasks belonging to inbox (excluding redundant empty zone-header tasks)
  const inboxTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.date !== 'inbox') return false;

      // Exclude empty technical zone headers ("ванная", "балкон", "комната", "кухня")
      if (isHubZoneHeader(task)) return false;

      // Assignee filter
      if (selectedAssignee !== 'all' && task.assignee !== selectedAssignee) {
        return false;
      }

      // Quick tabs
      if (activeFilter === 'home') {
        const cat = (task.category || '').toLowerCase();
        return cat.includes('дом') || cat.includes('покупк') || (task.room && task.room !== 'Все');
      }
      if (activeFilter === 'finances') {
        const cat = (task.category || '').toLowerCase();
        return cat.includes('финанс') || cat.includes('жкх') || task.bracketColor === 'finance' || task.title.toLowerCase().includes('коммунальн');
      }
      if (activeFilter === 'bathroom') return task.room === 'Ванная';
      if (activeFilter === 'balcony') return task.room === 'Балкон';
      if (activeFilter === 'kitchen') return task.room === 'Кухня';
      if (activeFilter === 'room') return task.room === 'Комната';

      return true;
    });
  }, [tasks, selectedAssignee, activeFilter]);

  const totalInboxCount = useMemo(() => {
    return tasks.filter((t) => t.date === 'inbox' && !isHubZoneHeader(t)).length;
  }, [tasks]);

  const filterTabs: { id: QuickFilter; label: string }[] = [
    { id: 'all', label: `Все (${totalInboxCount})` },
    { id: 'home', label: 'Дом' },
    { id: 'finances', label: 'Финансы' },
    { id: 'bathroom', label: 'Ванная' },
    { id: 'balcony', label: 'Балкон' },
    { id: 'kitchen', label: 'Кухня' },
    { id: 'room', label: 'Комната' },
  ];

  return (
    <div
      ref={setNodeRef}
      className="flex-1 flex flex-col min-h-0 space-y-2.5 select-none"
    >
      {/* SINGLE CLEAN HEADER ROW WITH MINIMALIST TEXT TABS */}
      <div className="flex items-center justify-between text-xs px-0.5 border-b border-white/[0.06] pb-2 shrink-0">
        {/* Left minimal text tabs */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`transition-colors whitespace-nowrap text-[12px] pb-0.5 relative ${
                  isActive
                    ? 'text-zinc-100 font-medium'
                    : 'text-zinc-500 hover:text-zinc-300 font-normal'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-[-9px] left-0 right-0 h-[1.5px] bg-zinc-200 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right assignee switcher: Все · Егор · Аня */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 shrink-0">
          {(['all', 'egor', 'anya'] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onAssigneeChange(a)}
              className={`transition-colors ${
                selectedAssignee === a
                  ? 'text-zinc-100 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {a === 'all' ? 'Все' : a === 'egor' ? 'Егор' : 'Аня'}
            </button>
          ))}
        </div>
      </div>

      {/* FLOATING 4-COLUMN BENTO GRID OF COMPACT GLASS CAPSULES (gap-2, h-[38px]) */}
      <div
        className={`flex-1 overflow-y-auto min-h-0 pr-1 transition-colors ${
          isOver ? 'ring-1 ring-white/30 rounded-xl' : ''
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {inboxTasks.map((task) => (
            <SortableGlassCard
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onClick={onTaskClick}
              onDelete={onDeleteTask}
              mode="inbox"
            />
          ))}

          {inboxTasks.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-zinc-500 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              Нет задач в выбранной категории
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
