import React, { useState } from 'react';
import { 
  Circle, 
  CheckCircle2, 
  Search, 
  FileText, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  X, 
  LayoutGrid
} from 'lucide-react';
import { NexusTask, Assignee, RoomArea } from '../../types/nexus';
import { useNexusStore } from '../../store/useNexusStore';

interface SpatialInboxGridProps {
  tasks: NexusTask[];
  onToggleTask: (id: string) => void;
  onTaskClick: (task: NexusTask) => void;
  onAddNewTask?: () => void;
  selectedAssignee: Assignee;
  onAssigneeChange: (assignee: Assignee) => void;
  isWidgetMode?: boolean;
}

export const SpatialInboxGrid: React.FC<SpatialInboxGridProps> = ({
  tasks,
  onToggleTask,
  onTaskClick,
  selectedAssignee,
  onAssigneeChange,
  isWidgetMode = false,
}) => {
  const { addTask } = useNexusStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomArea>('Все');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [inboxDisplayMode, setInboxDisplayMode] = useState<'hubs' | 'all'>('hubs');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active Hub Checklist Drawer Modal state
  const [activeHubDrawer, setActiveHubDrawer] = useState<NexusTask | null>(null);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerFilter, setDrawerFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Identifies a hub parent card (bathroom, kitchen, utilities, room, balcony, etc.)
  const isHubTask = (task: NexusTask): boolean => {
    if (task.isHub) return true;
    const t = task.title.trim().toLowerCase();
    return ['ванная', 'балкон', 'комната', 'кухня', 'коммунальные', 'доп.'].includes(t);
  };

  // Formats lowercase raw hub titles to human-readable labels
  const formatHubTitle = (title: string): string => {
    const lower = title.trim().toLowerCase();
    if (lower === 'ванная') return 'Ванная комната';
    if (lower === 'кухня') return 'Кухня & Обустройство';
    if (lower === 'коммунальные') return 'Коммунальные платежи & ЖКХ';
    if (lower === 'доп.') return 'Дополнительно & Разное';
    if (lower === 'балкон') return 'Балкон & Лоджия';
    if (lower === 'комната') return 'Спальня & Комната';
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  // Subtask finder for hub cards (bathroom, kitchen, utilities, etc.)
  const getSubtasksForHub = (hub: NexusTask) => {
    const hubId = hub.id;
    const hubLower = hub.title.toLowerCase().trim();

    return tasks.filter((t) => {
      if (t.id === hub.id) return false;
      if (isHubTask(t)) return false;
      if (t.parentId === hubId) return true;

      const tRoom = (t.room || '').toLowerCase();
      const tTags = (t.tags || []).map((tag) => tag.toLowerCase());
      const tTitle = t.title.toLowerCase();

      if (hubLower.includes('коммунальн')) {
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
      if (hubLower.includes('ванн')) {
        return tRoom === 'ванная' || tTags.includes('ванная');
      }
      if (hubLower.includes('кухн')) {
        return tRoom === 'кухня' || tTags.includes('кухня');
      }
      if (hubLower.includes('балкон')) {
        return tRoom === 'балкон' || tTags.includes('балкон');
      }
      if (hubLower.includes('комнат')) {
        return tRoom === 'комната' || tTags.includes('комната');
      }
      if (hubLower.includes('доп')) {
        return tTags.includes('доп') || tTags.includes('дополнительно');
      }
      return false;
    });
  };

  // Checks if a task is a child inside any of the room hubs
  const isChildOfAnyHub = (t: NexusTask): boolean => {
    if (t.parentId) return true;
    const tRoom = (t.room || '').toLowerCase();
    const tTags = (t.tags || []).map((tag) => tag.toLowerCase());
    return (
      ['ванная', 'кухня', 'балкон', 'комната'].includes(tRoom) ||
      tTags.some((tag) => ['ванная', 'кухня', 'балкон', 'комната', 'жкх', 'показания', 'доп'].includes(tag))
    );
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

    // In 'hubs' display mode, show hub cards + standalone unparented tasks (unless user is actively searching)
    if (inboxDisplayMode === 'hubs' && !searchQuery.trim()) {
      if (isHubTask(t)) return true;
      if (isChildOfAnyHub(t)) return false;
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
        {/* Title & Mode Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-[12.5px] font-bold text-white uppercase tracking-wider">
            Входящие и без срока
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.1] text-amber-300 font-mono-num text-[11px] font-bold border border-white/[0.08]">
            {inboxTasks.length}
          </span>

          {/* Hubs vs All Flat Tasks switcher */}
          <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setInboxDisplayMode('hubs')}
              className={`h-6 px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                inboxDisplayMode === 'hubs'
                  ? 'bg-white/[0.12] text-amber-300 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Компактный вид: хабы комнат со списками подзадач"
            >
              <Layers size={11} />
              <span>Хабы</span>
            </button>
            <button
              type="button"
              onClick={() => setInboxDisplayMode('all')}
              className={`h-6 px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                inboxDisplayMode === 'all'
                  ? 'bg-white/[0.12] text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Плоский вид: все задачи подряд"
            >
              <LayoutGrid size={11} />
              <span>Все подряд</span>
            </button>
          </div>

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

        {/* Filters and Search Bar (NO duplicate + button) */}
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
        </div>
      </div>

      {/* Grid of Tasks (Hubs + Standalone, all Draggable) */}
      {inboxTasks.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-1">
          <p className="text-[12.5px] font-medium">Нет задач в этой категории</p>
          <p className="text-[11px] text-zinc-600">Все чисто или не совпадает с фильтром</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {inboxTasks.map((task) => {
            const isHub = isHubTask(task);
            const subtasks = isHub ? getSubtasksForHub(task) : [];
            const totalSubtasks = Math.max(task.subtaskCount || 0, subtasks.length);
            const completedSubtasks = subtasks.filter((s) => s.completed).length;

            const hasNotes = Boolean(task.notes && task.notes.trim().length > 0);
            const isNoteOpen = expandedNotes[task.id];

            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', task.id);
                  e.dataTransfer.setData('application/nexus-task-id', task.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => {
                  if (isHub) {
                    setActiveHubDrawer(task);
                  } else {
                    onTaskClick(task);
                  }
                }}
                className={`p-2.5 rounded-xl transition-all duration-150 cursor-pointer flex flex-col justify-between gap-1.5 shadow-xs border border-transparent hover:border-white/[0.14] ${getPriorityBorder(
                  task
                )} ${isHub ? 'ring-1 ring-amber-500/20 bg-amber-500/[0.04]' : ''}`}
              >
                {/* Upper line: Complete Checkbox, Title, and Badges */}
                <div className="flex items-start gap-2">
                  {isHub ? (
                    <div 
                      className="mt-0.5 text-amber-400 shrink-0" 
                      title="Хаб задач со списком подзадач"
                    >
                      <Layers size={14} />
                    </div>
                  ) : (
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
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold leading-snug break-words">
                      {isHub ? formatHubTitle(task.title) : task.title}
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {task.room && task.room !== 'Все' && (
                        <span className="text-[9.5px] font-medium text-amber-300/90 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.2 rounded">
                          {task.room}
                        </span>
                      )}

                      {/* Hub Badge: 1-click opens Glass Popover Drawer */}
                      {isHub ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHubDrawer(task);
                          }}
                          className="text-[9.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 transition-all cursor-pointer shadow-xs"
                          title="Открыть список всех подзадач"
                        >
                          <Layers size={9} />
                          <span>{totalSubtasks} подзадач</span>
                          {completedSubtasks > 0 && (
                            <span className="opacity-75 font-mono-num font-normal">
                              ({completedSubtasks}/{totalSubtasks})
                            </span>
                          )}
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

                {/* Expandable authentic notes (passwords redacted with 1-click copy) */}
                {hasNotes && isNoteOpen && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 p-2 rounded-lg bg-black/40 border border-white/[0.08] text-[11px] text-zinc-300"
                  >
                    {renderSafeNotes(task.notes!, task.id)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* Interactive Glass Checklist Drawer for Hubs (Кухня, Ванная...) */}
      {/* ========================================================= */}
      {activeHubDrawer && (() => {
        const hub = activeHubDrawer;
        const subtasks = getSubtasksForHub(hub);
        const totalCount = subtasks.length;
        const completedCount = subtasks.filter((s) => s.completed).length;
        const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Filter subtasks in drawer
        const filteredSubtasks = subtasks.filter((s) => {
          if (drawerFilter === 'pending' && s.completed) return false;
          if (drawerFilter === 'completed' && !s.completed) return false;
          if (drawerSearch.trim()) {
            const q = drawerSearch.toLowerCase();
            const inTitle = s.title.toLowerCase().includes(q);
            const inNotes = s.notes?.toLowerCase().includes(q) || false;
            return inTitle || inNotes;
          }
          return true;
        });

        const handleAddSubtask = (e: React.FormEvent) => {
          e.preventDefault();
          if (!newSubtaskTitle.trim()) return;
          addTask({
            title: newSubtaskTitle.trim(),
            parentId: hub.id,
            completed: false,
            bracketColor: hub.bracketColor || 'neutral',
            category: hub.category || 'Дом',
            room: hub.room || 'Все',
            assignee: hub.assignee || 'together',
            date: 'inbox',
            projectName: hub.projectName || '📦Для дома!',
            tags: hub.tags || [],
          });
          setNewSubtaskTitle('');
        };

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
            onClick={() => setActiveHubDrawer(null)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#121620]/95 border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-start justify-between gap-3 bg-white/[0.02]">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <Layers size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[16px] font-bold text-white tracking-tight">
                        {formatHubTitle(hub.title)}
                      </h3>
                      {hub.room && hub.room !== 'Все' && (
                        <span className="text-[10px] font-semibold text-amber-300/90 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full">
                          {hub.room}
                        </span>
                      )}
                      {hub.projectName && (
                        <span className="text-[10px] text-zinc-400 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full font-mono-num">
                          {hub.projectName}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-zinc-400 mt-0.5">
                      {totalCount === 0
                        ? 'Нет вложенных пунктов'
                        : `${completedCount} из ${totalCount} выполнено (${progressPct}%)`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveHubDrawer(null)}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Закрыть"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Progress Bar Strip */}
              <div className="h-1.5 w-full bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Search & Filter Toolbar */}
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between gap-2 flex-wrap bg-white/[0.01]">
                <div className="relative flex-1 min-w-[180px]">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={drawerSearch}
                    onChange={(e) => setDrawerSearch(e.target.value)}
                    placeholder="Поиск по подзадачам..."
                    className="w-full h-7 pl-8 pr-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11.5px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06]">
                  {(
                    [
                      { id: 'all', label: `Все (${totalCount})` },
                      { id: 'pending', label: `В работе (${totalCount - completedCount})` },
                      { id: 'completed', label: `Готово (${completedCount})` },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setDrawerFilter(f.id)}
                      className={`h-6 px-2 rounded-md text-[10.5px] font-medium transition-all cursor-pointer ${
                        drawerFilter === f.id
                          ? 'bg-white/[0.12] text-white font-semibold shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Subtasks Checklist */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 [scrollbar-width:thin] max-h-[50vh]">
                {filteredSubtasks.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-[12px]">
                    {drawerSearch ? 'Ничего не найдено по запросу' : 'Список пуст'}
                  </div>
                ) : (
                  filteredSubtasks.map((sub) => {
                    const hasNotes = Boolean(sub.notes && sub.notes.trim().length > 0);
                    const isNoteOpen = expandedNotes[sub.id];

                    return (
                      <div
                        key={sub.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', sub.id);
                          e.dataTransfer.setData('application/nexus-task-id', sub.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer group flex flex-col gap-1.5 ${
                          sub.completed
                            ? 'bg-black/30 border-white/[0.04] opacity-65'
                            : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                        onClick={() => onToggleTask(sub.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleTask(sub.id);
                              }}
                              className="text-zinc-400 group-hover:text-emerald-400 transition-colors shrink-0"
                            >
                              {sub.completed ? (
                                <CheckCircle2 size={15} className="text-emerald-400" />
                              ) : (
                                <Circle size={15} />
                              )}
                            </button>

                            <span
                              className={`text-[12.5px] leading-snug break-words ${
                                sub.completed
                                  ? 'line-through text-zinc-500'
                                  : 'text-zinc-100 group-hover:text-white'
                              }`}
                            >
                              {sub.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {hasNotes && (
                              <button
                                type="button"
                                onClick={(e) => toggleNote(sub.id, e)}
                                className="text-[9.5px] font-medium text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-sky-500/20 transition-all cursor-pointer"
                              >
                                <FileText size={9} />
                                <span>Заметка</span>
                                {isNoteOpen ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                              </button>
                            )}

                            <span
                              className="text-zinc-600 hover:text-zinc-400 text-[10px] cursor-grab px-1"
                              title="Перетащите на таймлайн недели"
                            >
                              ⋮⋮
                            </span>
                          </div>
                        </div>

                        {/* Expanded Notes inside Drawer Item */}
                        {hasNotes && isNoteOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 p-2 rounded-lg bg-black/40 border border-white/[0.06] text-[11px]"
                          >
                            {renderSafeNotes(sub.notes!, sub.id)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer: Quick Add Subtask Form */}
              <form
                onSubmit={handleAddSubtask}
                className="p-3 bg-white/[0.02] border-t border-white/[0.08] flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder={`+ Добавить пункт в ${formatHubTitle(hub.title)}...`}
                  className="flex-1 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[12px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/50"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="h-8 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[12px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Добавить
                </button>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};