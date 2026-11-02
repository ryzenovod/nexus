import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { NexusTask, BracketColor } from '../../types/nexus';

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
  if (task.room && task.room !== 'Все') {
    return task.room;
  }
  const raw = task.category || 'Дом';
  return raw.replace(/[📦🎓🏆💼🚀💰🛒📋💕✨!]/g, '').trim().split(' ')[0] || 'Дом';
};

const getBracketHex = (color: BracketColor): string => {
  switch (color) {
    case 'critical':
      return '#ef4444'; // Red
    case 'active':
      return '#22c55e'; // Emerald
    case 'finance':
      return '#eab308'; // Amber
    case 'cyber':
    case 'neutral':
    default:
      return '#71717a'; // Zinc
  }
};

const getStatusCircleClass = (color: BracketColor, completed: boolean): string => {
  if (completed) {
    return 'border-zinc-300 bg-zinc-200 text-zinc-950';
  }
  switch (color) {
    case 'critical':
      return 'border-red-500/80 hover:border-red-400 bg-red-500/10';
    case 'active':
      return 'border-emerald-500/80 hover:border-emerald-400 bg-emerald-500/10';
    case 'finance':
      return 'border-amber-500/80 hover:border-amber-400 bg-amber-500/10';
    case 'neutral':
    default:
      return 'border-zinc-600 hover:border-zinc-400 bg-zinc-900/60';
  }
};

export const GlassCard: React.FC<GlassCardProps> = ({
  task,
  onToggle,
  onClick,
  isDragging = false,
}) => {
  const bracketHex = getBracketHex(task.bracketColor);
  const statusCircleClass = getStatusCircleClass(task.bracketColor, task.completed);
  const tag = getCleanTag(task);

  return (
    <motion.div
      layoutId={`task-${task.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick && onClick(task)}
      className={`h-[38px] px-3 py-1.5 flex items-center gap-2.5 bg-[#0b0b0e] hover:bg-[#121217] transition-colors select-none cursor-pointer group min-w-0 ${
        task.completed ? 'opacity-40' : ''
      } ${isDragging ? 'z-50 shadow-2xl ring-1 ring-white/20' : ''}`}
    >
      {/* Linear Status Circle (No ugly square checkboxes!) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center transition-all ${statusCircleClass}`}
        aria-label={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
      >
        {task.completed && <Check size={9} strokeWidth={3} />}
      </button>

      {/* Tiny vertical indicator capsule (2.5px x 14px) */}
      <span 
        className="w-[2.5px] h-3.5 rounded-full shrink-0" 
        style={{ backgroundColor: bracketHex }} 
      />

      {/* Clean tag (no emoji!) */}
      <span className="text-[11px] text-zinc-500 font-mono shrink-0 select-none">
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
