import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trash2,
  Calendar,
  ExternalLink,
  DollarSign,
  Tag
} from 'lucide-react';
import { 
  NexusTask, 
  BracketColor, 
  Assignee, 
  RoomArea, 
  TaskCategory 
} from '../../types/nexus';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: NexusTask | null;
  initialDate?: string;
  onSave: (taskData: Omit<NexusTask, 'id' | 'createdAt' | 'order'>) => void;
  onUpdate?: (id: string, updates: Partial<NexusTask>) => void;
  onDelete?: (id: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  initialDate,
  onSave,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [bracketColor, setBracketColor] = useState<BracketColor>('active');
  const [category, setCategory] = useState<TaskCategory>('Дом');
  const [room, setRoom] = useState<RoomArea>('Все');
  const [assignee, setAssignee] = useState<Assignee>('together');
  const [date, setDate] = useState<string>('inbox');
  const [isOverdue, setIsOverdue] = useState(false);
  const [isRegular, setIsRegular] = useState(false);
  const [regularPeriod, setRegularPeriod] = useState('');
  const [price, setPrice] = useState<string>('');
  const [link, setLink] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setNotes(taskToEdit.notes || '');
      setBracketColor(taskToEdit.bracketColor);
      setCategory(taskToEdit.category);
      setRoom(taskToEdit.room || 'Все');
      setAssignee(taskToEdit.assignee);
      setDate(taskToEdit.date);
      setIsOverdue(taskToEdit.isOverdue || false);
      setIsRegular(taskToEdit.isRegular || false);
      setRegularPeriod(taskToEdit.regularPeriod || '');
      setPrice(taskToEdit.price !== undefined ? String(taskToEdit.price) : '');
      setLink(taskToEdit.link || '');
      setTagsInput(taskToEdit.tags?.join(', ') || '');
    } else {
      setTitle('');
      setNotes('');
      setBracketColor('active');
      setCategory('Дом');
      setRoom('Все');
      setAssignee('together');
      setDate(initialDate || 'inbox');
      setIsOverdue(false);
      setIsRegular(false);
      setRegularPeriod('');
      setPrice('');
      setLink('');
      setTagsInput('');
    }
  }, [taskToEdit, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const numericPrice = price ? parseFloat(price) : undefined;

    if (taskToEdit && onUpdate) {
      onUpdate(taskToEdit.id, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        bracketColor,
        category,
        room,
        assignee,
        date,
        isOverdue,
        isRegular,
        regularPeriod: isRegular ? regularPeriod : undefined,
        price: numericPrice,
        link: link.trim() || undefined,
        tags: parsedTags,
      });
    } else {
      onSave({
        title: title.trim(),
        notes: notes.trim() || undefined,
        completed: false,
        bracketColor,
        category,
        room,
        assignee,
        date,
        isOverdue,
        isRegular,
        regularPeriod: isRegular ? regularPeriod : undefined,
        price: numericPrice,
        link: link.trim() || undefined,
        tags: parsedTags,
      });
    }

    onClose();
  };

  const categories: TaskCategory[] = [
    'Дом',
    'ВШЭ',
    'РУДН',
    'Я-Профи',
    'Работа',
    'Проекты',
    'Финансы',
    'Покупки',
    'Общее',
  ];

  const rooms: RoomArea[] = ['Все', 'Ванная', 'Балкон', 'Комната', 'Кухня'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Soft Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Linear-Style Slide-Over Drawer */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="w-screen max-w-md bg-[#0c0c0e] border-l border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-y-auto z-10"
          >
            {/* Header bar */}
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                {taskToEdit ? 'Детали задачи' : 'Новая задача'}
              </span>

              <div className="flex items-center gap-1">
                {taskToEdit && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(taskToEdit.id);
                      onClose();
                    }}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Удалить задачу"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Form Body */}
            <form id="task-drawer-form" onSubmit={handleSubmit} className="flex-1 p-5 space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Название задачи
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Клей. Крючок в ванной"
                  className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 focus:outline-none"
                />
              </div>

              {/* Indicator Bracket Color */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Скобка индикатора
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'critical', label: 'Срочно', color: 'bg-red-500' },
                    { id: 'active', label: 'Ремонт', color: 'bg-emerald-500' },
                    { id: 'finance', label: 'ЖКХ', color: 'bg-amber-500' },
                    { id: 'neutral', label: 'Вишлист', color: 'bg-zinc-500' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBracketColor(b.id as BracketColor)}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        bracketColor === b.id
                          ? 'bg-white/[0.1] text-zinc-100'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${b.color}`} />
                      <span>{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee & Room Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Assignee */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Исполнитель
                  </label>
                  <div className="flex rounded-md bg-white/[0.03] p-0.5 text-xs">
                    {[
                      { id: 'together', label: 'Вместе' },
                      { id: 'egor', label: 'Егор' },
                      { id: 'anya', label: 'Аня' },
                    ].map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAssignee(a.id as Assignee)}
                        className={`flex-1 rounded py-1 text-center font-medium transition-colors ${
                          assignee === a.id
                            ? 'bg-white/[0.1] text-zinc-100'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Зона квартиры
                  </label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value as RoomArea)}
                    className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-400"
                  >
                    {rooms.map((r) => (
                      <option key={r} value={r} className="bg-zinc-900 text-zinc-200">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Date Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Категория
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-400"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-zinc-900 text-zinc-200">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Дата плана
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="inbox или 2026-11-02"
                    className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono"
                  />
                </div>
              </div>

              {/* Price & External Link Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Цена (₽)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1685"
                    className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Ссылка на товар / макет
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              {/* Notes / Description */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Заметки & Детали
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Добавьте артикул, размеры, шаги выполнения или инструкцию..."
                  className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 leading-relaxed"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="ванная, сантехника, леруа"
                  className="w-full rounded-md border border-white/[0.08] bg-zinc-950/70 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
                />
              </div>
            </form>

            {/* Bottom Actions Footer */}
            <div className="p-4 border-t border-white/[0.06] flex items-center justify-between bg-zinc-950/40">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Отмена
              </button>

              <button
                type="submit"
                form="task-drawer-form"
                className="px-4 py-1.5 rounded-md bg-white text-zinc-950 text-xs font-medium hover:bg-zinc-200 transition-colors shadow-sm"
              >
                {taskToEdit ? 'Сохранить изменения' : 'Создать задачу'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
