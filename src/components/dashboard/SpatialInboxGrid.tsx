import React, { useState } from 'react';
import { 
  Circle, 
  CheckCircle2, 
  Search, 
  Plus, 
  FileText, 
  Layers, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { NexusTask, Assignee, RoomArea } from '../../types/nexus';

interface SpatialInboxGridProps {
  tasks: NexusTask[];
  onToggleTask: (id: string) => void;
  onTaskClick: (task: NexusTask) => void;
  onAddNewTask: () => void;
  selectedAssignee: Assignee;
  onAssigneeChange: (assignee: Assignee) => void;
  isWidgetMode?: boolean;
}

export const SpatialInboxGrid: React.FC<SpatialInboxGridProps> = ({
  tasks,
  onToggleTask,
  onTaskClick,
  onAddNewTask,
  selectedAssignee,
  onAssigneeChange,
  isWidgetMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomArea>('Все');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isGroupedByProject, setIsGroupedByProject] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Subtask finder for hub cards (bathroom, kitchen, utilities, etc.)
  const getSubtasksForHub = (hub: NexusTask) => {
    const hubName = hub.title.toLowerCase().trim();
    return tasks.filter((t) => {
      if (t.id === hub.id || t.isHub) return false;
      if (t.parentId === hub.id) return true;
      const tRoom = (t.room || '').toLowerCase();
      const tTags = (t.tags || []).map((tag) => tag.toLowerCase());
      const tTitle = t.title.toLowerCase();

      if (hubName === 'коммунальные') {
        return (
          tTitle.includes('коммунальн') ||
          tTitle.includes('домиленд') ||
          tTitle.includes('мосэнерго') ||
          tTitle.includes('епд') ||
          tTitle.includes('wi-fi') ||
          tTags.includes('жкх') ||
          tTags.includes('показания')
        );
      }
      if (['ванная', 'кухня', 'балкон', 'комната'].includes(hubName)) {
        return tRoom === hubName || tTags.includes(hubName);
      }
      if (hubName.includes('доп')) {
        return tTags.includes('доп') || tTags.includes('дополнительно');
      }
      return false;
    });
  };

  const renderSafeNotes = (rawNotes: string, taskId: string) => {
    const lines = rawNotes.split('\n');

    const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
      <div className="space-y-1 text-[11px] font-mono-num">
        {lines.map((line, idx) => {
          const lower = line.toLowerCase();
          const isPassword = lower.includes('пароль') || lower.includes('password');
          const isLogin = lower.includes('логин') || lower.includes('login') || lower.includes('пользователь');

          const parts = line.split(':');
          const label = parts[0];
          const val = parts.slice(1).join(':').trim();

          if (isPassword) {
            const key = `${taskId}-pw-${idx}`;
            return (
              <div key={idx} className="flex items-center justify-between gap-2 p-1 rounded bg-black/40 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-zinc-500 font-sans text-[10px]">{label}:</span>
                  <span className="tracking-widest text-amber-300 font-mono">••••••••</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCopy(val || '••••••••', key, e)}
                  className="text-[9.5px] px-1.5 py-0.5 rounded bg-white/[0.08] hover:bg-white/[0.14] text-zinc-300 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedKey === key ? 'Скопировано ✓' : 'Копировать'}
                </button>
              </div>
            );
          }

          if (isLogin && val) {
            const key = `${taskId}-log-${idx}`;
            return (
              <div key={idx} className="flex items-center justify-between gap-2 p-1 rounded bg-black/40 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="text-zinc-500 font-sans text-[10px]">{label}:</span>
                  <span className="text-zinc-200 truncate">{val}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCopy(val, key, e)}
                  className="text-[9.5px] px-1.5 py-0.5 rounded bg-white/[0.08] hover:bg-white/[0.14] text-zinc-300 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedKey === key ? 'Скопировано ✓' : 'Копировать'}
                </button>
              </div>
            );
          }

          return (
            <div key={idx} className="text-zinc-300">
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  // Extract distinct projects
  const availableProjects = React.useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.projectName) set.add(t.projectName);
    });
    return Array.from(set);
  }, [tasks]);

  // Filter inbox tasks
  const inboxTasks = tasks.filter((t) => {
    // Only undated tasks or date === 'inbox'
    if (t.date !== 'inbox' && !t.isOverdue) return false;
    if (t.completed) return false;

    // Assignee filter
    if (selectedAssignee !== 'all' && t.assignee !== selectedAssignee && t.assignee !== 'together') {
      return false;
    }

    // Room filter
    if (selectedRoom !== 'Все' && t.room !== selectedRoom) {
      return false;
    }

    // Project filter
    if (selectedProject !== 'all' && t.projectName !== selectedProject) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = t.title.toLowerCase().includes(q);
      const inNotes = t.notes?.toLowerCase().includes(q) || false;
      const inTags = t.tags?.some((tag) => tag.toLowerCase().includes(q)) || false;
      if (!inTitle && !inNotes && !inTags) return false;
    }

    return true;
  });

  const getPriorityBorder = (task: NexusTask) => {
    if (task.bracketColor === 'critical') {
      return 'border-l-[3px] border-[#ff6b6b] bg-[#ff6b6b]/10 text-white hover:bg-[#ff6b6b]/15';
    }
    if (task.bracketColor === 'finance') {
      return 'border-l-[3px] border-[#eab308] bg-[#eab308]/10 text-zinc-100 hover:bg-[#eab308]/15';
    }
    if (task.bracketColor === 'active') {
      return 'border-l-[3px] border-[#ffa94d] bg-[#ffa94d]/10 text-zinc-100 hover:bg-[#ffa94d]/15';
    }
    return 'border-l-[3px] border-[#69db7c] bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]';
  };

  const toggleNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rooms: RoomArea[] = ['Все', 'Ванная', 'Кухня', 'Балкон', 'Комната'];

  return (
    <div className={`w-full rounded-[14px] p-4 transition-all ${
      isWidgetMode 
        ? 'bg-transparent border border-white/[0.06] shadow-none' 
        : 'bg-[#12161f]/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12)]'
    } flex flex-col gap-3.5`}>
      {/* Inbox Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        {/* Title & Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-[12.5px] font-bold text-white uppercase tracking-wider">
            Входящие и без срока
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.1] text-amber-300 font-mono-num text-[11px] font-bold border border-white/[0.08]">
            {inboxTasks.length}
          </span>
          {availableProjects.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedProject('all')}
                className={`h-5 px-2 rounded text-[10.5px] font-medium transition-all ${
                  selectedProject === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-zinc-400 hover:text-white bg-white/[0.04]'
                }`}
              >
                Все списки
              </button>
              {availableProjects.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedProject(p)}
                  className={`h-5 px-2 rounded text-[10.5px] font-medium transition-all ${
                    selectedProject === p
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-white bg-white/[0.04]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters and Search Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Room Filter Pills */}
          <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06]">
            {rooms.map((room) => {
              const isActive = selectedRoom === room;
              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => setSelectedRoom(room)}
                  className={`h-6 px-2.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.12] text-white shadow-xs font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {room}
                </button>
              );
            })}
          </div>

          {/* Assignee Filter */}
          <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06]">
            {(['all', 'egor', 'anya'] as const).map((a) => {
              const isActive = selectedAssignee === a;
              const label = a === 'all' ? 'Все' : a === 'egor' ? 'Егор' : 'Аня';
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => onAssigneeChange(a)}
                  className={`h-6 px-2 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.12] text-white font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="h-7 w-[130px] sm:w-[150px] pl-7 pr-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11.5px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>

          {/* New Task Button */}
          <button
            type="button"
            onClick={onAddNewTask}
            className="h-7 px-3 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-zinc-100 text-[11.5px] font-medium flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus size={12} />
            <span>В список</span>
          </button>
        </div>
      </div>

      {/* Grid of Genuine Tasks */}
      {inboxTasks.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-1">
          <p className="text-[12.5px] font-medium">Нет задач в этой категории</p>
          <p className="text-[11px] text-zinc-600">Все чисто или не совпадает с фильтром</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {inboxTasks.map((task) => {
            const hasNotes = Boolean(task.notes && task.notes.trim().length > 0);
            const isNoteOpen = expandedNotes[task.id];

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={`p-2.5 rounded-xl transition-all duration-150 cursor-pointer flex flex-col justify-between gap-1.5 shadow-xs border border-transparent hover:border-white/[0.12] ${getPriorityBorder(
                  task
                )}`}
              >
                {/* Upper line: Complete Checkbox, Title, and Badges */}
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className="mt-0.5 text-zinc-400 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                  >
                    <Circle size={13} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium leading-snug break-words">
                      {task.title}
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[9.5px] font-semibold text-zinc-400 bg-white/[0.06] px-1.5 py-0.2 rounded font-mono-num">
                        📦 Для дома!
                      </span>

                      {task.room && task.room !== 'Все' && (
                        <span className="text-[9.5px] font-medium text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded">
                          {task.room}
                        </span>
                      )}

                      {task.isHub && task.subtaskCount ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedSubtasks((prev) => ({ ...prev, [task.id]: !prev[task.id] }));
                          }}
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border transition-all cursor-pointer ${
                            expandedSubtasks[task.id]
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                              : 'bg-white/[0.08] hover:bg-white/[0.14] text-zinc-300 border-white/[0.1]'
                          }`}
                          title="Показать / скрыть подзадачи"
                        >
                          <Layers size={9} />
                          <span>{task.subtaskCount} подзадач</span>
                          {expandedSubtasks[task.id] ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                        </button>
                      ) : null}

                      {hasNotes && (
                        <button
                          type="button"
                          onClick={(e) => toggleNote(task.id, e)}
                          className="text-[9.5px] font-medium text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-sky-500/20 transition-all cursor-pointer"
                        >
                          <FileText size={9} />
                          <span>Заметка</span>
                          {isNoteOpen ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable subtasks accordion */}
                {task.isHub && expandedSubtasks[task.id] && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 pt-2 border-t border-white/[0.08] space-y-1.5 max-h-[220px] overflow-y-auto [scrollbar-width:thin] pr-1"
                  >
                    {getSubtasksForHub(task).map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => onToggleTask(sub.id)}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-black/30 hover:bg-white/[0.06] border border-white/[0.04] transition-colors cursor-pointer group/sub"
                      >
                        <button
                          type="button"
                          className="text-zinc-400 group-hover/sub:text-emerald-400 transition-colors shrink-0"
                        >
                          {sub.completed ? (
                            <CheckCircle2 size={13} className="text-emerald-400" />
                          ) : (
                            <Circle size={13} />
                          )}
                        </button>
                        <span
                          className={`text-[11.5px] leading-tight truncate flex-1 ${
                            sub.completed ? 'line-through text-zinc-500' : 'text-zinc-200 group-hover/sub:text-white'
                          }`}
                        >
                          {sub.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expandable authentic notes (passwords redacted with 1-click copy) */}
                {hasNotes && isNoteOpen && (
                  <div className="mt-2 p-2 rounded-lg bg-black/40 border border-white/[0.08] text-[11px] text-zinc-300">
                    {renderSafeNotes(task.notes!, task.id)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
