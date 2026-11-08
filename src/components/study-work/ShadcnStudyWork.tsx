import { openExternalUrl } from '@/lib/safeExternalUrl';
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
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { InlineText, InlineNumber } from '@/components/ui/inline-edit';
import { StudyWorkItem } from '@/types/nexus';
import { soundEffects } from '@/utils/soundEffects';
import confetti from 'canvas-confetti';

// 4 Master Direction Columns for Egor & Anya
interface MasterColumn {
  id: string;
  acceptedSpaces: string[];
  title: string;
  subtitle: string;
  user: 'egor' | 'anya' | 'together';
  accentGlow: string;
  accentText: string;
  badgeBg: string;
  icon: any;
  extraBadge?: string;
}

const MASTER_COLUMNS: MasterColumn[] = [
  {
    id: 'hse-egor',
    acceptedSpaces: ['hse-egor', 'hse'],
    title: 'ВШЭ (Егор)',
    subtitle: 'Магистратура НИУ ВШЭ',
    user: 'egor',
    accentGlow: 'bg-sky-500',
    accentText: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400',
    icon: GraduationCap,
  },
  {
    id: 'rudn-anya',
    acceptedSpaces: ['rudn-anya', 'rudn'],
    title: 'РУДН (Аня)',
    subtitle: 'Управление продуктом · РУДН',
    user: 'anya',
    accentGlow: 'bg-purple-500',
    accentText: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400',
    icon: BookOpen,
  },
  {
    id: 'yaprofi-dfo',
    acceptedSpaces: ['yaprofi-dfo', 'yaprofi-cfo', 'yaprofi'],
    title: 'Я-Профессионал',
    subtitle: 'Федеральная олимпиада · ДФО ⇄ ЦФО',
    user: 'together',
    accentGlow: 'bg-amber-500',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400',
    icon: Radio,
  },
  {
    id: 'work-projects',
    acceptedSpaces: ['work-egor', 'projects-anya', 'work-projects', 'work'],
    title: 'Работа & Личные проекты',
    subtitle: 'Продакшн, стартапы и деплой',
    user: 'together',
    accentGlow: 'bg-emerald-500',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400',
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
    updateRUDNSubjectName,
    updateHSECourseName,
    customColumnMeta,
    updateColumnMeta,
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

  // Exactly 3 clean modes: Kanban | Focus Timer | Schedule & BRS (No DFO radar tab)
  const [activeTab, setActiveTab] = useState<'kanban' | 'pomodoro' | 'brs'>('kanban');

  // Kanban view state
  const [selectedUserFilter, setSelectedUserFilter] = useState<'all' | 'egor' | 'anya'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Quick Add under Column Header
  const [quickAddSpaceId, setQuickAddSpaceId] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [quickAddDeadline, setQuickAddDeadline] = useState('');

  // BRS Sub-tab selection: RUDN (Anya) vs HSE (Egor) only
  const [brsActiveSubTab, setBrsActiveSubTab] = useState<'rudn' | 'hse'>('rudn');

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
    <div className="flex-1 flex flex-col space-y-8 max-w-[1400px] mx-auto w-full pb-12">
      {/* ── 1. OPEN AIRY HEADER (No Outer Box, Pure Linear Aesthetics) ── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-400/20 p-3 shrink-0 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Учеба, Магистратура & «Я-Профессионал»
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                НИУ ВШЭ (Егор), РУДН (Аня) и лидерство ДФО ⇄ ЦФО
              </p>
            </div>
          </div>

          {/* Floating Mode Switcher Capsule (Exactly 3 Tabs) */}
          <div className="rounded-full bg-white/[0.04] p-1 flex items-center gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <button
              type="button"
              onClick={() => { setActiveTab('kanban'); soundEffects.playClick(); }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer border-0 ${
                activeTab === 'kanban'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Канбан дел
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('pomodoro'); soundEffects.playClick(); }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border-0 ${
                activeTab === 'pomodoro'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
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
              type="button"
              onClick={() => { setActiveTab('brs'); soundEffects.playClick(); }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border-0 ${
                activeTab === 'brs'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>БРС & Оценки</span>
            </button>
          </div>
        </div>

        {/* Search, Assignee filter & Add action in one clean line */}
        {activeTab === 'kanban' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {/* Search Input Capsule */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по задачам, курсам и тегам..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white/[0.04] text-zinc-200 placeholder:text-zinc-500 rounded-full border-0 outline-none focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              {/* Assignee Filter Pills */}
              <div className="flex items-center rounded-full bg-white/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => setSelectedUserFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border-0 ${
                    selectedUserFilter === 'all'
                      ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Все
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserFilter('egor')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border-0 ${
                    selectedUserFilter === 'egor'
                      ? 'bg-sky-500/25 text-sky-200 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Егор
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserFilter('anya')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border-0 ${
                    selectedUserFilter === 'anya'
                      ? 'bg-purple-500/25 text-purple-200 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Аня
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setQuickAddSpaceId(MASTER_COLUMNS[0].id);
                  setQuickAddTitle('');
                  setQuickAddDeadline('');
                }}
                className="rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white px-4 py-2 transition-all flex items-center gap-1.5 cursor-pointer border-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Новое направление</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. TAB 1: 4 MASTER KANBAN COLUMNS (Zero Hard Borders) ── */}
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
                className="rounded-[26px] bg-white/[0.02] p-4 flex flex-col gap-3 min-h-[440px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border-0"
              >
                {/* Column Header: Soft icon, name, counter, plus button */}
                <div className="flex items-center justify-between pb-2 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`p-2 rounded-2xl ${col.badgeBg} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <InlineText
                          value={customColumnMeta?.[col.id]?.title || col.title}
                          onChange={(val) => updateColumnMeta(col.id, { title: val })}
                          className="font-semibold text-[15px] text-white leading-tight whitespace-nowrap"
                        />
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                        <InlineText
                          value={customColumnMeta?.[col.id]?.subtitle || col.subtitle}
                          onChange={(val) => updateColumnMeta(col.id, { subtitle: val })}
                          className="text-[11px] text-zinc-400 truncate"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs tabular-nums text-zinc-400 font-medium">
                      {completedCount}/{columnItems.length}
                    </span>

                    {/* Circular Add Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setQuickAddSpaceId(isAdding ? null : col.id);
                        setQuickAddTitle('');
                        setQuickAddDeadline('');
                        soundEffects.playClick();
                      }}
                      className="rounded-full w-7 h-7 bg-white/[0.05] hover:bg-white/[0.12] text-zinc-300 hover:text-white flex items-center justify-center transition-all border-0 cursor-pointer"
                      title="Быстро добавить задачу в эту колонку"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Quick Add Form Under Header */}
                {isAdding && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] space-y-2.5">
                    <input
                      autoFocus
                      placeholder="Название задачи или работы..."
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickAddSubmit(col);
                        if (e.key === 'Escape') setQuickAddSpaceId(null);
                      }}
                      className="w-full h-8 text-xs bg-white/[0.06] text-zinc-100 placeholder:text-zinc-500 rounded-full px-3 border-0 outline-none focus:ring-1 focus:ring-sky-500/50"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="date"
                        value={quickAddDeadline}
                        onChange={(e) => setQuickAddDeadline(e.target.value)}
                        className="h-7 text-[11px] bg-white/[0.06] text-zinc-300 rounded-full border-0 px-3 w-36 outline-none"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuickAddSpaceId(null)}
                          className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer border-0"
                        >
                          Отмена
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAddSubmit(col)}
                          disabled={!quickAddTitle.trim()}
                          className="px-3.5 py-1 text-xs rounded-full bg-white text-zinc-950 font-semibold hover:bg-zinc-100 disabled:opacity-40 transition cursor-pointer border-0"
                        >
                          Создать
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cards List in Column (Linear style, ZERO border-l-4) */}
                <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                  {columnItems.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                      <p className="text-xs text-zinc-500 font-medium mb-3">Нет активных задач</p>
                      {!isAdding && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuickAddSpaceId(col.id);
                            setQuickAddTitle('');
                            setQuickAddDeadline('');
                            soundEffects.playClick();
                          }}
                          className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer border-0"
                        >
                          <Plus className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Добавить задачу</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    columnItems.map((it) => {
                      const isDone = it.status === 'done';
                      const subtasksTotal = it.subtasks?.length || 0;
                      const subtasksDone = it.subtasks?.filter((s) => s.completed).length || 0;

                      return (
                        <div
                          key={it.id}
                          onClick={() => handleOpenDrawer(it)}
                          className={`group relative rounded-[20px] bg-[#111420]/90 hover:bg-[#161A29] p-4 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.09),0_0_0_1px_rgba(255,255,255,0.04)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 cursor-pointer select-none space-y-2.5 border-0 ${
                            isDone ? 'opacity-40' : ''
                          }`}
                        >
                          {/* Priority / Space Top Corner Glow */}
                          <div 
                            className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none transition-opacity group-hover:opacity-20 ${
                              it.priority === 'high' ? 'bg-rose-500' : it.priority === 'medium' ? 'bg-amber-500' : 'bg-indigo-500'
                            }`} 
                          />

                          {/* Row 1: Rounded Checkbox + Priority Dot + Title + Fast Action Icons */}
                          <div className="flex items-start gap-2.5">
                            {/* Rounded Checkbox */}
                            <div 
                              className="pt-0.5 shrink-0" 
                              onClick={(e) => handleToggleStatus(it, e)}
                            >
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-zinc-950 shadow-xs'
                                  : 'ring-1 ring-white/20 group-hover:ring-sky-400 bg-white/[0.04]'
                              }`}>
                                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  {/* Priority indicator dot */}
                                  <span 
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      it.priority === 'high' 
                                        ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]' 
                                        : it.priority === 'medium' 
                                        ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' 
                                        : 'bg-zinc-500'
                                    }`} 
                                    title={it.priority === 'high' ? 'Высокий приоритет' : it.priority === 'medium' ? 'Средний приоритет' : 'Обычный'}
                                  />
                                  <span className={`text-[14px] font-medium leading-snug break-words ${
                                    isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
                                  }`}>
                                    {it.title}
                                  </span>
                                </div>

                                {/* Hover Action icons */}
                                <div 
                                  onClick={(e) => e.stopPropagation()} 
                                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1"
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteDirect(it, e)}
                                    className="p-1 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-white/[0.08] transition-all cursor-pointer border-0"
                                    title="Удалить задачу"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Course or Project subtitle */}
                              {it.courseOrProject && (
                                <span className="text-[11px] text-zinc-400 block mt-1 truncate">
                                  {it.courseOrProject}
                                </span>
                              )}

                              {/* Description / Notes snippet */}
                              {(it.notes || it.description) && (
                                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                                  {it.notes || it.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Clean Footer (ZERO border-t, pure layout) */}
                          <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Subtasks progress pill */}
                              {subtasksTotal > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-zinc-300 tabular-nums">
                                  <CheckSquare className="h-2.5 w-2.5 text-emerald-400" />
                                  <span>{subtasksDone}/{subtasksTotal}</span>
                                </span>
                              )}

                              {/* Deadline pill */}
                              {it.deadline && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-zinc-300 tabular-nums">
                                  <Calendar className="h-2.5 w-2.5 text-zinc-400" />
                                  <span>{it.deadline.replace('2026-', '')}</span>
                                </span>
                              )}

                              {/* Timezone Note (e.g. +7ч ДФО) */}
                              {it.timezoneNote && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-medium">
                                  <Globe2 className="h-2.5 w-2.5" />
                                  <span>{it.timezoneNote}</span>
                                </span>
                              )}

                              {/* TickTick synced */}
                              {it.isTickTick && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[10px]">
                                  <Zap className="h-2.5 w-2.5" />
                                  <span>TickTick</span>
                                </span>
                              )}
                            </div>

                            {/* Assignee Badge */}
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider rounded-full bg-white/[0.04] px-2 py-0.5">
                              {it.user === 'egor' ? 'ЕГОР' : it.user === 'anya' ? 'АНЯ' : 'ПАРА'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Explicit Bottom "+ Добавить задачу" button */}
                  {columnItems.length > 0 && !isAdding && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuickAddSpaceId(col.id);
                        setQuickAddTitle('');
                        setQuickAddDeadline('');
                        soundEffects.playClick();
                      }}
                      className="w-full py-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] text-xs text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 border-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Добавить задачу</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 3. TAB 2: POMODORO FOCUS TIMER (.nexus-surface) ── */}
      {activeTab === 'pomodoro' && (
        <div className="nexus-surface p-10 flex flex-col items-center justify-center space-y-8 text-center max-w-2xl mx-auto w-full">
          <div>
            <h3 className="text-xl font-semibold text-white">
              Фокус-таймер учебы и проектов
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Глубокая концентрация по технике Pomodoro · +50 XP за каждую завершенную сессию
            </p>
          </div>

          {/* Mode pills */}
          <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-full">
            <button
              type="button"
              onClick={() => { setPomodoroMode('work'); soundEffects.playClick(); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
                pomodoroMode === 'work'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Фокус (25 мин)
            </button>
            <button
              type="button"
              onClick={() => { setPomodoroMode('shortBreak'); soundEffects.playClick(); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
                pomodoroMode === 'shortBreak'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Короткий отдых (5 мин)
            </button>
            <button
              type="button"
              onClick={() => { setPomodoroMode('longBreak'); soundEffects.playClick(); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
                pomodoroMode === 'longBreak'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Длинный отдых (15 мин)
            </button>
          </div>

          {/* Giant Time Display with tabular-nums */}
          <div className="py-6">
            <span className="text-7xl font-bold tracking-tight text-white tabular-nums">
              {timeFormatted}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {pomodoroIsRunning ? (
              <button
                type="button"
                onClick={pausePomodoro}
                className="h-12 px-8 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 border-0"
              >
                <Pause className="h-4 w-4" />
                <span>Пауза</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startPomodoro}
                className="h-12 px-8 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-white/10 border-0"
              >
                <Play className="h-4 w-4 fill-zinc-950" />
                <span>Начать фокус</span>
              </button>
            )}

            <button
              type="button"
              onClick={resetPomodoro}
              className="h-12 w-12 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 flex items-center justify-center transition-all cursor-pointer border-0"
              title="Сбросить таймер"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Sessions Counter */}
          <div className="pt-4 border-t border-white/[0.06] w-full flex items-center justify-around text-xs text-zinc-400">
            <div>
              Завершено сессий: <span className="font-semibold text-zinc-200 tabular-nums">{pomodoroCompletedSessions}</span>
            </div>
            <div>
              Заработано XP: <span className="font-semibold text-amber-300 tabular-nums">+{pomodoroCompletedSessions * 50} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. TAB 3: BRS & CALCULATORS (.nexus-surface, Only RUDN and HSE) ── */}
      {activeTab === 'brs' && (
        <div className="nexus-surface p-7 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-white">
                Калькуляторы оценивания: РУДН (БРС) & НИУ ВШЭ (10 баллов)
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Интерактивный расчет оценок в реальном времени · Данные автоматически сохраняются в облаке
              </p>
            </div>

            {/* Exactly 2 Clean Sub-tabs: RUDN and HSE */}
            <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-full">
              <button
                type="button"
                onClick={() => { setBrsActiveSubTab('rudn'); soundEffects.playClick(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border-0 ${
                  brsActiveSubTab === 'rudn'
                    ? 'bg-purple-500/30 text-purple-200 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                РУДН (100 баллов · Аня)
              </button>
              <button
                type="button"
                onClick={() => { setBrsActiveSubTab('hse'); soundEffects.playClick(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border-0 ${
                  brsActiveSubTab === 'hse'
                    ? 'bg-sky-500/30 text-sky-200 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                НИУ ВШЭ (10 баллов · Егор)
              </button>
            </div>
          </div>

          {/* 4.1. RUDN 100-Point BRS System (Anya) */}
          {brsActiveSubTab === 'rudn' && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-200 text-xs flex items-center justify-between">
                <span>📚 <b>Шкала ECTS РУДН</b>: 95–100 (A, 5+), 86–94 (B, 5), 69–85 (C, 4), 61–68 (D, 3+), 51–60 (E, 3)</span>
                <span className="tabular-nums font-medium">Макс: 60 + 20 + 20 = 100</span>
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
                      className="p-5 rounded-2xl bg-white/[0.025] space-y-4"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <InlineText
                            value={subj.subjectName}
                            onChange={(val) => updateRUDNSubjectName(subj.id, val)}
                            className="font-semibold text-sm text-zinc-100"
                          />
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            РУДН Онлайн · Управление продуктом
                          </p>
                        </div>
                        <span className={`tabular-nums text-xs px-2.5 py-0.5 rounded-full font-medium ${gradeColor}`}>
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
                              <input
                                type="number"
                                min={0}
                                max={60}
                                value={subj.currentControl}
                                onChange={(e) => updateRUDNSubjectScore(subj.id, 'currentControl', Math.min(60, Math.max(0, Number(e.target.value))))}
                                className="h-6 w-14 text-center tabular-nums text-xs bg-white/[0.06] rounded-full border-0 p-0 text-zinc-100 outline-none"
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
                              <input
                                type="number"
                                min={0}
                                max={20}
                                value={subj.milestoneControl}
                                onChange={(e) => updateRUDNSubjectScore(subj.id, 'milestoneControl', Math.min(20, Math.max(0, Number(e.target.value))))}
                                className="h-6 w-14 text-center tabular-nums text-xs bg-white/[0.06] rounded-full border-0 p-0 text-zinc-100 outline-none"
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
                              <input
                                type="number"
                                min={0}
                                max={20}
                                value={subj.finalExam}
                                onChange={(e) => updateRUDNSubjectScore(subj.id, 'finalExam', Math.min(20, Math.max(0, Number(e.target.value))))}
                                className="h-6 w-14 text-center tabular-nums text-xs bg-white/[0.06] rounded-full border-0 p-0 text-zinc-100 outline-none"
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

                      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, total)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4.2. HSE 10-Point Cumulative System (Egor) */}
          {brsActiveSubTab === 'hse' && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-200 text-xs flex items-center justify-between">
                <span>🎓 <b>Формула НИУ ВШЭ</b>: О_итог = Округление(Σ(О_компонент × Вес)). Оценка от 1 до 10 (8-10 Отлично, 6-7 Хорошо)</span>
                <span className="tabular-nums font-medium">Шкала: 10 баллов</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {hseCalculators.map((calc) => {
                  const totalScore = calc.components.reduce((acc, c) => acc + (c.score * c.weight), 0);
                  const roundedScore = Math.round(totalScore);
                  const isGoalAchieved = roundedScore >= calc.targetScore;

                  return (
                    <div
                      key={calc.id}
                      className="p-5 rounded-2xl bg-white/[0.025] space-y-4"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <InlineText
                            value={calc.courseName}
                            onChange={(val) => updateHSECourseName(calc.id, val)}
                            className="font-semibold text-sm text-zinc-100"
                          />
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Целевая оценка: {calc.targetScore} / 10 · {isGoalAchieved ? '🎯 Цель достигнута!' : 'В процессе'}
                          </p>
                        </div>
                        <span className={`tabular-nums text-xs px-2.5 py-0.5 rounded-full font-medium ${
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
                                <div className="flex items-center gap-1 text-[11px] text-zinc-400 tabular-nums">
                                  <span>вес:</span>
                                  <input
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="1"
                                    value={comp.weight}
                                    onChange={(e) => updateHSEComponentWeight(calc.id, comp.id, Number(e.target.value))}
                                    className="h-5 w-12 text-center tabular-nums text-[11px] bg-white/[0.06] rounded-full border-0 p-0 text-zinc-200 outline-none"
                                  />
                                </div>

                                {/* Editable Score (0 to 10) */}
                                <div className="flex items-center gap-1 text-zinc-200 tabular-nums font-medium">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="10"
                                    value={comp.score}
                                    onChange={(e) => updateHSEComponentScore(calc.id, comp.id, Number(e.target.value))}
                                    className="h-6 w-12 text-center tabular-nums text-xs bg-white/[0.06] rounded-full border-0 p-0 text-zinc-100 outline-none"
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

                      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, roundedScore * 10)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. RIGHT SHEET DRAWER (Full CRUD Card Editor, Zero Nested Borders) ── */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-[#0D101A]/95 backdrop-blur-3xl text-zinc-100 p-6 space-y-6 border-l border-white/[0.08] [scrollbar-width:thin]">
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
                className="bg-white/[0.04] text-zinc-100 text-xs border-0 rounded-full h-9 focus-visible:ring-1 focus-visible:ring-sky-500"
              />
            </div>

            {/* Course or Project */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Предмет / Проект</label>
              <Input
                value={editCourseOrProject}
                onChange={(e) => setEditCourseOrProject(e.target.value)}
                placeholder="Например: Распределенные системы, Управление продуктом, Nexus Web"
                className="bg-white/[0.04] text-zinc-100 text-xs border-0 rounded-full h-9 focus-visible:ring-1 focus-visible:ring-sky-500"
              />
            </div>

            {/* Column Direction Space */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Направление (колонка)</label>
              <Select value={editSpace} onValueChange={setEditSpace}>
                <SelectTrigger className="bg-white/[0.04] text-zinc-100 text-xs border-0 rounded-full h-9">
                  <SelectValue placeholder="Выберите направление" />
                </SelectTrigger>
                <SelectContent className="bg-[#0D101A] border-white/[0.08] text-zinc-100 text-xs rounded-2xl">
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
                  <SelectTrigger className="bg-white/[0.04] text-zinc-100 text-xs border-0 rounded-full h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0D101A] border-white/[0.08] text-zinc-100 text-xs rounded-2xl">
                    <SelectItem value="egor">Егор</SelectItem>
                    <SelectItem value="anya">Аня</SelectItem>
                    <SelectItem value="together">Вместе (Пара)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Приоритет</label>
                <Select value={editPriority} onValueChange={(val: any) => setEditPriority(val)}>
                  <SelectTrigger className="bg-white/[0.04] text-zinc-100 text-xs border-0 rounded-full h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0D101A] border-white/[0.08] text-zinc-100 text-xs rounded-2xl">
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
                  className="bg-white/[0.04] text-zinc-100 text-xs border-0 rounded-full h-9 focus-visible:ring-1 focus-visible:ring-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Таймзона / Координация</label>
                <Input
                  value={editTimezoneNote}
                  onChange={(e) => setEditTimezoneNote(e.target.value)}
                  placeholder="напр. +7ч ДФО / МСК"
                  className="bg-white/[0.04] text-zinc-100 text-xs border-0 rounded-full h-9 focus-visible:ring-1 focus-visible:ring-sky-500"
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
                <span className="text-[11px] text-zinc-400 tabular-nums">
                  {selectedItem?.subtasks?.filter((s) => s.completed).length || 0} / {selectedItem?.subtasks?.length || 0}
                </span>
              </div>

              {/* Subtasks List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {selectedItem?.subtasks?.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03]"
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
                      className="text-zinc-500 hover:text-red-400 p-0.5 border-0 bg-transparent cursor-pointer"
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
                  className="h-9 text-xs bg-white/[0.04] text-zinc-100 border-0 rounded-full"
                />
                <Button
                  size="sm"
                  onClick={handleAddSubtaskInDrawer}
                  className="h-9 px-3 text-xs bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 rounded-full"
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
                className="w-full p-3 rounded-2xl bg-white/[0.04] text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none leading-relaxed border-0"
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
                  className="bg-white/[0.04] text-zinc-100 text-xs border-0 rounded-full h-9 focus-visible:ring-1 focus-visible:ring-sky-500 flex-1"
                />
                {editLinkUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openExternalUrl(editLinkUrl)}
                    className="h-9 px-3 text-xs bg-white/[0.06] text-zinc-200 border-0 rounded-full"
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
              className="text-xs gap-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 border-0 rounded-full cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Удалить задачу</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSaveDrawer}
              className="text-xs bg-white text-zinc-950 hover:bg-zinc-100 font-semibold shadow-sm px-5 rounded-full cursor-pointer"
            >
              Сохранить изменения
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
