import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
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
          ? '1px solid rgba(245, 158, 11, 0.3)'
          : isOver
          ? '1px solid rgba(255, 255, 255, 0.25)'
          : '1px solid rgba(255, 255, 255, 0.07)',
      }}
      className={`flex flex-col rounded-lg bg-[rgba(18,18,21,0.65)] backdrop-blur-[24px] p-2 transition-all duration-150 min-h-[150px] ${
        isOver ? 'bg-[rgba(32,32,38,0.85)]' : ''
      }`}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold tracking-tight ${isToday ? 'text-amber-400' : 'text-zinc-200'}`}>
            {dayName}
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {formattedDate}
          </span>
          {isToday && (
            <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1 py-0.2 font-mono text-[9px] font-semibold text-amber-300 border border-amber-500/25">
              СЕГОДНЯ
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAddTaskForDay(dateString)}
          className="rounded p-0.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors"
          title={`Добавить задачу на ${dayName}`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[340px] pr-0.5 no-scrollbar flex flex-col">
        {tasks.map((task) => (
          <SortableGlassCard
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onClick={onTaskClick}
            onDelete={onDeleteTask}
            mode="week"
            compact
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-4 text-center text-xs text-zinc-600 tracking-wide select-none">
            Свободно
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
    <div className="space-y-2.5">
      {/* Week Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
          <h2 className="text-xs font-semibold tracking-tight text-zinc-200">
            Недельное расписание
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">
            {days[0].formattedDate} — {days[6].formattedDate} {days[0].dateString.slice(0, 4)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOffsetChange(activeWeekOffset - 1)}
            className="flex h-6 w-6 items-center justify-center rounded border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            title="Предыдущая неделя"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onOffsetChange(0)}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium border transition-colors ${
              activeWeekOffset === 0
                ? 'bg-white/[0.08] text-zinc-100 border-white/[0.12]'
                : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-zinc-200'
            }`}
          >
            <span>Сегодня</span>
          </button>

          <button
            type="button"
            onClick={() => onOffsetChange(activeWeekOffset + 1)}
            className="flex h-6 w-6 items-center justify-center rounded border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            title="Следующая неделя"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 7 Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
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
