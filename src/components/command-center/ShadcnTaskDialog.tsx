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
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {taskToEdit ? 'Редактировать задачу' : 'Новая задача в NEXUS'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Задача сохранится локально и будет отправлена в очередь синхронизации.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Название задачи</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Что нужно сделать..."
                className="mt-1"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Заметки / Описание</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Дополнительные детали..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Исполнитель</label>
                <div className="flex rounded-md border p-1 gap-1 mt-1">
                  {(['together', 'egor', 'anya'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAssignee(a)}
                      className={`flex-1 py-1 text-xs rounded transition-colors ${
                        assignee === a
                          ? 'bg-secondary font-semibold text-secondary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {a === 'together' ? 'Вместе' : a === 'egor' ? 'Егор' : 'Аня'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Дата (ГГГГ-ММ-ДД)</label>
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="2026-11-02 или inbox"
                  className="mt-1 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Помещение</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {roomsList.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoom(r)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                      room === r
                        ? 'bg-secondary font-semibold text-secondary-foreground border-foreground/20'
                        : 'border-transparent text-muted-foreground hover:bg-muted/40'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            {taskToEdit ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDelete(taskToEdit.id)}
              >
                Удалить
              </Button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" size="sm">
                {taskToEdit ? 'Сохранить' : 'Создать задачу'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
