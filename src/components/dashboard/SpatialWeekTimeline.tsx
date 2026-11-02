import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { NexusTask, GCalEvent } from '../../types/nexus';

interface SpatialWeekTimelineProps {
  tasks: NexusTask[];
  gcalEvents?: GCalEvent[];
  activeWeekOffset: number;
  onOffsetChange: (offset: number) => void;
  onToggleTask: (id: string) => void;
  onTaskClick: (task: NexusTask) => void;
  onAddTaskForDay: (dateStr: string) => void;
  onScheduleTask?: (taskId: string, dateStr: string) => void;
}

export const SpatialWeekTimeline: React.FC<SpatialWeekTimelineProps> = ({
  tasks,
  gcalEvents = [],
  activeWeekOffset,
  onOffsetChange,
  onToggleTask,
  onTaskClick,
  onAddTaskForDay,
  onScheduleTask,
}) => {
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const monthNames = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
  ];

  // Generate 7 days starting from today + offset
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + (activeWeekOffset * 7) + i);
    const iso = d.toLocaleDateString('sv-SE');
    days.push({
      dateObj: d,
      iso,
      isToday: activeWeekOffset === 0 && i === 0,
    });
  }

  const currentWeekEndIso = days[6].iso;
  const futureTimedTasks = tasks.filter(
    (t) => !t.completed && t.date && t.date !== 'inbox' && t.date > currentWeekEndIso
  );

  const getPriorityClass = (task: NexusTask) => {
    if (task.bracketColor === 'critical' || task.isOverdue) {
      return 'border-l-[3px] border-[#ff6b6b] bg-[#ff6b6b]/10 text-white hover:bg-[#ff6b6b]/15';
    }
    if (task.bracketColor === 'finance') {
      return 'border-l-[3px] border-[#eab308] bg-[#eab308]/10 text-zinc-100 hover:bg-[#eab308]/15';
    }
    if (task.bracketColor === 'active') {
      return 'border-l-[3px] border-[#ffa94d] bg-[#ffa94d]/10 text-zinc-100 hover:bg-[#ffa94d]/15';
    }
    return 'border-l-[3px] border-[#69db7c] bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]';
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header with week navigation */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-[13px] font-bold text-white tracking-wide uppercase">
              7-Day Spatial Timeline
            </h2>
          </div>

          <span className="text-[11px] text-zinc-400 font-mono-num">
            TickTick & GCal Live
          </span>

          {/* Quick jump to future deadline if outside current 7 days */}
          {futureTimedTasks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const firstDate = new Date(futureTimedTasks[0].date);
                const diffDays = Math.round((firstDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const targetOffset = Math.floor(diffDays / 7);
                onOffsetChange(targetOffset > 0 ? targetOffset : 1);
              }}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-[11px] text-amber-300 font-medium transition-all cursor-pointer"
              title={`Перейти к неделе с задачей: ${futureTimedTasks[0].title}`}
            >
              <Clock size={11} className="text-amber-400" />
              <span>Впереди: {futureTimedTasks[0].title} ({futureTimedTasks[0].date})</span>
              <span className="text-[9.5px] opacity-75">→</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-white/[0.03] p-0.5 rounded-full border border-white/[0.06]">
          <button
            type="button"
            onClick={() => onOffsetChange(activeWeekOffset - 1)}
            className="h-6 px-2.5 rounded-full text-[11px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            ← Пред
          </button>
          {activeWeekOffset !== 0 && (
            <button
              type="button"
              onClick={() => onOffsetChange(0)}
              className="h-6 px-2.5 rounded-full text-[11px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              Сегодня
            </button>
          )}
          <button
            type="button"
            onClick={() => onOffsetChange(activeWeekOffset + 1)}
            className="h-6 px-2.5 rounded-full text-[11px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            След →
          </button>
        </div>
      </div>

      {/* 7 Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 min-h-[220px]">
        {days.map((day) => {
          const d = day.dateObj;
          const dayTitle = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;

          // Find tasks for this day
          const dayTasks = tasks.filter((t) => {
            if (t.completed) return false;
            // Overdue tasks show on Today
            if (day.isToday && t.isOverdue) return true;
            return t.date === day.iso;
          });

          // Find GCal events for this day
          const dayEvents = gcalEvents.filter((ev) => {
            const evDate = ev.start?.date || (ev.start?.dateTime ? ev.start.dateTime.slice(0, 10) : null);
            return evDate === day.iso;
          });

          const totalItems = dayTasks.length + dayEvents.length;

          return (
            <div
              key={day.iso}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverDay !== day.iso) setDragOverDay(day.iso);
              }}
              onDragLeave={() => {
                if (dragOverDay === day.iso) setDragOverDay(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/nexus-task-id');
                if (taskId && onScheduleTask) {
                  onScheduleTask(taskId, day.iso);
                }
                setDragOverDay(null);
              }}
              className={`rounded-[14px] p-3 flex flex-col transition-all duration-200 border ${
                dragOverDay === day.iso
                  ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-500/15'
                  : day.isToday
                  ? 'bg-[#181b26]/85 border-amber-500/40 shadow-[0_8px_24px_rgba(255,159,67,0.12),inset_0_1px_0_rgba(255,190,118,0.25)] ring-1 ring-amber-500/20'
                  : 'bg-[#12161f]/60 hover:bg-[#181e2a]/75 border-white/[0.08] hover:border-white/[0.16] shadow-[0_6px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]'
              } backdrop-blur-2xl`}
            >
              {/* Day Column Header */}
              <div className={`flex items-center justify-between pb-2 mb-2 border-b shrink-0 ${
                day.isToday ? 'border-amber-500/25' : 'border-white/[0.07]'
              }`}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-[12px] font-bold tracking-tight truncate ${
                    day.isToday ? 'text-[#ffbe76]' : 'text-zinc-200'
                  }`}>
                    {dayTitle}
                  </span>
                  {day.isToday && (
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[#ff9f43] border border-amber-500/35">
                      Сегодня
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onAddTaskForDay(day.iso)}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
                  title={`Добавить задачу на ${dayTitle}`}
                >
                  <Plus size={12} strokeWidth={2.4} />
                </button>
              </div>

              {/* Day Items List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 [scrollbar-width:thin]">
                {totalItems === 0 ? (
                  /* Compact Stylish Drop-Slot for Empty Days */
                  <div
                    onClick={() => onAddTaskForDay(day.iso)}
                    className={`h-full min-h-[90px] rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 p-2 transition-all cursor-pointer group/drop ${
                      dragOverDay === day.iso
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200 scale-[1.02]'
                        : 'border-white/[0.08] hover:border-white/[0.2] bg-white/[0.01] hover:bg-white/[0.03] text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Кликните, чтобы добавить задачу, или перетащите сюда задачу из Входящих"
                  >
                    <div className="w-5 h-5 rounded-md bg-white/[0.04] group-hover/drop:bg-amber-400/20 group-hover/drop:text-amber-300 flex items-center justify-center transition-colors">
                      <Plus size={11} strokeWidth={2.4} />
                    </div>
                    <span className="text-[10px] font-medium tracking-tight text-center leading-tight">
                      {dragOverDay === day.iso ? 'Отпустите для переноса' : 'Свободно · Перетащите сюда'}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* GCal Events (Blue Glass cards) */}
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-1.5 px-2 rounded-lg bg-[#4dabf7]/12 border-l-[3px] border-[#4dabf7] text-white text-[11px] shadow-xs flex items-start gap-1.5 transition-all"
                      >
                        <span className="font-mono-num font-bold text-[#74c0fc] text-[10.5px] shrink-0 mt-0.5">
                          {ev.timeStr || 'весь день'}
                        </span>
                        <span className="leading-snug break-words line-clamp-2">
                          {ev.summary}
                        </span>
                      </div>
                    ))}

                    {/* TickTick Tasks (Draggable) */}
                    {dayTasks.map((task) => {
                      const isOverdue = day.isToday && task.isOverdue;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', task.id);
                            e.dataTransfer.setData('application/nexus-task-id', task.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onClick={() => onTaskClick(task)}
                          className={`p-1.5 px-2 rounded-lg text-[11.5px] transition-all cursor-pointer group flex items-start gap-1.5 ${getPriorityClass(
                            task
                          )}`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            className="mt-0.5 text-zinc-400 group-hover:text-zinc-200 transition-colors shrink-0 cursor-pointer"
                          >
                            <Circle size={12} />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              {isOverdue && (
                                <span className="inline-block text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-[#ff6b6b]/25 text-[#ff6b6b] border border-[#ff6b6b]/40">
                                  Просрочено
                                </span>
                              )}
                              {task.regularPeriod && (
                                <span className="inline-block text-[8.5px] font-medium px-1 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                                  Регулярно
                                </span>
                              )}
                            </div>
                            <span className="leading-snug break-words line-clamp-2 mt-0.5">
                              {task.title}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
