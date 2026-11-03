import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Radio, 
  Briefcase, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  CheckSquare, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  Search, 
  Globe2,
  Zap,
  Target,
  Sliders,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNexusStore } from '@/store/useNexusStore';
import { StudyWorkItem, NexusTask } from '@/types/nexus';
import { soundEffects } from '@/utils/soundEffects';
import { YaProfiMapRadar } from './YaProfiMapRadar';
import confetti from 'canvas-confetti';

// 4 Master Direction Columns for Egor & Anya
interface MasterColumn {
  id: string; // primary space ID
  acceptedSpaces: string[];
  title: string;
  subtitle: string;
  user: 'egor' | 'anya' | 'together';
  accentText: string;
  badgeBg: string;
  bracketBorder: string;
  icon: any;
}

const MASTER_COLUMNS: MasterColumn[] = [
  {
    id: 'hse-egor',
    acceptedSpaces: ['hse-egor', 'hse'],
    title: 'ВШЭ Магистратура (Егор)',
    subtitle: 'Распределенные системы · CS',
    user: 'egor',
    accentText: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400',
    bracketBorder: 'border-l-sky-500',
    icon: GraduationCap,
  },
  {
    id: 'rudn-anya',
    acceptedSpaces: ['rudn-anya', 'rudn'],
    title: 'РУДН Онлайн (Аня)',
    subtitle: 'Клиническая психология · БРС',
    user: 'anya',
    accentText: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400',
    bracketBorder: 'border-l-purple-500',
    icon: BookOpen,
  },
  {
    id: 'yaprofi-dfo',
    acceptedSpaces: ['yaprofi-dfo', 'yaprofi-cfo', 'yaprofi'],
    title: 'Я-Профессионал (ДФО и ЦФО)',
    subtitle: 'Федеральная олимпиада · 2 таймзоны',
    user: 'together',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400',
    bracketBorder: 'border-l-amber-500',
    icon: Radio,
  },
  {
    id: 'work-projects',
    acceptedSpaces: ['work-egor', 'projects-anya', 'work-projects', 'work'],
    title: 'Работа и Проекты',
    subtitle: 'Продакшн, стартапы и деплой',
    user: 'together',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400',
    bracketBorder: 'border-l-emerald-500',
    icon: Briefcase,
  },
];

export const ShadcnStudyWork: React.FC = () => {
  const {
    studyWorkItems,
    addStudyWorkItem,
    updateStudyWorkItem,
    updateStudyWorkStatus,
    deleteStudyWorkItem,
    toggleStudyWorkSubtask,
    addStudyWorkSubtask,
    deleteStudyWorkSubtask,
    hseCalculators,
    updateHSEComponentScore,
    updateHSEComponentWeight,
    rudnSubjects,
    updateRUDNSubjectScore,
    tasks,
    toggleTaskCompletion,
    deleteTask,
    addXp,
    pomodoroMode,
    pomodoroTimeLeft,
    pomodoroIsRunning,
    pomodoroCompletedSessions,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    setPomodoroMode,
  } = useNexusStore();

  // Exactly 3 clean top-level tabs: Kanban | Focus Timer | Schedule & BRS
  const [activeTab, setActiveTab] = useState<'kanban' | 'pomodoro' | 'brs'>('kanban');

  // Kanban view state
  const [selectedUserFilter, setSelectedUserFilter] = useState<'all' | 'egor' | 'anya'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Quick Add under Column Header
  const [quickAddSpaceId, setQuickAddSpaceId] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [quickAddDeadline, setQuickAddDeadline] = useState('');

  // BRS Sub-tab selection: RUDN (Anya) vs HSE (Egor) vs Ya-Profi Radar
  const [brsActiveSubTab, setBrsActiveSubTab] = useState<'rudn' | 'hse' | 'radar'>('rudn');

  // Sheet Drawer (Card Detail Editor) state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StudyWorkItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCourseOrProject, setEditCourseOrProject] = useState('');
  const [editSpace, setEditSpace] = useState('hse-egor');
  const [editUser, setEditUser] = useState<'egor' | 'anya' | 'together'>('together');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editDeadline, setEditDeadline] = useState('');
  const [editTimezoneNote, setEditTimezoneNote] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Helper to open Drawer for a card
  const handleOpenDrawer = (item: StudyWorkItem) => {
    setSelectedItem(item);
    setEditTitle(item.title);
    setEditCourseOrProject(item.courseOrProject || '');
    setEditSpace(item.space);
    setEditUser(item.user);
    setEditPriority(item.priority);
    setEditDeadline(item.deadline || '');
    setEditTimezoneNote(item.timezoneNote || '');
    setEditNotes(item.notes || item.description || '');
    setEditLinkUrl(item.linkUrl || '');
    setNewSubtaskInput('');
    setIsDrawerOpen(true);
    try {
      soundEffects.playClick();
    } catch {}
  };

  // Save changes from Drawer
  const handleSaveDrawer = () => {
    if (!selectedItem) return;
    updateStudyWorkItem(selectedItem.id, {
      title: editTitle.trim() || selectedItem.title,
      courseOrProject: editCourseOrProject.trim() || undefined,
      space: editSpace,
      user: editUser,
      priority: editPriority,
      deadline: editDeadline || undefined,
      timezoneNote: editTimezoneNote.trim() || undefined,
      notes: editNotes.trim() || undefined,
      description: editNotes.trim() || undefined,
      linkUrl: editLinkUrl.trim() || undefined,
    });
    try {
      soundEffects.playClick();
    } catch {}
    setIsDrawerOpen(false);
  };

  // Delete card from Drawer
  const handleDeleteFromDrawer = () => {
    if (!selectedItem) return;
    if (selectedItem.isTickTick && selectedItem.tickTickTaskId) {
      deleteTask(selectedItem.tickTickTaskId);
    } else {
      deleteStudyWorkItem(selectedItem.id);
    }
    try {
      soundEffects.playClick();
    } catch {}
    setIsDrawerOpen(false);
  };

  // Direct card deletion from hover trash icon
  const handleDeleteDirect = (item: StudyWorkItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isTickTick && item.tickTickTaskId) {
      deleteTask(item.tickTickTaskId);
    } else {
      deleteStudyWorkItem(item.id);
    }
    try {
      soundEffects.playClick();
    } catch {}
  };

  // Quick inline creation under column header
  const handleQuickAddSubmit = (col: MasterColumn) => {
    if (!quickAddTitle.trim()) return;
    addStudyWorkItem({
      space: col.id,
      user: col.user,
      title: quickAddTitle.trim(),
      deadline: quickAddDeadline || undefined,
      status: 'in_progress',
      priority: 'medium',
    });
    setQuickAddTitle('');
    setQuickAddDeadline('');
    setQuickAddSpaceId(null);
    try {
      soundEffects.playClick();
    } catch {}
  };

  // Toggle status from card round checkbox: toggles done <-> in_progress with XP and confetti
  const handleToggleStatus = (item: StudyWorkItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isTickTick && item.tickTickTaskId) {
      toggleTaskCompletion(item.tickTickTaskId);
      try {
        soundEffects.playClick();
      } catch {}
      return;
    }

    if (item.status === 'done') {
      updateStudyWorkStatus(item.id, 'in_progress');
      try {
        soundEffects.playClick();
      } catch {}
    } else {
      updateStudyWorkStatus(item.id, 'done');
      addXp(30);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#c084fc', '#34d399', '#fbbf24']
        });
        soundEffects.playSuccess();
      } catch {}
    }
  };

  // Direct fast status switch on card hover (Бэклог / В работу / Сдано)
  const handleQuickSetStatus = (item: StudyWorkItem, status: StudyWorkItem['status']) => {
    if (status === 'done' && item.status !== 'done') {
      updateStudyWorkStatus(item.id, 'done');
      addXp(30);
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        soundEffects.playSuccess();
      } catch {}
    } else {
      updateStudyWorkStatus(item.id, status);
      try {
        soundEffects.playClick();
      } catch {}
    }
  };

  // Add checklist item inside Drawer
  const handleAddSubtaskInDrawer = () => {
    if (!selectedItem || !newSubtaskInput.trim()) return;
    addStudyWorkSubtask(selectedItem.id, newSubtaskInput.trim());
    setNewSubtaskInput('');
    try {
      soundEffects.playClick();
    } catch {}
  };

  // Format Pomodoro Time
  const timeFormatted = useMemo(() => {
    const minutes = Math.floor(pomodoroTimeLeft / 60);
    const seconds = pomodoroTimeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [pomodoroTimeLeft]);

  // Map TickTick tasks into virtual StudyWork items for complete view
  const getTickTickTasksForSpace = (col: MasterColumn): StudyWorkItem[] => {
    const existingTitles = new Set(studyWorkItems.map((s) => s.title.toLowerCase().trim()));
    return tasks
      .filter((t) => {
        if (existingTitles.has(t.title.toLowerCase().trim())) return false;
        const text = `${t.title} ${t.category || ''} ${(t.tags || []).join(' ')}`.toLowerCase();
        if (col.id === 'hse-egor') {
          return text.includes('вшэ') || text.includes('магистр') || text.includes('hse');
        }
        if (col.id === 'rudn-anya') {
          return text.includes('рудн') || text.includes('rudn') || text.includes('психол');
        }
        if (col.id === 'yaprofi-dfo') {
          return text.includes('я-профи') || text.includes('профессионал') || text.includes('дфо') || text.includes('цфо');
        }
        if (col.id === 'work-projects') {
          return text.includes('работа') || text.includes('work') || text.includes('проект') || text.includes('деплой');
        }
        return false;
      })
      .map((t) => ({
        id: `tt-${t.id}`,
        space: col.id,
        user: t.assignee === 'egor' ? 'egor' : t.assignee === 'anya' ? 'anya' : 'together',
        title: t.title,
        status: t.completed ? 'done' : 'in_progress',
        priority: t.bracketColor === 'critical' ? 'high' : t.bracketColor === 'active' ? 'medium' : 'low',
        deadline: t.date !== 'inbox' ? t.date : undefined,
        tags: t.tags || [],
        notes: t.notes,
        isTickTick: true,
        tickTickTaskId: t.id,
      }));
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-[1700px] mx-auto w-full pb-12 animate-fade-in">
      {/* ── 1. CLEAN TOP NAVIGATION HEADER ── */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl text-card-foreground shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold leading-tight text-zinc-100">
                  Учеба, Проекты & БРС
                </h3>
                <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-400">
                  Воркспейс пары
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                НИУ ВШЭ (Егор), РУДН (Аня) и Федеральная координация ДФО ⇄ ЦФО
              </p>
            </div>
          </div>

          {/* EXACTLY 3 CLEAN TABS: Канбан дел | Фокус-таймер | Расписание и БРС */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('kanban'); soundEffects.playClick(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Канбан дел
            </button>

            <button
              onClick={() => { setActiveTab('pomodoro'); soundEffects.playClick(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pomodoro'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Фокус-таймер</span>
              {pomodoroIsRunning && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping ml-0.5" />
              )}
            </button>

            <button
              onClick={() => { setActiveTab('brs'); soundEffects.playClick(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'brs'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Расписание и БРС</span>
            </button>
          </div>
        </div>

        {/* Search & Assignee filter (shown only in Kanban mode) */}
        {activeTab === 'kanban' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по задачам, курсам и тегам..."
                  className="pl-8 h-8 text-xs bg-white/[0.03] text-zinc-200 placeholder:text-zinc-500 rounded-lg border-none focus-visible:ring-1 focus-visible:ring-sky-500/50"
                />
              </div>

              {/* Assignee Filter Pills */}
              <div className="flex items-center bg-white/[0.03] rounded-lg p-0.5">
                <button
                  onClick={() => setSelectedUserFilter('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    selectedUserFilter === 'all'
                      ? 'bg-white/[0.1] text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setSelectedUserFilter('egor')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    selectedUserFilter === 'egor'
                      ? 'bg-sky-500/20 text-sky-300 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Егор
                </button>
                <button
                  onClick={() => setSelectedUserFilter('anya')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    selectedUserFilter === 'anya'
                      ? 'bg-purple-500/20 text-purple-300 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Аня
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>💡 Клик по карточке открывает детали сдачи и чек-лист</span>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. TAB 1: 4 MASTER KANBAN COLUMNS (Zero Nested Borders) ── */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MASTER_COLUMNS.map((col) => {
            const Icon = col.icon;
            const isAdding = quickAddSpaceId === col.id;

            // Local items matching this space
            const localItems = studyWorkItems.filter((it) => {
              if (col.id === 'work-projects') {
                return (
                  col.acceptedSpaces.includes(it.space) ||
                  !['hse-egor', 'hse', 'rudn-anya', 'rudn', 'yaprofi-dfo', 'yaprofi-cfo', 'yaprofi'].includes(it.space)
                );
              }
              return col.acceptedSpaces.includes(it.space);
            });

            // Virtual TickTick tasks for this direction
            const tickTickItems = getTickTickTasksForSpace(col);

            // Merged & filtered items
            const columnItems = [...localItems, ...tickTickItems].filter((item) => {
              if (selectedUserFilter !== 'all') {
                if (item.user !== selectedUserFilter && item.user !== 'together') return false;
              }
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = item.title.toLowerCase().includes(q);
                const matchCourse = (item.courseOrProject || '').toLowerCase().includes(q);
                const matchNotes = (item.notes || item.description || '').toLowerCase().includes(q);
                const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
                if (!matchTitle && !matchCourse && !matchNotes && !matchTags) return false;
              }
              return true;
            });

            const completedCount = columnItems.filter((i) => i.status === 'done').length;

            return (
              <div
                key={col.id}
                className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl shadow-sm p-4 flex flex-col space-y-3 min-h-[520px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`p-1.5 rounded-lg ${col.badgeBg} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-zinc-100 truncate leading-tight">
                        {col.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {col.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-300">
                      {completedCount}/{columnItems.length}
                    </span>

                    {/* Inline Quick Add Toggle Button (+) */}
                    <button
                      type="button"
                      onClick={() => {
                        setQuickAddSpaceId(isAdding ? null : col.id);
                        setQuickAddTitle('');
                        setQuickAddDeadline('');
                        soundEffects.playClick();
                      }}
                      className="h-7 w-7 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Быстро добавить задачу в эту колонку"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Quick Add Form Right Under Column Header */}
                {isAdding && (
                  <div className="p-3 rounded-xl bg-white/[0.05] space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Input
                      autoFocus
                      placeholder="Название задачи или работы..."
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickAddSubmit(col);
                        if (e.key === 'Escape') setQuickAddSpaceId(null);
                      }}
                      className="h-8 text-xs bg-zinc-900/90 text-zinc-100 placeholder:text-zinc-500 rounded-lg border-none focus-visible:ring-1 focus-visible:ring-sky-500/50"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        type="date"
                        value={quickAddDeadline}
                        onChange={(e) => setQuickAddDeadline(e.target.value)}
                        className="h-7 text-[11px] bg-zinc-900/70 text-zinc-300 rounded-lg border-none w-36 px-2"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuickAddSpaceId(null)}
                          className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                        >
                          Отмена
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAddSubmit(col)}
                          disabled={!quickAddTitle.trim()}
                          className="px-3 py-1 text-xs rounded-lg bg-zinc-100 text-zinc-950 font-medium hover:bg-white disabled:opacity-40 transition cursor-pointer"
                        >
                          Создать
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cards List in Column (Zero nested borders!) */}
                <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                  {columnItems.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-zinc-600 text-2xl mb-1">📖</span>
                      <p className="text-xs text-zinc-500 font-medium">Нет активных задач</p>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddSpaceId(col.id);
                          setQuickAddTitle('');
                          setQuickAddDeadline('');
                        }}
                        className="mt-2 text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
                      >
                        + Создать первую задачу
                      </button>
                    </div>
                  ) : (
                    columnItems.map((it) => {
                      const isDone = it.status === 'done';
                      const subtasksTotal = it.subtasks?.length || 0;
                      const subtasksDone = it.subtasks?.filter((s) => s.completed).length || 0;

                      // Priority bracket color indicator (strictly 3px left border)
                      const bracketBorder = it.priority === 'high'
                        ? 'border-l-rose-500'
                        : it.priority === 'medium'
                        ? 'border-l-amber-500'
                        : col.bracketBorder;

                      return (
                        <div
                          key={it.id}
                          onClick={() => handleOpenDrawer(it)}
                          className={`group relative p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-all cursor-pointer select-none space-y-2 border-l-[3px] ${bracketBorder} ${
                            isDone ? 'opacity-50' : 'shadow-xs'
                          }`}
                        >
                          {/* Row 1: Checkbox + Title + Fast Action Icons */}
                          <div className="flex items-start gap-2.5">
                            {/* Custom round checkbox */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleStatus(it, e)}
                              className={`h-4.5 w-4.5 rounded-full mt-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                isDone
                                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                                  : 'bg-white/[0.08] hover:bg-white/[0.15] text-transparent hover:text-zinc-400'
                              }`}
                              title={isDone ? 'Вернуть в работу' : 'Отметить сданным (+30 XP)'}
                            >
                              <Check className="h-3 w-3 stroke-[3]" />
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1.5">
                                <span
                                  className={`text-xs font-medium leading-snug break-words ${
                                    isDone ? 'line-through text-zinc-400' : 'text-zinc-100'
                                  }`}
                                >
                                  {it.title}
                                </span>

                                {/* Quick Hover Action Icons: Status Switcher & Delete */}
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1"
                                >
                                  <div className="flex items-center bg-zinc-900/90 rounded-md p-0.5 text-[9px]">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickSetStatus(it, 'backlog')}
                                      className={`px-1 py-0.5 rounded transition ${
                                        it.status === 'backlog' ? 'bg-white/20 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                                      }`}
                                      title="В бэклог"
                                    >
                                      Бэклог
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickSetStatus(it, 'in_progress')}
                                      className={`px-1 py-0.5 rounded transition ${
                                        it.status === 'in_progress' ? 'bg-sky-500/30 text-sky-200 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                                      }`}
                                      title="В работу"
                                    >
                                      В работе
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickSetStatus(it, 'done')}
                                      className={`px-1 py-0.5 rounded transition ${
                                        it.status === 'done' ? 'bg-emerald-500/30 text-emerald-200 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                                      }`}
                                      title="Сдано"
                                    >
                                      Сдано
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteDirect(it, e)}
                                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-white/[0.08] transition cursor-pointer"
                                    title="Удалить задачу"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Course or Project snippet */}
                              {it.courseOrProject && (
                                <span className="text-[10px] text-zinc-400 block mt-0.5 truncate">
                                  📚 {it.courseOrProject}
                                </span>
                              )}

                              {/* Notes snippet */}
                              {(it.notes || it.description) && (
                                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                                  {it.notes || it.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Footer Badges & Subtask Progress */}
                          <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Subtasks pill */}
                              {subtasksTotal > 0 && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-zinc-300">
                                  <CheckSquare className="h-2.5 w-2.5 text-emerald-400" />
                                  <span>{subtasksDone}/{subtasksTotal}</span>
                                </span>
                              )}

                              {/* Priority pill */}
                              {it.priority === 'high' && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-[10px] text-rose-300 font-medium">
                                  Срочно
                                </span>
                              )}
                              {it.priority === 'medium' && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-[10px] text-amber-300 font-medium">
                                  Важно
                                </span>
                              )}

                              {/* Deadline */}
                              {it.deadline && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {it.deadline.replace('2026-', '')}
                                </span>
                              )}

                              {/* DFO timezone coordination badge */}
                              {it.timezoneNote && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px] text-amber-300">
                                  <Globe2 className="h-2.5 w-2.5" />
                                  <span>{it.timezoneNote}</span>
                                </span>
                              )}

                              {/* External link */}
                              {it.linkUrl && (
                                <a
                                  href={it.linkUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300"
                                >
                                  <ExternalLink className="h-2.5 w-2.5" />
                                  <span>Линк</span>
                                </a>
                              )}

                              {/* TickTick synced badge */}
                              {it.isTickTick && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-[10px] text-sky-400">
                                  <Zap className="h-2.5 w-2.5" />
                                  <span>TickTick</span>
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                              {it.user === 'egor' ? 'Егор' : it.user === 'anya' ? 'Аня' : 'Пара'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Explicit Bottom "+ Добавить задачу" button */}
                  {!isAdding && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuickAddSpaceId(col.id);
                        setQuickAddTitle('');
                        setQuickAddDeadline('');
                        soundEffects.playClick();
                      }}
                      className="w-full py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-xs text-zinc-400 hover:text-zinc-200 transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Добавить задачу</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 3. TAB 2: POMODORO FOCUS TIMER ── */}
      {activeTab === 'pomodoro' && (
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl text-card-foreground shadow-sm p-10 flex flex-col items-center justify-center space-y-8 text-center max-w-2xl mx-auto w-full animate-fade-in">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">
              Фокус-таймер учебы и проектов
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Глубокая концентрация по технике Pomodoro · +50 XP за каждую завершенную сессию
            </p>
          </div>

          {/* Mode pills */}
          <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-xl">
            <button
              onClick={() => { setPomodoroMode('work'); soundEffects.playClick(); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pomodoroMode === 'work'
                  ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Фокус (25 мин)
            </button>
            <button
              onClick={() => { setPomodoroMode('shortBreak'); soundEffects.playClick(); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pomodoroMode === 'shortBreak'
                  ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Короткий отдых (5 мин)
            </button>
            <button
              onClick={() => { setPomodoroMode('longBreak'); soundEffects.playClick(); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pomodoroMode === 'longBreak'
                  ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Длинный отдых (15 мин)
            </button>
          </div>

          {/* Giant Time Display */}
          <div className="py-6">
            <span className="font-mono text-7xl font-bold tracking-tight text-zinc-100 tabular-nums">
              {timeFormatted}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {pomodoroIsRunning ? (
              <button
                onClick={pausePomodoro}
                className="h-12 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Pause className="h-4 w-4" />
                <span>Пауза</span>
              </button>
            ) : (
              <button
                onClick={startPomodoro}
                className="h-12 px-8 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-white/10"
              >
                <Play className="h-4 w-4 fill-zinc-950" />
                <span>Начать фокус</span>
              </button>
            )}

            <button
              onClick={resetPomodoro}
              className="h-12 w-12 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Сбросить таймер"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Sessions Counter */}
          <div className="pt-4 border-t border-white/[0.06] w-full flex items-center justify-around text-xs text-zinc-400">
            <div>
              Завершено сессий: <span className="font-mono font-semibold text-zinc-200">{pomodoroCompletedSessions}</span>
            </div>
            <div>
              Заработано XP: <span className="font-mono font-semibold text-amber-300">+{pomodoroCompletedSessions * 50} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. TAB 3: SCHEDULE & 100% INTERACTIVE BRS CALCULATORS ── */}
      {activeTab === 'brs' && (
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl text-card-foreground shadow-sm p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Калькуляторы оценивания: РУДН (БРС) & НИУ ВШЭ (10 баллов)
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Интерактивный расчет оценок в реальном времени · Данные автоматически сохраняются в Supabase
              </p>
            </div>

            {/* Sub-tab selection */}
            <div className="flex items-center gap-2 bg-white/[0.04] p-1 rounded-xl">
              <button
                onClick={() => { setBrsActiveSubTab('rudn'); soundEffects.playClick(); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  brsActiveSubTab === 'rudn'
                    ? 'bg-purple-500/25 text-purple-200 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                РУДН (100 баллов · Аня)
              </button>
              <button
                onClick={() => { setBrsActiveSubTab('hse'); soundEffects.playClick(); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  brsActiveSubTab === 'hse'
                    ? 'bg-sky-500/25 text-sky-200 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                НИУ ВШЭ (10 баллов · Егор)
              </button>
              <button
                onClick={() => { setBrsActiveSubTab('radar'); soundEffects.playClick(); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  brsActiveSubTab === 'radar'
                    ? 'bg-amber-500/25 text-amber-200 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Radio className="h-3 w-3 text-amber-400" />
                <span>ДФО Радар Я-Профи</span>
              </button>
            </div>
          </div>

          {/* 4.1. RUDN 100-Point BRS System (Anya) */}
          {brsActiveSubTab === 'rudn' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-200 text-xs flex items-center justify-between">
                <span>📚 <b>Шкала ECTS РУДН</b>: 95–100 (A, 5+), 86–94 (B, 5), 69–85 (C, 4), 61–68 (D, 3+), 51–60 (E, 3)</span>
                <span className="font-mono">Макс: 60 + 20 + 20 = 100</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rudnSubjects.map((subj) => {
                  const total = subj.currentControl + subj.milestoneControl + subj.finalExam;
                  const gradeLabel =
                    total >= 95
                      ? 'Отлично (A)'
                      : total >= 86
                      ? 'Очень хорошо (B)'
                      : total >= 69
                      ? 'Хорошо (C)'
                      : total >= 61
                      ? 'Удовлетворительно (D)'
                      : total >= 51
                      ? 'Посредственно (E)'
                      : 'Не зачтено (F)';
                  const gradeColor =
                    total >= 86
                      ? 'text-emerald-400 bg-emerald-500/15'
                      : total >= 69
                      ? 'text-sky-400 bg-sky-500/15'
                      : total >= 51
                      ? 'text-amber-400 bg-amber-500/15'
                      : 'text-rose-400 bg-rose-500/15';

                  return (
                    <div
                      key={subj.id}
                      className="p-4 rounded-xl bg-white/[0.04] space-y-4 shadow-xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-semibold text-sm text-zinc-100">
                            {subj.subjectName}
                          </h4>
                          <span className="text-[11px] text-zinc-400">
                            РУДН Онлайн · Психология
                          </span>
                        </div>
                        <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-medium ${gradeColor}`}>
                          {total} / 100 · {gradeLabel}
                        </span>
                      </div>

                      {/* 3 Interactive Inputs & Sliders */}
                      <div className="space-y-3.5 text-xs">
                        {/* Control 1: Current */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-zinc-400">
                            <span>Текущий контроль (лекции/кейсы, 0-60)</span>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={0}
                                max={60}
                                value={subj.currentControl}
                                onChange={(e) => updateRUDNSubjectScore(subj.id, 'currentControl', Math.min(60, Math.max(0, Number(e.target.value))))}
                                className="h-6 w-14 text-center font-mono text-xs bg-zinc-900 border-none p-0 text-zinc-100"
                              />
                              <span className="text-[10px] text-zinc-500">/ 60</span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            value={subj.currentControl}
                            onChange={(e) => updateRUDNSubjectScore(subj.id, 'currentControl', Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                          />
                        </div>

                        {/* Control 2: Milestone */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-zinc-400">
                            <span>Рубежный контроль (тесты, 0-20)</span>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={0}
                                max={20}
                                value={subj.milestoneControl}
                                onChange={(e) => updateRUDNSubjectScore(subj.id, 'milestoneControl', Math.min(20, Math.max(0, Number(e.target.value))))}
                                className="h-6 w-14 text-center font-mono text-xs bg-zinc-900 border-none p-0 text-zinc-100"
                              />
                              <span className="text-[10px] text-zinc-500">/ 20</span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={subj.milestoneControl}
                            onChange={(e) => updateRUDNSubjectScore(subj.id, 'milestoneControl', Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                          />
                        </div>

                        {/* Control 3: Exam */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-zinc-400">
                            <span>Экзамен / Зачет (сессия, 0-20)</span>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={0}
                                max={20}
                                value={subj.finalExam}
                                onChange={(e) => updateRUDNSubjectScore(subj.id, 'finalExam', Math.min(20, Math.max(0, Number(e.target.value))))}
                                className="h-6 w-14 text-center font-mono text-xs bg-zinc-900 border-none p-0 text-zinc-100"
                              />
                              <span className="text-[10px] text-zinc-500">/ 20</span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={subj.finalExam}
                            onChange={(e) => updateRUDNSubjectScore(subj.id, 'finalExam', Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                          />
                        </div>
                      </div>

                      <Progress value={total} className="h-2 bg-white/5" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4.2. HSE 10-Point Cumulative System (Egor) */}
          {brsActiveSubTab === 'hse' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-500/10 text-sky-200 text-xs flex items-center justify-between">
                <span>🎓 <b>Формула НИУ ВШЭ</b>: О_итог = Округление(Σ(О_компонент × Вес)). Оценка от 1 до 10 (8-10 Отлично, 6-7 Хорошо)</span>
                <span className="font-mono">Шкала: 10 баллов</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {hseCalculators.map((calc) => {
                  const totalScore = calc.components.reduce((acc, c) => acc + (c.score * c.weight), 0);
                  const roundedScore = Math.round(totalScore);
                  const isGoalAchieved = roundedScore >= calc.targetScore;

                  return (
                    <div
                      key={calc.id}
                      className="p-5 rounded-xl bg-white/[0.04] space-y-4 shadow-xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-semibold text-sm text-zinc-100">
                            {calc.courseName}
                          </h4>
                          <span className="text-[11px] text-zinc-400">
                            Целевая оценка: {calc.targetScore} / 10 · {isGoalAchieved ? '🎯 Цель достигнута!' : 'В процессе'}
                          </span>
                        </div>
                        <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          roundedScore >= 8 ? 'text-emerald-400 bg-emerald-500/15' : 'text-sky-400 bg-sky-500/15'
                        }`}>
                          Итог: {roundedScore} / 10 ({totalScore.toFixed(2)})
                        </span>
                      </div>

                      {/* Components List with Editable Weights and Scores */}
                      <div className="space-y-3.5 text-xs">
                        {calc.components.map((comp) => (
                          <div key={comp.id} className="space-y-1">
                            <div className="flex justify-between items-center text-zinc-300">
                              <span className="truncate pr-2">{comp.name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Editable Weight */}
                                <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                                  <span>вес:</span>
                                  <Input
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="1"
                                    value={comp.weight}
                                    onChange={(e) => updateHSEComponentWeight(calc.id, comp.id, Number(e.target.value))}
                                    className="h-5 w-12 text-center font-mono text-[11px] bg-zinc-900 border-none p-0 text-zinc-200"
                                  />
                                </div>

                                {/* Editable Score (0 to 10) */}
                                <div className="flex items-center gap-1 text-zinc-200 font-mono font-medium">
                                  <Input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="10"
                                    value={comp.score}
                                    onChange={(e) => updateHSEComponentScore(calc.id, comp.id, Number(e.target.value))}
                                    className="h-6 w-12 text-center font-mono text-xs bg-zinc-900 border-none p-0 text-zinc-100"
                                  />
                                  <span className="text-[10px] text-zinc-500">/ 10</span>
                                </div>
                              </div>
                            </div>

                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="0.5"
                              value={comp.score}
                              onChange={(e) => updateHSEComponentScore(calc.id, comp.id, Number(e.target.value))}
                              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
                            />
                          </div>
                        ))}
                      </div>

                      <Progress value={roundedScore * 10} className="h-2 bg-white/5" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4.3. Ya-Profi Radar DFO / CFO */}
          {brsActiveSubTab === 'radar' && (
            <div className="animate-fade-in">
              <YaProfiMapRadar />
            </div>
          )}
        </div>
      )}

      {/* ── 5. RIGHT SHEET DRAWER (Full CRUD Card Editor) ── */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-zinc-950/95 backdrop-blur-3xl text-zinc-100 p-6 space-y-6 [scrollbar-width:thin]">
          <SheetHeader className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-300">
                Карточка воркспейса
              </span>
              {selectedItem?.isTickTick && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400">
                  Синхронизировано из TickTick
                </span>
              )}
            </div>
            <SheetTitle className="text-base font-semibold text-zinc-100">
              Детали учебного / рабочего дела
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-400">
              Название, предмет/проект, дедлайн, часовой пояс и чек-лист
            </SheetDescription>
          </SheetHeader>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Название задачи</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Что нужно сдать или сделать?"
                className="bg-white/[0.04] text-zinc-100 text-xs border-none focus-visible:ring-1 focus-visible:ring-sky-500"
              />
            </div>

            {/* Course or Project */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Предмет / Проект</label>
              <Input
                value={editCourseOrProject}
                onChange={(e) => setEditCourseOrProject(e.target.value)}
                placeholder="Например: Распределенные системы, Клиническая психология, Nexus Web"
                className="bg-white/[0.04] text-zinc-100 text-xs border-none focus-visible:ring-1 focus-visible:ring-sky-500"
              />
            </div>

            {/* Column Direction Space */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Направление (колонка)</label>
              <Select value={editSpace} onValueChange={setEditSpace}>
                <SelectTrigger className="bg-white/[0.04] text-zinc-100 text-xs border-none">
                  <SelectValue placeholder="Выберите направление" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-none text-zinc-100 text-xs">
                  {MASTER_COLUMNS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Ответственный</label>
                <Select value={editUser} onValueChange={(val: any) => setEditUser(val)}>
                  <SelectTrigger className="bg-white/[0.04] text-zinc-100 text-xs border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-none text-zinc-100 text-xs">
                    <SelectItem value="egor">Егор</SelectItem>
                    <SelectItem value="anya">Аня</SelectItem>
                    <SelectItem value="together">Вместе (Пара)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Приоритет</label>
                <Select value={editPriority} onValueChange={(val: any) => setEditPriority(val)}>
                  <SelectTrigger className="bg-white/[0.04] text-zinc-100 text-xs border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-none text-zinc-100 text-xs">
                    <SelectItem value="high">Срочно (высокий)</SelectItem>
                    <SelectItem value="medium">Важно (средний)</SelectItem>
                    <SelectItem value="low">Обычный (плановый)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deadline & Timezone Coordination */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Дедлайн</label>
                <Input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="bg-white/[0.04] text-zinc-100 text-xs border-none focus-visible:ring-1 focus-visible:ring-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Таймзона / Координация</label>
                <Input
                  value={editTimezoneNote}
                  onChange={(e) => setEditTimezoneNote(e.target.value)}
                  placeholder="напр. +7ч ДФО / МСК"
                  className="bg-white/[0.04] text-zinc-100 text-xs border-none focus-visible:ring-1 focus-visible:ring-sky-500"
                />
              </div>
            </div>

            {/* Checklist / Subtasks */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Чек-лист сдачи / подзадач</span>
                </label>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {selectedItem?.subtasks?.filter((s) => s.completed).length || 0} / {selectedItem?.subtasks?.length || 0}
                </span>
              </div>

              {/* Subtasks List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {selectedItem?.subtasks?.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Checkbox
                        checked={sub.completed}
                        onCheckedChange={() => selectedItem && toggleStudyWorkSubtask(selectedItem.id, sub.id)}
                        className="h-3.5 w-3.5"
                      />
                      <span
                        className={`text-xs truncate ${
                          sub.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectedItem && deleteStudyWorkSubtask(selectedItem.id, sub.id)}
                      className="text-zinc-500 hover:text-red-400 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Subtask Input */}
              <div className="flex items-center gap-1.5">
                <Input
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtaskInDrawer();
                  }}
                  placeholder="Добавить пункт чек-листа... (Enter)"
                  className="h-8 text-xs bg-white/[0.04] text-zinc-100 border-none"
                />
                <Button
                  size="sm"
                  onClick={handleAddSubtaskInDrawer}
                  className="h-8 px-3 text-xs bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Notes & Context Description */}
            <div className="space-y-1.5 pt-2">
              <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                <span>Заметки, требования и ссылки на материалы</span>
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Требования к сдаче, репозиторий, темы доклада..."
                className="w-full p-2.5 rounded-lg bg-white/[0.04] text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none leading-relaxed border-none"
              />
            </div>

            {/* Link URL */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                <span>Ссылка (LMS, Zoom, GitHub, портал олимпиады)</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  value={editLinkUrl}
                  onChange={(e) => setEditLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/[0.04] text-zinc-100 text-xs border-none focus-visible:ring-1 focus-visible:ring-sky-500 flex-1"
                />
                {editLinkUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(editLinkUrl, '_blank')}
                    className="h-8 px-2.5 text-xs bg-white/[0.04] text-zinc-200 border-none"
                  >
                    Открыть
                  </Button>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteFromDrawer}
              className="text-xs gap-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 border-none cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Удалить задачу</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSaveDrawer}
              className="text-xs bg-zinc-100 text-zinc-950 hover:bg-white font-medium shadow-sm px-5 cursor-pointer"
            >
              Сохранить изменения
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
