import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Sparkles, 
  Command, 
  Calendar, 
  Tag, 
  User, 
  ArrowRight, 
  LayoutDashboard, 
  CreditCard, 
  Gift, 
  GraduationCap, 
  Monitor, 
  X,
  Check
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { NexusTab } from '../navigation/TabNav';
import { BracketColor, Assignee, TaskCategory, RoomArea } from '../../types/nexus';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NexusTab) => void;
  onToggleWidgetMode: () => void;
  onOpenSettings: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onToggleWidgetMode,
  onOpenSettings,
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { tasks, addTask, toggleTaskCompletion } = useNexusStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setInput('');
    }
  }, [isOpen]);

  // Handle Cmd+K / Esc global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // NLP Parser logic for natural commands
  // Example: "Купить герметик для кабины завтра #дом @егор 450р"
  const parseNaturalInput = (text: string) => {
    let cleanTitle = text;
    let assignee: Assignee = 'together';
    let category: TaskCategory = 'Дом';
    let room: RoomArea = 'Все';
    let date = 'inbox';
    let price: number | undefined = undefined;
    let bracketColor: BracketColor = 'active';

    // Parse assignee
    if (text.includes('@егор') || text.includes('@egor')) {
      assignee = 'egor';
      cleanTitle = cleanTitle.replace(/@егор|@egor/gi, '');
    } else if (text.includes('@аня') || text.includes('@anya')) {
      assignee = 'anya';
      cleanTitle = cleanTitle.replace(/@аня|@anya/gi, '');
    } else if (text.includes('@вместе') || text.includes('@together')) {
      assignee = 'together';
      cleanTitle = cleanTitle.replace(/@вместе|@together/gi, '');
    }

    // Parse category
    if (text.includes('#финансы') || text.includes('#деньги') || text.includes('#жкх')) {
      category = 'Финансы';
      bracketColor = 'finance';
      cleanTitle = cleanTitle.replace(/#финансы|#деньги|#жкх/gi, '');
    } else if (text.includes('#япрофи') || text.includes('#дфо') || text.includes('#цфо')) {
      category = 'Я-Профи';
      bracketColor = 'critical';
      cleanTitle = cleanTitle.replace(/#япрофи|#дфо|#цфо/gi, '');
    } else if (text.includes('#вшэ')) {
      category = 'ВШЭ';
      bracketColor = 'cyber';
      cleanTitle = cleanTitle.replace(/#вшэ/gi, '');
    } else if (text.includes('#рудн') || text.includes('#учеба')) {
      category = 'РУДН';
      bracketColor = 'cyber';
      cleanTitle = cleanTitle.replace(/#рудн|#учеба/gi, '');
    } else if (text.includes('#работа') || text.includes('#openmap')) {
      category = 'Работа';
      bracketColor = 'critical';
      cleanTitle = cleanTitle.replace(/#работа|#openmap/gi, '');
    } else if (text.includes('#покупки') || text.includes('#вишлист')) {
      category = 'Покупки';
      bracketColor = 'neutral';
      cleanTitle = cleanTitle.replace(/#покупки|#вишлист/gi, '');
    } else if (text.includes('#дом')) {
      category = 'Дом';
      bracketColor = 'active';
      cleanTitle = cleanTitle.replace(/#дом/gi, '');
    }

    // Parse rooms
    if (text.toLowerCase().includes('ванная') || text.toLowerCase().includes('ванной')) {
      room = 'Ванная';
    } else if (text.toLowerCase().includes('балкон')) {
      room = 'Балкон';
    } else if (text.toLowerCase().includes('комната')) {
      room = 'Комната';
    } else if (text.toLowerCase().includes('кухня') || text.toLowerCase().includes('кухне')) {
      room = 'Кухня';
    }

    // Parse dates
    const today = new Date(2026, 10, 2); // 2026-11-02
    if (text.toLowerCase().includes('сегодня')) {
      date = '2026-11-02';
      cleanTitle = cleanTitle.replace(/сегодня/gi, '');
    } else if (text.toLowerCase().includes('завтра')) {
      date = '2026-11-03';
      cleanTitle = cleanTitle.replace(/завтра/gi, '');
    } else if (text.toLowerCase().includes('в среду') || text.toLowerCase().includes('среда')) {
      date = '2026-11-04';
      cleanTitle = cleanTitle.replace(/в среду|среда/gi, '');
    }

    // Parse price e.g. 450р or 450 руб
    const priceMatch = text.match(/(\d+)\s*(?:р|руб|₽)/i);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
      cleanTitle = cleanTitle.replace(priceMatch[0], '');
    }

    return {
      title: cleanTitle.trim(),
      assignee,
      category,
      room,
      date,
      price,
      bracketColor,
    };
  };

  const parsedNLP = parseNaturalInput(input);

  const handleCreateNLPTask = () => {
    if (!parsedNLP.title) return;
    addTask({
      title: parsedNLP.title,
      completed: false,
      bracketColor: parsedNLP.bracketColor,
      category: parsedNLP.category,
      room: parsedNLP.room,
      assignee: parsedNLP.assignee,
      date: parsedNLP.date,
      price: parsedNLP.price,
    });
    onClose();
  };

  // Filter tasks based on input
  const matchingTasks = input.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(input.toLowerCase()) ||
          t.notes?.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5)
    : [];

  const quickNavActions = [
    { label: 'Перейти: Центр управления (Задачи)', tab: 'command-center' as NexusTab, icon: LayoutDashboard },
    { label: 'Перейти: Интерактивный План квартиры', tab: 'blueprint' as NexusTab, icon: LayoutDashboard },
    { label: 'Перейти: Совместные Финансы & ЖКХ', tab: 'finances' as NexusTab, icon: CreditCard },
    { label: 'Перейти: Вишлист («Берем или нет?»)', tab: 'wishlist' as NexusTab, icon: Gift },
    { label: 'Перейти: ВШЭ x РУДН x Я-Профи', tab: 'study-work' as NexusTab, icon: GraduationCap },
    { label: 'Перейти: Радар ЦФО ⇄ ДФО', tab: 'yaprofi-radar' as NexusTab, icon: Sparkles },
    { label: 'Перейти: Расписание .ics & БРС Калькулятор', tab: 'academic' as NexusTab, icon: GraduationCap },
    { label: 'Перейти: Свидания: «Что делаем 4 ноября?»', tab: 'date-night' as NexusTab, icon: Gift },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0D101A]/95 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 bg-white/[0.015]">
          <Search className="h-5 w-5 text-amber-400" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                handleCreateNLPTask();
              }
            }}
            placeholder="Введите команду или задачу (напр. Купить герметик завтра #дом @егор 450р)..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="rounded-md bg-white/[0.08] px-1.5 py-0.5 tabular-nums text-[10px] text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Content Container */}
        <div className="max-h-[460px] overflow-y-auto p-3 space-y-4">
          {/* Natural Language Task Preview */}
          {input.trim() && parsedNLP.title && (
            <div className="rounded-xl bg-amber-500/[0.08] p-3 shadow-[inset_0_1px_0_rgba(251,191,36,0.15)]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Создать задачу естественным языком (нажмите Enter):
                </span>
                <button
                  type="button"
                  onClick={handleCreateNLPTask}
                  className="rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-semibold text-zinc-950 hover:bg-amber-300 transition-colors shadow-sm"
                >
                  Создать
                </button>
              </div>

              <div className="mt-2 text-sm font-medium text-white">
                «{parsedNLP.title}»
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
                <span className="rounded-md bg-white/[0.06] px-2 py-0.5">
                  Исполнитель: {parsedNLP.assignee === 'egor' ? 'Егор' : parsedNLP.assignee === 'anya' ? 'Аня' : 'Вместе'}
                </span>
                <span className="rounded-md bg-white/[0.06] px-2 py-0.5">
                  Зона: {parsedNLP.room}
                </span>
                <span className="rounded-md bg-white/[0.06] px-2 py-0.5">
                  Срок: {parsedNLP.date}
                </span>
                {parsedNLP.price && (
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 tabular-nums text-emerald-300 font-medium">
                    {parsedNLP.price} ₽
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Matching Tasks Search Results */}
          {matchingTasks.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1.5">
                Найденные задачи ({matchingTasks.length})
              </div>
              <div className="space-y-1">
                {matchingTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      toggleTaskCompletion(task.id);
                      onClose();
                    }}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-white/[0.05] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${task.completed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span className={`text-xs ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {task.room || task.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Navigation Sections */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1.5">
              Быстрый переход по модулям
            </div>
            <div className="space-y-1">
              {quickNavActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.tab}
                    type="button"
                    onClick={() => {
                      onSelectTab(action.tab);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-zinc-400" />
                      <span>{action.label}</span>
                    </div>
                    <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                      {i + 1}
                    </kbd>
                  </button>
                );
              })}

              {/* Toggle Widget Desktop Mode */}
              <button
                type="button"
                onClick={() => {
                  onToggleWidgetMode();
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Monitor className="h-4 w-4 text-amber-400" />
                  <span>Переключить режим виджета (Übersicht / Desktop Mode)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2.5 bg-black/40 text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>Используйте <strong className="text-zinc-300">#дом</strong>, <strong className="text-zinc-300">#финансы</strong> для категорий</span>
            <span><strong className="text-zinc-300">@егор</strong>, <strong className="text-zinc-300">@аня</strong> для назначения</span>
          </div>
          <span>Нажмите <strong className="text-zinc-300">Enter</strong> для подтверждения</span>
        </div>
      </motion.div>
    </div>
  );
};
