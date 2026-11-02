import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Briefcase, 
  Rocket, 
  Calendar, 
  Plus, 
  Layers, 
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
  Globe
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { StudySpace, StudyWorkItem } from '../../types/nexus';
import { DualTimeClock } from '../visual/DualTimeClock';
import { CyberCatMascot } from '../visual/CyberCatMascot';
import { cozyAudio } from '../../utils/CozyAudioSynthesizer';

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
    pomodoroCompletedSessions,
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
    color: string;
    badge?: string;
  }[] = [
    {
      id: 'yaprofi-dfo',
      label: '🏆 Я-Профи: Федеральный Лидер ДФО (Аня)',
      shortLabel: 'Я-Профи ДФО',
      user: 'anya',
      icon: Trophy,
      color: '#f59e0b',
      badge: 'ДФО +7ч 🌏',
    },
    {
      id: 'yaprofi-cfo',
      label: '🏆 Я-Профи: Региональный Лидер ЦФО (Аня)',
      shortLabel: 'Я-Профи ЦФО',
      user: 'anya',
      icon: Trophy,
      color: '#ec4899',
      badge: 'Москва / ЦФО',
    },
    {
      id: 'rudn-anya',
      label: '🎓 РУДН Онлайн: Психология (Аня)',
      shortLabel: 'РУДН Онлайн',
      user: 'anya',
      icon: GraduationCap,
      color: '#f43f5e',
    },
    {
      id: 'hse-egor',
      label: '🎓 ВШЭ: Магистратура (Егор)',
      shortLabel: 'ВШЭ Магистратура',
      user: 'egor',
      icon: GraduationCap,
      color: '#6366f1',
    },
    {
      id: 'work-egor',
      label: '💼 Работа: OpenMap & Core (Егор)',
      shortLabel: 'Работа OpenMap',
      user: 'egor',
      icon: Briefcase,
      color: '#38bdf8',
    },
    {
      id: 'projects-anya',
      label: '🚀 Проекты & Дизайн (Аня)',
      shortLabel: 'Дизайн / NEXUS',
      user: 'anya',
      icon: Rocket,
      color: '#a855f7',
    },
  ];

  const currentSpaceConfig = spaces.find((s) => s.id === activeStudySpace) || spaces[0];

  const filteredItems = studyWorkItems.filter((item) => item.space === activeStudySpace);

  const columns: { id: StudyWorkItem['status']; title: string; color: string }[] = [
    { id: 'backlog', title: 'Бэклог', color: '#64748b' },
    { id: 'in_progress', title: 'В процессе', color: '#38bdf8' },
    { id: 'review', title: 'Ревью / Сдача', color: '#eab308' },
    { id: 'done', title: 'Готово', color: '#22c55e' },
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addStudyWorkItem({
      space: activeStudySpace,
      user: currentSpaceConfig.user,
      title: newTitle.trim(),
      description: newDescription.trim(),
      courseOrProject: newCourse.trim() || currentSpaceConfig.shortLabel,
      status: 'backlog',
      priority: newPriority,
      deadline: newDeadline || new Date().toISOString().slice(0, 10),
      timezoneNote: newTzNote.trim() || undefined,
      tags: newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    });

    setNewTitle('');
    setNewDescription('');
    setNewCourse('');
    setNewTags('');
    setNewTzNote('');
    setShowAddModal(false);
  };

  const minutes = Math.floor(pomodoroTimeLeft / 60);
  const seconds = pomodoroTimeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* 1. TOP DUAL TIMEZONE & SPACES BANNER */}
      <div className="rounded-2xl border border-white/10 bg-[#0f1115]/80 backdrop-blur-2xl p-4 sm:p-5 shadow-glass space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <span>Хаб «ВШЭ x РУДН x Я-Профессионал»</span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-500/30">
                Москва ⇄ ДФО
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Координация академических модулей, федерального лидерства ДФО/ЦФО и рабочих спринтов
            </p>
          </div>

          {/* Dual Clock Widget */}
          <DualTimeClock />
        </div>

        {/* Space Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {spaces.map((space) => {
            const Icon = space.icon;
            const isActive = activeStudySpace === space.id;
            const count = studyWorkItems.filter((i) => i.space === space.id).length;

            return (
              <button
                key={space.id}
                type="button"
                onClick={() => setActiveStudySpace(space.id)}
                style={{
                  borderColor: isActive ? space.color : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: isActive ? `0 0 16px ${space.color}30` : 'none',
                }}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                  isActive ? 'bg-white/[0.09]' : 'bg-black/30 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4" style={{ color: space.color }} />
                  <span className="font-mono text-xs font-semibold text-zinc-400">
                    {count}
                  </span>
                </div>

                <span className="mt-2 text-xs font-bold text-white line-clamp-1">
                  {space.shortLabel}
                </span>

                <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400">
                  <span>{space.user === 'egor' ? 'Егор' : 'Аня'}</span>
                  {space.badge && (
                    <span className="font-mono text-[9px] text-amber-300/90">
                      {space.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. COZY FOCUS ROOM (PLAY. FOCUS. WIN. REPEAT. - EXACTLY AS IN REFERENCE PHOTO) */}
      <div className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-r from-[#170e2b] via-[#100d1e] to-[#0d0f17] p-5 sm:p-6 shadow-glass overflow-hidden">
        {/* Neon Ambient Wall Glows */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-purple-500/20 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-pink-500/15 blur-[80px]" />

        {/* Top Header Row with Neon Signs & Sticky Notes */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            {/* Glowing Neon Gamepad (from reference) */}
            <div className="relative flex h-10 w-12 items-center justify-center rounded-xl bg-purple-950/40 border border-purple-400/50 shadow-[0_0_18px_rgba(168,85,247,0.5)]">
              <span className="text-xl">🎮</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-purple-200">
                  PLAY. FOCUS. WIN. REPEAT.
                </span>
                <span className="text-pink-400">💜</span>
              </div>
              <p className="font-mono text-[11px] text-purple-300/70">
                one more level. one step closer.
              </p>
            </div>
          </div>

          {/* Wall Sticky Notes & Signs from Reference Photo */}
          <div className="flex items-center gap-2.5">
            {/* Sticky note 1 */}
            <div className="rotate-[-2deg] rounded bg-[#2a1a45]/90 border border-purple-500/30 px-2.5 py-1 text-[10px] font-mono text-purple-200 shadow-md">
              don't stop now ♡
            </div>

            {/* Sticky note 2 */}
            <div className="rotate-[3deg] rounded bg-[#2a1a45]/90 border border-purple-500/30 px-2.5 py-1 text-[10px] font-mono text-purple-200 shadow-md">
              you got this! ♡
            </div>

            {/* LEVEL UP poster */}
            <div className="rounded bg-black/60 border border-purple-400/40 px-2 py-0.5 text-center font-mono text-[9px] font-bold text-amber-300 tracking-wider shadow-sm">
              LEVEL UP ↑
            </div>

            {/* GAME ON neon acrylic stand */}
            <div className="rounded bg-purple-950/60 border border-pink-400/50 px-2 py-0.5 font-mono text-[9px] font-extrabold text-pink-300 shadow-[0_0_10px_rgba(244,114,182,0.4)]">
              GAME ON
            </div>
          </div>
        </div>

        {/* Focus Room Body */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Cyber-Cat on Focus Desk */}
          <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-black/35 border border-purple-500/20 shadow-inner">
            <CyberCatMascot
              gamification={gamification}
              onEquipCosmetic={equipCosmetic}
            />
            <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-purple-300/90 font-bold flex items-center gap-1.5">
              <span>FOCUS &gt;&gt; WIN</span>
              <span className="text-pink-400">✦</span>
            </div>
          </div>

          {/* Pomodoro Center */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Timer className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Cozy Focus Pomodoro
              </span>
            </div>

            {/* User switcher */}
            <div className="inline-flex items-center rounded-lg bg-black/50 p-0.5 text-xs border border-white/10">
              <button
                type="button"
                onClick={() => setPomodoroUser('together')}
                className={`rounded px-2.5 py-1 font-semibold transition-colors ${
                  pomodoroUser === 'together' ? 'bg-amber-500 text-black' : 'text-zinc-400'
                }`}
              >
                Вместе 💕
              </button>
              <button
                type="button"
                onClick={() => setPomodoroUser('egor')}
                className={`rounded px-2.5 py-1 font-semibold transition-colors ${
                  pomodoroUser === 'egor' ? 'bg-indigo-500 text-white' : 'text-zinc-400'
                }`}
              >
                Егор
              </button>
              <button
                type="button"
                onClick={() => setPomodoroUser('anya')}
                className={`rounded px-2.5 py-1 font-semibold transition-colors ${
                  pomodoroUser === 'anya' ? 'bg-rose-500 text-white' : 'text-zinc-400'
                }`}
              >
                Аня
              </button>
            </div>

            {/* Time display */}
            <div>
              <span className="font-mono text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]">
                {formattedTime}
              </span>
              <p className="text-xs text-zinc-400 mt-1">
                {pomodoroMode === 'work' ? 'Сессия непрерывного фокуса (+50 XP)' : 'Уютный отдых ☕️'}
              </p>
            </div>

            {/* Timer buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={pomodoroIsRunning ? pausePomodoro : startPomodoro}
                className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-black shadow-lg transition-transform active:scale-95 ${
                  pomodoroIsRunning
                    ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-400/25'
                    : 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-400/25'
                }`}
              >
                {pomodoroIsRunning ? (
                  <>
                    <Pause className="h-4 w-4 fill-current" />
                    <span>Пауза</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Фокус</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetPomodoro}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/10 transition-colors"
                title="Сбросить таймер"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setPomodoroMode(pomodoroMode === 'work' ? 'shortBreak' : 'work')}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
              >
                {pomodoroMode === 'work' ? 'Отдых 5м' : 'Работа 25м'}
              </button>
            </div>
          </div>

          {/* Web Audio Synthesizer Controls */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-purple-400" />
                <span>Web Audio Ambiance</span>
              </span>
              <span className="font-mono text-[10px] text-purple-300">
                0% MP3 / Чистый код
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Процедурный генератор уюта без внешних файлов:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSoundAmbiance(soundAmbiance === 'rain' ? 'off' : 'rain')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-colors ${
                  soundAmbiance === 'rain'
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-200'
                    : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06]'
                }`}
              >
                <CloudRain className="h-4 w-4 mb-1" />
                <span className="text-[10px]">Ночной Дождь</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundAmbiance(soundAmbiance === 'fireplace' ? 'off' : 'fireplace')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-colors ${
                  soundAmbiance === 'fireplace'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                    : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06]'
                }`}
              >
                <Flame className="h-4 w-4 mb-1" />
                <span className="text-[10px]">Теплый Камин</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundAmbiance(soundAmbiance === 'chimes' ? 'off' : 'chimes')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-colors ${
                  soundAmbiance === 'chimes'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                    : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06]'
                }`}
              >
                <Sparkles className="h-4 w-4 mb-1" />
                <span className="text-[10px]">Колокольчики</span>
              </button>
            </div>

            {soundAmbiance !== 'off' && (
              <button
                type="button"
                onClick={() => setSoundAmbiance('off')}
                className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-red-400 hover:underline"
              >
                <VolumeX className="h-3.5 w-3.5" />
                <span>Выключить звук</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. KANBAN BOARD */}
      <div className="rounded-2xl border border-white/10 bg-[#0f1115]/80 backdrop-blur-2xl p-4 sm:p-5 shadow-glass">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: currentSpaceConfig.color }}
            />
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">
              {currentSpaceConfig.label}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Добавить задачу</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTasks = filteredItems.filter((i) => i.status === column.id);

            return (
              <div
                key={column.id}
                className="rounded-xl border border-white/[0.08] bg-black/30 p-3.5 flex flex-col min-h-[420px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {column.title}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-400">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                  {columnTasks.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="rounded-xl border border-white/10 bg-[#121020]/90 backdrop-blur-xl p-3 space-y-2 group hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-zinc-400 line-clamp-1">
                          {item.courseOrProject}
                        </span>

                        {item.priority === 'high' && (
                          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-300 border border-red-500/30">
                            HIGH
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-zinc-100 leading-snug">
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-[11px] text-zinc-400 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Timezone Note (essential for DFO +7h) */}
                      {item.timezoneNote && (
                        <div className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-1 text-[10px] font-mono text-purple-300 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>{item.timezoneNote}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-[10px] text-zinc-400 border-t border-white/[0.04]">
                        <span className="flex items-center gap-1 text-amber-400/90 font-mono">
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
                              className="flex items-center gap-0.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300 hover:bg-white/20"
                              title="Переместить в следующую колонку"
                            >
                              <span>Далее</span>
                              <ChevronRight className="h-2.5 w-2.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteStudyWorkItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-center text-xs text-zinc-600">
                      Пусто
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD TASK */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12141a] p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">
              Новая задача: {currentSpaceConfig.shortLabel}
            </h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Созвон с ДФО, вебинар РУДН, лаба ВШЭ..."
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Курс / Вуз / Проект
                </label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="Я-Профи ДФО, ВШЭ, РУДН..."
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Описание
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Детали, ссылка на зум, требования..."
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Дедлайн
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Приоритет
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="low">Низкий (Low)</option>
                    <option value="medium">Средний (Medium)</option>
                    <option value="high">Высокий (High)</option>
                  </select>
                </div>
              </div>

              {activeStudySpace.includes('dfo') && (
                <div>
                  <label className="block text-xs font-medium text-purple-300 mb-1">
                    Пояснение по часовому поясу ДФО (+7ч)
                  </label>
                  <input
                    type="text"
                    value={newTzNote}
                    onChange={(e) => setNewTzNote(e.target.value)}
                    placeholder="Например: 10:00 МСК = 17:00 Владивосток"
                    className="w-full rounded-lg border border-purple-500/30 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Теги
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="дфо, созвон, вшэ, рудн"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
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
