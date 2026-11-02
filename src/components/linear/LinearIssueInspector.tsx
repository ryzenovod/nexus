import React, { useState } from 'react';
import { X, Calendar, Trash2, CheckCircle2, User, Tag, Home, CreditCard, ExternalLink, Plus } from 'lucide-react';
import { NexusTask, BracketColor, Assignee, RoomArea, TaskCategory } from '../../types/nexus';
import { PriorityIcon, StatusIcon, LinearPriority, LinearStatus } from './LinearIcons';
import { getTaskPriority, getTaskStatus } from './LinearIssueRow';

interface LinearIssueInspectorProps {
  task: NexusTask;
  issueIndex: number;
  onClose: () => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: NexusTask) => void;
}

export const LinearIssueInspector: React.FC<LinearIssueInspectorProps> = ({
  task,
  issueIndex,
  onClose,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const priority = getTaskPriority(task);
  const status = getTaskStatus(task);
  const issueId = `NEX-${String(issueIndex + 1).padStart(2, '0')}`;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      onUpdateTask({ ...task, title: title.trim() });
    }
  };

  const handleNotesBlur = () => {
    if (notes !== task.notes) {
      onUpdateTask({ ...task, notes });
    }
  };

  const handleToggleSubtask = (subId: string) => {
    if (!task.subtasks) return;
    const updated = task.subtasks.map((st) =>
      st.id === subId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({ ...task, subtasks: updated });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const current = task.subtasks || [];
    const newSt = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    onUpdateTask({ ...task, subtasks: [...current, newSt] });
    setNewSubtaskTitle('');
  };

  return (
    <div className="w-[320px] lg:w-[340px] border-l border-[#1c1d24] bg-[#0d0e12] flex flex-col shrink-0 h-full overflow-hidden select-none animate-in slide-in-from-right-4 duration-200">
      {/* Top Bar with ID and Close */}
      <div className="h-[44px] px-4 border-b border-[#1c1d24] flex items-center justify-between shrink-0 bg-[#0f1014]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono font-medium text-[#8a8f98]">
            {issueId}
          </span>
          <span className="text-[#5e636e] text-xs">/</span>
          <button
            type="button"
            onClick={() => onToggleTask(task.id)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#16171d] hover:bg-[#1e2028] border border-[#262833] text-[#ededef] transition-colors"
          >
            <StatusIcon status={status} size={12} />
            <span>{status === 'done' ? 'Выполнено' : status === 'in_progress' ? 'В работе' : 'К выполнению'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-[#5e636e] hover:text-[#ededef] hover:bg-[#1c1d24] transition-colors"
          title="Закрыть панель (Esc)"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main Inspector Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-[13px] leading-[18px]">
        {/* Title input */}
        <div>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            rows={2}
            className="w-full bg-transparent text-[14px] font-medium text-[#ededef] tracking-[-0.01em] border-none focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded p-1 resize-none placeholder-[#5e636e]"
            placeholder="Название задачи..."
          />
        </div>

        {/* Properties Grid */}
        <div className="space-y-2 rounded-lg bg-[#131419] border border-[#1e2028] p-3 text-[12px]">
          {/* Priority */}
          <div className="flex items-center justify-between py-1">
            <span className="text-[#5e636e] flex items-center gap-2">
              <PriorityIcon priority={priority} size={13} />
              Приоритет
            </span>
            <select
              value={task.bracketColor}
              onChange={(e) => onUpdateTask({ ...task, bracketColor: e.target.value as BracketColor })}
              className="bg-[#16171d] border border-[#232530] text-[#ededef] text-[11px] rounded px-2 py-0.5 focus:outline-none"
            >
              <option value="critical">Urgent (Срочно)</option>
              <option value="active">High (Активно)</option>
              <option value="finance">Finance (Финансы)</option>
              <option value="cyber">Medium (Учеба)</option>
              <option value="neutral">Low (Спокойно)</option>
            </select>
          </div>

          {/* Assignee */}
          <div className="flex items-center justify-between py-1 border-t border-[#1c1d24]">
            <span className="text-[#5e636e] flex items-center gap-2">
              <User size={13} />
              Исполнитель
            </span>
            <select
              value={task.assignee}
              onChange={(e) => onUpdateTask({ ...task, assignee: e.target.value as Assignee })}
              className="bg-[#16171d] border border-[#232530] text-[#ededef] text-[11px] rounded px-2 py-0.5 focus:outline-none"
            >
              <option value="together">Вместе (ЕА)</option>
              <option value="egor">Егор (Е)</option>
              <option value="anya">Аня (А)</option>
            </select>
          </div>

          {/* Room / Area */}
          <div className="flex items-center justify-between py-1 border-t border-[#1c1d24]">
            <span className="text-[#5e636e] flex items-center gap-2">
              <Home size={13} />
              Зона квартиры
            </span>
            <select
              value={task.room || 'Все'}
              onChange={(e) => onUpdateTask({ ...task, room: e.target.value as RoomArea })}
              className="bg-[#16171d] border border-[#232530] text-[#ededef] text-[11px] rounded px-2 py-0.5 focus:outline-none"
            >
              <option value="Все">Все зоны</option>
              <option value="Ванная">Ванная</option>
              <option value="Балкон">Балкон</option>
              <option value="Кухня">Кухня</option>
              <option value="Комната">Комната</option>
              <option value="Коридор">Коридор</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between py-1 border-t border-[#1c1d24]">
            <span className="text-[#5e636e] flex items-center gap-2">
              <Tag size={13} />
              Категория
            </span>
            <select
              value={task.category || 'Дом'}
              onChange={(e) => onUpdateTask({ ...task, category: e.target.value as TaskCategory })}
              className="bg-[#16171d] border border-[#232530] text-[#ededef] text-[11px] rounded px-2 py-0.5 focus:outline-none"
            >
              <option value="Дом">Дом</option>
              <option value="Финансы">Финансы</option>
              <option value="ВШЭ">ВШЭ</option>
              <option value="РУДН">РУДН</option>
              <option value="Я-Профи">Я-Профи</option>
              <option value="Работа">Работа</option>
              <option value="Покупки">Покупки</option>
              <option value="Общее">Общее</option>
            </select>
          </div>

          {/* Price / Budget */}
          {task.price !== undefined && (
            <div className="flex items-center justify-between py-1 border-t border-[#1c1d24]">
              <span className="text-[#5e636e] flex items-center gap-2">
                <CreditCard size={13} />
                Бюджет
              </span>
              <span className="font-mono text-[12px] text-[#ededef]">
                {task.price.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center justify-between py-1 border-t border-[#1c1d24]">
            <span className="text-[#5e636e] flex items-center gap-2">
              <Calendar size={13} />
              Срок
            </span>
            <span className="font-mono text-[11px] text-[#8a8f98]">
              {task.date === 'inbox' ? 'Входящие' : task.date}
            </span>
          </div>
        </div>

        {/* Subtasks (Checklist) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">
            <span>Подзадачи ({task.subtasks?.length || 0})</span>
          </div>

          <div className="space-y-1">
            {task.subtasks?.map((st) => (
              <div
                key={st.id}
                onClick={() => handleToggleSubtask(st.id)}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#16171d] cursor-pointer text-[12px]"
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                    st.completed
                      ? 'border-[#5e6ad2] bg-[#5e6ad2] text-white'
                      : 'border-[#5e636e] bg-transparent'
                  }`}
                >
                  {st.completed && <CheckCircle2 size={10} />}
                </div>
                <span
                  className={`flex-1 truncate ${
                    st.completed ? 'line-through text-[#5e636e]' : 'text-[#ededef]'
                  }`}
                >
                  {st.title}
                </span>
              </div>
            ))}

            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask();
                }}
                placeholder="+ Добавить подзадачу..."
                className="flex-1 bg-[#16171d] border border-[#232530] text-[#ededef] text-[12px] rounded px-2 py-1 placeholder-[#5e636e] focus:outline-none focus:border-[#5e6ad2]"
              />
              {newSubtaskTitle.trim() && (
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-2 py-1 rounded bg-[#5e6ad2] text-white text-[11px]"
                >
                  <Plus size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notes / Markdown description */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">
            Заметки
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            rows={4}
            className="w-full bg-[#131419] border border-[#1e2028] text-[12px] leading-relaxed text-[#ededef] rounded-lg p-2.5 focus:outline-none focus:border-[#5e6ad2] placeholder-[#5e636e] resize-none"
            placeholder="Добавьте подробности, ссылки или контекст..."
          />
        </div>

        {/* Link (if present) */}
        {task.link && (
          <div>
            <a
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-[#5e6ad2] hover:underline"
            >
              <ExternalLink size={12} />
              <span>Открыть ссылку по задаче</span>
            </a>
          </div>
        )}

        {/* Bottom Actions: Complete / Delete */}
        <div className="pt-4 border-t border-[#1c1d24] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Удалить эту задачу?')) {
                onDeleteTask(task.id);
                onClose();
              }
            }}
            className="flex items-center gap-1 text-[11px] text-[#eb5757] hover:text-red-400 p-1 rounded hover:bg-red-950/20 transition-colors"
          >
            <Trash2 size={13} />
            <span>Удалить</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleTask(task.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[12px] font-medium transition-colors ${
              task.completed
                ? 'bg-[#16171d] text-[#8a8f98] hover:bg-[#1e2028]'
                : 'bg-[#5e6ad2] text-white hover:bg-[#6872d9]'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>{task.completed ? 'Вернуть в работу' : 'Завершить'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
