import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus
} from 'lucide-react';
import { NexusTask, BracketColor } from '../../types/nexus';

interface DayColumnProps {
  dateString: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  tasks: NexusTask[];
  onToggleTask: (id: string) => void;
  onTaskClick: (task: NexusTask) => void;
  onDeleteTask: (id: string) => void;
  onAddTaskForDay: (dateString: string) => void;
}

const getBorderColor = (color: BracketColor) => {
  switch (color) {
    case 'critical':
      return 'border-l-red-500';
    case 'active':
      return 'border-l-emerald-500';
    case 'finance':
      return 'border-l-amber-500';
    case 'neutral':
    default:
      return 'border-l-zinc-500';
  }
};

const cleanCategory = (cat: string) => {
  return cat.replace(/[📦🎓🏆💼🚀💰🛒📋💕✨]/g, '').trim();
};

const DayColumn: React.FC<DayColumnProps> = ({
  dateString,
  dayName,
  dayNumber,
  isToday,
  tasks,
  onTaskClick,
  onAddTaskForDay,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-day-${dateString}`,
    data: { targetDate: dateString },
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-full flex flex-col min-w-0 transition-colors group ${
        isOver ? 'bg-white/[0.04]' : 'bg-[#0b0b0e]'
      }`}
    >
      {/* Day Header: thin clean line */}
      <div className="h-8 px-2.5 border-b border-white/[0.06] flex items-center justify-between text-xs select-none shrink-0 bg-[#09090c]/70">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-zinc-400">
            {dayName}
          </span>
          {isToday ? (
            <span className="bg-amber-400 text-zinc-950 font-semibold px-1.5 py-0.2 rounded text-[10.5px] font-mono leading-none">
              {dayNumber}
            </span>
          ) : (
            <span className="text-zinc-500 font-mono text-[11px]">
              {dayNumber}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAddTaskForDay(dateString)}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-500 hover:text-zinc-200 transition-opacity"
          title={`Добавить задачу на ${dayName}`}
        >
          <Plus size={12} strokeWidth={2} />
        </button>
      </div>

      {/* Task List inside day */}
      <div className="flex-1 p-1.5 space-y-1 overflow-y-auto no-scrollbar">
        {tasks.map((task) => {
          const borderColor = getBorderColor(task.bracketColor);
          const tag = cleanCategory(task.category || 'Задача');

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={`p-1.5 px-2 rounded bg-white/[0.025] hover:bg-white/[0.06] border-l-2 ${borderColor} transition-colors cursor-pointer select-none text-left ${
                task.completed ? 'opacity-40 grayscale line-through' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[9.5px] font-mono uppercase text-zinc-500 mb-0.5 truncate">
                <span className="truncate">{tag}</span>
                {task.isOverdue && !task.completed && (
                  <span className="text-red-400 font-semibold">Срочно</span>
                )}
              </div>
              <div className="text-[11.5px] font-normal text-zinc-200 leading-snug line-clamp-2 break-words">
                {task.title}
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-center text-[11px] text-zinc-600 select-none py-6">
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
  // Base reference date is Monday, Nov 2, 2026
  const baseDate = new Date(2026, 10, 2);
  
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

    const isToday = activeWeekOffset === 0 && i === 0;
    const dayTasks = tasks.filter((t) => t.date === dateString);

    return {
      dateString,
      dayName: dayNames[i],
      dayNumber: d.getDate(),
      formattedDate: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      isToday,
      tasks: dayTasks,
    };
  });

  return (
    <div className="space-y-2 shrink-0">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between text-xs px-0.5">
        <div className="flex items-center gap-2">
          <CalendarIcon size={13} className="text-zinc-500" />
          <span className="font-medium text-zinc-300">
            Расписание недели
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {days[0].formattedDate} — {days[6].formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => onOffsetChange(activeWeekOffset - 1)}
            className="h-6 w-6 flex items-center justify-center rounded border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Предыдущая неделя"
          >
            <ChevronLeft size={13} />
          </button>

          <button
            type="button"
            onClick={() => onOffsetChange(0)}
            className={`px-2 py-0.5 rounded border transition-colors ${
              activeWeekOffset === 0
                ? 'bg-white/[0.08] text-zinc-200 border-white/[0.1]'
                : 'bg-white/[0.02] text-zinc-500 border-white/[0.06] hover:text-zinc-300'
            }`}
          >
            Сегодня
          </button>

          <button
            type="button"
            onClick={() => onOffsetChange(activeWeekOffset + 1)}
            className="h-6 w-6 flex items-center justify-center rounded border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Следующая неделя"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* RULE 3: SEAMLESS MONOLITHIC 7-DAY MATRIX (Amie / Notion Calendar style) */}
      <div className="grid grid-cols-7 divide-x divide-white/[0.06] border border-white/[0.07] rounded-xl bg-[#0b0b0e] overflow-hidden h-[180px] shadow-sm">
        {days.map((day) => (
          <DayColumn
            key={day.dateString}
            dateString={day.dateString}
            dayName={day.dayName}
            dayNumber={day.dayNumber}
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
