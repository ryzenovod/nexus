import React from 'react';
import { NexusTask } from '../../types/nexus';
import { PriorityIcon, StatusIcon, LinearPriority, LinearStatus } from './LinearIcons';

interface LinearIssueRowProps {
  task: NexusTask;
  index: number;
  isSelected?: boolean;
  onToggle: (id: string) => void;
  onClick: (task: NexusTask) => void;
}

export const getTaskPriority = (task: NexusTask): LinearPriority => {
  if (task.isOverdue || task.bracketColor === 'critical') return 'urgent';
  if (task.bracketColor === 'active' || task.bracketColor === 'finance') return 'high';
  if (task.bracketColor === 'cyber') return 'medium';
  if (task.bracketColor === 'neutral' || task.title.includes('?')) return 'low';
  return 'none';
};

export const getTaskStatus = (task: NexusTask): LinearStatus => {
  if (task.completed) return 'done';
  if (task.date && task.date !== 'inbox') return 'in_progress';
  return 'todo';
};

const getCategoryDetails = (task: NexusTask): { label: string; dotColor: string } => {
  const titleLower = (task.title || '').toLowerCase();
  if (titleLower.includes('коммунальн') || task.tags?.includes('жкх') || task.id === 'task-hub-communal') {
    return { label: 'ЖКХ', dotColor: '#f59e0b' };
  }
  if (task.room && task.room !== 'Все') {
    return { label: task.room, dotColor: '#10b981' };
  }
  const raw = task.category || 'Дом';
  const clean = raw.replace(/[📦🎓🏆💼🚀💰🛒📋💕✨!]/g, '').trim().split(' ')[0] || 'Дом';
  if (clean === 'Для') return { label: 'Дом', dotColor: '#10b981' };
  if (clean === 'Финансы') return { label: 'Финансы', dotColor: '#f59e0b' };
  if (clean === 'ВШЭ' || clean === 'РУДН' || clean === 'Я-Профи') return { label: clean, dotColor: '#38bdf8' };
  if (clean === 'Покупки') return { label: 'Покупки', dotColor: '#a855f7' };
  return { label: clean, dotColor: '#71717a' };
};

const formatDateShort = (dateStr?: string): string => {
  if (!dateStr || dateStr === 'inbox') return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const month = months[parseInt(parts[1], 10) - 1] || '';
  return `${day} ${month}`;
};

export const LinearIssueRow: React.FC<LinearIssueRowProps> = ({
  task,
  index,
  isSelected = false,
  onToggle,
  onClick,
}) => {
  const priority = getTaskPriority(task);
  const status = getTaskStatus(task);
  const { label: catLabel, dotColor } = getCategoryDetails(task);
  const issueId = `NEX-${String(index + 1).padStart(2, '0')}`;
  const dateFormatted = formatDateShort(task.date);

  const assigneeText =
    task.assignee === 'egor' ? 'Е' : task.assignee === 'anya' ? 'А' : 'ЕА';

  return (
    <div
      onClick={() => onClick(task)}
      className={`h-[38px] px-4 border-b border-[#16171d] flex items-center gap-3 cursor-pointer select-none transition-colors group ${
        isSelected
          ? 'bg-[#1e2028]'
          : 'hover:bg-[#15161c] bg-transparent'
      }`}
    >
      {/* 1. Priority Icon (14px) */}
      <div className="shrink-0 flex items-center justify-center w-[14px]">
        <PriorityIcon priority={priority} size={14} />
      </div>

      {/* 2. Monospace Issue ID (e.g. NEX-01) */}
      <span className="text-[12px] font-mono text-[#5e636e] w-[52px] shrink-0">
        {issueId}
      </span>

      {/* 3. Linear Status Icon (14px, click to toggle) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className="shrink-0 flex items-center justify-center w-[14px] hover:scale-110 transition-transform"
        title={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
      >
        <StatusIcon status={status} size={14} />
      </button>

      {/* 4. Full Task Title (occupies main space, zero truncation for long text) */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span
          className={`text-[13px] leading-[18px] font-normal tracking-[-0.01em] truncate ${
            task.completed
              ? 'line-through text-[#5e636e]'
              : 'text-[#ededef] group-hover:text-white'
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* 5. Right Metadata (Price, Label, Date, Assignee Avatar) */}
      <div className="shrink-0 flex items-center gap-2.5">
        {/* Price Badge (if present) */}
        {task.price && task.price > 0 && (
          <span className="text-[11px] font-mono text-[#8a8f98] bg-[#16171d] px-1.5 py-0.5 rounded border border-[#22242e] tabular-nums">
            {task.price.toLocaleString('ru-RU')} ₽
          </span>
        )}

        {/* Linear Category Label Pill */}
        <div className="h-[20px] px-2 rounded-full bg-[#16171d] border border-[#232530] text-[11px] text-[#8a8f98] flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
          />
          <span className="truncate max-w-[80px]">{catLabel}</span>
        </div>

        {/* Date string */}
        {dateFormatted && (
          <span className="text-[12px] text-[#5e636e] w-[45px] text-right font-mono tabular-nums">
            {dateFormatted}
          </span>
        )}

        {/* Assignee Micro-Avatar */}
        <div
          className="w-[18px] h-[18px] rounded-full bg-[#232530] text-[10px] font-medium text-[#ededef] flex items-center justify-center shrink-0 tracking-tighter"
          title={task.assignee === 'egor' ? 'Егор' : task.assignee === 'anya' ? 'Аня' : 'Вместе'}
        >
          {assigneeText}
        </div>
      </div>
    </div>
  );
};
