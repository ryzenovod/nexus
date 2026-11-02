import React, { useState, useMemo } from 'react';
import { Check, Home, CreditCard, GraduationCap, Plus, ArrowUpRight } from 'lucide-react';
import { NexusTask, Assignee } from '../../types/nexus';
import { useNexusStore } from '../../store/useNexusStore';

interface BentoSpheresColumnsProps {
  tasks: NexusTask[];
  onToggleTask: (id: string) => void;
  onTaskClick: (task: NexusTask) => void;
  onAddTaskForSphere: (defaultCategory: string, defaultRoom?: string) => void;
}

const isHubHeader = (t: NexusTask): boolean => {
  const title = (t.title || '').toLowerCase().trim();
  return ['ванная', 'балкон', 'комната', 'кухня', 'доп.', 'дополнительно', 'прихожая'].includes(title);
};

export const BentoSpheresColumns: React.FC<BentoSpheresColumnsProps> = ({
  tasks,
  onToggleTask,
  onTaskClick,
  onAddTaskForSphere,
}) => {
  const { studyWorkItems } = useNexusStore();

  // Tabs filters inside each column
  const [col1Filter, setCol1Filter] = useState<'all' | 'bath' | 'kitchen' | 'balcony' | 'room'>('all');
  const [col2Filter, setCol2Filter] = useState<'all' | 'util' | 'fin' | 'wish'>('all');
  const [col3Filter, setCol3Filter] = useState<'all' | 'hse' | 'rudn' | 'yaprofi' | 'work'>('all');

  // Filter tasks for Column 1: Дом и Ремонт
  const homeTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (isHubHeader(t)) return false;

      // Exclude study/work and utilities/finances
      const lower = (t.title || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();
      if (cat.includes('вшэ') || cat.includes('рудн') || cat.includes('я-профи') || cat.includes('работа')) return false;
      if (lower.includes('домиленд') || lower.includes('мосэнерго') || lower.includes('коммунальн') || lower.includes('епд') || lower.includes('wi-fi')) return false;
      if (cat.includes('финанс') && !t.room) return false;

      // Must be home/room or purchases for rooms (including "Клей. Крючок в ванной")
      const isHome = cat.includes('дом') || (t.room && t.room !== 'Все') || t.tags?.includes('дом') || t.tags?.includes('ремонт') || lower.includes('клей') || lower.includes('крючок');
      if (!isHome) return false;

      // Filter tabs inside column 1
      if (col1Filter === 'bath') return t.room === 'Ванная' || lower.includes('ванн');
      if (col1Filter === 'kitchen') return t.room === 'Кухня' || lower.includes('кухн');
      if (col1Filter === 'balcony') return t.room === 'Балкон' || lower.includes('балкон');
      if (col1Filter === 'room') return t.room === 'Комната' || lower.includes('комнат');

      return true;
    });
  }, [tasks, col1Filter]);

  // Filter tasks for Column 2: Финансы, ЖКХ и Покупки (strictly bills & finance, no room repairs!)
  const financeTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (isHubHeader(t)) return false;

      const lower = (t.title || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();

      // Exclude home repair tasks explicitly
      if (t.room && t.room !== 'Все') return false;
      if (lower.includes('клей') || lower.includes('крючок') || lower.includes('затирка') || lower.includes('плинтус')) return false;

      const isUtil = 
        lower.includes('коммунальн') || 
        lower.includes('домиленд') || 
        lower.includes('мосэнерго') || 
        lower.includes('епд') || 
        lower.includes('wi-fi') || 
        lower.includes('wifi') ||
        t.tags?.includes('жкх') ||
        t.tags?.includes('показания');

      const isFin = 
        cat.includes('финанс') || 
        lower.includes('газпромбанк') ||
        lower.includes('общий счет') ||
        lower.includes('кэшбэк') || 
        lower.includes('кэшбек') || 
        lower.includes('бюджет');

      const isWish = (cat.includes('покупк') || lower.includes('?')) && !t.room;

      const matchesSphere = isUtil || isFin || (col2Filter === 'wish' && isWish);
      if (!matchesSphere) return false;

      // Filter tabs inside column 2
      if (col2Filter === 'util') return isUtil;
      if (col2Filter === 'fin') return isFin;
      if (col2Filter === 'wish') return isWish;

      return true;
    });
  }, [tasks, col2Filter]);

  // Filter tasks for Column 3: Учеба, Работа & Я-Профессионал
  const studyWorkTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (isHubHeader(t)) return false;

      const lower = (t.title || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();

      const isHse = cat.includes('вшэ') || lower.includes('вшэ') || lower.includes('нир') || t.tags?.includes('вшэ');
      const isRudn = cat.includes('рудн') || lower.includes('рудн') || t.tags?.includes('рудн');
      const isYaprofi = cat.includes('я-профи') || cat.includes('япрофи') || lower.includes('дфо') || lower.includes('цфо') || lower.includes('япрофи') || t.tags?.includes('я-профи');
      const isWork = cat.includes('работа') || lower.includes('openmap') || t.tags?.includes('openmap') || t.tags?.includes('работа');

      const matchesSphere = isHse || isRudn || isYaprofi || isWork;
      if (!matchesSphere) return false;

      // Filter tabs inside column 3
      if (col3Filter === 'hse') return isHse;
      if (col3Filter === 'rudn') return isRudn;
      if (col3Filter === 'yaprofi') return isYaprofi;
      if (col3Filter === 'work') return isWork;

      return true;
    });
  }, [tasks, col3Filter]);

  // Also include studyWorkItems in Column 3
  const filteredStudyItems = useMemo(() => {
    return (studyWorkItems || []).filter((item) => {
      if (item.status === 'done') return false;
      if (col3Filter === 'hse') return item.space === 'hse-egor' || item.tags?.includes('вшэ');
      if (col3Filter === 'rudn') return item.space === 'rudn-anya' || item.tags?.includes('рудн');
      if (col3Filter === 'yaprofi') return item.space === 'yaprofi-dfo' || item.tags?.includes('я-профи') || item.tags?.includes('дфо');
      if (col3Filter === 'work') return item.tags?.includes('работа') || item.tags?.includes('openmap');
      return true;
    });
  }, [studyWorkItems, col3Filter]);

  // Tag helper to ensure 100% correct micro-badges
  const getDisplayTag = (task: NexusTask, sphere: 'home' | 'finance' | 'study'): string => {
    const titleLower = (task.title || '').toLowerCase();
    
    if (sphere === 'study') {
      if (titleLower.includes('дфо') || task.tags?.includes('дфо')) return 'Я-Профи ДФО';
      if (titleLower.includes('цфо') || task.tags?.includes('цфо')) return 'Я-Профи ЦФО';
      if (titleLower.includes('вшэ') || task.category === 'ВШЭ') return 'ВШЭ';
      if (titleLower.includes('рудн') || task.category === 'РУДН') return 'РУДН';
      if (titleLower.includes('openmap') || task.category === 'Работа') return 'OpenMap';
      return task.category || 'Учеба';
    }

    if (sphere === 'finance') {
      if (titleLower.includes('коммунальн') || titleLower.includes('домиленд') || titleLower.includes('мосэнерго') || task.tags?.includes('жкх')) {
        return 'ЖКХ';
      }
      if (titleLower.includes('?') || task.category === 'Покупки') return 'Вишлист';
      return 'Финансы';
    }

    // Home sphere
    if (task.room && task.room !== 'Все') return task.room;
    if (titleLower.includes('ванн')) return 'Ванная';
    if (titleLower.includes('кухн')) return 'Кухня';
    if (titleLower.includes('балкон')) return 'Балкон';
    if (titleLower.includes('комнат') || titleLower.includes('подушка')) return 'Комната';
    return 'Дом';
  };

  const renderTaskCard = (task: NexusTask, sphere: 'home' | 'finance' | 'study') => {
    const tag = getDisplayTag(task, sphere);
    const assigneeText = task.assignee === 'egor' ? 'Е' : task.assignee === 'anya' ? 'А' : 'ЕА';

    // Highlight critical/urgent tasks with soft subtle left accent
    const isCritical = task.isOverdue || task.bracketColor === 'critical';

    return (
      <div
        key={task.id}
        onClick={() => onTaskClick(task)}
        className={`p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-150 flex items-start gap-3 group shadow-xs cursor-pointer select-none ${
          task.completed ? 'opacity-40 grayscale' : ''
        } ${isCritical ? 'border-l-[3px] border-l-rose-500/90 bg-rose-950/10' : ''}`}
      >
        {/* Animated Custom Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleTask(task.id);
          }}
          className={`w-4 h-4 mt-0.5 rounded-full border shrink-0 flex items-center justify-center transition-all ${
            task.completed
              ? 'border-emerald-400 bg-emerald-400 text-zinc-950'
              : 'border-white/20 group-hover:border-white/60 bg-transparent'
          }`}
          title={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
        >
          {task.completed && <Check size={10} strokeWidth={3} />}
        </button>

        {/* Central Content */}
        <div className="flex-1 min-w-0">
          <div
            className={`text-[13px] text-zinc-100 font-normal leading-snug break-words ${
              task.completed ? 'line-through text-zinc-500' : 'group-hover:text-white'
            }`}
          >
            {task.title}
          </div>

          {task.notes && (
            <div className="text-[11.5px] text-zinc-400 line-clamp-1 mt-0.5 font-normal">
              {task.notes}
            </div>
          )}
        </div>

        {/* Right Metadata */}
        <div className="shrink-0 flex items-center gap-1.5 self-start pt-0.5">
          {task.price && task.price > 0 && (
            <span className="text-[11px] font-mono text-zinc-300 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] tabular-nums">
              {task.price.toLocaleString('ru-RU')} ₽
            </span>
          )}

          <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-400 group-hover:text-zinc-200">
            {tag}
          </span>

          <div
            className="w-[18px] h-[18px] rounded-full bg-white/[0.06] text-[10px] font-medium text-zinc-300 flex items-center justify-center tracking-tighter"
            title={task.assignee === 'egor' ? 'Егор' : task.assignee === 'anya' ? 'Аня' : 'Вместе'}
          >
            {assigneeText}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 select-none items-start">
      {/* COLUMN 1: ДОМ И РЕМОНТ */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111216]/90 p-4 backdrop-blur-xl shadow-lg flex flex-col space-y-3.5">
        {/* Header with Title and Tabs */}
        <div>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Home size={14} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-semibold text-zinc-100 tracking-tight">
                  Дом и Ремонт
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {homeTasks.length} задач в уюте
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAddTaskForSphere('Дом', 'Ванная')}
              className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
              title="Добавить задачу по дому"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Clean Quick Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-1 border-t border-white/[0.04]">
            {[
              { id: 'all', label: 'Все' },
              { id: 'bath', label: 'Ванная' },
              { id: 'kitchen', label: 'Кухня' },
              { id: 'balcony', label: 'Балкон' },
              { id: 'room', label: 'Комната' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCol1Filter(tab.id as any)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                  col1Filter === tab.id
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-2 overflow-y-auto max-h-[520px] [scrollbar-width:thin] pr-0.5">
          {homeTasks.map((t) => renderTaskCard(t, 'home'))}

          {homeTasks.length === 0 && (
            <div className="py-12 text-center text-xs text-zinc-500 font-mono">
              В этой зоне нет активных дел
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: ФИНАНСЫ, ЖКХ И ПОКУПКИ */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111216]/90 p-4 backdrop-blur-xl shadow-lg flex flex-col space-y-3.5">
        {/* Header with Title and Tabs */}
        <div>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <CreditCard size={14} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-semibold text-zinc-100 tracking-tight">
                  Финансы, ЖКХ и Покупки
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {financeTasks.length} платежей и покупок
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAddTaskForSphere('Финансы')}
              className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
              title="Добавить расход или покупку"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Clean Quick Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-1 border-t border-white/[0.04]">
            {[
              { id: 'all', label: 'Все' },
              { id: 'util', label: 'ЖКХ' },
              { id: 'fin', label: 'Финансы' },
              { id: 'wish', label: 'Покупки ?' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCol2Filter(tab.id as any)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                  col2Filter === tab.id
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-2 overflow-y-auto max-h-[520px] [scrollbar-width:thin] pr-0.5">
          {financeTasks.map((t) => renderTaskCard(t, 'finance'))}

          {financeTasks.length === 0 && (
            <div className="py-12 text-center text-xs text-zinc-500 font-mono">
              Все счета оплачены
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 3: УЧЕБА, РАБОТА & Я-ПРОФЕССИОНАЛ */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111216]/90 p-4 backdrop-blur-xl shadow-lg flex flex-col space-y-3.5">
        {/* Header with Title and Tabs */}
        <div>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                <GraduationCap size={14} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-semibold text-zinc-100 tracking-tight">
                  Учеба, Работа & Я-Профи
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {studyWorkTasks.length + filteredStudyItems.length} активных дел
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAddTaskForSphere('ВШЭ')}
              className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Добавить учебную задачу"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Clean Quick Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-1 border-t border-white/[0.04]">
            {[
              { id: 'all', label: 'Все' },
              { id: 'hse', label: 'ВШЭ' },
              { id: 'rudn', label: 'РУДН' },
              { id: 'yaprofi', label: 'Я-Профи' },
              { id: 'work', label: 'Работа' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCol3Filter(tab.id as any)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  col3Filter === tab.id
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-2 overflow-y-auto max-h-[520px] [scrollbar-width:thin] pr-0.5">
          {/* Study & Work Academic Projects */}
          {filteredStudyItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/10 via-[#161722] to-[#12131a] hover:border-indigo-500/40 transition-all flex flex-col gap-1.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-zinc-100 leading-snug">
                  {item.title}
                </span>
                <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 font-medium">
                  {item.courseOrProject}
                </span>
              </div>
              {item.description && (
                <p className="text-[11px] text-zinc-400 leading-snug">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-white/[0.04]">
                <span className="text-zinc-400 font-sans">
                  {item.user === 'egor' ? '👤 Егор' : '👤 Аня'}
                </span>
                {item.deadline && (
                  <span className="text-amber-400 font-semibold">
                    До {item.deadline}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Regular Study Tasks */}
          {studyWorkTasks.map((t) => renderTaskCard(t, 'study'))}

          {studyWorkTasks.length === 0 && filteredStudyItems.length === 0 && (
            <div className="py-12 text-center text-xs text-zinc-500 font-mono">
              Все дедлайны сданы
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
