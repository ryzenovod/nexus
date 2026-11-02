import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Clock, 
  ExternalLink, 
  Layers, 
  AlertCircle,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { NexusTask, BracketColor } from '../../types/nexus';

interface GlassCardProps {
  task: NexusTask;
  onToggle: (id: string) => void;
  onClick?: (task: NexusTask) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
  isDragging?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  task,
  onToggle,
  onClick,
  onDelete,
  compact = false,
  isDragging = false,
}) => {
  const [showActions, setShowActions] = useState(false);

  // 3px solid bracket indicator strictly from screenshot DNA (no background gradients)
  const getBracketBorderColor = (color: BracketColor): string => {
    switch (color) {
      case 'critical':
        return '#ef4444';
      case 'active':
        return '#22c55e';
      case 'finance':
        return '#eab308';
      case 'cyber':
      case 'neutral':
      default:
        return '#71717a';
    }
  };

  const bracketColor = getBracketBorderColor(task.bracketColor);

  return (
    <motion.div
      layoutId={`task-${task.id}`}
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 32,
      }}
      style={{
        borderLeft: `3px solid ${bracketColor}`,
      }}
      className={`group relative rounded-r-lg border-y border-r border-white/[0.07] bg-[rgba(24,24,28,0.65)] hover:bg-[rgba(32,32,38,0.85)] backdrop-blur-[24px] select-none transition-colors duration-150 py-2 px-3 ${
        task.completed ? 'opacity-40 grayscale-[50%]' : ''
      } ${
        isDragging ? 'scale-105 z-50 shadow-2xl ring-1 ring-white/20' : ''
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Minimal Checkbox Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] transition-all duration-100 ${
            task.completed
              ? 'bg-zinc-200 text-zinc-950 border border-zinc-200'
              : 'border border-zinc-700 bg-zinc-950/80 hover:border-zinc-400 group-hover:bg-zinc-800'
          }`}
          aria-label={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
        >
          {task.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
        </button>

        {/* Content Body: Horizontal linear row */}
        <div 
          className="flex-1 min-w-0 cursor-pointer flex items-center gap-2"
          onClick={() => onClick && onClick(task)}
        >
          {/* Overdue Badge */}
          {task.isOverdue && !task.completed && (
            <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.2 font-mono text-[9px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 shrink-0">
              <AlertCircle className="h-2.5 w-2.5" />
              ПРОСРОЧЕНО
            </span>
          )}

          {/* Hub Badge */}
          {task.isHub && (
            <span className="inline-flex items-center gap-0.5 rounded bg-white/[0.05] px-1.5 py-0.2 font-mono text-[9px] text-zinc-300 border border-white/[0.08] shrink-0">
              <Layers className="h-2.5 w-2.5 text-zinc-400" />
              ХАБ {task.subtaskCount ? `(${task.subtaskCount})` : ''}
            </span>
          )}

          {/* Category micro-badge */}
          {task.category && (
            <span className="rounded bg-white/[0.04] border border-white/[0.05] px-1.5 py-0.5 text-[11px] text-zinc-400 font-normal shrink-0 hidden sm:inline-block">
              {task.category}
            </span>
          )}

          {/* Title */}
          <span
            className={`text-[13px] font-medium tracking-tight text-zinc-100 truncate flex-1 min-w-0 ${
              task.completed ? 'line-through text-zinc-500' : ''
            }`}
          >
            {task.title}
          </span>

          {/* Price (if present) */}
          {task.price !== undefined && task.price > 0 && (
            <span className="font-mono text-[11px] font-medium text-emerald-400/90 shrink-0">
              {task.price.toLocaleString('ru-RU')} ₽
            </span>
          )}

          {/* Regular recurrence pill */}
          {task.isRegular && (
            <span className="hidden md:inline-flex items-center gap-1 rounded bg-white/[0.04] px-1.5 py-0.2 text-[10px] text-zinc-400 border border-white/[0.06] shrink-0">
              <Clock className="h-2.5 w-2.5 text-amber-400/80" />
              {task.regularPeriod || 'Регулярно'}
            </span>
          )}

          {/* Linear-Style Assignee Micro-Pill with 6px dot indicator */}
          {task.assignee === 'egor' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-300 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span>Егор</span>
            </span>
          )}
          {task.assignee === 'anya' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-300 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
              <span>Аня</span>
            </span>
          )}
          {task.assignee === 'together' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-300 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span>Вместе</span>
            </span>
          )}

          {/* External link */}
          {task.link && (
            <a
              href={task.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-0.5 text-zinc-500 hover:text-zinc-200 transition-colors shrink-0"
              title="Открыть ссылку"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Card Quick Actions Menu */}
        {onDelete && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-zinc-500 hover:text-zinc-200 rounded hover:bg-white/10"
              aria-label="Действия"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {showActions && (
              <div 
                className="absolute right-0 top-5 z-30 min-w-[110px] rounded-md border border-white/10 bg-zinc-900 p-1 shadow-xl backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    onDelete(task.id);
                    setShowActions(false);
                  }}
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Удалить
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes line preview (if non-compact and exists) */}
      {!compact && task.notes && (
        <p className="mt-1 pl-5 text-[11px] leading-relaxed text-zinc-500 truncate">
          {task.notes}
        </p>
      )}
    </motion.div>
  );
};
