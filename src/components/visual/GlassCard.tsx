import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Clock, 
  ExternalLink, 
  Layers, 
  Calendar,
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [showActions, setShowActions] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setShowActions(false);
  };

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
      ref={cardRef}
      layoutId={`task-${task.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 30,
      }}
      style={{
        borderLeft: `3px solid ${bracketColor}`,
        borderTopLeftRadius: '8px',
        borderBottomLeftRadius: '8px',
      }}
      className={`group relative rounded-r-lg border-y border-r border-white/[0.07] bg-zinc-900/80 backdrop-blur-[20px] select-none transition-all duration-150 ${
        task.completed ? 'opacity-40 grayscale-[50%]' : 'hover:border-white/[0.16] hover:bg-zinc-900/95'
      } ${compact ? 'py-1.5 px-2.5 min-h-[40px]' : 'py-2 px-3 min-h-[50px]'} ${
        isDragging ? 'scale-105 z-50 shadow-xl ring-1 ring-zinc-500/50' : ''
      }`}
    >
      {/* Subtle Monochrome Cursor Light (no colored haze) */}
      {mousePos && (
        <div
          className="pointer-events-none absolute inset-0 rounded-r-lg transition-opacity duration-200"
          style={{
            background: `radial-gradient(140px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.04), transparent 80%)`,
          }}
        />
      )}

      <div className="relative flex items-start gap-2">
        {/* Minimal Checkbox Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] transition-all duration-100 ${
            task.completed
              ? 'bg-zinc-200 text-zinc-950 border border-zinc-200'
              : 'border border-zinc-700 bg-zinc-950/70 hover:border-zinc-400 group-hover:bg-zinc-800/80'
          }`}
          aria-label={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
        >
          {task.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
        </button>

        {/* Content Body */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onClick && onClick(task)}
        >
          {/* Header Row: Title & Badges */}
          <div className="flex flex-wrap items-center gap-1.5 leading-snug">
            {/* OVERDUE Badge */}
            {task.isOverdue && !task.completed && (
              <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.2 font-mono text-[9px] font-semibold tracking-wide text-red-400 bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-2.5 w-2.5" />
                ПРОСРОЧЕНО
              </span>
            )}

            {/* Hub Badge */}
            {task.isHub && (
              <span className="inline-flex items-center gap-1 rounded bg-white/[0.05] px-1.5 py-0.2 font-mono text-[9px] text-zinc-300 border border-white/[0.08]">
                <Layers className="h-2.5 w-2.5 text-zinc-400" />
                ХАБ {task.subtaskCount ? `(${task.subtaskCount})` : ''}
              </span>
            )}

            {/* Main Title */}
            <span
              className={`text-[13px] font-medium tracking-tight break-words text-zinc-100 ${
                task.completed ? 'line-through text-zinc-400' : ''
              }`}
            >
              {task.title}
            </span>
          </div>

          {/* Notes Preview (if not compact) */}
          {!compact && task.notes && (
            <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400/85 line-clamp-1">
              {task.notes}
            </p>
          )}

          {/* Metadata Footer */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400">
            {/* Room micro-tag */}
            {task.room && task.room !== 'Все' && (
              <span className="rounded bg-white/[0.04] px-1.5 py-0.2 text-[10px] text-zinc-400 border border-white/[0.06]">
                {task.room}
              </span>
            )}

            {/* Regular recurrence pill */}
            {task.isRegular && (
              <span className="inline-flex items-center gap-1 rounded bg-white/[0.04] px-1.5 py-0.2 text-zinc-300 border border-white/[0.06]">
                <Clock className="h-2.5 w-2.5 text-amber-400/80" />
                {task.regularPeriod || 'Регулярно'}
              </span>
            )}

            {/* Price tag */}
            {task.price !== undefined && task.price > 0 && (
              <span className="inline-flex items-center rounded bg-white/[0.04] px-1.5 py-0.2 font-mono font-medium text-emerald-400/90 border border-emerald-500/20">
                {task.price.toLocaleString('ru-RU')} ₽
              </span>
            )}

            {/* Assignee Badge (monochrome & clean) */}
            {task.assignee === 'egor' && (
              <span className="font-mono text-[10px] text-zinc-400">
                Егор
              </span>
            )}
            {task.assignee === 'anya' && (
              <span className="font-mono text-[10px] text-zinc-400">
                Аня
              </span>
            )}
            {task.assignee === 'together' && (
              <span className="font-mono text-[10px] text-zinc-400">
                Вместе
              </span>
            )}

            {/* Date if assigned */}
            {task.date && task.date !== 'inbox' && (
              <span className="inline-flex items-center gap-0.5 text-zinc-500 font-mono text-[10px]">
                <Calendar className="h-2.5 w-2.5" />
                {task.date.slice(5)}
              </span>
            )}

            {/* External link */}
            {task.link && (
              <a
                href={task.link}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="ml-auto inline-flex items-center gap-0.5 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Открыть ссылку"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Card Quick Actions Menu */}
        {onDelete && (
          <div className="relative">
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
    </motion.div>
  );
};
