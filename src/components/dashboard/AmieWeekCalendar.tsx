import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { NexusTask } from '../../types/nexus';

interface AmieWeekCalendarProps {
  tasks: NexusTask[];
  activeWeekOffset: number;
  onOffsetChange: (offset: number) => void;
  onTaskClick: (task: NexusTask) => void;
  onAddTaskForDay: (dateString: string) => void;
}

export const AmieWeekCalendar: React.FC<AmieWeekCalendarProps> = ({
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

  const getAmieCardStyle = (task: NexusTask): string => {
    const titleLower = (task.title || '').toLowerCase();
    const cat = (task.category || '').toLowerCase();

    // 1. Emerald for couple plans (4 ноября)
    if (titleLower.includes('4 ноября') || titleLower.includes('свидани') || titleLower.includes('кино')) {
      return 'bg-emerald-500/10 border-l-2 border-emerald-400 text-emerald-100 hover:bg-emerald-500/15';
    }

    // 2. Amber for Home & Utilities
    if (
      titleLower.includes('мосэнерго') ||
      titleLower.includes('жкх') ||
      titleLower.includes('домиленд') ||
      cat.includes('финанс') ||
      cat.includes('дом') ||
      task.bracketColor === 'finance'
    ) {
      return 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-100 hover:bg-amber-500/15';
    }

    // 3. Purple-pink for RUDN & Ya-Profi (Anya)
    if (
      cat.includes('рудн') ||
      cat.includes('я-профи') ||
      titleLower.includes('рудн') ||
      titleLower.includes('дфо') ||
      titleLower.includes('цфо') ||
      titleLower.includes('япрофи')
    ) {
      return 'bg-purple-500/10 border-l-2 border-purple-400 text-purple-100 hover:bg-purple-500/15';
    }

    // 4. Blue-indigo for HSE & Egor's Work (OpenMap)
    if (
      cat.includes('вшэ') ||
      cat.includes('работа') ||
      titleLower.includes('вшэ') ||
      titleLower.includes('нир') ||
      titleLower.includes('openmap')
    ) {
      return 'bg-indigo-500/10 border-l-2 border-indigo-400 text-indigo-100 hover:bg-indigo-500/15';
    }

    // Default
    return 'bg-white/[0.04] border-l-2 border-zinc-400 text-zinc-100 hover:bg-white/[0.08]';
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111216]/90 p-4 backdrop-blur-xl shadow-lg space-y-3 select-none">
      {/* Top Header of Week Ribbon */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <CalendarIcon size={14} className="text-zinc-400" />
          <span className="font-semibold text-zinc-100 text-[13px]">
            Недельный Календарь Amie
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            {days[0].formattedDate} — {days[6].formattedDate}
          </span>
        </div>

        {/* Legend pills & Nav */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-[10.5px] font-medium">
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              ЖКХ & Дом
            </span>
            <span className="flex items-center gap-1 text-indigo-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              ВШЭ & OpenMap
            </span>
            <span className="flex items-center gap-1 text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              РУДН & Я-Профи
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Планы вдвоем
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => onOffsetChange(activeWeekOffset - 1)}
              className="h-6 w-6 flex items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:text-white transition-colors"
              title="Предыдущая неделя"
            >
              <ChevronLeft size={13} />
            </button>

            <button
              type="button"
              onClick={() => onOffsetChange(0)}
              className={`px-2 py-0.5 rounded-lg border transition-colors ${
                activeWeekOffset === 0
                  ? 'bg-white/[0.1] text-white border-white/[0.12] font-semibold'
                  : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white'
              }`}
            >
              Сегодня
            </button>

            <button
              type="button"
              onClick={() => onOffsetChange(activeWeekOffset + 1)}
              className="h-6 w-6 flex items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:text-white transition-colors"
              title="Следующая неделя"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 7 Days Columns in Amie.so Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {days.map((day) => (
          <div
            key={day.dateString}
            className={`rounded-xl p-2.5 border flex flex-col min-h-[160px] group transition-all duration-200 ${
              day.isToday
                ? 'bg-gradient-to-b from-amber-500/[0.08] to-transparent border-amber-500/30 ring-1 ring-amber-500/20'
                : 'bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08]'
            }`}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11.5px] font-semibold ${
                    day.isToday ? 'text-amber-300' : 'text-zinc-400'
                  }`}
                >
                  {day.dayName}
                </span>
                <span
                  className={`text-[12px] font-mono font-bold ${
                    day.isToday
                      ? 'text-white px-1.5 py-0.2 rounded bg-amber-500/30'
                      : 'text-zinc-200'
                  }`}
                >
                  {day.dayNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onAddTaskForDay(day.dateString)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all"
                title={`Добавить задачу на ${day.dayName}`}
              >
                <Plus size={11} strokeWidth={2.2} />
              </button>
            </div>

            {/* Event Cards inside Day */}
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[180px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {day.tasks.map((task) => {
                const cardStyle = getAmieCardStyle(task);

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`p-2 rounded-lg cursor-pointer transition-all duration-150 shadow-xs border ${cardStyle} ${
                      task.completed ? 'opacity-40 grayscale line-through' : ''
                    }`}
                  >
                    {/* 2-line title without clipping */}
                    <div className="text-[12px] font-medium leading-snug line-clamp-2 break-words">
                      {task.title}
                    </div>

                    {/* Time / Assignee note if applicable */}
                    {task.assignee && (
                      <div className="mt-1 flex items-center justify-between text-[10px] opacity-75 font-mono">
                        <span>
                          {task.assignee === 'egor' ? 'Егор' : task.assignee === 'anya' ? 'Аня' : 'Вместе'}
                        </span>
                        {task.price && (
                          <span>{task.price.toLocaleString('ru-RU')} ₽</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {day.tasks.length === 0 && (
                <div className="h-full flex items-center justify-center text-[11px] text-zinc-600 select-none py-6 font-mono">
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
