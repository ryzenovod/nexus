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
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { NexusTask, Assignee, RoomArea } from '@/types/nexus';
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
  const { gcalEvents, budget } = useNexusStore();
  const [selectedRoom, setSelectedRoom] = useState<string>('Все');
  const [taskSearch, setTaskSearch] = useState<string>('');
  const [activeHubTask, setActiveHubTask] = useState<NexusTask | null>(null);
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

      // Filter events from gcal (strictly real events from fetch_data.py)
      const dayEvents = (gcalEvents || []).filter(e => {
        if (!e || !e.start || (e.id && e.id.startsWith('gcal-'))) return false;
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

  // Safe subtasks for activeHubTask without leaked passwords
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
    <div className="flex-1 flex flex-col space-y-6 max-w-[1600px] mx-auto w-full pb-8">
      {/* ── 1. METRIC CARDS ROW ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Tasks */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">TickTick Задачи</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {activeTasks.length} <span className="text-sm font-normal text-muted-foreground">активных</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            +{completedTasks.length} завершено · синхронизировано с Mac
          </p>
        </div>

        {/* Card 2: Schedule & Overdue */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">План на неделю</span>
            <CalendarDays className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {todayTasks.length} <span className="text-sm font-normal text-muted-foreground">дел на сегодня</span>
          </div>
          <p className="text-xs mt-1">
            {overdueTasks.length > 0 ? (
              <span className="text-red-400 font-medium">{overdueTasks.length} просрочено</span>
            ) : (
              <span className="text-muted-foreground">Все задачи выполняются в срок</span>
            )}
          </p>
        </div>

        {/* Card 3: Joint Budget */}
        <div 
          onClick={() => onNavigateTab('finances')}
          className="rounded-xl border bg-card text-card-foreground shadow-xs p-6 cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">Совместный бюджет пары</span>
            <CreditCard className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight font-mono-num">
            {budgetCollected.toLocaleString('ru-RU')} ₽ 
            <span className="text-sm font-normal text-muted-foreground"> / {budgetTarget.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={budgetProgress} className="h-1.5 flex-1" />
            <span className="text-[11px] font-mono text-muted-foreground">{budgetProgress}%</span>
          </div>
        </div>

        {/* Card 4: Utilities */}
        <div 
          onClick={() => onNavigateTab('finances')}
          className="rounded-xl border bg-card text-card-foreground shadow-xs p-6 cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">ЖКХ Москвы (Ноябрь)</span>
            <Home className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight font-mono-num">
            1 685 ₽ <span className="text-sm font-normal text-muted-foreground">к оплате</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Мосэнерго: передано · Домиленд: 1 685 ₽
          </p>
        </div>
      </div>

      {/* ── 2. 7-DAY WEEK CALENDAR TIMELINE ── */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
        <div className="flex flex-wrap items-center justify-between p-5 border-b gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-base font-semibold leading-none">Календарь и задачи недели</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {weekDays[0].dayNumber} {weekDays[0].monthName} — {weekDays[6].dayNumber} {weekDays[6].monthName} 2026
              </p>
            </div>
            {activeWeekOffset !== 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeWeekOffset > 0 ? `+${activeWeekOffset} нед.` : `${activeWeekOffset} нед.`}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border bg-muted/30 p-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOffsetChange(activeWeekOffset - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOffsetChange(0)}
                className={`h-7 px-2.5 text-xs ${activeWeekOffset === 0 ? 'bg-background font-semibold shadow-xs' : ''}`}
              >
                Сегодня
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOffsetChange(activeWeekOffset + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Assignee filter toggle */}
            <div className="flex items-center rounded-md border bg-muted/30 p-0.5">
              {(['all', 'egor', 'anya'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => onAssigneeChange(a)}
                  className={`h-7 px-2.5 text-xs rounded-sm transition-all cursor-pointer ${
                    selectedAssignee === a
                      ? 'bg-background text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {a === 'all' ? 'Все' : a === 'egor' ? 'Егор' : 'Аня'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 7 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x border-border min-h-[220px]">
          {weekDays.map((day) => {
            return (
              <div
                key={day.iso}
                className={`flex flex-col p-3 transition-colors ${
                  day.isToday ? 'bg-muted/20' : 'hover:bg-muted/10'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {day.dayName}
                    </span>
                    <span className={`text-sm font-semibold ${day.isToday ? 'text-primary' : ''}`}>
                      {day.dayNumber}
                    </span>
                  </div>
                  {day.isToday && (
                    <Badge variant="default" className="text-[10px] h-4 px-1.5 font-normal">
                      Сегодня
                    </Badge>
                  )}
                </div>

                {/* Day Items List */}
                <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[260px] [scrollbar-width:none]">
                  {/* Calendar Events */}
                  {day.events.map((ev, eIdx) => {
                    const time = ev.start?.dateTime
                      ? new Date(ev.start.dateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                      : 'весь день';
                    return (
                      <div
                        key={ev.id || eIdx}
                        className="flex items-center gap-1.5 p-1.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs"
                      >
                        <Clock className="h-3 w-3 text-sky-400 shrink-0" />
                        <span className="text-[10px] font-mono shrink-0">{time}</span>
                        <span className="truncate font-medium">{ev.summary}</span>
                      </div>
                    );
                  })}

                  {/* Tasks */}
                  {day.tasks.map((task) => {
                    const isDone = task.completed;
                    return (
                      <div
                        key={task.id}
                        className={`group flex items-start gap-2 p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
                          isDone 
                            ? 'bg-muted/30 border-transparent opacity-50 line-through' 
                            : task.isOverdue
                              ? 'bg-red-500/10 border-red-500/20 text-foreground'
                              : 'bg-card hover:bg-accent hover:text-accent-foreground'
                        }`}
                        onClick={() => onTaskClick(task)}
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
                              <Badge variant="destructive" className="h-3.5 px-1 text-[9px]">
                                Просрочено
                              </Badge>
                            )}
                            <span className="truncate font-medium">{task.title}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {day.tasks.length === 0 && day.events.length === 0 && (
                    <div className="h-full flex items-center justify-center py-6 text-muted-foreground/40 text-[11px]">
                      Свободно
                    </div>
                  )}
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={() => onAddTask(day.iso)}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors opacity-70 hover:opacity-100"
                >
                  <Plus className="h-3 w-3" />
                  <span>Добавить</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. FLAT TASKS INBOX & HUBS BROWSER ── */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
        <div className="p-5 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold leading-none">
                Все задачи и хабы обустройства
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                47 реальных дел из ваших списков TickTick с быстрым доступом к чек-листам
              </p>
            </div>

            {/* Task Search in Inbox */}
            <div className="relative w-full sm:w-64">
              <Input
                type="search"
                placeholder="Фильтр в списке..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="h-8 text-xs bg-muted/40"
              />
            </div>
          </div>

          {/* Room Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            {roomTabs.map((tab) => {
              const isActive = selectedRoom === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRoom(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-secondary text-secondary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] opacity-60">({tab.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasks Grid / Flat List */}
        <div className="divide-y border-t max-h-[500px] overflow-y-auto [scrollbar-width:thin]">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isDone = task.completed;
              const hasChecklist = task.isHub || (task.subtasks && task.subtasks.length > 0) || (task.subtaskCount && task.subtaskCount > 0);
              const count = task.subtaskCount || task.subtasks?.length || 0;

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 px-5 hover:bg-muted/30 transition-colors gap-3 ${
                    isDone ? 'opacity-50 line-through bg-muted/10' : ''
                  }`}
                >
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={isDone}
                      onCheckedChange={() => onToggleTask(task.id)}
                    />
                    <div 
                      className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                      onClick={() => onTaskClick(task)}
                    >
                      <span className="text-sm font-medium truncate">
                        {task.title}
                      </span>
                      {task.isOverdue && !isDone && (
                        <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                          Просрочено
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Middle: Badges */}
                  <div className="hidden sm:flex items-center gap-2">
                    {task.room && (
                      <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                        {task.room}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[11px] font-normal">
                      {task.assignee === 'egor' ? 'Егор' : task.assignee === 'anya' ? 'Аня' : 'Егор & Аня'}
                    </Badge>
                  </div>

                  {/* Right: Hub Drawer Trigger Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    {hasChecklist && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveHubTask(task)}
                        className="h-7 px-2.5 text-xs gap-1 text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                      >
                        <Layers className="h-3 w-3" />
                        <span>Чек-лист {count > 0 ? `(${count})` : ''}</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskClick(task)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Редактировать
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Нет задач по выбранным фильтрам
            </div>
          )}
        </div>
      </div>

      {/* ── 4. SHADCN SHEET DRAWER FOR SUBTASK CHECKLISTS ── */}
      <Sheet open={Boolean(activeHubTask)} onOpenChange={(open) => !open && setActiveHubTask(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {activeHubTask?.room || 'Хаб обустройства'}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                TickTick
              </Badge>
            </div>
            <SheetTitle className="text-lg font-bold mt-1">
              {activeHubTask?.title}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
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
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-muted/40 border-transparent text-muted-foreground line-through'
                        : 'bg-card hover:bg-accent border-border'
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
              <div className="py-8 text-center text-xs text-muted-foreground">
                Подзадачи пока не добавлены
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
