import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { NexusTask, BracketColor } from '../../types/nexus';

interface GlassCardProps {
  task: NexusTask;
  onToggle: (id: string) => void;
  onClick?: (task: NexusTask) => void;
  onDelete?: (id: string) => void;
  compact?: boolean; // When true or when in week view, renders Week card format
  isDragging?: boolean;
  mode?: 'week' | 'inbox';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  task,
  onToggle,
  onClick,
  compact = false,
  isDragging = false,
  mode,
}) => {
  // 3px solid bracket indicator strictly from screenshot DNA
  const getBracketBorderColor = (color: BracketColor): string => {
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

  const bracketColor = getBracketBorderColor(task.bracketColor);
  const isWeekMode = mode === 'week' || compact;

  // --- WEEK PLANNER CARD FORMAT (FULL TITLE, NO TRUNCATION, METADATA LINE) ---
  if (isWeekMode) {
    return (
      <motion.div
        layoutId={`task-${task.id}`}
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        onClick={() => onClick && onClick(task)}
        style={{ borderLeft: `3px solid ${bracketColor}` }}
        className={`group relative rounded-r-md border-y border-r border-white/[0.07] bg-[rgba(24,24,28,0.7)] hover:bg-[rgba(32,32,38,0.9)] backdrop-blur-[24px] select-none p-2.5 flex flex-col gap-1.5 transition-colors cursor-pointer ${
          task.completed ? 'opacity-40 grayscale-[50%]' : ''
        } ${isDragging ? 'scale-105 z-50 shadow-2xl ring-1 ring-white/20' : ''}`}
      >
        {/* Top metadata line WITHOUT borders */}
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Minimal Checkbox */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(task.id);
              }}
              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] transition-all ${
                task.completed
                  ? 'bg-zinc-200 text-zinc-950 border border-zinc-200'
                  : 'border border-zinc-700 bg-zinc-950/80 hover:border-zinc-400 group-hover:bg-zinc-800'
              }`}
              aria-label={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
            >
              {task.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            </button>

            {/* Overdue indicator dot or Category label */}
            {task.isOverdue && !task.completed ? (
              <span className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-wider text-red-400 font-semibold shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                ПРОСРОЧЕНО
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 truncate font-mono">
                {task.category || 'Задача'}
              </span>
            )}
          </div>

          {/* Assignee subtle name */}
          {task.assignee && task.assignee !== 'together' && (
            <span className="text-[10px] text-zinc-400 shrink-0 font-sans">
              {task.assignee === 'egor' ? 'Егор' : 'Аня'}
            </span>
          )}
        </div>

        {/* FULL TASK TITLE on entire column width (never cut to 1 letter!) */}
        <div
          className={`text-[12.5px] font-medium text-zinc-100 leading-snug line-clamp-3 break-words ${
            task.completed ? 'line-through text-zinc-500' : ''
          }`}
        >
          {task.title}
        </div>
      </motion.div>
    );
  }

  // --- INBOX GRID CARD FORMAT (MACOS WIDGET STYLE: NO CLUTTER, FULL TITLE) ---
  return (
    <motion.div
      layoutId={`task-${task.id}`}
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
      onClick={() => onClick && onClick(task)}
      style={{ borderLeft: `3px solid ${bracketColor}` }}
      className={`group relative rounded-r-md border-y border-r border-white/[0.07] bg-[rgba(24,24,28,0.7)] hover:bg-[rgba(32,32,38,0.9)] backdrop-blur-[24px] select-none py-2.5 px-3 flex items-baseline gap-2.5 transition-colors cursor-pointer ${
        task.completed ? 'opacity-40 grayscale-[50%]' : ''
      } ${isDragging ? 'scale-105 z-50 shadow-2xl ring-1 ring-white/20' : ''}`}
    >
      {/* Checkbox button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`relative top-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] transition-all ${
          task.completed
            ? 'bg-zinc-200 text-zinc-950 border border-zinc-200'
            : 'border border-zinc-700 bg-zinc-950/80 hover:border-zinc-400 group-hover:bg-zinc-800'
        }`}
        aria-label={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
      >
        {task.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
      </button>

      {/* Small calm tag */}
      {task.category && (
        <span className="text-[11px] text-zinc-400 shrink-0 font-normal select-none">
          {task.category}
        </span>
      )}

      {/* FULL TASK TITLE (never truncated to 1 letter!) */}
      <span
        className={`text-[13px] text-zinc-100 font-normal leading-snug break-words flex-1 min-w-0 ${
          task.completed ? 'line-through text-zinc-500' : ''
        }`}
      >
        {task.title}
      </span>
    </motion.div>
  );
};
