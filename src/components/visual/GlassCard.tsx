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

  // Bracket styling based on visual-dna.md
  const getBracketStyles = (color: BracketColor) => {
    switch (color) {
      case 'critical':
        return {
          borderLeft: '3.5px solid #ef4444',
          bgGradient: 'linear-gradient(90deg, rgba(127, 29, 29, 0.32) 0%, rgba(18, 20, 26, 0.82) 100%)',
          shadow: '0 0 16px rgba(239, 68, 68, 0.16)',
          hoverBorder: 'rgba(239, 68, 68, 0.4)',
        };
      case 'active':
        return {
          borderLeft: '3.5px solid #22c55e',
          bgGradient: 'linear-gradient(90deg, rgba(34, 197, 94, 0.16) 0%, rgba(18, 20, 26, 0.82) 100%)',
          shadow: '0 0 16px rgba(34, 197, 94, 0.14)',
          hoverBorder: 'rgba(34, 197, 94, 0.4)',
        };
      case 'finance':
        return {
          borderLeft: '3.5px solid #eab308',
          bgGradient: 'linear-gradient(90deg, rgba(234, 179, 8, 0.16) 0%, rgba(18, 20, 26, 0.82) 100%)',
          shadow: '0 0 16px rgba(234, 179, 8, 0.14)',
          hoverBorder: 'rgba(234, 179, 8, 0.4)',
        };
      case 'neutral':
      default:
        return {
          borderLeft: '3.5px solid #64748b',
          bgGradient: 'linear-gradient(90deg, rgba(100, 116, 139, 0.12) 0%, rgba(18, 20, 26, 0.82) 100%)',
          shadow: '0 0 12px rgba(100, 116, 139, 0.08)',
          hoverBorder: 'rgba(100, 116, 139, 0.4)',
        };
    }
  };

  const bracket = getBracketStyles(task.bracketColor);

  return (
    <motion.div
      ref={cardRef}
      layoutId={`task-${task.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 28,
      }}
      style={{
        borderLeft: bracket.borderLeft,
        background: bracket.bgGradient,
        boxShadow: isDragging ? '0 12px 28px rgba(0,0,0,0.6)' : bracket.shadow,
        borderTopLeftRadius: '10px',
        borderBottomLeftRadius: '10px',
      }}
      className={`group relative rounded-r-xl border-y border-r border-white/[0.08] backdrop-blur-[24px] select-none transition-all duration-200 ${
        task.completed ? 'opacity-40 grayscale-[40%]' : 'hover:border-white/[0.18]'
      } ${compact ? 'p-2.5 min-h-[46px]' : 'p-3.5 min-h-[58px]'} ${
        isDragging ? 'scale-105 z-50 ring-2 ring-amber-500/50' : ''
      }`}
    >
      {/* Interactive Cursor Spotlight Glow */}
      {mousePos && (
        <div
          className="pointer-events-none absolute inset-0 rounded-r-xl transition-opacity duration-300 opacity-100"
          style={{
            background: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.08), transparent 80%)`,
          }}
        />
      )}

      <div className="relative flex items-start gap-2.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all duration-150 ${
            task.completed
              ? 'bg-emerald-500 text-black border-transparent shadow-sm shadow-emerald-500/50'
              : 'border border-white/20 bg-black/30 hover:border-white/50 group-hover:bg-white/5'
          }`}
        >
          {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
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
              <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-red-300 border border-red-500/40">
                <AlertCircle className="h-2.5 w-2.5" />
                ПРОСРОЧЕНО
              </span>
            )}

            {/* Hub Badge */}
            {task.isHub && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-300 border border-amber-500/30">
                <Layers className="h-2.5 w-2.5" />
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
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-400/90 line-clamp-2">
              {task.notes}
            </p>
          )}

          {/* Metadata Footer */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400">
            {/* Regular recurrence pill */}
            {task.isRegular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-zinc-300 border border-white/[0.06]">
                <Clock className="h-2.5 w-2.5 text-amber-400" />
                {task.regularPeriod || 'Регулярно'}
              </span>
            )}

            {/* Price tag */}
            {task.price !== undefined && task.price > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono font-medium text-emerald-300 border border-emerald-500/20">
                {task.price.toLocaleString('ru-RU')} ₽
              </span>
            )}

            {/* Assignee Monogram Badge */}
            {task.assignee === 'egor' && (
              <span className="inline-flex items-center rounded bg-indigo-500/20 px-1.5 py-0.5 font-mono font-semibold text-indigo-300 border border-indigo-500/30">
                Егор
              </span>
            )}
            {task.assignee === 'anya' && (
              <span className="inline-flex items-center rounded bg-rose-500/20 px-1.5 py-0.5 font-mono font-semibold text-rose-300 border border-rose-500/30">
                Аня
              </span>
            )}
            {task.assignee === 'together' && (
              <span className="inline-flex items-center rounded bg-purple-500/20 px-1.5 py-0.5 font-mono font-semibold text-purple-300 border border-purple-500/30">
                Вместе
              </span>
            )}

            {/* Room tag */}
            {task.room && task.room !== 'Все' && (
              <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-zinc-400">
                {task.room}
              </span>
            )}

            {/* Date if assigned */}
            {task.date && task.date !== 'inbox' && (
              <span className="inline-flex items-center gap-0.5 text-zinc-400">
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
                className="ml-auto inline-flex items-center gap-0.5 text-amber-400/80 hover:text-amber-300 transition-colors"
                title="Открыть ссылку"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Card Quick Actions Menu Button */}
        {onDelete && (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-500 hover:text-zinc-200 rounded hover:bg-white/10"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {showActions && (
              <div 
                className="absolute right-0 top-6 z-30 min-w-[120px] rounded-lg border border-white/10 bg-[#14171f] p-1 shadow-xl backdrop-blur-md"
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
