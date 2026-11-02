import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GlassCard } from './GlassCard';
import { NexusTask } from '../../types/nexus';

interface SortableGlassCardProps {
  task: NexusTask;
  onToggle: (id: string) => void;
  onClick?: (task: NexusTask) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
  mode?: 'week' | 'inbox';
}

export const SortableGlassCard: React.FC<SortableGlassCardProps> = ({
  task,
  onToggle,
  onClick,
  onDelete,
  compact = false,
  mode,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <GlassCard
        task={task}
        onToggle={onToggle}
        onClick={onClick}
        onDelete={onDelete}
        compact={compact}
        mode={mode}
        isDragging={isDragging}
      />
    </div>
  );
};
