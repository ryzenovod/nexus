import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Briefcase, 
  Rocket, 
  Calendar, 
  Plus, 
  Timer,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
  CloudRain,
  Flame,
  Sparkles,
  Globe,
  Radio,
  BookOpen
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { StudySpace, StudyWorkItem } from '../../types/nexus';
import { CyberCatMascot } from '../visual/CyberCatMascot';
import { YaProfiMapRadar } from './YaProfiMapRadar';
import { AcademicTracker } from './AcademicTracker';

export type StudyWorkSubTab = 'kanban' | 'radar' | 'academic' | 'focus';

export const StudyWorkModule: React.FC = () => {
  const {
    studyWorkItems,
    activeStudySpace,
    setActiveStudySpace,
    addStudyWorkItem,
    updateStudyWorkStatus,
    deleteStudyWorkItem,
    pomodoroMode,
    pomodoroTimeLeft,
    pomodoroIsRunning,
    pomodoroUser,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    setPomodoroMode,
    setPomodoroUser,
    soundAmbiance,
    setSoundAmbiance,
    gamification,
    equipCosmetic,
  } = useNexusStore();

  const [activeSubTab, setActiveSubTab] = useState<StudyWorkSubTab>('kanban');
  const [selectedSpaceFilter, setSelectedSpaceFilter] = useState<'all' | StudySpace>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newTzNote, setNewTzNote] = useState('');

  const spaces: { 
    id: StudySpace; 
    label: string; 
    shortLabel: string;
    user: 'egor' | 'anya' | 'together'; 
  }[] = [
    {
      id: 'yaprofi-dfo',
      label: 'Я-Профи: Федеральный Лидер ДФО (Аня)',
      shortLabel: 'Я-Профи ДФО',
      user: 'anya',
    },
    {
      id: 'yaprofi-cfo',
      label: 'Я-Профи: Региональный Лидер ЦФО (Аня)',
      shortLabel: 'Я-Профи ЦФО',
      user: 'anya',
    },
    {
      id: 'rudn-anya',
      label: 'РУДН Онлайн: Психология (Аня)',
      shortLabel: 'РУДН Онлайн',
      user: 'anya',
    },
    {
      id: 'hse-egor',
      label: 'ВШЭ: Магистратура (Егор)',
      shortLabel: 'ВШЭ',
      user: 'egor',
    },
    {
      id: 'work-egor',
      label: 'Работа: OpenMap & Core (Егор)',
      shortLabel: 'Работа',
      user: 'egor',
    },
    {
      id: 'projects-anya',
      label: 'Проекты & Дизайн (Аня)',
      shortLabel: 'Проекты',
      user: 'anya',
    },
  ];

  const filteredItems = studyWorkItems.filter((item) => {
    if (selectedSpaceFilter === 'all') return true;
    return item.space === selectedSpaceFilter;
  });

  const columns: { id: StudyWorkItem['status']; title: string }[] = [
    { id: 'backlog', title: 'Бэклог' },
    { id: 'in_progress', title: 'В работе' },
    { id: 'review', title: 'На проверке' },
    { id: 'done', title: 'Сдано' },
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetSpace = selectedSpaceFilter === 'all' ? 'hse-egor' : selectedSpaceFilter;
    const spaceConfig = spaces.find((s) => s.id === targetSpace) || spaces[0];

    addStudyWorkItem({
      space: targetSpace,
      user: spaceConfig.user,
      title: newTitle.trim(),
      description: newDescription.trim() || '',
      courseOrProject: newCourse.trim() || 'Общее',
      status: 'backlog',
      priority: newPriority,
      deadline: newDeadline || '2026-11-15',
      timezoneNote: newTzNote.trim() || undefined,
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setNewTitle('');
    setNewDescription('');
    setNewCourse('');
    setNewDeadline('');
    setNewTags('');
    setNewTzNote('');
    setShowAddModal(false);
  };

  const minutes = Math.floor(pomodoroTimeLeft / 60);
  const seconds = pomodoroTimeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* 1. SINGLE CLEAN HEADER ROW: TITLE + VIEW SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-zinc-400" />
          <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
            Учеба и Проекты
          </h2>
        </div>

        {/* View Switcher: Single clean row */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.03] rounded-md p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('kanban')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeSubTab === 'kanban'
                  ? 'bg-white/[0.08] text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Канбан
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('radar')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeSubTab === 'radar'
                  ? 'bg-white/[0.08] text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Радар ЦФО ⇄ ДФО
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('academic')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeSubTab === 'academic'
                  ? 'bg-white/[0.08] text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Расписание & БРС
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('focus')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeSubTab === 'focus'
                  ? 'bg-white/[0.08] text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Фокус-таймер
            </button>
          </div>

          {activeSubTab === 'kanban' && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 rounded bg-zinc-100 hover:bg-white px-2.5 py-1 text-xs font-medium text-zinc-950 transition-colors shadow-sm"
            >
              <Plus className="h-3 w-3 stroke-[2.5]" />
              <span>Задача</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Selected View */}
      {activeSubTab === 'radar' && <YaProfiMapRadar />}
      {activeSubTab === 'academic' && <AcademicTracker />}

      {/* FOCUS ROOM */}
      {activeSubTab === 'focus' && (
        <div className="rounded-xl border border-white/[0.07] bg-[rgba(18,18,21,0.75)] backdrop-blur-[24px] p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <span className="font-mono text-xs font-semibold tracking-wider text-zinc-200 uppercase">
                PLAY. FOCUS. WIN. REPEAT.
              </span>
              <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
                one more level. one step closer.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
              <span>Сессия фокуса</span>
              <span>·</span>
              <span>Личный рекорд</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Mascot */}
            <div className="flex flex-col items-center justify-center text-center p-4">
              <CyberCatMascot
                gamification={gamification}
                onEquipCosmetic={equipCosmetic}
              />
              <div className="mt-3 font-mono text-[11px] tracking-wider text-zinc-400 font-medium">
                FOCUS &gt;&gt; WIN
              </div>
            </div>

            {/* Pomodoro Center */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center rounded-md bg-white/[0.03] p-0.5 text-xs">
                {(['together', 'egor', 'anya'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setPomodoroUser(u)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      pomodoroUser === u ? 'bg-white/[0.1] text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {u === 'together' ? 'Вместе' : u === 'egor' ? 'Егор' : 'Аня'}
                  </button>
                ))}
              </div>

              <div>
                <span className="font-mono text-5xl font-bold tracking-tight text-zinc-100 tabular-nums">
                  {formattedTime}
                </span>
                <span className="block font-mono text-xs text-zinc-500 mt-1">
                  {pomodoroMode === 'work' ? 'Сессия концентрации (25 мин)' : 'Отдых (5 мин)'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={pomodoroIsRunning ? pausePomodoro : startPomodoro}
                  className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
                    pomodoroIsRunning
                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-zinc-100 text-zinc-950 hover:bg-white'
                  }`}
                >
                  {pomodoroIsRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{pomodoroIsRunning ? 'Пауза' : 'Старт'}</span>
                </button>

                <button
                  type="button"
                  onClick={resetPomodoro}
                  className="rounded-md p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
                  title="Сброс таймера"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setPomodoroMode(pomodoroMode === 'work' ? 'shortBreak' : 'work')}
                  className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 transition-colors"
                >
                  {pomodoroMode === 'work' ? 'Отдых 5м' : 'Работа 25м'}
                </button>
              </div>
            </div>

            {/* Ambiance Controls */}
            <div className="space-y-3">
              <span className="text-xs font-medium text-zinc-300 block">
                Звуки уюта (Web Audio)
              </span>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'rain', label: 'Дождь', icon: CloudRain },
                  { id: 'fireplace', label: 'Камин', icon: Flame },
                  { id: 'chimes', label: 'Звон', icon: Sparkles },
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = soundAmbiance === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSoundAmbiance(isActive ? 'off' : (s.id as any))}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs transition-colors ${
                        isActive
                          ? 'bg-white/[0.1] text-zinc-100'
                          : 'bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-[11px]">{s.label}</span>
                    </button>
                  );
                })}
              </div>

              {soundAmbiance !== 'off' && (
                <button
                  type="button"
                  onClick={() => setSoundAmbiance('off')}
                  className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                >
                  <VolumeX className="h-3.5 w-3.5" />
                  <span>Выключить звук</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KANBAN BOARD */}
      {activeSubTab === 'kanban' && (
        <div className="space-y-4">
          {/* Light Text Tabs with thin bottom line for Project/Space filter */}
          <div className="flex items-center gap-4 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedSpaceFilter('all')}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedSpaceFilter === 'all'
                  ? 'border-zinc-100 text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Все проекты ({studyWorkItems.length})
            </button>

            {spaces.map((space) => {
              const count = studyWorkItems.filter((i) => i.space === space.id).length;
              const isActive = selectedSpaceFilter === space.id;

              return (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => setSelectedSpaceFilter(space.id)}
                  className={`pb-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'border-zinc-100 text-zinc-100'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>{space.shortLabel}</span>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 4 Clean Kanban Columns (SEAMLESS 1PX HAIRLINE BENTO GRID) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-white/[0.06] border border-white/[0.07] rounded-xl overflow-hidden shadow-sm">
            {columns.map((column) => {
              const columnTasks = filteredItems.filter((i) => i.status === column.id);

              return (
                <div
                  key={column.id}
                  className="bg-[#0b0b0e] p-3.5 flex flex-col min-h-[460px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.05]">
                    <span className="text-xs font-semibold text-zinc-200">
                      {column.title}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
                    {columnTasks.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className="rounded-lg border border-white/[0.07] bg-[rgba(24,24,28,0.7)] hover:bg-[rgba(32,32,38,0.9)] p-3 space-y-2 transition-colors"
                      >
                        {/* Top line: project & priority */}
                        <div className="flex items-center justify-between gap-1 text-[11px]">
                          <span className="text-zinc-400 font-medium truncate">
                            {item.courseOrProject}
                          </span>

                          {item.priority === 'high' && (
                            <span className="flex items-center gap-1 font-mono text-[10px] text-red-400 font-semibold shrink-0">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              HIGH
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-[12.5px] font-medium text-zinc-100 leading-snug break-words">
                          {item.title}
                        </h4>

                        {item.description && (
                          <p className="text-xs text-zinc-400/80 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {item.timezoneNote && (
                          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 pt-1">
                            <Globe className="h-3 w-3 text-zinc-500" />
                            <span>{item.timezoneNote}</span>
                          </div>
                        )}

                        {/* Footer: deadline & status mover */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-[11px] text-zinc-500">
                          <span className="font-mono">{item.deadline}</span>

                          <div className="flex items-center gap-1">
                            {column.id !== 'backlog' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const prev = column.id === 'done' ? 'review' : column.id === 'review' ? 'in_progress' : 'backlog';
                                  updateStudyWorkStatus(item.id, prev);
                                }}
                                className="hover:text-zinc-200 px-1"
                                title="Назад"
                              >
                                ←
                              </button>
                            )}

                            {column.id !== 'done' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = column.id === 'backlog' ? 'in_progress' : column.id === 'in_progress' ? 'review' : 'done';
                                  updateStudyWorkStatus(item.id, next);
                                }}
                                className="hover:text-zinc-200 px-1 font-medium"
                                title="Вперед"
                              >
                                →
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteStudyWorkItem(item.id)}
                              className="hover:text-red-400 ml-1"
                              title="Удалить"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="py-8 text-center text-xs text-zinc-600 select-none">
                        Пусто
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-100 mb-3">
              Новая задача по учебе / проектам
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Название</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="НИР: тестирование или Отчет по практике"
                  className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Предмет / Проект</label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="ВШЭ: НИР или Я-Профи"
                  className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Дедлайн</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Приоритет</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                  >
                    <option value="low">Обычный</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Часовой пояс / Заметка</label>
                <input
                  type="text"
                  value={newTzNote}
                  onChange={(e) => setNewTzNote(e.target.value)}
                  placeholder="Владивосток: сдача до 17:00 (МСК 10:00)"
                  className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Описание</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Детали задания..."
                  className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md bg-white text-zinc-950 text-xs font-medium hover:bg-zinc-200"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
