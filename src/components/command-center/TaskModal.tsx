import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  DollarSign, 
  Link as LinkIcon, 
  Trash2,
  Check
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
  const [category, setCategory] = useState<TaskCategory>('📦 Для дома!');
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
      setCategory('📦 Для дома!');
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#12141a] p-6 shadow-2xl overflow-hidden"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h3 className="text-base font-bold text-white">
              {taskToEdit ? 'Редактировать задачу' : 'Новая задача NEXUS'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:text-zinc-100 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Название задачи
              </label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Клей. Крючок в ванной"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/60"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Заметки / детали
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Уточнения, артикул, размеры, инструкция..."
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/60"
              />
            </div>

            {/* Indicator Bracket Color Picker */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Цвет индикатора (скобки)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={() => setBracketColor('critical')}
                  className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-[11px] transition-all ${
                    bracketColor === 'critical'
                      ? 'border-red-500 bg-red-500/20 text-red-200 ring-1 ring-red-500'
                      : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="h-3 w-1 rounded-full bg-red-500" />
                  <span>Критично</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBracketColor('active')}
                  className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-[11px] transition-all ${
                    bracketColor === 'active'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500'
                      : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="h-3 w-1 rounded-full bg-emerald-500" />
                  <span>Дом/Уют</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBracketColor('finance')}
                  className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-[11px] transition-all ${
                    bracketColor === 'finance'
                      ? 'border-yellow-500 bg-yellow-500/20 text-yellow-200 ring-1 ring-yellow-500'
                      : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="h-3 w-1 rounded-full bg-yellow-500" />
                  <span>Финансы</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBracketColor('cyber')}
                  className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-[11px] transition-all ${
                    bracketColor === 'cyber'
                      ? 'border-zinc-400 bg-white/[0.1] text-zinc-100'
                      : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="h-3 w-1 rounded-full bg-zinc-400" />
                  <span>Учеба</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBracketColor('neutral')}
                  className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-[11px] transition-all ${
                    bracketColor === 'neutral'
                      ? 'border-slate-500 bg-slate-500/20 text-slate-200 ring-1 ring-slate-500'
                      : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="h-3 w-1 rounded-full bg-slate-500" />
                  <span>Вишлист</span>
                </button>
              </div>
            </div>

            {/* Row: Assignee & Room */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Исполнитель
                </label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value as Assignee)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="together">Вместе (Егор + Аня)</option>
                  <option value="egor">Егор</option>
                  <option value="anya">Аня</option>
                  <option value="all">Все</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Комната / Зона
                </label>
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value as RoomArea)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="Все">Все зоны / Общее</option>
                  <option value="Ванная">Ванная</option>
                  <option value="Балкон">Балкон</option>
                  <option value="Комната">Комната</option>
                  <option value="Кухня">Кухня</option>
                  <option value="Коридор">Коридор</option>
                </select>
              </div>
            </div>

            {/* Row: Date & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Срок выполнения
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={date === 'inbox' ? '' : date}
                    onChange={(e) => setDate(e.target.value || 'inbox')}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
                  />
                  {date !== 'inbox' && (
                    <button
                      type="button"
                      onClick={() => setDate('inbox')}
                      className="rounded bg-white/10 px-2 text-[10px] text-zinc-300 hover:bg-white/20"
                    >
                      Инбокс
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Категория
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="📦 Для дома!">📦 Для дома!</option>
                  <option value="💰 Финансы">💰 Финансы</option>
                  <option value="🛒 Покупки">🛒 Покупки</option>
                  <option value="🎓 ВШЭ (Егор)">🎓 ВШЭ (Егор)</option>
                  <option value="🎓 РУДН (Аня)">🎓 РУДН (Аня)</option>
                  <option value="🏆 Я-Профессионал">🏆 Я-Профессионал</option>
                  <option value="💼 Работа (Егор)">💼 Работа (Егор)</option>
                  <option value="🚀 Проекты">🚀 Проекты</option>
                  <option value="📋 Общее">📋 Общее</option>
                </select>
              </div>
            </div>

            {/* Flags: Overdue & Regular */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={isOverdue}
                  onChange={(e) => setIsOverdue(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-red-500 focus:ring-0"
                />
                <span className="text-red-300">Пометить как [ПРОСРОЧЕНО]</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={isRegular}
                  onChange={(e) => setIsRegular(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-amber-500 focus:ring-0"
                />
                <span>Регулярное повторение</span>
              </label>
            </div>

            {isRegular && (
              <div>
                <input
                  type="text"
                  value={regularPeriod}
                  onChange={(e) => setRegularPeriod(e.target.value)}
                  placeholder="Период (например: 15–26 числа каждого месяца)"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            )}

            {/* Price & Link */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Сумма (₽)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Ссылка (Ozon, WB, mos.ru)
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              {taskToEdit && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(taskToEdit.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Удалить</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-white/10 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white px-4 py-2 text-xs font-medium text-zinc-950 transition-colors shadow-sm"
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>{taskToEdit ? 'Сохранить' : 'Создать'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
