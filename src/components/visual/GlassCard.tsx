import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { NexusTask } from '../../types/nexus';

interface GlassCardProps {
  task: NexusTask;
  onToggle: (id: string) => void;
  onClick?: (task: NexusTask) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
  isDragging?: boolean;
  mode?: 'week' | 'inbox';
}

const getCleanTag = (task: NexusTask): string => {
  const titleLower = (task.title || '').toLowerCase();
  if (
    titleLower.includes('коммунальн') || 
    task.tags?.includes('жкх') || 
    task.id === 'task-hub-communal'
  ) {
    return 'ЖКХ';
  }
  if (task.room && task.room !== 'Все') {
    return task.room;
  }
  const raw = task.category || 'Дом';
  const clean = raw.replace(/[📦🎓🏆💼🚀💰🛒📋💕✨!]/g, '').trim().split(' ')[0] || 'Дом';
  if (clean === 'Для') return 'Дом';
  return clean;
};

const getCardBracketClass = (task: NexusTask): string => {
  const titleLower = (task.title || '').toLowerCase();
  const isCommunal = 
    titleLower.includes('коммунальн') || 
    task.tags?.includes('жкх') || 
    task.id === 'task-hub-communal';

  if (isCommunal) {
    return 'border-l-rose-500 bg-rose-950/25 hover:bg-rose-950/35 border-rose-500/30';
  }

  const isNeutralWish = task.bracketColor === 'neutral' || task.title.includes('?');
  if (isNeutralWish) {
    return 'border-l-zinc-500/60 bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]';
  }

  switch (task.bracketColor) {
    case 'critical':
      return 'border-l-rose-500 bg-rose-950/20 hover:bg-rose-950/30 border-rose-500/25';
    case 'active':
      return 'border-l-emerald-500/80 bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]';
    case 'finance':
      return 'border-l-amber-400/80 bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]';
    case 'cyber':
      return 'border-l-sky-500/80 bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]';
    case 'neutral':
    default:
      return 'border-l-zinc-500/60 bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]';
  }
};

export const GlassCard: React.FC<GlassCardProps> = ({
  task,
  onToggle,
  onClick,
  isDragging = false,
}) => {
  const tag = getCleanTag(task);
  const cardBracketClass = getCardBracketClass(task);

  return (
    <motion.div
      layoutId={`task-${task.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick && onClick(task)}
      className={`h-[38px] px-3 flex items-center gap-2.5 rounded-lg border-l-[3px] border backdrop-blur-md transition-all select-none cursor-pointer group min-w-0 ${cardBracketClass} ${
        task.completed ? 'opacity-40' : ''
      } ${isDragging ? 'z-50 shadow-2xl ring-1 ring-white/20' : ''}`}
    >
      {/* Quiet Neutral Status Circle (Doesn't fight with colored left bracket) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center transition-all ${
          task.completed
            ? 'border-zinc-300 bg-zinc-200 text-zinc-950'
            : 'border-white/20 group-hover:border-white/60 bg-transparent'
        }`}
        aria-label={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
      >
        {task.completed && <Check size={9} strokeWidth={3} />}
      </button>

      {/* Clean category tag */}
      <span className="text-[11px] text-zinc-400/90 font-mono shrink-0 select-none">
        {tag}
      </span>

      {/* Full task title in ONE clean, perfectly aligned line */}
      <span
        className={`text-[12.5px] text-zinc-200 group-hover:text-white font-normal truncate min-w-0 flex-1 leading-none ${
          task.completed ? 'line-through text-zinc-600' : ''
        }`}
      >
        {task.title}
      </span>
    </motion.div>
  );
};
