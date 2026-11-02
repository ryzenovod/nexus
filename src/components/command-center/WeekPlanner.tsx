import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles,
  Plus
} from 'lucide-react';
import { NexusTask } from '../../types/nexus';
import { SortableGlassCard } from '../visual/SortableGlassCard';

interface DayColumnProps {
  dateString: string;
  dayName: string;
  formattedDate: string;
  isToday: boolean;
  tasks: NexusTask[];
  onToggleTask: (id: string) => void;
  onTaskClick: (task: NexusTask) => void;
  onDeleteTask: (id: string) => void;
  onAddTaskForDay: (dateString: string) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({
  dateString,
  dayName,
  formattedDate,
  isToday,
  tasks,
  onToggleTask,
  onTaskClick,
  onDeleteTask,
  onAddTaskForDay,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-day-${dateString}`,
    data: { targetDate: dateString },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        border: isToday
          ? '1px solid rgba(245, 158, 11, 0.5)'
          : isOver
          ? '1px solid rgba(56, 189, 248, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isToday
          ? '0 0 24px rgba(245, 158, 11, 0.12), inset 0 0 12px rgba(245, 158, 11, 0.04)'
          : isOver
          ? '0 0 20px rgba(56, 189, 248, 0.15)'
          : 'none',
      }}
      className={`flex flex-col rounded-xl bg-[#0f1115]/80 backdrop-blur-[28px] p-2.5 transition-all duration-200 min-h-[220px] ${
        isOver ? 'bg-sky-950/20 ring-1 ring-sky-400/40' : ''
      }`}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold tracking-tight ${isToday ? 'text-amber-400' : 'text-zinc-200'}`}>
            {dayName}
          </span>
          <span className="text-[11px] text-zinc-400">
            {formattedDate}
          </span>
          {isToday && (
            <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300 border border-amber-500/40">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              СЕГОДНЯ
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAddTaskForDay(dateString)}
          className="rounded p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors"
          title={`Добавить задачу на ${dayName}`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] pr-0.5 no-scrollbar">
        {tasks.map((task) => (
          <SortableGlassCard
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onClick={onTaskClick}
            onDelete={onDeleteTask}
            compact
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex h-24 flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.06] text-center text-[11px] text-zinc-500/70 p-2">
            <span>Перетащите сюда</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface WeekPlannerProps {
  tasks: NexusTask[];
  activeWeekOffset: number;
  onOffsetChange: (offset: number) => void;
  onToggleTask: (id: string) => void;
  onTaskClick: (task: NexusTask) => void;
  onDeleteTask: (id: string) => void;
  onAddTaskForDay: (dateString: string) => void;
}

export const WeekPlanner: React.FC<WeekPlannerProps> = ({
  tasks,
  activeWeekOffset,
  onOffsetChange,
  onToggleTask,
  onTaskClick,
  onDeleteTask,
  onAddTaskForDay,
}) => {
  // Base reference date is Monday, Nov 2, 2026 (matching system date & widget screenshot)
  const baseDate = new Date(2026, 10, 2); // Nov 2, 2026
  
  // Calculate Monday of the targeted week offset
  const currentWeekMonday = new Date(baseDate);
  currentWeekMonday.setDate(baseDate.getDate() + activeWeekOffset * 7);

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekMonday);
    d.setDate(currentWeekMonday.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const isToday = activeWeekOffset === 0 && i === 0; // Monday Nov 2, 2026 is today

    const dayTasks = tasks.filter((t) => t.date === dateString);

    return {
      dateString,
      dayName: dayNames[i],
      formattedDate: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      isToday,
      tasks: dayTasks,
    };
  });

  return (
    <div className="space-y-3">
      {/* Week Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-tight text-white">
            Недельное расписание
          </h2>
          <span className="text-xs text-zinc-400">
            {days[0].formattedDate} — {days[6].formattedDate} {days[0].dateString.slice(0, 4)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOffsetChange(activeWeekOffset - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 transition-colors"
            title="Предыдущая неделя"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onOffsetChange(0)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
              activeWeekOffset === 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Сегодня</span>
          </button>

          <button
            type="button"
            onClick={() => onOffsetChange(activeWeekOffset + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 transition-colors"
            title="Следующая неделя"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 7 Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {days.map((day) => (
          <DayColumn
            key={day.dateString}
            dateString={day.dateString}
            dayName={day.dayName}
            formattedDate={day.formattedDate}
            isToday={day.isToday}
            tasks={day.tasks}
            onToggleTask={onToggleTask}
            onTaskClick={onTaskClick}
            onDeleteTask={onDeleteTask}
            onAddTaskForDay={onAddTaskForDay}
          />
        ))}
      </div>
    </div>
  );
};
