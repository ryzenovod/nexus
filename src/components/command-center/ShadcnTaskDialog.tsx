import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NexusTask, Assignee, RoomArea, BracketColor, TaskCategory } from '@/types/nexus';

interface ShadcnTaskDialogProps {
  isOpen: boolean;
  taskToEdit: NexusTask | null;
  initialDate?: string;
  onClose: () => void;
  onSave: (task: Omit<NexusTask, 'id' | 'createdAt' | 'order'>) => void;
  onUpdate: (id: string, updates: Partial<NexusTask>) => void;
  onDelete: (id: string) => void;
}

export const ShadcnTaskDialog: React.FC<ShadcnTaskDialogProps> = ({
  isOpen,
  taskToEdit,
  initialDate = 'inbox',
  onClose,
  onSave,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('inbox');
  const [assignee, setAssignee] = useState<Assignee>('together');
  const [room, setRoom] = useState<RoomArea>('Все');
  const [category, setCategory] = useState<TaskCategory>('Общее');
  const [bracketColor, setBracketColor] = useState<BracketColor>('neutral');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setNotes(taskToEdit.notes || '');
      setDate(taskToEdit.date || 'inbox');
      setAssignee(taskToEdit.assignee);
      setRoom(taskToEdit.room || 'Все');
      setCategory(taskToEdit.category);
      setBracketColor(taskToEdit.bracketColor);
    } else {
      setTitle('');
      setNotes('');
      setDate(initialDate);
      setAssignee('together');
      setRoom('Все');
      setCategory('Общее');
      setBracketColor('neutral');
    }
  }, [taskToEdit, initialDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      onUpdate(taskToEdit.id, {
        title: title.trim(),
        notes: notes.trim(),
        date,
        assignee,
        room,
        category,
        bracketColor,
      });
    } else {
      onSave({
        title: title.trim(),
        notes: notes.trim(),
        completed: false,
        bracketColor,
        category,
        room,
        assignee,
        date,
        isOverdue: false,
        isRegular: false,
      });
    }
  };

  const roomsList: RoomArea[] = ['Все', 'Кухня', 'Ванная', 'Комната', 'Балкон', 'Коридор'];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0D101A]/95 border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-white tracking-tight">
              {taskToEdit ? 'Редактировать задачу' : 'Новая задача в NEXUS'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Задача сохранится локально и будет отправлена в очередь синхронизации.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-400">Название задачи</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Что нужно сделать..."
                className="mt-1 bg-white/[0.04] border-white/[0.08] text-white placeholder-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20 rounded-xl"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-400">Заметки / Описание</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Дополнительные детали..."
                className="mt-1 bg-white/[0.04] border-white/[0.08] text-white placeholder-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-400">Исполнитель</label>
                <div className="flex rounded-xl bg-white/[0.04] p-1 gap-1 mt-1">
                  {(['together', 'egor', 'anya'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAssignee(a)}
                      className={`flex-1 py-1 text-xs rounded-lg transition-all ${
                        assignee === a
                          ? 'bg-white/10 font-medium text-white shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {a === 'together' ? 'Вместе' : a === 'egor' ? 'Егор' : 'Аня'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400">Дата (ГГГГ-ММ-ДД)</label>
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="2026-11-02 или inbox"
                  className="mt-1 tabular-nums text-xs bg-white/[0.04] border-white/[0.08] text-white placeholder-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-400">Помещение</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {roomsList.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoom(r)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                      room === r
                        ? 'bg-white/10 font-medium text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2">
            {taskToEdit ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDelete(taskToEdit.id)}
                className="rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
              >
                Удалить
              </Button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={onClose}
                className="rounded-xl bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-zinc-300"
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                size="sm"
                className="rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-medium shadow-sm"
              >
                {taskToEdit ? 'Сохранить' : 'Создать задачу'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
