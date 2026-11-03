import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  CalendarDays, 
  CreditCard, 
  Home, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Layers,
  Calendar,
  MapPin,
  AlignLeft,
  Sparkles
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { NexusTask, Assignee } from '@/types/nexus';
import { useNexusStore } from '@/store/useNexusStore';

interface ShadcnOverviewProps {
  tasks: NexusTask[];
  onToggleTask: (id: string) => void;
  onTaskClick: (task: NexusTask) => void;
  onAddTask: (date?: string, category?: string, room?: string) => void;
  onDeleteTask: (id: string) => void;
  activeWeekOffset: number;
  onOffsetChange: (offset: number) => void;
  selectedAssignee: Assignee;
  onAssigneeChange: (assignee: Assignee) => void;
  onNavigateTab: (tab: any) => void;
}

export const ShadcnOverview: React.FC<ShadcnOverviewProps> = ({
  tasks,
  onToggleTask,
  onTaskClick,
  onAddTask,
  onDeleteTask,
  activeWeekOffset,
  onOffsetChange,
  selectedAssignee,
  onAssigneeChange,
  onNavigateTab,
}) => {
  const { gcalEvents, budget, addTask } = useNexusStore();
  const [selectedRoom, setSelectedRoom] = useState<string>('Все');
  const [taskSearch, setTaskSearch] = useState<string>('');
  const [activeHubTask, setActiveHubTask] = useState<NexusTask | null>(null);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<any | null>(null);
  const [hubChecklistState, setHubChecklistState] = useState<Record<string, boolean>>({});

  // Local ISO date formatter without UTC rollover
  const formatLocalIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // 1. Calculate Metric Card Values
  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);

  const todayStr = useMemo(() => {
    return formatLocalIso(new Date());
  }, []);

  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.date === todayStr);
  }, [tasks, todayStr]);

  const overdueTasks = useMemo(() => {
    return tasks.filter(t => t.isOverdue && !t.completed);
  }, [tasks]);

  const budgetCollected = budget.currentBalance;
  const budgetTarget = budget.totalTarget || 80000;
  const budgetProgress = Math.min(100, Math.round((budgetCollected / budgetTarget) * 100));

  // 2. Generate 7 Days for Timeline
  const weekDays = useMemo(() => {
    const days = [];
    const base = new Date();
    base.setDate(base.getDate() + activeWeekOffset * 7);
    
    // Find Monday of the target week
    const dayOfWeek = base.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMon);
    monday.setHours(0, 0, 0, 0);

    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatLocalIso(d);
      const isToday = iso === todayStr;

      // Filter tasks for this day
      const dayTasks = tasks.filter(t => {
        if (selectedAssignee !== 'all' && t.assignee !== selectedAssignee && t.assignee !== 'together') {
          return false;
        }
        if (t.isOverdue && isToday) return true;
        return t.date === iso;
      });

      // Filter events from gcal (strictly real events, zero demo mock noise)
      const dayEvents = (gcalEvents || []).filter(e => {
        if (!e || !e.start || (e.id && e.id.startsWith('gcal-'))) return false;
        const summary = (e.summary || '').toLowerCase();
        if (
          summary.includes('синхронизация по деплою') ||
          summary.includes('леруа мерлен') ||
          summary.includes('свидание пары') ||
          summary.includes('созвон с амбассадорами') ||
          summary.includes('семинар по нир') ||
          summary.includes('лекции и тестирование')
        ) {
          return false;
        }
        const eDate = e.start.date || (e.start.dateTime ? e.start.dateTime.slice(0, 10) : '');
        return eDate === iso;
      });

      days.push({
        dateObj: d,
        iso,
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        monthName: monthNames[d.getMonth()],
        isToday,
        tasks: dayTasks,
        events: dayEvents,
      });
    }
    return days;
  }, [activeWeekOffset, tasks, selectedAssignee, todayStr, gcalEvents]);

  // 3. Filtered Tasks for Flat Inbox & Hubs
  const roomTabs = [
    { id: 'Все', label: 'Все', count: tasks.length },
    { id: 'Кухня', label: 'Кухня', count: tasks.filter(t => t.room === 'Кухня' || t.parentId === 'hub-kitchen' || t.title.toLowerCase().includes('кухн')).length },
    { id: 'Ванная', label: 'Ванная', count: tasks.filter(t => t.room === 'Ванная' || t.parentId === 'hub-bathroom' || t.title.toLowerCase().includes('ванн')).length },
    { id: 'Комната', label: 'Комната', count: tasks.filter(t => t.room === 'Комната' || t.parentId === 'hub-bedroom' || t.title.toLowerCase().includes('комнат')).length },
    { id: 'Балкон', label: 'Балкон', count: tasks.filter(t => t.room === 'Балкон' || t.parentId === 'hub-balcony' || t.title.toLowerCase().includes('балкон')).length },
    { id: 'ЖКХ', label: 'ЖКХ & Счета', count: tasks.filter(t => t.category === 'Финансы' || t.category === '💰 Финансы' || t.parentId === 'hub-bills').length },
    { id: 'Разное', label: 'Разное', count: tasks.filter(t => t.room === 'Коридор' || t.parentId === 'hub-misc').length },
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Assignee filter
      if (selectedAssignee !== 'all' && task.assignee !== selectedAssignee && task.assignee !== 'together') {
        return false;
      }
      // Room filter
      if (selectedRoom !== 'Все') {
        if (selectedRoom === 'Кухня' && task.room !== 'Кухня' && task.parentId !== 'hub-kitchen' && !task.title.toLowerCase().includes('кухн')) return false;
        if (selectedRoom === 'Ванная' && task.room !== 'Ванная' && task.parentId !== 'hub-bathroom' && !task.title.toLowerCase().includes('ванн')) return false;
        if (selectedRoom === 'Комната' && task.room !== 'Комната' && task.parentId !== 'hub-bedroom' && !task.title.toLowerCase().includes('комнат')) return false;
        if (selectedRoom === 'Балкон' && task.room !== 'Балкон' && task.parentId !== 'hub-balcony' && !task.title.toLowerCase().includes('балкон')) return false;
        if (selectedRoom === 'ЖКХ' && task.category !== 'Финансы' && task.category !== '💰 Финансы' && task.parentId !== 'hub-bills') return false;
        if (selectedRoom === 'Разное' && task.room !== 'Коридор' && task.parentId !== 'hub-misc') return false;
      }
      // Search
      if (taskSearch.trim()) {
        const q = taskSearch.toLowerCase();
        return task.title.toLowerCase().includes(q) || (task.notes && task.notes.toLowerCase().includes(q));
      }
      return true;
    });
  }, [tasks, selectedAssignee, selectedRoom, taskSearch]);

  const handleToggleSubtask = (hubId: string, subId: string) => {
    const key = `${hubId}_${subId}`;
    setHubChecklistState(prev => ({ ...prev, [key]: !prev[key] }));

    // Send completion to local bridge
    fetch('/api/ticktick/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: hubId, itemId: subId }),
    }).catch(() => {});
  };

  // Safe subtasks for activeHubTask
  const activeHubSubtasks = useMemo(() => {
    if (!activeHubTask) return [];
    if (activeHubTask.subtasks && activeHubTask.subtasks.length > 0) {
      return activeHubTask.subtasks.map(it => ({
        id: it.id,
        title: it.title,
        completed: it.completed || !!hubChecklistState[`${activeHubTask.id}_${it.id}`],
      }));
    }
    // If no direct subtasks, find children by parentId
    return tasks
      .filter(t => t.parentId === activeHubTask.id)
      .map(t => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
      }));
  }, [activeHubTask, tasks, hubChecklistState]);

  return (
    <div className="flex-1 flex flex-col space-y-7 max-w-[1400px] mx-auto w-full pb-8">
      {/* ── 1. BENTO METRIC CARDS ROW (Google/Linear 2026) ── */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Tasks */}
        <div 
          onClick={() => {
            document.getElementById('inbox-tasks-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="nexus-surface nexus-interactive-card p-6 relative overflow-hidden group cursor-pointer"
          title="Нажмите, чтобы перейти к списку активных задач"
        >
          {/* Subtle living glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-35" />

          <div className="flex flex-row items-center justify-between pb-3">
            <span className="text-xs font-medium text-zinc-400">TickTick Задачи</span>
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-white tabular-nums">
            {activeTasks.length} <span className="text-sm font-normal text-zinc-400">активных</span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            +{completedTasks.length} завершено · перейти к списку ↓
          </p>
        </div>

        {/* Card 2: Schedule & Overdue */}
        <div 
          onClick={() => {
            document.getElementById('week-calendar-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="nexus-surface nexus-interactive-card p-6 relative overflow-hidden group cursor-pointer"
          title="Нажмите, чтобы перейти к недельному календарю"
        >
          {/* Subtle living glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-35" />

          <div className="flex flex-row items-center justify-between pb-3">
            <span className="text-xs font-medium text-zinc-400">План на неделю</span>
            <div className="p-2 rounded-full bg-sky-500/10 text-sky-400">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-white tabular-nums">
            {todayTasks.length} <span className="text-sm font-normal text-zinc-400">дел на сегодня</span>
          </div>
          <p className="text-xs mt-2">
            {overdueTasks.length > 0 ? (
              <span className="text-rose-400 font-medium">{overdueTasks.length} просрочено · перейти к календарю ↓</span>
            ) : (
              <span className="text-zinc-400">Все в срок · перейти к календарю ↓</span>
            )}
          </p>
        </div>

        {/* Card 3: Joint Budget */}
        <div 
          onClick={() => onNavigateTab('finances')}
          className="nexus-surface nexus-interactive-card p-6 relative overflow-hidden group cursor-pointer"
          title="Нажмите, чтобы открыть раздел Финансы и Бюджет"
        >
          {/* Subtle living glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-35" />

          <div className="flex flex-row items-center justify-between pb-3">
            <span className="text-xs font-medium text-zinc-400">Совместный бюджет пары</span>
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-white tabular-nums">
            {budgetCollected.toLocaleString('ru-RU')} ₽ 
            <span className="text-sm font-normal text-zinc-400"> / {budgetTarget.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400 tabular-nums font-medium">{budgetProgress}%</span>
          </div>
        </div>

        {/* Card 4: Utilities */}
        <div 
          onClick={() => onNavigateTab('finances')}
          className="nexus-surface nexus-interactive-card p-6 relative overflow-hidden group cursor-pointer"
          title="Нажмите, чтобы открыть квитанции и счетчики ЖКХ"
        >
          {/* Subtle living glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-35" />

          <div className="flex flex-row items-center justify-between pb-3">
            <span className="text-xs font-medium text-zinc-400">ЖКХ Москвы (Ноябрь)</span>
            <div className="p-2 rounded-full bg-purple-500/10 text-purple-400">
              <Home className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-white tabular-nums">
            1 685 ₽ <span className="text-sm font-normal text-zinc-400">к оплате</span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Мосэнерго: передано · Домиленд: 1 685 ₽ →
          </p>
        </div>
      </div>

      {/* ── 2. 7-DAY WEEK CALENDAR TIMELINE (Zero Borders, Pure Floating Day Capsules) ── */}
      <div id="week-calendar-section" className="nexus-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-white">Календарь и задачи недели</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {weekDays[0].dayNumber} {weekDays[0].monthName} — {weekDays[6].dayNumber} {weekDays[6].monthName} 2026
              </p>
            </div>
            {activeWeekOffset !== 0 && (
              <span className="rounded-full bg-white/[0.08] text-zinc-300 text-xs px-2.5 py-0.5 tabular-nums">
                {activeWeekOffset > 0 ? `+${activeWeekOffset} нед.` : `${activeWeekOffset} нед.`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Week navigation pill */}
            <div className="flex items-center rounded-full bg-white/[0.04] p-1">
              <button
                type="button"
                onClick={() => onOffsetChange(activeWeekOffset - 1)}
                className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onOffsetChange(0)}
                className={`h-7 px-3 text-xs rounded-full transition-all cursor-pointer ${
                  activeWeekOffset === 0 
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={() => onOffsetChange(activeWeekOffset + 1)}
                className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Assignee filter toggle */}
            <div className="flex items-center rounded-full bg-white/[0.04] p-1">
              {(['all', 'egor', 'anya'] as const).map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => onAssigneeChange(a)}
                  className={`h-7 px-3 text-xs rounded-full transition-all cursor-pointer ${
                    selectedAssignee === a
                      ? 'bg-white text-zinc-950 font-medium shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {a === 'all' ? 'Все' : a === 'egor' ? 'Егор' : 'Аня'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 7 Days Grid: ZERO vertical lines, independent floating day capsules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mt-6">
          {weekDays.map((day) => {
            return (
              <div
                key={day.iso}
                onClick={() => onAddTask(day.iso)}
                className={`p-3.5 flex flex-col min-h-[190px] transition-all duration-300 cursor-pointer group/day ${
                  day.isToday 
                    ? 'rounded-[22px] bg-gradient-to-b from-indigo-500/[0.12] to-indigo-500/[0.03] ring-1 ring-indigo-400/25 shadow-[0_12px_30px_-10px_rgba(99,102,241,0.25)]' 
                    : 'rounded-[22px] bg-white/[0.02] hover:bg-white/[0.035]'
                }`}
                title={`Нажмите для создания задачи на ${day.dayName}, ${day.dayNumber} ${day.monthName}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-medium text-zinc-400">
                      {day.dayName}
                    </span>
                    <span className={`text-sm font-semibold tabular-nums ${day.isToday ? 'text-indigo-300' : 'text-zinc-200'}`}>
                      {day.dayNumber}
                    </span>
                  </div>
                  {day.isToday && (
                    <span className="rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 font-medium">
                      Сегодня
                    </span>
                  )}
                </div>

                {/* Day Items List */}
                <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[260px] [scrollbar-width:none]">
                  {/* Calendar Events (Clickable to open Sheet inspector) */}
                  {day.events.map((ev, eIdx) => {
                    const time = ev.start?.dateTime
                      ? new Date(ev.start.dateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                      : 'весь день';
                    return (
                      <div
                        key={ev.id || eIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCalendarEvent({ ...ev, formattedTime: time, dateIso: day.iso, dayLabel: `${day.dayName}, ${day.dayNumber}` });
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 px-2.5 py-2 text-xs cursor-pointer transition-all"
                        title="Нажмите для просмотра события и добавления в задачи"
                      >
                        <Clock className="h-3 w-3 text-sky-400 shrink-0" />
                        <span className="text-[10px] shrink-0 tabular-nums">{time}</span>
                        <span className="truncate font-medium">{ev.summary}</span>
                      </div>
                    );
                  })}

                  {/* Tasks inside day: Borderless soft pills */}
                  {day.tasks.map((task) => {
                    const isDone = task.completed;
                    return (
                      <div
                        key={task.id}
                        className={`group flex items-start gap-2 rounded-xl px-2.5 py-2 text-xs transition-all cursor-pointer ${
                          isDone 
                            ? 'bg-white/[0.02] opacity-40 line-through text-zinc-400' 
                            : task.isOverdue
                              ? 'bg-rose-500/15 text-rose-200 hover:bg-rose-500/25'
                              : 'bg-white/[0.05] hover:bg-white/[0.09] text-zinc-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                      >
                        <div 
                          className="pt-0.5" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            onToggleTask(task.id); 
                          }}
                        >
                          <Checkbox checked={isDone} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            {task.isOverdue && !isDone && (
                              <span className="rounded-full bg-rose-500/20 text-rose-300 px-1.5 py-0.2 text-[9px] font-medium shrink-0">
                                Просрочено
                              </span>
                            )}
                            <span className="truncate font-medium">{task.title}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {day.tasks.length === 0 && day.events.length === 0 && (
                    <div className="h-full flex items-center justify-center py-6 text-zinc-600 text-[11px]">
                      Свободно
                    </div>
                  )}
                </div>

                {/* Quick Add Button: subtle on hover to prevent clutter */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTask(day.iso);
                  }}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-1 rounded-full text-xs text-zinc-400 hover:text-white transition-opacity opacity-0 group-hover/day:opacity-100 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Добавить</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. FLAT TASKS INBOX & HUBS BROWSER (Pure Row Aesthetics, Zero Borders) ── */}
      <div id="inbox-tasks-section" className="nexus-surface p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-white">
              Все задачи и хабы обустройства
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              47 реальных дел из ваших списков TickTick с быстрым доступом к чек-листам
            </p>
          </div>

          {/* Task Search in Inbox: Soft pill without rough borders */}
          <div className="relative w-full sm:w-72">
            <input
              type="search"
              placeholder="Фильтр в списке..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-full rounded-full bg-white/[0.04] focus:bg-white/[0.07] focus:ring-1 focus:ring-white/15 px-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 border-0 outline-none transition-all"
            />
          </div>
        </div>

        {/* Room Filter Tabs: Google AI floating chips without borders */}
        <div className="flex flex-wrap items-center gap-2 mt-2 mb-6">
          {roomTabs.map((tab) => {
            const isActive = selectedRoom === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRoom(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] font-semibold'
                    : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[11px] tabular-nums ${isActive ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tasks List: space-y-1.5, ZERO divide-y, ZERO border-b */}
        <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1 [scrollbar-width:thin]">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isDone = task.completed;
              const hasChecklist = task.isHub || (task.subtasks && task.subtasks.length > 0) || (task.subtaskCount && task.subtaskCount > 0);
              const count = task.subtaskCount || task.subtasks?.length || 0;

              return (
                <div
                  key={task.id}
                  className={`nexus-row group flex items-center justify-between gap-4 cursor-pointer ${
                    isDone ? 'opacity-40 line-through' : ''
                  }`}
                >
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div 
                      className="pt-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        isDone 
                          ? 'bg-indigo-500 text-white shadow-xs' 
                          : 'ring-1 ring-white/20 group-hover:ring-indigo-400 bg-white/[0.03]'
                      }`}>
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <div 
                      className="flex items-center gap-2 flex-1 min-w-0"
                      onClick={() => onTaskClick(task)}
                    >
                      <span className="text-sm font-medium text-zinc-100 truncate">
                        {task.title}
                      </span>
                      {task.isOverdue && !isDone && (
                        <span className="rounded-full bg-rose-500/20 text-rose-300 px-2 py-0.5 text-[10px] font-medium shrink-0">
                          Просрочено
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Badges */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {task.room && (
                      <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-zinc-300">
                        {task.room}
                      </span>
                    )}
                    <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-zinc-300">
                      {task.assignee === 'egor' ? 'Егор' : task.assignee === 'anya' ? 'Аня' : 'Вместе'}
                    </span>
                  </div>

                  {/* Right: Hub Drawer Trigger + Edit Button (Smooth appearance on hover) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {hasChecklist && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHubTask(task);
                        }}
                        className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-full px-3 py-1 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Layers className="h-3 w-3" />
                        <span>Чек-лист {count > 0 ? `(${count})` : ''}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-full hover:bg-white/[0.05] cursor-pointer"
                    >
                      Редактировать
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-zinc-500">
              Нет задач по выбранным фильтрам
            </div>
          )}
        </div>
      </div>

      {/* ── 4. SHADCN SHEET DRAWER FOR SUBTASK CHECKLISTS ── */}
      <Sheet open={Boolean(activeHubTask)} onOpenChange={(open) => !open && setActiveHubTask(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-[#0D101A]/95 backdrop-blur-2xl border-l border-white/[0.08] text-zinc-100">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-zinc-300 font-medium">
                {activeHubTask?.room || 'Хаб обустройства'}
              </span>
              <span className="text-xs text-zinc-400">
                TickTick
              </span>
            </div>
            <SheetTitle className="text-lg font-bold mt-1 text-white">
              {activeHubTask?.title}
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-400">
              Полный интерактивный чек-лист. Отметки синхронизируются с локальным скриптом и облаком.
            </SheetDescription>
          </SheetHeader>

          {/* Subtask items list */}
          <div className="flex-1 overflow-y-auto space-y-2 mt-4 pr-1 [scrollbar-width:thin]">
            {activeHubSubtasks.length > 0 ? (
              activeHubSubtasks.map((sub, sIdx) => {
                const subKey = activeHubTask ? `${activeHubTask.id}_${sub.id}` : '';
                const isChecked = sub.completed || !!hubChecklistState[subKey];

                return (
                  <div
                    key={sub.id || sIdx}
                    onClick={() => activeHubTask && handleToggleSubtask(activeHubTask.id, sub.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-white/[0.02] text-zinc-500 line-through'
                        : 'bg-white/[0.04] hover:bg-white/[0.07] text-zinc-200'
                    }`}
                  >
                    <Checkbox checked={isChecked} />
                    <span className="text-xs font-medium flex-1">
                      {sub.title}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                Подзадачи пока не добавлены
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── 5. SHADCN SHEET DRAWER FOR CALENDAR EVENTS ── */}
      <Sheet open={Boolean(selectedCalendarEvent)} onOpenChange={(open) => !open && setSelectedCalendarEvent(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-[#0D101A]/95 backdrop-blur-2xl border-l border-white/[0.08] text-zinc-100">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-300">
                <Clock className="h-3 w-3" />
                <span>Google Calendar Live</span>
              </span>
              {selectedCalendarEvent?.dayLabel && (
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-zinc-300">
                  {selectedCalendarEvent.dayLabel}
                </span>
              )}
            </div>
            <SheetTitle className="text-lg font-bold mt-2 text-white">
              {selectedCalendarEvent?.summary || 'Событие календаря'}
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>Время: {selectedCalendarEvent?.formattedTime || 'весь день'}</span>
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 mt-6">
            {selectedCalendarEvent?.location && (
              <div className="p-3.5 rounded-2xl bg-white/[0.04] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>Место проведения</span>
                </div>
                <p className="text-xs text-zinc-200 pl-5">{selectedCalendarEvent.location}</p>
              </div>
            )}

            {selectedCalendarEvent?.description && (
              <div className="p-3.5 rounded-2xl bg-white/[0.04] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                  <AlignLeft className="h-3.5 w-3.5 text-sky-400" />
                  <span>Описание / Заметки</span>
                </div>
                <p className="text-xs text-zinc-200 whitespace-pre-wrap pl-5">
                  {selectedCalendarEvent.description}
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-sky-500/10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-semibold text-sky-200">Синхронизация с планом Nexus</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Вы можете одним кликом преобразовать это событие в задачу плана, чтобы отслеживать её выполнение и получать XP маскота котика.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (selectedCalendarEvent) {
                    addTask({
                      title: selectedCalendarEvent.summary || 'Событие из календаря',
                      date: selectedCalendarEvent.dateIso,
                      category: 'Проекты',
                      assignee: 'together',
                      completed: false,
                      bracketColor: 'active',
                      tags: ['Календарь', 'GCal'],
                    });
                    setSelectedCalendarEvent(null);
                  }
                }}
                className="w-full h-9 rounded-full text-xs font-semibold gap-1.5 bg-sky-500 hover:bg-sky-400 text-white cursor-pointer transition-all flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Превратить в задачу плана</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
