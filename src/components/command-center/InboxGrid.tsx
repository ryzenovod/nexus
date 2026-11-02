import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  Inbox, 
  Search, 
  FoldVertical, 
  UnfoldVertical,
  Plus
} from 'lucide-react';
import { 
  NexusTask, 
  BracketColor, 
  Assignee, 
  RoomArea, 
  TaskCategory 
} from '../../types/nexus';
import { SortableGlassCard } from '../visual/SortableGlassCard';
import { GlassCard } from '../visual/GlassCard';

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

export const InboxGrid: React.FC<InboxGridProps> = ({
  tasks,
  searchQuery,
  onSearchChange,
  selectedBracket,
  onBracketChange,
  selectedAssignee,
  onAssigneeChange,
  selectedRoom,
  onRoomChange,
  selectedCategory,
  onCategoryChange,
  isSmartGrouped,
  onToggleSmartGrouping,
  onToggleTask,
  onTaskClick,
  onDeleteTask,
  onAddNewTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'droppable-inbox',
    data: { targetDate: 'inbox' },
  });

  // Filter tasks belonging to inbox
  const inboxTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.date !== 'inbox') return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query) ?? false;
        const matchesTags = task.tags?.some((t) => t.toLowerCase().includes(query)) ?? false;
        if (!matchesTitle && !matchesNotes && !matchesTags) return false;
      }

      // Bracket color
      if (selectedBracket !== 'all' && task.bracketColor !== selectedBracket) {
        return false;
      }

      // Assignee
      if (selectedAssignee !== 'all' && task.assignee !== selectedAssignee) {
        return false;
      }

      // Room
      if (selectedRoom !== 'Все' && task.room !== selectedRoom) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, selectedBracket, selectedAssignee, selectedRoom, selectedCategory]);

  // Grouped structure for room hub mode
  const { groupedHubs, flatTasks } = useMemo(() => {
    if (!isSmartGrouped) {
      return { groupedHubs: [], flatTasks: inboxTasks };
    }

    const hubMap: Record<string, { hub: NexusTask; children: NexusTask[] }> = {};
    const remaining: NexusTask[] = [];

    // Find all hubs first
    inboxTasks.forEach((t) => {
      if (t.isHub) {
        hubMap[t.room || t.title.toLowerCase()] = { hub: t, children: [] };
      }
    });

    // Populate children
    inboxTasks.forEach((t) => {
      if (t.isHub) return;

      const roomKey = t.room;
      if (roomKey && hubMap[roomKey]) {
        hubMap[roomKey].children.push(t);
      } else {
        remaining.push(t);
      }
    });

    return {
      groupedHubs: Object.values(hubMap),
      flatTasks: remaining,
    };
  }, [inboxTasks, isSmartGrouped]);

  const rooms: RoomArea[] = ['Все', 'Ванная', 'Балкон', 'Комната', 'Кухня'];

  const categories: ('all' | TaskCategory)[] = [
    'all',
    '📦 Для дома!',
    '🎓 ВШЭ (Егор)',
    '🎓 РУДН (Аня)',
    '🏆 Я-Профессионал',
    '💼 Работа (Егор)',
    '🚀 Проекты',
    '💰 Финансы',
    '🛒 Покупки',
    '📋 Общее',
  ];

  const assignees: { id: Assignee; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'together', label: 'Вместе' },
    { id: 'egor', label: 'Егор' },
    { id: 'anya', label: 'Аня' },
  ];

  return (
    <div
      ref={setNodeRef}
      style={{
        border: isOver ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.07)',
      }}
      className={`rounded-xl bg-[rgba(18,18,21,0.75)] backdrop-blur-[24px] p-3 sm:p-4 transition-all ${
        isOver ? 'bg-[rgba(32,32,38,0.85)]' : ''
      }`}
    >
      {/* Inbox Header: Title, Counter & Action Bar */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
              <Inbox className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-xs font-semibold tracking-tight text-zinc-100 uppercase">
              Входящие и без срока
            </h2>
            <span className="flex h-4 items-center justify-center rounded bg-white/[0.06] px-1.5 font-mono text-[10px] font-medium text-zinc-300 border border-white/[0.08]">
              {inboxTasks.length}
            </span>
          </div>

          {/* Grouping switch and quick new button */}
          <div className="flex items-center gap-1.5">
            {/* Raycast-style Segmented View Mode Switcher */}
            <div className="inline-flex items-center rounded-lg border border-white/[0.06] bg-white/[0.03] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => onToggleSmartGrouping(false)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
                  !isSmartGrouped
                    ? 'bg-white/[0.09] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <UnfoldVertical className="h-3 w-3" />
                <span>Плоская сетка</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSmartGrouping(true)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
                  isSmartGrouped
                    ? 'bg-white/[0.09] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FoldVertical className="h-3 w-3" />
                <span>Хабы зон</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onAddNewTask}
              className="flex items-center gap-1 rounded-lg bg-zinc-100 hover:bg-white px-2.5 py-1 text-xs font-medium text-zinc-950 transition-colors"
            >
              <Plus className="h-3 w-3 stroke-[2.5]" />
              <span>Задача</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2 h-3 w-3 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Поиск по задачам и тегам..."
              className="w-full rounded border border-white/[0.08] bg-zinc-950/70 pl-7 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-400 focus:outline-none"
            />
          </div>

          {/* Assignee Filter Pills */}
          <div className="flex items-center rounded border border-white/[0.06] bg-white/[0.02] p-0.5 text-xs">
            {assignees.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onAssigneeChange(a.id)}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  selectedAssignee === a.id
                    ? 'bg-white/[0.1] text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Bracket Color Filter */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => onBracketChange('all')}
              className={`rounded px-1.5 py-0.5 text-[11px] font-mono border transition-colors ${
                selectedBracket === 'all'
                  ? 'bg-white/[0.1] text-white border-white/[0.12]'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200'
              }`}
            >
              Все
            </button>
            <button
              type="button"
              onClick={() => onBracketChange('critical')}
              className={`h-3.5 w-3.5 rounded border border-red-500/50 bg-red-500/30 transition-all ${
                selectedBracket === 'critical' ? 'ring-1 ring-red-400 scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              title="Критичные / Коммуналка (красный)"
            />
            <button
              type="button"
              onClick={() => onBracketChange('active')}
              className={`h-3.5 w-3.5 rounded border border-emerald-500/50 bg-emerald-500/30 transition-all ${
                selectedBracket === 'active' ? 'ring-1 ring-emerald-400 scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              title="Дом / Уют (зеленый)"
            />
            <button
              type="button"
              onClick={() => onBracketChange('finance')}
              className={`h-3.5 w-3.5 rounded border border-amber-500/50 bg-amber-500/30 transition-all ${
                selectedBracket === 'finance' ? 'ring-1 ring-amber-400 scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              title="Финансы / ЖКХ (янтарный)"
            />
            <button
              type="button"
              onClick={() => onBracketChange('neutral')}
              className={`h-3.5 w-3.5 rounded border border-zinc-500/50 bg-zinc-500/30 transition-all ${
                selectedBracket === 'neutral' ? 'ring-1 ring-zinc-400 scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              title="Нейтральные / Вишлист (серый)"
            />
          </div>

          {/* Room Filter Select */}
          <select
            value={selectedRoom}
            onChange={(e) => onRoomChange(e.target.value as RoomArea)}
            className="rounded border border-white/[0.08] bg-zinc-950/70 px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-zinc-400"
          >
            {rooms.map((r) => (
              <option key={r} value={r} className="bg-zinc-900 text-zinc-200">
                {r === 'Все' ? 'Все зоны' : r}
              </option>
            ))}
          </select>

          {/* Category Filter Select */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as 'all' | TaskCategory)}
            className="rounded border border-white/[0.08] bg-zinc-950/70 px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-zinc-400"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-zinc-900 text-zinc-200">
                {c === 'all' ? 'Все направления' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-3">
        {isSmartGrouped && groupedHubs.length > 0 ? (
          // --- BENTO ROOM HUBS (NO DOUBLE NESTED FRAMES) ---
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {groupedHubs.map(({ hub, children }) => (
                <div
                  key={hub.id}
                  className="rounded-lg border border-white/[0.06] bg-[rgba(24,24,28,0.4)] p-2 space-y-1.5"
                >
                  {/* Hub Header Card */}
                  <GlassCard
                    task={hub}
                    onToggle={onToggleTask}
                    onClick={onTaskClick}
                    onDelete={onDeleteTask}
                    compact
                  />

                  {/* Subtasks inside this Room */}
                  <div className="space-y-1 pl-1.5 border-l border-white/[0.06]">
                    {children.map((childTask) => (
                      <SortableGlassCard
                        key={childTask.id}
                        task={childTask}
                        onToggle={onToggleTask}
                        onClick={onTaskClick}
                        onDelete={onDeleteTask}
                        compact
                      />
                    ))}

                    {children.length === 0 && (
                      <div className="text-[11px] text-zinc-500 py-1 italic">
                        Все задачи этой зоны выполнены
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Other Tasks Outside Hubs */}
            {flatTasks.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-semibold text-zinc-400 mb-2">
                  Остальные задачи и вишлист
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {flatTasks.map((task) => (
                    <SortableGlassCard
                      key={task.id}
                      task={task}
                      onToggle={onToggleTask}
                      onClick={onTaskClick}
                      onDelete={onDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // --- FLAT 4-COLUMN WIDGET GRID (MATCHING ORIGINAL SCREENSHOT) ---
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {inboxTasks.map((task) => (
              <SortableGlassCard
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onClick={onTaskClick}
                onDelete={onDeleteTask}
              />
            ))}

            {inboxTasks.length === 0 && (
              <div className="col-span-full py-10 text-center text-xs text-zinc-500">
                Нет задач, соответствующих выбранным фильтрам
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
