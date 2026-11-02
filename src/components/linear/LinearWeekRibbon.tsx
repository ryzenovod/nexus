import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { NexusTask } from '../../types/nexus';
import { StatusIcon } from './LinearIcons';

interface LinearWeekRibbonProps {
  tasks: NexusTask[];
  activeWeekOffset: number;
  onOffsetChange: (offset: number) => void;
  onTaskClick: (task: NexusTask) => void;
  onAddTaskForDay: (dateString: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const LinearWeekRibbon: React.FC<LinearWeekRibbonProps> = ({
  tasks,
  activeWeekOffset,
  onOffsetChange,
  onTaskClick,
  onAddTaskForDay,
}) => {
  // Reference date: Monday, Nov 2, 2026
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
    <div className="h-[130px] border-b border-[#1c1d24] flex flex-col shrink-0 bg-[#0c0d11] select-none">
      {/* Slim top control bar */}
      <div className="h-[26px] px-4 flex items-center justify-between border-b border-[#1c1d24] text-[11px] font-mono text-[#8a8f98]">
        <div className="flex items-center gap-2">
          <span className="font-sans font-medium text-[#ededef]">Недельный график</span>
          <span className="text-[#5e636e]">·</span>
          <span>{days[0].formattedDate} — {days[6].formattedDate}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOffsetChange(activeWeekOffset - 1)}
            className="p-1 rounded hover:bg-[#16171d] text-[#8a8f98] hover:text-[#ededef]"
            title="Предыдущая неделя"
          >
            <ChevronLeft size={12} />
          </button>
          <button
            type="button"
            onClick={() => onOffsetChange(0)}
            className={`px-1.5 py-0.5 rounded text-[10px] ${
              activeWeekOffset === 0
                ? 'bg-[#1e2028] text-[#ededef]'
                : 'text-[#5e636e] hover:text-[#ededef]'
            }`}
          >
            Сегодня
          </button>
          <button
            type="button"
            onClick={() => onOffsetChange(activeWeekOffset + 1)}
            className="p-1 rounded hover:bg-[#16171d] text-[#8a8f98] hover:text-[#ededef]"
            title="Следующая неделя"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* 7 Day Columns */}
      <div className="flex-1 grid grid-cols-7 divide-x divide-[#1c1d24] overflow-hidden">
        {days.map((day) => (
          <div
            key={day.dateString}
            className={`flex flex-col min-w-0 p-1.5 group transition-colors ${
              day.isToday ? 'bg-[#15161c]/40' : 'hover:bg-[#111217]'
            }`}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="flex items-center gap-1 text-[11px]">
                <span className={day.isToday ? 'text-[#5e6ad2] font-semibold' : 'text-[#8a8f98]'}>
                  {day.dayName}
                </span>
                <span className={day.isToday ? 'text-white font-mono font-bold' : 'text-[#5e636e] font-mono'}>
                  {day.dayNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onAddTaskForDay(day.dateString)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#5e636e] hover:text-[#ededef] hover:bg-[#1c1d24] transition-all"
                title={`+ задача на ${day.dayName}`}
              >
                <Plus size={10} />
              </button>
            </div>

            {/* Chips List */}
            <div className="flex-1 overflow-y-auto space-y-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {day.tasks.map((task) => {
                const status = task.completed ? 'done' : 'in_progress';
                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="h-[24px] px-2 text-[12px] rounded bg-[#16171d] hover:bg-[#1e2028] border border-[#232530] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <StatusIcon status={status} size={11} />
                    <span className="truncate text-[#ededef] leading-none text-[11.5px]">
                      {task.title}
                    </span>
                  </div>
                );
              })}

              {day.tasks.length === 0 && (
                <div className="h-full flex items-center justify-center text-[11px] text-[#2c2e38] font-mono select-none">
                  —
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
