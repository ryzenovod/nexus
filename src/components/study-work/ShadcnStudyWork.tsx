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
  FolderPlus, 
  FileText, 
  Sparkles, 
  Search, 
  Filter,
  Zap,
  Globe2,
  AlertCircle
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNexusStore } from '@/store/useNexusStore';
import { StudyWorkItem, StudySpaceColumn, NexusTask } from '@/types/nexus';
import { soundEffects } from '@/utils/soundEffects';
import { YaProfiMapRadar } from './YaProfiMapRadar';
import confetti from 'canvas-confetti';

// 4 default permanent study & work direction columns
const DEFAULT_STUDY_SPACES: StudySpaceColumn[] = [
  {
    id: 'hse-egor',
    title: 'ВШЭ (Егор)',
    user: 'egor',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400',
    borderAccent: 'border-l-sky-500',
  },
  {
    id: 'rudn-anya',
    title: 'РУДН (Аня)',
    user: 'anya',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400',
    borderAccent: 'border-l-purple-500',
  },
  {
    id: 'yaprofi-dfo',
    title: 'Я-Профессионал',
    user: 'together',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400',
    borderAccent: 'border-l-amber-500',
  },
  {
    id: 'work-projects',
    title: 'Работа & Личные проекты',
    user: 'together',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400',
    borderAccent: 'border-l-emerald-500',
  },
];

// Color palette choices for new custom directions
const COLOR_OPTIONS = [
  { key: 'sky', label: 'Голубой (ВШЭ)', text: 'text-sky-400', bg: 'bg-sky-500/10 text-sky-400', border: 'border-l-sky-500' },
  { key: 'purple', label: 'Фиолетовый (РУДН)', text: 'text-purple-400', bg: 'bg-purple-500/10 text-purple-400', border: 'border-l-purple-500' },
  { key: 'amber', label: 'Янтарный (Я-Профи)', text: 'text-amber-400', bg: 'bg-amber-500/10 text-amber-400', border: 'border-l-amber-500' },
  { key: 'emerald', label: 'Изумрудный (Проекты)', text: 'text-emerald-400', bg: 'bg-emerald-500/10 text-emerald-400', border: 'border-l-emerald-500' },
  { key: 'rose', label: 'Розовый / Коралл', text: 'text-rose-400', bg: 'bg-rose-500/10 text-rose-400', border: 'border-l-rose-500' },
  { key: 'indigo', label: 'Индиго', text: 'text-indigo-400', bg: 'bg-indigo-500/10 text-indigo-400', border: 'border-l-indigo-500' },
  { key: 'cyan', label: 'Бирюзовый', text: 'text-cyan-400', bg: 'bg-cyan-500/10 text-cyan-400', border: 'border-l-cyan-500' },
];

export const ShadcnStudyWork: React.FC = () => {
  const {
    studyWorkItems,
    customStudySpaces,
    addStudyWorkItem,
    updateStudyWorkItem,
    updateStudyWorkStatus,
    deleteStudyWorkItem,
    toggleStudyWorkSubtask,
    addStudyWorkSubtask,
    deleteStudyWorkSubtask,
    addStudySpace,
    deleteStudySpace,
    tasks,
    toggleTaskCompletion,
    deleteTask,
    pomodoroMode,
    pomodoroTimeLeft,
    pomodoroIsRunning,
    pomodoroCompletedSessions,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    setPomodoroMode,
    rudnSubjects,
    updateRUDNSubjectScore,
    hseCalculators,
    updateHSEComponentScore,
  } = useNexusStore();

  const [activeTab, setActiveTab] = useState<'kanban' | 'pomodoro' | 'brs' | 'radar'>('kanban');
  const [selectedUserFilter, setSelectedUserFilter] = useState<'all' | 'egor' | 'anya'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Quick-Add in column header
  const [quickAddSpaceId, setQuickAddSpaceId] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  // Dialog for creating a new direction column
  const [isNewSpaceDialogOpen, setIsNewSpaceDialogOpen] = useState(false);
  const [newSpaceTitle, setNewSpaceTitle] = useState('');
  const [newSpaceUser, setNewSpaceUser] = useState<'egor' | 'anya' | 'together'>('together');
  const [newSpaceColorKey, setNewSpaceColorKey] = useState('sky');

  // Drawer Sheet for editing a card
  const [selectedItem, setSelectedItem] = useState<StudyWorkItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSpace, setEditSpace] = useState('');
  const [editUser, setEditUser] = useState<'egor' | 'anya' | 'together'>('together');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editDeadline, setEditDeadline] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editTimezoneNote, setEditTimezoneNote] = useState('');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // BRS calculator tab sub-view
  const [brsSystem, setBrsSystem] = useState<'rudn' | 'hse'>('rudn');

  // Combined space columns (4 default + custom user created)
  const allSpaces = useMemo(() => {
    return [...DEFAULT_STUDY_SPACES, ...(customStudySpaces || [])];
  }, [customStudySpaces]);

  // Pomodoro time formatting
  const minutes = Math.floor(pomodoroTimeLeft / 60);
  const seconds = pomodoroTimeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Match TickTick tasks to directions
  const getTickTickTasksForSpace = (spaceId: string): NexusTask[] => {
    return tasks.filter((t) => {
      if (t.isHub || t.parentId) return false;
      const titleLower = (t.title || '').toLowerCase();
      const catLower = (t.category || '').toLowerCase();
      const tags = (t.tags || []).map((x) => x.toLowerCase());

      if (spaceId === 'hse-egor') {
        return catLower === 'вшэ' || titleLower.includes('вшэ') || titleLower.includes('магистратур') || tags.includes('вшэ');
      }
      if (spaceId === 'rudn-anya') {
        return catLower === 'рудн' || titleLower.includes('рудн') || tags.includes('рудн') || tags.includes('учеба');
      }
      if (spaceId === 'yaprofi-dfo') {
        return catLower === 'я-профи' || titleLower.includes('я-профи') || titleLower.includes('дфо') || tags.includes('я-профи') || tags.includes('дфо');
      }
      if (spaceId === 'work-projects') {
        return (
          catLower === 'работа' || 
          catLower === 'проекты' || 
          titleLower.includes('работа') || 
          titleLower.includes('проект') || 
          titleLower.includes('openmap') || 
          tags.includes('работа') || 
          tags.includes('проекты')
        );
      }
      return false;
    });
  };

  // Quick Inline Add handler
  const handleQuickAdd = (spaceId: string) => {
    if (!quickAddTitle.trim()) {
      setQuickAddSpaceId(null);
      return;
    }

    const spaceObj = allSpaces.find((s) => s.id === spaceId);
    const assignedUser = spaceObj ? spaceObj.user : 'together';

    addStudyWorkItem({
      title: quickAddTitle.trim(),
      space: spaceId,
      user: assignedUser,
      status: 'in_progress',
      priority: 'medium',
      courseOrProject: spaceObj ? spaceObj.title : 'Учеба & Проекты',
      deadline: new Date().toISOString().split('T')[0],
      tags: [spaceId],
      subtasks: [],
      notes: '',
      linkUrl: '',
    });

    try {
      soundEffects.playClick();
    } catch {}

    setQuickAddTitle('');
    setQuickAddSpaceId(null);
  };

  // Open Drawer Sheet for card
  const handleOpenDrawer = (item: StudyWorkItem) => {
    setSelectedItem(item);
    setEditTitle(item.title);
    setEditSpace(item.space);
    setEditUser(item.user);
    setEditPriority(item.priority || 'medium');
    setEditDeadline(item.deadline || '');
    setEditNotes(item.notes || item.description || '');
    setEditLinkUrl(item.linkUrl || '');
    setEditTimezoneNote(item.timezoneNote || '');
    setNewSubtaskInput('');
    setIsDrawerOpen(true);
    try {
      soundEffects.playClick();
    } catch {}
  };

  // Save changes in Drawer Sheet
  const handleSaveDrawer = () => {
    if (!selectedItem) return;

    // If it's a TickTick task, toggle completion or update
    if (selectedItem.isTickTick && selectedItem.tickTickTaskId) {
      setIsDrawerOpen(false);
      return;
    }

    updateStudyWorkItem(selectedItem.id, {
      title: editTitle.trim() || selectedItem.title,
      space: editSpace,
      user: editUser,
      priority: editPriority,
      deadline: editDeadline,
      notes: editNotes,
      linkUrl: editLinkUrl,
      timezoneNote: editTimezoneNote,
    });

    try {
      soundEffects.playClick();
    } catch {}

    setIsDrawerOpen(false);
  };

  // Delete card from Drawer
  const handleDeleteItem = () => {
    if (!selectedItem) return;
    deleteStudyWorkItem(selectedItem.id);
    try {
      soundEffects.playClick();
    } catch {}
    setIsDrawerOpen(false);
  };

  // Add subtask inside Drawer
  const handleAddSubtaskInDrawer = () => {
    if (!selectedItem || !newSubtaskInput.trim()) return;
    addStudyWorkSubtask(selectedItem.id, newSubtaskInput.trim());
    setNewSubtaskInput('');
    try {
      soundEffects.playClick();
    } catch {}
  };

  // Toggle item status from card checkbox
  const handleToggleStatus = (item: StudyWorkItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isTickTick && item.tickTickTaskId) {
      toggleTaskCompletion(item.tickTickTaskId);
      try {
        soundEffects.playClick();
      } catch {}
      return;
    }

    const nextStatus = item.status === 'done' ? 'in_progress' : 'done';
    updateStudyWorkStatus(item.id, nextStatus);
  };

  // Delete item directly from card trash icon
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

  // Add new Custom Direction Column
  const handleCreateSpace = () => {
    if (!newSpaceTitle.trim()) return;

    const colorConfig = COLOR_OPTIONS.find((c) => c.key === newSpaceColorKey) || COLOR_OPTIONS[0];
    const newId = `custom-${Date.now()}`;

    addStudySpace({
      id: newId,
      title: newSpaceTitle.trim(),
      user: newSpaceUser,
      color: colorConfig.text,
      badgeBg: colorConfig.bg,
      borderAccent: colorConfig.border,
      isCustom: true,
    });

    try {
      soundEffects.playSuccess();
      confetti({ particleCount: 30, spread: 50 });
    } catch {}

    setNewSpaceTitle('');
    setIsNewSpaceDialogOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-[1700px] mx-auto w-full pb-12 animate-fade-in">
      {/* ── 1. TOP NAV & SUB-TABS (No duplicate timer bar here!) ── */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl text-card-foreground shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold leading-tight text-zinc-100">
                  Учеба, Магистратура & «Я-Профессионал»
                </h3>
                <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-400">
                  Живой воркспейс
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                НИУ ВШЭ (Егор), РУДН (Аня) и Федеральная координация ДФО ⇄ ЦФО
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Pulsing indicator if pomodoro is running in background */}
            {pomodoroIsRunning && activeTab !== 'pomodoro' && (
              <div 
                onClick={() => setActiveTab('pomodoro')}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-mono cursor-pointer hover:bg-amber-500/20 transition-colors"
                title="Перейти к таймеру фокуса"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Фокус {timeFormatted}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); pausePomodoro(); }} 
                  className="hover:text-white p-0.5"
                >
                  <Pause className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Tab: Kanban */}
            <button
              onClick={() => { setActiveTab('kanban'); soundEffects.playClick(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]'
              }`}
            >
              Канбан дел
            </button>

            {/* Tab: Pomodoro Timer */}
            <button
              onClick={() => { setActiveTab('pomodoro'); soundEffects.playClick(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pomodoro'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Фокус-таймер {pomodoroIsRunning ? `(${timeFormatted})` : ''}</span>
            </button>

            {/* Tab: BRS Calculator */}
            <button
              onClick={() => { setActiveTab('brs'); soundEffects.playClick(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'brs'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>БРС & Оценки</span>
            </button>

            {/* Tab: Ya-Profi Radar */}
            <button
              onClick={() => { setActiveTab('radar'); soundEffects.playClick(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]'
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-purple-400" />
              <span>ДФО Радар</span>
            </button>
          </div>
        </div>

        {/* Filters and Search toolbar (shown in Kanban) */}
        {activeTab === 'kanban' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по задачам и тегам..."
                  className="pl-8 h-8 text-xs bg-white/[0.03] text-zinc-200 placeholder:text-zinc-500 rounded-lg focus-visible:ring-1 focus-visible:ring-sky-500/50"
                />
              </div>

              {/* Assignee filter */}
              <div className="flex items-center bg-white/[0.03] rounded-lg p-0.5">
                <button
                  onClick={() => setSelectedUserFilter('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    selectedUserFilter === 'all'
                      ? 'bg-white/[0.1] text-zinc-100'
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewSpaceDialogOpen(true)}
                className="h-8 px-3 rounded-lg text-xs gap-1.5 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08] transition cursor-pointer flex items-center"
              >
                <FolderPlus className="h-3.5 w-3.5 text-sky-400" />
                <span>+ Новое направление</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. KANBAN BOARD WITH DYNAMIC COLUMNS ── */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allSpaces.map((col) => {
            // Get local studyWork items for this column
            const localItems = studyWorkItems.filter((it) => it.space === col.id);

            // Get TickTick items matching this space
            const tickTickTasks = getTickTickTasksForSpace(col.id);

            // Convert tickTickTasks into unified StudyWorkItem representation (excluding duplicates)
            const tickTickAsStudyItems: StudyWorkItem[] = tickTickTasks
              .filter((tt) => !localItems.some((loc) => loc.title.toLowerCase() === tt.title.toLowerCase()))
              .map((tt) => ({
                id: `tt-${tt.id}`,
                space: col.id,
                user: tt.assignee === 'egor' ? 'egor' : tt.assignee === 'anya' ? 'anya' : 'together',
                title: tt.title,
                description: tt.notes || '',
                courseOrProject: col.title,
                status: tt.completed ? 'done' : 'in_progress',
                priority: tt.bracketColor === 'critical' ? 'high' : 'medium',
                deadline: tt.date !== 'inbox' ? tt.date : '',
                tags: tt.tags || [],
                notes: tt.notes,
                linkUrl: tt.link,
                subtasks: (tt.subtasks || []).map((s) => ({ id: s.id, title: s.title, completed: s.completed })),
                isTickTick: true,
                tickTickTaskId: tt.id,
              }));

            // Merge and apply search/assignee filters
            const combinedItems = [...localItems, ...tickTickAsStudyItems].filter((item) => {
              if (selectedUserFilter !== 'all') {
                if (item.user !== selectedUserFilter && item.user !== 'together') return false;
              }
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = item.title.toLowerCase().includes(q);
                const matchNotes = (item.notes || '').toLowerCase().includes(q);
                const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
                if (!matchTitle && !matchNotes && !matchTags) return false;
              }
              return true;
            });

            const completedCount = combinedItems.filter((i) => i.status === 'done').length;
            const isAdding = quickAddSpaceId === col.id;

            return (
              <div
                key={col.id}
                className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl shadow-sm p-4 flex flex-col space-y-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`p-1.5 rounded-md ${col.badgeBg} shrink-0`}>
                      {col.id === 'hse-egor' && <GraduationCap className="h-4 w-4" />}
                      {col.id === 'rudn-anya' && <BookOpen className="h-4 w-4" />}
                      {col.id === 'yaprofi-dfo' && <Radio className="h-4 w-4" />}
                      {col.id === 'work-projects' && <Briefcase className="h-4 w-4" />}
                      {col.isCustom && <Sparkles className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-100 truncate leading-tight">
                        {col.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 capitalize">
                        {col.user === 'egor' ? 'Егор' : col.user === 'anya' ? 'Аня' : 'Вместе'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-300">
                      {completedCount}/{combinedItems.length}
                    </span>

                    {/* Inline Quick Add Button */}
                    <button
                      onClick={() => {
                        setQuickAddSpaceId(isAdding ? null : col.id);
                        setQuickAddTitle('');
                        soundEffects.playClick();
                      }}
                      className="h-7 w-7 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Быстро добавить задачу"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete custom column if custom */}
                    {col.isCustom && (
                      <button
                        onClick={() => deleteStudySpace(col.id)}
                        className="h-7 w-7 rounded-md bg-white/[0.05] hover:bg-red-500/20 text-zinc-400 hover:text-red-300 flex items-center justify-center transition-colors cursor-pointer"
                        title="Удалить направление"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Quick Add Input Box */}
                {isAdding && (
                  <div className="p-2 rounded-lg bg-zinc-900/90 space-y-2 animate-fade-in">
                    <Input
                      autoFocus
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickAdd(col.id);
                        if (e.key === 'Escape') setQuickAddSpaceId(null);
                      }}
                      placeholder="Название дела... (Enter)"
                      className="h-8 text-xs bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-500 rounded focus-visible:ring-1 focus-visible:ring-sky-500"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setQuickAddSpaceId(null)}
                        className="h-6 px-2 text-[11px] text-zinc-400 hover:text-white"
                      >
                        Отмена
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleQuickAdd(col.id)}
                        className="h-6 px-2.5 text-[11px] bg-zinc-100 text-zinc-950 hover:bg-white font-medium"
                      >
                        Добавить
                      </Button>
                    </div>
                  </div>
                )}

                {/* Cards List */}
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[620px] pr-0.5 [scrollbar-width:thin]">
                  {combinedItems.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                      Нет активных дел
                    </div>
                  ) : (
                    combinedItems.map((it) => {
                      const isDone = it.status === 'done';
                      const subtasksTotal = it.subtasks?.length || 0;
                      const subtasksDone = it.subtasks?.filter((s) => s.completed).length || 0;

                      // 3px bracket indicator color
                      const bracketBorder = it.priority === 'high'
                        ? 'border-l-red-500'
                        : it.priority === 'medium'
                        ? 'border-l-amber-500'
                        : 'border-l-emerald-500';

                      return (
                        <div
                          key={it.id}
                          onClick={() => handleOpenDrawer(it)}
                          className={`group relative p-3 rounded-lg border-l-[3px] ${bracketBorder} transition-all cursor-pointer select-none space-y-2 ${
                            isDone
                              ? 'bg-zinc-900/30 opacity-55'
                              : 'bg-zinc-900/70 hover:bg-zinc-900/95 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Checkbox: toggles status */}
                            <div 
                              onClick={(e) => handleToggleStatus(it, e)} 
                              className="pt-0.5"
                            >
                              <Checkbox
                                checked={isDone}
                                className="h-4 w-4 rounded data-[state=checked]:bg-zinc-100 data-[state=checked]:text-zinc-950"
                              />
                            </div>

                            {/* Title & Deadline */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1.5">
                                <span
                                  className={`text-xs font-medium leading-snug break-words ${
                                    isDone ? 'line-through text-zinc-400' : 'text-zinc-100'
                                  }`}
                                >
                                  {it.title}
                                </span>

                                <div className="flex items-center gap-1 shrink-0">
                                  {it.deadline && (
                                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-zinc-400" />
                                      {it.deadline.replace('2026-', '')}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteDirect(it, e)}
                                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Удалить задачу"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Description / Notes snippet */}
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
                                  <CheckSquare className="h-3 w-3 text-emerald-400" />
                                  <span>{subtasksDone}/{subtasksTotal}</span>
                                </span>
                              )}

                              {/* External link indicator */}
                              {it.linkUrl && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-zinc-400">
                                  <ExternalLink className="h-2.5 w-2.5" />
                                  <span>Линк</span>
                                </span>
                              )}

                              {/* DFO timezone badge */}
                              {it.timezoneNote && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px] text-amber-300">
                                  <Globe2 className="h-2.5 w-2.5" />
                                  <span>+7ч ДФО</span>
                                </span>
                              )}

                              {/* TickTick integration badge */}
                              {it.isTickTick && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-[10px] text-sky-400 font-medium">
                                  <Zap className="h-2.5 w-2.5" />
                                  <span>TickTick</span>
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                              {it.user === 'egor' ? 'Егор' : it.user === 'anya' ? 'Аня' : 'Пара'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Explicit "+ Добавить задачу" button at bottom of column */}
                  {!isAdding && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuickAddSpaceId(col.id);
                        setQuickAddTitle('');
                        soundEffects.playClick();
                      }}
                      className="w-full py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] text-xs text-zinc-400 hover:text-zinc-200 transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
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

      {/* ── 3. POMODORO FOCUS VIEW (Dedicated Full Screen) ── */}
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
              Короткий перерыв (5 мин)
            </button>
            <button
              onClick={() => { setPomodoroMode('longBreak'); soundEffects.playClick(); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pomodoroMode === 'longBreak'
                  ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Длинный перерыв (15 мин)
            </button>
          </div>

          {/* Big Digital Clock */}
          <div className="text-8xl font-bold font-mono tracking-widest text-zinc-100 py-4 tabular-nums select-none">
            {timeFormatted}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={() => {
                if (pomodoroIsRunning) {
                  pausePomodoro();
                } else {
                  startPomodoro();
                  soundEffects.playSuccess();
                }
              }}
              className="h-12 px-8 font-semibold text-sm bg-zinc-100 text-zinc-950 hover:bg-white shadow-sm gap-2"
            >
              {pomodoroIsRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{pomodoroIsRunning ? 'Пауза' : 'Запустить фокус'}</span>
            </Button>

            <button
              type="button"
              onClick={() => { resetPomodoro(); soundEffects.playClick(); }}
              className="h-12 px-5 rounded-md bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] transition flex items-center justify-center cursor-pointer"
              title="Сбросить время"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 pt-4 text-xs text-zinc-400">
            <div>
              Завершено сессий сегодня:{' '}
              <span className="font-semibold text-zinc-200 font-mono">
                {pomodoroCompletedSessions}
              </span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div>
              Заработано XP:{' '}
              <span className="font-semibold text-amber-400 font-mono">
                +{pomodoroCompletedSessions * 50} XP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. BRS CALCULATOR VIEW ── */}
      {activeTab === 'brs' && (
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl text-card-foreground shadow-sm p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Балльно-рейтинговая система (БРС) РУДН & ВШЭ
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Интерактивный расчет накопленной и результирующей оценки по учебным планам
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBrsSystem('rudn')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  brsSystem === 'rudn'
                    ? 'bg-purple-500/20 text-purple-300 font-semibold'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                РУДН (100 баллов · Аня)
              </button>
              <button
                onClick={() => setBrsSystem('hse')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  brsSystem === 'hse'
                    ? 'bg-sky-500/20 text-sky-300 font-semibold'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                НИУ ВШЭ (10 баллов · Егор)
              </button>
            </div>
          </div>

          {/* RUDN Calculator Grid */}
          {brsSystem === 'rudn' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rudnSubjects.map((subj) => {
                const total = subj.currentControl + subj.milestoneControl + subj.finalExam;
                const gradeLabel =
                  total >= 86
                    ? 'Отлично (A)'
                    : total >= 69
                    ? 'Хорошо (B/C)'
                    : total >= 51
                    ? 'Удовлетворительно (D/E)'
                    : 'Не зачтено (F)';
                const gradeColor =
                  total >= 86
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : total >= 69
                    ? 'text-sky-400 bg-sky-500/10'
                    : total >= 51
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-red-400 bg-red-500/10';

                return (
                  <div
                    key={subj.id}
                    className="p-4 rounded-xl bg-zinc-900/60 backdrop-blur-xl space-y-4"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-zinc-100">
                          {subj.subjectName}
                        </h4>
                        <span className="text-[11px] text-zinc-400">
                          РУДН Онлайн · Модульная система БРС
                        </span>
                      </div>
                      <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-medium ${gradeColor}`}>
                        {total} / 100 · {gradeLabel}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Текущий контроль (лекции/семинары, макс. 60)</span>
                          <span className="font-mono text-zinc-200">{subj.currentControl}</span>
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

                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Рубежный контроль (тесты, макс. 20)</span>
                          <span className="font-mono text-zinc-200">{subj.milestoneControl}</span>
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

                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Экзамен / зачет (макс. 20)</span>
                          <span className="font-mono text-zinc-200">{subj.finalExam}</span>
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
          )}

          {/* HSE Calculator Grid */}
          {brsSystem === 'hse' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {hseCalculators.map((calc) => {
                const totalScore = calc.components.reduce((acc, c) => acc + (c.score * c.weight), 0);
                const roundedScore = Math.round(totalScore);

                return (
                  <div
                    key={calc.id}
                    className="p-4 rounded-xl bg-zinc-900/60 backdrop-blur-xl space-y-4"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-zinc-100">
                          {calc.courseName}
                        </h4>
                        <span className="text-[11px] text-zinc-400">
                          Формула ВШЭ · Целевой балл: {calc.targetScore} / 10
                        </span>
                      </div>
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full font-medium text-sky-400 bg-sky-500/10">
                        Итог: {roundedScore} / 10 ({totalScore.toFixed(2)})
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {calc.components.map((comp) => (
                        <div key={comp.id}>
                          <div className="flex justify-between text-zinc-400 mb-1">
                            <span>{comp.name} (вес {Math.round(comp.weight * 100)}%)</span>
                            <span className="font-mono text-zinc-200">{comp.score} / 10</span>
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
          )}
        </div>
      )}

      {/* ── 5. YA-PROFI RADAR VIEW ── */}
      {activeTab === 'radar' && (
        <div className="animate-fade-in">
          <YaProfiMapRadar />
        </div>
      )}

      {/* ── 6. RIGHT SHEET DRAWER (Full CRUD Card Editor) ── */}
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
              Редактирование задачи
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-400">
              Направление, дедлайн, чек-лист подзадач, ссылки и заметки
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
                placeholder="Что нужно сделать?"
                className="bg-white/[0.04] text-zinc-100 text-xs focus-visible:ring-1 focus-visible:ring-sky-500"
              />
            </div>

            {/* Space / Direction Column */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Направление (колонка)</label>
              <Select value={editSpace} onValueChange={setEditSpace}>
                <SelectTrigger className="bg-white/[0.04] text-zinc-100 text-xs">
                  <SelectValue placeholder="Выберите направление" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-none text-zinc-100 text-xs">
                  {allSpaces.map((s) => (
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
                  <SelectTrigger className="bg-white/[0.04] text-zinc-100 text-xs">
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
                  <SelectTrigger className="bg-white/[0.04] text-zinc-100 text-xs">
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

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Дата дедлайна</label>
              <Input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="bg-white/[0.04] text-zinc-100 text-xs focus-visible:ring-1 focus-visible:ring-sky-500"
              />
            </div>

            {/* Subtasks / Checklist */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Чек-лист подзадач</span>
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
                      onClick={() => selectedItem && deleteStudyWorkSubtask(selectedItem.id, sub.id)}
                      className="text-zinc-500 hover:text-red-400 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <div className="flex items-center gap-1.5">
                <Input
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtaskInDrawer();
                  }}
                  placeholder="Добавить пункт чек-листа... (Enter)"
                  className="h-8 text-xs bg-white/[0.04] text-zinc-100"
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

            {/* Notes & Context */}
            <div className="space-y-1.5 pt-2">
              <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                <span>Заметки и тезисы</span>
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Контекст, требования, детали сдачи..."
                className="w-full p-2.5 rounded-lg bg-white/[0.04] text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none leading-relaxed"
              />
            </div>

            {/* Link URL */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                <span>Ссылка (портал, таблица, Zoom)</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  value={editLinkUrl}
                  onChange={(e) => setEditLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/[0.04] text-zinc-100 text-xs focus-visible:ring-1 focus-visible:ring-sky-500 flex-1"
                />
                {editLinkUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(editLinkUrl, '_blank')}
                    className="h-8 px-2.5 text-xs bg-white/[0.04] text-zinc-200"
                  >
                    Открыть
                  </Button>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="flex items-center justify-between pt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteItem}
              className="text-xs gap-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Удалить задачу</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSaveDrawer}
              className="text-xs bg-zinc-100 text-zinc-950 hover:bg-white font-medium shadow-sm px-5"
            >
              Сохранить
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── 7. DIALOG: NEW DIRECTION COLUMN ── */}
      <Dialog open={isNewSpaceDialogOpen} onOpenChange={setIsNewSpaceDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950/95 backdrop-blur-3xl text-zinc-100 p-6 space-y-5">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-base font-semibold text-zinc-100">
              Создать новое направление
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Добавьте новую колонку в Канбан для курса, стартапа или личного проекта
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Название направления</label>
              <Input
                autoFocus
                value={newSpaceTitle}
                onChange={(e) => setNewSpaceTitle(e.target.value)}
                placeholder="Например: ВКР Диплом, Курс по ИИ, Стартап"
                className="bg-white/[0.04] text-zinc-100 text-xs focus-visible:ring-1 focus-visible:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Ответственный</label>
              <Select value={newSpaceUser} onValueChange={(val: any) => setNewSpaceUser(val)}>
                <SelectTrigger className="bg-white/[0.04] text-zinc-100 text-xs">
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
              <label className="text-zinc-300 font-medium">Цветовая тема бейджа</label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setNewSpaceColorKey(c.key)}
                    className={`p-2 rounded-lg text-left text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                      newSpaceColorKey === c.key
                        ? 'bg-white/[0.12] text-white font-semibold'
                        : 'bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${c.text.replace('text-', 'bg-')}`} />
                    <span className="text-zinc-300 truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNewSpaceDialogOpen(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Отмена
            </Button>
            <Button
              size="sm"
              onClick={handleCreateSpace}
              className="text-xs bg-zinc-100 text-zinc-950 hover:bg-white font-medium shadow-sm px-4"
            >
              Создать направление
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShadcnStudyWork;
