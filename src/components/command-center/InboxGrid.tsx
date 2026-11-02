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
      } else if (t.category === '💰 Финансы' && hubMap['Все']) {
        hubMap['Все'].children.push(t);
      } else {
        remaining.push(t);
      }
    });

    return {
      groupedHubs: Object.values(hubMap),
      flatTasks: remaining,
    };
  }, [inboxTasks, isSmartGrouped]);

  const categories: ('all' | TaskCategory)[] = [
    'all',
    '📦 Для дома!',
    '💰 Финансы',
    '🛒 Покупки',
    '🎓 ВШЭ (Егор)',
    '🎓 РУДН (Аня)',
    '🏆 Я-Профессионал',
    '💼 Работа (Егор)',
    '🚀 Проекты',
    '📋 Общее',
  ];

  const rooms: RoomArea[] = ['Все', 'Ванная', 'Балкон', 'Комната', 'Кухня'];

  const assignees: { id: Assignee; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'together', label: 'Вместе 💕' },
    { id: 'egor', label: 'Егор' },
    { id: 'anya', label: 'Аня' },
  ];

  return (
    <div
      ref={setNodeRef}
      style={{
        border: isOver ? '1px solid rgba(168, 85, 247, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isOver ? '0 0 24px rgba(168, 85, 247, 0.2)' : '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }}
      className={`rounded-2xl bg-[#0f1118]/85 backdrop-blur-[28px] p-4 sm:p-5 transition-all ${
        isOver ? 'ring-1 ring-purple-400/50 bg-purple-950/20' : ''
      }`}
    >
      {/* Inbox Header: Title, Counter & Action Bar */}
      <div className="flex flex-col gap-3 pb-4 border-b border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <Inbox className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-white uppercase">
              Входящие и без срока
            </h2>
            <span className="flex h-5 items-center justify-center rounded-full bg-white/[0.08] px-2 font-mono text-xs font-semibold text-zinc-300 border border-white/[0.08]">
              {inboxTasks.length}
            </span>
          </div>

          {/* Grouping switch and quick new button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSmartGrouping(!isSmartGrouped)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                isSmartGrouped
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:bg-white/10'
              }`}
              title="Переключить режим: компактные хабы зон или плоская 4-колоночная сетка"
            >
              {isSmartGrouped ? (
                <>
                  <FoldVertical className="h-3.5 w-3.5" />
                  <span>Хабы комнат</span>
                </>
              ) : (
                <>
                  <UnfoldVertical className="h-3.5 w-3.5" />
                  <span>Сетка как в виджете</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onAddNewTask}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-purple-500/20 hover:brightness-110 transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Добавить</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[190px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Поиск по задачам и тегам..."
              className="w-full rounded-lg border border-white/10 bg-black/40 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          {/* Assignee Filter Pills */}
          <div className="flex items-center rounded-lg border border-white/10 bg-black/30 p-0.5 text-xs">
            {assignees.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onAssigneeChange(a.id)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  selectedAssignee === a.id
                    ? 'bg-purple-600/40 text-purple-200 border border-purple-500/30'
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
              className={`rounded px-2 py-1 text-[11px] font-mono border transition-colors ${
                selectedBracket === 'all'
                  ? 'bg-white/20 text-white border-white/20'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200'
              }`}
            >
              Все
            </button>
            <button
              type="button"
              onClick={() => onBracketChange('critical')}
              className={`h-5 w-5 rounded border border-red-500/40 bg-red-500/20 transition-all ${
                selectedBracket === 'critical' ? 'ring-2 ring-red-400 scale-110' : 'opacity-70 hover:opacity-100'
              }`}
              title="Критичные / Коммуналка (красный)"
            />
            <button
              type="button"
              onClick={() => onBracketChange('active')}
              className={`h-5 w-5 rounded border border-emerald-500/40 bg-emerald-500/20 transition-all ${
                selectedBracket === 'active' ? 'ring-2 ring-emerald-400 scale-110' : 'opacity-70 hover:opacity-100'
              }`}
              title="Дом / Уют (зеленый)"
            />
            <button
              type="button"
              onClick={() => onBracketChange('finance')}
              className={`h-5 w-5 rounded border border-amber-500/40 bg-amber-500/20 transition-all ${
                selectedBracket === 'finance' ? 'ring-2 ring-amber-400 scale-110' : 'opacity-70 hover:opacity-100'
              }`}
              title="Финансы / ЖКХ (янтарный)"
            />
            <button
              type="button"
              onClick={() => onBracketChange('cyber')}
              className={`h-5 w-5 rounded border border-purple-500/40 bg-purple-500/20 transition-all ${
                selectedBracket === 'cyber' ? 'ring-2 ring-purple-400 scale-110' : 'opacity-70 hover:opacity-100'
              }`}
              title="ВШЭ / РУДН / Я-Профи (фиолетовый)"
            />
            <button
              type="button"
              onClick={() => onBracketChange('neutral')}
              className={`h-5 w-5 rounded border border-slate-500/40 bg-slate-500/20 transition-all ${
                selectedBracket === 'neutral' ? 'ring-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'
              }`}
              title="Вишлист / Вопросы (серый)"
            />
          </div>

          {/* Room Filter Select */}
          <select
            value={selectedRoom}
            onChange={(e) => onRoomChange(e.target.value as RoomArea)}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
          >
            {rooms.map((r) => (
              <option key={r} value={r} className="bg-[#141022] text-zinc-200">
                {r === 'Все' ? 'Все зоны' : r}
              </option>
            ))}
          </select>

          {/* Category Filter Select */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as 'all' | TaskCategory)}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#141022] text-zinc-200">
                {c === 'all' ? 'Все направления' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-4">
        {isSmartGrouped && groupedHubs.length > 0 ? (
          // --- SMART GROUPED ROOM HUBS VIEW ---
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedHubs.map(({ hub, children }) => (
                <div
                  key={hub.id}
                  className="rounded-xl border border-white/[0.08] bg-black/30 p-3 space-y-2"
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
                  <div className="space-y-1.5 pl-2 border-l border-white/[0.06]">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
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
          // --- FLAT 4-COLUMN WIDGET GRID (MATCHING SCREENSHOT) ---
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
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
              <div className="col-span-full py-12 text-center text-xs text-zinc-500">
                Нет задач, соответствующих выбранным фильтрам
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
