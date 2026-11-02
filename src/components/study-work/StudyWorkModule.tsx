import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Briefcase, 
  Rocket, 
  Calendar, 
  Clock, 
  Plus, 
  Check, 
  AlertCircle, 
  Layers, 
  ChevronRight, 
  Timer,
  Play,
  Pause,
  RotateCcw,
  User,
  Trash2
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { StudySpace, StudyWorkItem } from '../../types/nexus';

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
  } = useNexusStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTags, setNewTags] = useState('');

  const spaces: { id: StudySpace; label: string; user: 'egor' | 'anya'; icon: typeof GraduationCap; color: string }[] = [
    {
      id: 'study-anya',
      label: '🎓 Учеба: ВШЭ (Аня)',
      user: 'anya',
      icon: GraduationCap,
      color: '#f43f5e',
    },
    {
      id: 'study-egor',
      label: '🎓 Учеба: Магистратура (Егор)',
      user: 'egor',
      icon: GraduationCap,
      color: '#6366f1',
    },
    {
      id: 'work-egor',
      label: '💼 Работа: OpenMap & Core (Егор)',
      user: 'egor',
      icon: Briefcase,
      color: '#38bdf8',
    },
    {
      id: 'projects-anya',
      label: '🚀 Проекты & Дизайн (Аня)',
      user: 'anya',
      icon: Rocket,
      color: '#ec4899',
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
      courseOrProject: newCourse.trim() || 'Основное направление',
      status: 'backlog',
      priority: newPriority,
      deadline: newDeadline || new Date().toISOString().slice(0, 10),
      tags: newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    });

    setNewTitle('');
    setNewDescription('');
    setNewCourse('');
    setNewTags('');
    setShowAddModal(false);
  };

  // Format Pomodoro minutes:seconds
  const minutes = Math.floor(pomodoroTimeLeft / 60);
  const seconds = pomodoroTimeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* 1. TOP BAR: SPACES SWITCHER & POMODORO STRIP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spaces Switcher Tabs */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0f1115]/80 backdrop-blur-2xl p-4 shadow-glass">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h2 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <span>Пространства учебы и карьеры</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Создать задачу</span>
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    boxShadow: isActive ? `0 0 16px ${space.color}25` : 'none',
                  }}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    isActive ? 'bg-white/[0.08]' : 'bg-black/30 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4" style={{ color: space.color }} />
                    <span className="font-mono text-xs font-semibold text-zinc-400">
                      {count}
                    </span>
                  </div>
                  <span className="mt-2 text-xs font-bold text-white line-clamp-1">
                    {space.label.replace(/🎓|💼|🚀/g, '').trim()}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {space.user === 'egor' ? 'Егор' : 'Аня'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Couple Pomodoro Focus Widget */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-950/20 via-[#0f1115]/80 to-black/80 backdrop-blur-2xl p-4 shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Парный Pomodoro
              </span>
            </div>

            {/* User switcher */}
            <div className="flex items-center rounded-lg bg-black/40 p-0.5 text-[10px] border border-white/10">
              <button
                type="button"
                onClick={() => setPomodoroUser('together')}
                className={`rounded px-1.5 py-0.5 font-semibold ${
                  pomodoroUser === 'together' ? 'bg-amber-500 text-black' : 'text-zinc-400'
                }`}
              >
                Вместе
              </button>
              <button
                type="button"
                onClick={() => setPomodoroUser('egor')}
                className={`rounded px-1.5 py-0.5 font-semibold ${
                  pomodoroUser === 'egor' ? 'bg-indigo-500 text-white' : 'text-zinc-400'
                }`}
              >
                Егор
              </button>
              <button
                type="button"
                onClick={() => setPomodoroUser('anya')}
                className={`rounded px-1.5 py-0.5 font-semibold ${
                  pomodoroUser === 'anya' ? 'bg-rose-500 text-white' : 'text-zinc-400'
                }`}
              >
                Аня
              </button>
            </div>
          </div>

          {/* Timer Display */}
          <div className="my-3 text-center">
            <span className="font-mono text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              {formattedTime}
            </span>
            <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
              <span>{pomodoroMode === 'work' ? 'Сессия фокуса' : 'Отдых'}</span>
              <span>•</span>
              <span>Сессий закрыто: <strong className="text-amber-400 font-mono">{pomodoroCompletedSessions}</strong></span>
            </div>
          </div>

          {/* Pomodoro Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={pomodoroIsRunning ? pausePomodoro : startPomodoro}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold text-black shadow-md transition-transform active:scale-95 ${
                pomodoroIsRunning
                  ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-400/20'
                  : 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-400/20'
              }`}
            >
              {pomodoroIsRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Пауза</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Старт</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetPomodoro}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/10 transition-colors"
              title="Сбросить"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setPomodoroMode(pomodoroMode === 'work' ? 'shortBreak' : 'work')}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/10 transition-colors"
            >
              {pomodoroMode === 'work' ? 'Перерыв' : 'Работа'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = filteredItems.filter((i) => i.status === column.id);

          return (
            <div
              key={column.id}
              className="rounded-2xl border border-white/10 bg-[#0f1115]/80 backdrop-blur-2xl p-4 shadow-glass flex flex-col min-h-[450px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {column.title}
                  </h3>
                </div>
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-400">
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                {columnTasks.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2 group hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
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

                    <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-[10px] text-zinc-400 border-t border-white/[0.04]">
                      <span className="flex items-center gap-1 text-amber-400/90">
                        <Calendar className="h-2.5 w-2.5" />
                        {item.deadline}
                      </span>

                      {/* Status Next Step Button */}
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

      {/* MODAL: ADD STUDY/WORK TASK */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12141a] p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">
              Новая задача: {currentSpaceConfig.label}
            </h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Название задачи
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Глава диссертации, лаба Raft, PR review..."
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Курс / Проект
                </label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="НИУ ВШЭ, OpenMap, Распределенные системы..."
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Описание / ссылки
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Подробности, требования к сдаче..."
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

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="вшэ, диплом, go, openmap"
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
