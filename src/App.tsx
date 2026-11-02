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
import { useNexusStore } from './store/useNexusStore';
import { Header } from './components/navigation/Header';
import { TabNav, NexusTab } from './components/navigation/TabNav';
import { MobileBottomBar } from './components/navigation/MobileBottomBar';
import { WeekPlanner } from './components/command-center/WeekPlanner';
import { InboxGrid } from './components/command-center/InboxGrid';
import { TaskModal } from './components/command-center/TaskModal';
import { FinancesModule } from './components/finances/FinancesModule';
import { WishlistModule } from './components/wishlist/WishlistModule';
import { StudyWorkModule } from './components/study-work/StudyWorkModule';
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
    deleteTask,
    addTask,
    updateTask,
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
  const [activeDraggingTask, setActiveDraggingTask] = useState<NexusTask | null>(null);

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

  // Keyboard shortcut listener for numbers 1-5 for tab switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '1') setActiveTab('command-center');
      if (e.key === '2') setActiveTab('finances');
      if (e.key === '3') setActiveTab('wishlist');
      if (e.key === '4') setActiveTab('study-work');
      if (e.key === '5') setActiveTab('pomodoro');
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

  return (
    <div
      className={`relative min-h-screen text-zinc-100 transition-colors ${
        atmosphereMode === 'transparent' || isWidgetMode
          ? 'bg-transparent overflow-hidden'
          : 'bg-[#090714]'
      }`}
    >
      {/* Procedural Animated Canvas: Starry Twilight & Shooting Stars */}
      <StarryTwilightCanvas mode={atmosphereMode} />

      {/* Main Top Header */}
      {!isWidgetMode && (
        <div className="relative z-30">
          <Header
            onOpenSettings={() => setActiveSettingsModal(true)}
            onOpenCommandPalette={() => setActiveCommandPalette(true)}
            onOpenNewTask={() => {
              setInitialTaskDate('inbox');
              setSelectedTaskToEdit(null);
              setActiveTaskModal(true);
            }}
            isWidgetMode={isWidgetMode}
            onToggleWidgetMode={() => setIsWidgetMode(!isWidgetMode)}
          />

          <TabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            wishlistPendingCount={pendingWishlistCount}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main
        className={`relative z-10 mx-auto max-w-[1720px] pb-24 md:pb-12 ${
          isWidgetMode ? 'p-3' : 'p-4 sm:p-6'
        }`}
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* TAB 1: COMMAND CENTER */}
          {(activeTab === 'command-center' || isWidgetMode) && (
            <div className="space-y-6">
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

              {/* Lower Section: 4-Column Inbox & Backlog Grid */}
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

          {/* TAB 2: FINANCES & ЖКХ МОСКВЫ & CASHBACK ADVISOR */}
          {activeTab === 'finances' && !isWidgetMode && <FinancesModule />}

          {/* TAB 3: WISHLIST («БЕРЕМ ИЛИ НЕТ? 🐾») */}
          {activeTab === 'wishlist' && !isWidgetMode && <WishlistModule />}

          {/* TAB 4 & 5: ВШЭ x РУДН x Я-ПРОФИ & COZY FOCUS ROOM */}
          {(activeTab === 'study-work' || activeTab === 'pomodoro') && !isWidgetMode && (
            <StudyWorkModule />
          )}

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

      {/* Mobile Navigation Dock */}
      {!isWidgetMode && (
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
      )}

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={activeTaskModal}
        onClose={() => setActiveTaskModal(false)}
        taskToEdit={selectedTaskToEdit}
        initialDate={initialTaskDate}
        onSave={(data) => addTask(data)}
        onUpdate={(id, updates) => updateTask(id, updates)}
        onDelete={(id) => deleteTask(id)}
      />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={activeCommandPalette}
        onClose={() => setActiveCommandPalette(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onToggleWidgetMode={() => setIsWidgetMode(!isWidgetMode)}
        onOpenSettings={() => {
          setActiveCommandPalette(false);
          setActiveSettingsModal(true);
        }}
      />

      {/* Settings & Supabase Connection Modal */}
      <SettingsModal
        isOpen={activeSettingsModal}
        onClose={() => setActiveSettingsModal(false)}
      />
    </div>
  );
};

export default App;
