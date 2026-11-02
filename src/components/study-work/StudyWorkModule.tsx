import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Briefcase, 
  Rocket, 
  Calendar, 
  Plus, 
  ChevronRight, 
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
import { DualTimeClock } from '../visual/DualTimeClock';
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
    icon: typeof GraduationCap; 
    badge?: string;
  }[] = [
    {
      id: 'yaprofi-dfo',
      label: '🏆 Я-Профи: Федеральный Лидер ДФО (Аня)',
      shortLabel: 'Я-Профи ДФО',
      user: 'anya',
      icon: Trophy,
      badge: 'ДФО +7ч',
    },
    {
      id: 'yaprofi-cfo',
      label: '🏆 Я-Профи: Региональный Лидер ЦФО (Аня)',
      shortLabel: 'Я-Профи ЦФО',
      user: 'anya',
      icon: Trophy,
      badge: 'Москва / ЦФО',
    },
    {
      id: 'rudn-anya',
      label: '🎓 РУДН Онлайн: Психология (Аня)',
      shortLabel: 'РУДН Онлайн',
      user: 'anya',
      icon: GraduationCap,
    },
    {
      id: 'hse-egor',
      label: '🎓 ВШЭ: Магистратура (Егор)',
      shortLabel: 'ВШЭ Магистратура',
      user: 'egor',
      icon: GraduationCap,
    },
    {
      id: 'work-egor',
      label: '💼 Работа: OpenMap & Core (Егор)',
      shortLabel: 'Работа OpenMap',
      user: 'egor',
      icon: Briefcase,
    },
    {
      id: 'projects-anya',
      label: '🚀 Проекты & Дизайн (Аня)',
      shortLabel: 'Дизайн / NEXUS',
      user: 'anya',
      icon: Rocket,
    },
  ];

  const currentSpaceConfig = spaces.find((s) => s.id === activeStudySpace) || spaces[0];

  const filteredItems = studyWorkItems.filter(
    (item) => item.space === activeStudySpace
  );

  const columns: { id: StudyWorkItem['status']; title: string }[] = [
    { id: 'backlog', title: 'Бэклог' },
    { id: 'in_progress', title: 'В работе' },
    { id: 'review', title: 'На проверке' },
    { id: 'done', title: 'Сдано' },
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addStudyWorkItem({
      space: activeStudySpace,
      user: currentSpaceConfig.user,
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
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('kanban')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              activeSubTab === 'kanban'
                ? 'bg-white/[0.08] text-zinc-100 border-white/[0.12]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Канбан (ВШЭ / РУДН / Я-Профи)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('radar')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              activeSubTab === 'radar'
                ? 'bg-white/[0.08] text-zinc-100 border-white/[0.12]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-amber-400" />
            <span>Радар ЦФО ⇄ ДФО 📡</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('academic')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              activeSubTab === 'academic'
                ? 'bg-white/[0.08] text-zinc-100 border-white/[0.12]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Расписание & БРС 🎓</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('focus')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              activeSubTab === 'focus'
                ? 'bg-white/[0.08] text-zinc-100 border-white/[0.12]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Timer className="h-3.5 w-3.5" />
            <span>Focus Room ⏱</span>
          </button>
        </div>

        {activeSubTab === 'kanban' && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 rounded bg-zinc-100 hover:bg-white px-2.5 py-1 text-xs font-medium text-zinc-950 transition-colors"
          >
            <Plus className="h-3 w-3 stroke-[2.5]" />
            <span>Задача</span>
          </button>
        )}
      </div>

      {/* Render Selected Sub-View */}
      {activeSubTab === 'radar' && <YaProfiMapRadar />}
      {activeSubTab === 'academic' && <AcademicTracker />}

      {activeSubTab === 'focus' && (
        <div className="rounded-lg border border-white/[0.07] bg-zinc-900/70 backdrop-blur-[20px] p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  PLAY. FOCUS. WIN. REPEAT.
                </span>
              </div>
              <p className="font-mono text-[11px] text-zinc-500">
                one more level. one step closer.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-zinc-400 border border-white/[0.08] rounded px-2 py-0.5 bg-zinc-950/60">
                don't stop now ♡
              </span>
              <span className="font-mono text-[10px] text-zinc-400 border border-white/[0.08] rounded px-2 py-0.5 bg-zinc-950/60">
                you got this! ♡
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Mascot */}
            <div className="flex flex-col items-center justify-center text-center p-3 rounded border border-white/[0.06] bg-zinc-950/50">
              <CyberCatMascot
                gamification={gamification}
                onEquipCosmetic={equipCosmetic}
              />
              <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                FOCUS &gt;&gt; WIN
              </div>
            </div>

            {/* Pomodoro Center */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center rounded border border-white/[0.08] bg-zinc-950/60 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPomodoroUser('together')}
                  className={`rounded px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    pomodoroUser === 'together' ? 'bg-white/[0.12] text-zinc-100' : 'text-zinc-400'
                  }`}
                >
                  Вместе
                </button>
                <button
                  type="button"
                  onClick={() => setPomodoroUser('egor')}
                  className={`rounded px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    pomodoroUser === 'egor' ? 'bg-white/[0.12] text-zinc-100' : 'text-zinc-400'
                  }`}
                >
                  Егор
                </button>
                <button
                  type="button"
                  onClick={() => setPomodoroUser('anya')}
                  className={`rounded px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    pomodoroUser === 'anya' ? 'bg-white/[0.12] text-zinc-100' : 'text-zinc-400'
                  }`}
                >
                  Аня
                </button>
              </div>

              <div>
                <span className="font-mono text-5xl font-semibold tracking-tight text-zinc-100">
                  {formattedTime}
                </span>
                <p className="text-xs text-zinc-500 mt-1">
                  {pomodoroMode === 'work' ? 'Сессия непрерывного фокуса (+50 XP)' : 'Перерыв ☕️'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={pomodoroIsRunning ? pausePomodoro : startPomodoro}
                  className="flex items-center gap-1 rounded bg-zinc-100 hover:bg-white px-4 py-1 text-xs font-medium text-zinc-950 transition-colors"
                >
                  {pomodoroIsRunning ? (
                    <>
                      <Pause className="h-3 w-3 fill-current" />
                      <span>Пауза</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-current" />
                      <span>Фокус</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetPomodoro}
                  className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.08] bg-zinc-950/60 text-zinc-400 hover:text-zinc-200"
                  title="Сбросить таймер"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setPomodoroMode(pomodoroMode === 'work' ? 'shortBreak' : 'work')}
                  className="rounded border border-white/[0.08] bg-zinc-950/60 px-2.5 py-1 text-xs text-zinc-300 hover:text-zinc-100"
                >
                  {pomodoroMode === 'work' ? 'Отдых 5м' : 'Работа 25м'}
                </button>
              </div>
            </div>

            {/* Synthesizer Controls */}
            <div className="rounded border border-white/[0.07] bg-zinc-950/60 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Звуки уюта (Web Audio)</span>
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  Синтезатор
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSoundAmbiance(soundAmbiance === 'rain' ? 'off' : 'rain')}
                  className={`flex flex-col items-center justify-center p-2 rounded border text-xs transition-colors ${
                    soundAmbiance === 'rain'
                      ? 'border-white/[0.2] bg-white/[0.1] text-zinc-100'
                      : 'border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CloudRain className="h-3.5 w-3.5 mb-1" />
                  <span className="text-[10px]">Дождь</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundAmbiance(soundAmbiance === 'fireplace' ? 'off' : 'fireplace')}
                  className={`flex flex-col items-center justify-center p-2 rounded border text-xs transition-colors ${
                    soundAmbiance === 'fireplace'
                      ? 'border-white/[0.2] bg-white/[0.1] text-zinc-100'
                      : 'border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Flame className="h-3.5 w-3.5 mb-1 text-amber-400/80" />
                  <span className="text-[10px]">Камин</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundAmbiance(soundAmbiance === 'chimes' ? 'off' : 'chimes')}
                  className={`flex flex-col items-center justify-center p-2 rounded border text-xs transition-colors ${
                    soundAmbiance === 'chimes'
                      ? 'border-white/[0.2] bg-white/[0.1] text-zinc-100'
                      : 'border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 mb-1 text-zinc-300" />
                  <span className="text-[10px]">Звон</span>
                </button>
              </div>

              {soundAmbiance !== 'off' && (
                <button
                  type="button"
                  onClick={() => setSoundAmbiance('off')}
                  className="w-full flex items-center justify-center gap-1 pt-1 text-[11px] text-zinc-500 hover:text-zinc-300"
                >
                  <VolumeX className="h-3 w-3" />
                  <span>Выключить звук</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'kanban' && (
        <div className="space-y-3">
          {/* Dual Timezone Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-zinc-900/70 backdrop-blur-[20px] p-3">
            <DualTimeClock />

            {/* Spaces Selector Pills */}
            <div className="flex flex-wrap items-center gap-1">
              {spaces.map((space) => {
                const count = studyWorkItems.filter((i) => i.space === space.id).length;
                const isActive = activeStudySpace === space.id;

                return (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => setActiveStudySpace(space.id)}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-all ${
                      isActive
                        ? 'bg-white/[0.12] text-zinc-100 border border-white/[0.15]'
                        : 'bg-zinc-950/60 text-zinc-400 border border-white/[0.06] hover:text-zinc-200'
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
          </div>

          {/* Kanban Board Columns */}
          <div className="rounded-lg border border-white/[0.07] bg-zinc-900/70 backdrop-blur-[20px] p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {columns.map((column) => {
                const columnTasks = filteredItems.filter((i) => i.status === column.id);

                return (
                  <div
                    key={column.id}
                    className="rounded border border-white/[0.06] bg-zinc-950/50 p-2.5 flex flex-col min-h-[380px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                      <span className="text-xs font-semibold text-zinc-300">
                        {column.title}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {columnTasks.length}
                      </span>
                    </div>

                    {/* Cards List */}
                    <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
                      {columnTasks.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          className="rounded border border-white/[0.07] bg-zinc-900/80 p-2 space-y-1.5 group hover:border-white/[0.16] transition-all"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="rounded bg-white/[0.04] px-1 py-0.2 font-mono text-[9px] text-zinc-400 line-clamp-1 border border-white/[0.06]">
                              {item.courseOrProject}
                            </span>

                            {item.priority === 'high' && (
                              <span className="rounded bg-red-500/10 px-1 py-0.2 text-[9px] font-mono font-semibold text-red-400 border border-red-500/20">
                                HIGH
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-medium text-zinc-100 leading-snug">
                            {item.title}
                          </h4>

                          {item.description && (
                            <p className="text-[11px] text-zinc-400/80 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {item.timezoneNote && (
                            <div className="rounded bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                              <Globe className="h-2.5 w-2.5" />
                              <span>{item.timezoneNote}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-[10px] text-zinc-500 border-t border-white/[0.04]">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="h-2.5 w-2.5" />
                              {item.deadline}
                            </span>

                            <div className="flex items-center gap-1">
                              {column.id !== 'done' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStatus =
                                      column.id === 'backlog'
                                        ? 'in_progress'
                                        : column.id === 'in_progress'
                                        ? 'review'
                                        : 'done';
                                    updateStudyWorkStatus(item.id, nextStatus);
                                  }}
                                  className="flex items-center gap-0.5 rounded bg-white/[0.06] px-1.5 py-0.2 text-[10px] text-zinc-300 hover:bg-white/[0.1]"
                                  title="Переместить в следующую колонку"
                                >
                                  <span>Далее</span>
                                  <ChevronRight className="h-2.5 w-2.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => deleteStudyWorkItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-red-400 transition-opacity"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {columnTasks.length === 0 && (
                        <div className="flex h-24 items-center justify-center text-center text-xs text-zinc-600">
                          Пусто
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-white/[0.08] bg-zinc-900 p-4 shadow-2xl">
            <h3 className="text-xs font-semibold text-zinc-100 pb-2 mb-3 border-b border-white/[0.06]">
              Новая академическая или рабочая задача
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Например: Анализ данных ВШЭ / Эссе РУДН"
                  className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Курс / Проект
                  </label>
                  <input
                    type="text"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    placeholder="ML / Психология..."
                    className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Дедлайн
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2 py-1 text-xs text-white focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Часовой пояс / Заметка (для ДФО +7ч)
                </label>
                <input
                  type="text"
                  value={newTzNote}
                  onChange={(e) => setNewTzNote(e.target.value)}
                  placeholder="Например: 12:00 МСК = 19:00 Влад."
                  className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Описание / Детали
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Требования, ссылки, критерии..."
                  className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded bg-zinc-100 hover:bg-white px-3 py-1 text-xs font-medium text-zinc-950"
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
