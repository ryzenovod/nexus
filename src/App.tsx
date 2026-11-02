import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { Plus, Menu } from 'lucide-react';
import { useNexusStore } from './store/useNexusStore';
import { Sidebar } from './components/navigation/Sidebar';
import { NexusTab } from './components/navigation/TabNav';
import { MobileBottomBar } from './components/navigation/MobileBottomBar';
import { WeekPlanner } from './components/command-center/WeekPlanner';
import { InboxGrid } from './components/command-center/InboxGrid';
import { TaskModal } from './components/command-center/TaskModal';
import { FinancesModule } from './components/finances/FinancesModule';
import { WishlistModule } from './components/wishlist/WishlistModule';
import { StudyWorkModule } from './components/study-work/StudyWorkModule';
import { TelegramBridgeModal } from './components/telegram/TelegramBridgeModal';
import { TamagotchiRoomModal } from './components/visual/TamagotchiRoomModal';
import { CommandPalette } from './components/command-palette/CommandPalette';
import { SettingsModal } from './components/settings/SettingsModal';
import { GlassCard } from './components/visual/GlassCard';
import { StarryTwilightCanvas } from './components/visual/StarryTwilightCanvas';
import { NexusTask } from './types/nexus';

export const App: React.FC = () => {
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    selectedBracket,
    setSelectedBracket,
    selectedAssignee,
    setSelectedAssignee,
    selectedRoom,
    setSelectedRoom,
    selectedCategory,
    setSelectedCategory,
    isSmartGrouped,
    setIsSmartGrouped,
    activeWeekOffset,
    setActiveWeekOffset,
    toggleTaskCompletion,
    addTask,
    updateTask,
    deleteTask,
    moveTaskToDate,
    wishlist,
    tickPomodoro,
    pomodoroIsRunning,
    atmosphereMode,
    setAtmosphereMode,
  } = useNexusStore();

  const [activeTab, setActiveTab] = useState<NexusTab>('command-center');
  const [activeTaskModal, setActiveTaskModal] = useState(false);
  const [selectedTaskToEdit, setSelectedTaskToEdit] = useState<NexusTask | null>(null);
  const [initialTaskDate, setInitialTaskDate] = useState<string>('inbox');
  const [activeCommandPalette, setActiveCommandPalette] = useState(false);
  const [activeSettingsModal, setActiveSettingsModal] = useState(false);
  const [activeTelegramModal, setActiveTelegramModal] = useState(false);
  const [activeTamagotchiModal, setActiveTamagotchiModal] = useState(false);
  const [activeDraggingTask, setActiveDraggingTask] = useState<NexusTask | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Widget Mode: checked via URL query ?mode=widget or toggle
  const [isWidgetMode, setIsWidgetMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'widget';
    }
    return false;
  });

  // If ?mode=widget is enabled, automatically switch atmosphere to 'transparent'
  useEffect(() => {
    if (isWidgetMode) {
      setAtmosphereMode('transparent');
    }
  }, [isWidgetMode, setAtmosphereMode]);

  // Background Pomodoro ticker
  useEffect(() => {
    let interval: any = null;
    if (pomodoroIsRunning) {
      interval = setInterval(() => {
        tickPomodoro();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomodoroIsRunning, tickPomodoro]);

  // Keyboard shortcut listener: 1-4 for clean tabs, 'n' for new task, ⌘K for palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveCommandPalette(true);
        return;
      }

      if (e.key === '1') setActiveTab('command-center');
      if (e.key === '2') setActiveTab('finances');
      if (e.key === '3') setActiveTab('wishlist');
      if (e.key === '4') setActiveTab('study-work');
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setInitialTaskDate('inbox');
        setSelectedTaskToEdit(null);
        setActiveTaskModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = String(event.active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setActiveDraggingTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDraggingTask(null);

    if (!over) return;

    const taskId = String(active.id);
    const overId = String(over.id);

    if (overId.startsWith('droppable-day-')) {
      const targetDate = overId.replace('droppable-day-', '');
      moveTaskToDate(taskId, targetDate);
    } else if (overId === 'droppable-inbox') {
      moveTaskToDate(taskId, 'inbox');
    }
  };

  const handleOpenNewTaskForDate = (date: string) => {
    setInitialTaskDate(date);
    setSelectedTaskToEdit(null);
    setActiveTaskModal(true);
  };

  const handleCardClick = (task: NexusTask) => {
    setSelectedTaskToEdit(task);
    setActiveTaskModal(true);
  };

  const pendingWishlistCount = wishlist.filter((w) => w.status === 'pending').length;

  const tabTitles: Record<NexusTab, string> = {
    'command-center': 'Центр управления',
    'finances': 'Финансы и ЖКХ',
    'wishlist': 'Вишлист и Квартира',
    'study-work': 'Учеба и Я-Профи',
  };

  return (
    <div
      className={`h-screen overflow-hidden flex text-zinc-100 ${
        atmosphereMode === 'transparent' || isWidgetMode
          ? 'bg-transparent'
          : 'bg-[#09090b]'
      }`}
    >
      {/* Procedural Animated Canvas: Starry Twilight with subtle depth */}
      <StarryTwilightCanvas mode={atmosphereMode} />

      {/* RULE 1: DESKTOP APP SHELL - LEFT SIDEBAR */}
      {!isWidgetMode && (
        <div className="hidden md:flex">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenCommandPalette={() => setActiveCommandPalette(true)}
            onOpenTelegram={() => setActiveTelegramModal(true)}
            onOpenTamagotchi={() => setActiveTamagotchiModal(true)}
            onOpenSettings={() => setActiveSettingsModal(true)}
            isWidgetMode={isWidgetMode}
            onToggleWidgetMode={() => setIsWidgetMode(!isWidgetMode)}
            wishlistPendingCount={pendingWishlistCount}
          />
        </div>
      )}

      {/* RULE 1 & 5: RIGHT MAIN CANVAS (LINEAR STYLE AIR & INDIGO DEPTH) */}
      <div className="flex-1 overflow-y-auto relative flex flex-col min-w-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]">
        {/* Top Slim Header Bar */}
        {!isWidgetMode && (
          <header className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold tracking-tight text-zinc-100">
                {tabTitles[activeTab]}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setInitialTaskDate('inbox');
                  setSelectedTaskToEdit(null);
                  setActiveTaskModal(true);
                }}
                className="flex items-center gap-1.5 rounded-md bg-white text-zinc-950 hover:bg-zinc-200 px-3 py-1.5 text-xs font-medium transition-colors shadow-sm"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>+ Задача</span>
              </button>
            </div>
          </header>
        )}

        {/* Main Workspace Body */}
        <main className={`flex-1 ${isWidgetMode ? 'p-2 sm:p-3' : 'px-6 py-5'} pb-24 md:pb-8`}>
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* TAB 1: COMMAND CENTER (Week Planner + 4-Column Inbox Grid) */}
            {(activeTab === 'command-center' || isWidgetMode) && (
              <div className="space-y-5">
                {/* Upper Section: 7 Day Columns Planner */}
                <WeekPlanner
                  tasks={tasks}
                  activeWeekOffset={activeWeekOffset}
                  onOffsetChange={setActiveWeekOffset}
                  onToggleTask={toggleTaskCompletion}
                  onTaskClick={handleCardClick}
                  onDeleteTask={deleteTask}
                  onAddTaskForDay={handleOpenNewTaskForDate}
                />

                {/* Lower Section: 4-Column Flat Widget Grid */}
                <InboxGrid
                  tasks={tasks}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedBracket={selectedBracket}
                  onBracketChange={setSelectedBracket}
                  selectedAssignee={selectedAssignee}
                  onAssigneeChange={setSelectedAssignee}
                  selectedRoom={selectedRoom}
                  onRoomChange={setSelectedRoom}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  isSmartGrouped={isSmartGrouped}
                  onToggleSmartGrouping={setIsSmartGrouped}
                  onToggleTask={toggleTaskCompletion}
                  onTaskClick={handleCardClick}
                  onDeleteTask={deleteTask}
                  onAddNewTask={() => {
                    setInitialTaskDate('inbox');
                    setSelectedTaskToEdit(null);
                    setActiveTaskModal(true);
                  }}
                />
              </div>
            )}

            {/* TAB 2: FINANCES & ЖКХ МОСКВЫ & CASHBACK */}
            {activeTab === 'finances' && !isWidgetMode && <FinancesModule />}

            {/* TAB 3: WISHLIST («БЕРЕМ ИЛИ НЕТ?») + РЕМОНТ КВАРТИРЫ + СВИДАНИЯ */}
            {activeTab === 'wishlist' && !isWidgetMode && <WishlistModule />}

            {/* TAB 4: ВШЭ x РУДН x Я-ПРОФИ (КАНБАН + РАДАР ЦФО/ДФО + РАСПИСАНИЕ & БРС + FOCUS ROOM) */}
            {activeTab === 'study-work' && !isWidgetMode && <StudyWorkModule />}

            {/* Drag Overlay for smooth preview */}
            <DragOverlay>
              {activeDraggingTask && (
                <div className="w-64 opacity-95 shadow-2xl">
                  <GlassCard
                    task={activeDraggingTask}
                    onToggle={() => {}}
                    compact
                    isDragging
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </main>
      </div>

      {/* Mobile Navigation Dock for screens < md */}
      {!isWidgetMode && (
        <div className="md:hidden">
          <MobileBottomBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenNewTask={() => {
              setInitialTaskDate('inbox');
              setSelectedTaskToEdit(null);
              setActiveTaskModal(true);
            }}
            onOpenCommandPalette={() => setActiveCommandPalette(true)}
            wishlistBadge={pendingWishlistCount}
          />
        </div>
      )}

      {/* LINEAR-STYLE SLIDE-OVER DRAWER FOR TASKS */}
      <TaskModal
        isOpen={activeTaskModal}
        taskToEdit={selectedTaskToEdit}
        initialDate={initialTaskDate}
        onClose={() => {
          setActiveTaskModal(false);
          setSelectedTaskToEdit(null);
        }}
        onSave={(data) => {
          addTask(data);
          setActiveTaskModal(false);
          setSelectedTaskToEdit(null);
        }}
        onUpdate={(id, updates) => {
          updateTask(id, updates);
          setActiveTaskModal(false);
          setSelectedTaskToEdit(null);
        }}
        onDelete={(id) => {
          deleteTask(id);
          setActiveTaskModal(false);
          setSelectedTaskToEdit(null);
        }}
      />

      {/* OTHER MODALS */}
      <CommandPalette
        isOpen={activeCommandPalette}
        onClose={() => setActiveCommandPalette(false)}
        onSelectTab={setActiveTab}
        onToggleWidgetMode={() => setIsWidgetMode(!isWidgetMode)}
        onOpenSettings={() => setActiveSettingsModal(true)}
      />

      <SettingsModal
        isOpen={activeSettingsModal}
        onClose={() => setActiveSettingsModal(false)}
      />

      <TelegramBridgeModal
        isOpen={activeTelegramModal}
        onClose={() => setActiveTelegramModal(false)}
      />

      <TamagotchiRoomModal
        isOpen={activeTamagotchiModal}
        onClose={() => setActiveTamagotchiModal(false)}
      />
    </div>
  );
};

export default App;
