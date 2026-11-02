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
import { Plus } from 'lucide-react';
import { useNexusStore } from './store/useNexusStore';
import { DynamicIslandHeader } from './components/navigation/DynamicIslandHeader';
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
import { LinearCommandCenter } from './components/command-center/LinearCommandCenter';
import { BentoDashboard } from './components/dashboard/BentoDashboard';
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
    syncWithLivePipeline,
  } = useNexusStore();

  // Automatic background live data sync on mount
  useEffect(() => {
    syncWithLivePipeline();
  }, [syncWithLivePipeline]);

  const [activeTab, setActiveTab] = useState<NexusTab>('command-center');
  const [activeTaskModal, setActiveTaskModal] = useState(false);
  const [selectedTaskToEdit, setSelectedTaskToEdit] = useState<NexusTask | null>(null);
  const [initialTaskDate, setInitialTaskDate] = useState<string>('inbox');
  const [activeCommandPalette, setActiveCommandPalette] = useState(false);
  const [activeSettingsModal, setActiveSettingsModal] = useState(false);
  const [activeTelegramModal, setActiveTelegramModal] = useState(false);
  const [activeTamagotchiModal, setActiveTamagotchiModal] = useState(false);
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
      className={`h-screen w-screen overflow-hidden flex flex-col select-none antialiased font-sans text-[#ededef] relative ${
        atmosphereMode === 'transparent' || isWidgetMode
          ? 'bg-transparent'
          : 'bg-[#050507]'
      }`}
    >
      {/* Aurora Spatial Mesh with rich atmospheric lighting */}
      {!isWidgetMode && atmosphereMode !== 'transparent' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top indigo/purple aurora sphere */}
          <div
            className="absolute -top-[12%] left-[15%] w-[68vw] h-[52vw] rounded-full blur-[130px] opacity-45"
            style={{
              background:
                'radial-gradient(circle, rgba(99, 102, 241, 0.42) 0%, rgba(139, 92, 246, 0.20) 45%, transparent 75%)',
            }}
          />
          {/* Top-right warm amber sphere */}
          <div
            className="absolute -top-[8%] -right-[5%] w-[48vw] h-[48vw] rounded-full blur-[140px] opacity-40"
            style={{
              background:
                'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.14) 50%, transparent 75%)',
            }}
          />
          {/* Bottom emerald/cyan sphere */}
          <div
            className="absolute -bottom-[15%] left-[22%] w-[62vw] h-[52vw] rounded-full blur-[150px] opacity-35"
            style={{
              background:
                'radial-gradient(circle, rgba(16, 185, 129, 0.30) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 75%)',
            }}
          />
        </div>
      )}

      {/* Procedural Animated Canvas: Starry Twilight with subtle depth */}
      <StarryTwilightCanvas mode={atmosphereMode} />

      {/* Floating Dynamic Island Header (Linear / Apple VisionOS style) */}
      {!isWidgetMode && (
        <DynamicIslandHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCommandPalette={() => setActiveCommandPalette(true)}
          onOpenNewTask={() => {
            setInitialTaskDate('inbox');
            setSelectedTaskToEdit(null);
            setActiveTaskModal(true);
          }}
          onOpenTamagotchi={() => setActiveTamagotchiModal(true)}
          wishlistPendingCount={pendingWishlistCount}
        />
      )}

      {/* Full-width Main Content Viewport */}
      <main
        className={`flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative z-10 transition-all ${
          isWidgetMode
            ? 'h-screen p-2 bg-transparent'
            : 'px-2 sm:px-4 pb-2 pt-1'
        }`}
      >
        {/* TAB 1: COMMAND CENTER / DASHBOARD */}
        {(activeTab === 'command-center' || isWidgetMode) && (
          <BentoDashboard
            tasks={tasks}
            activeWeekOffset={activeWeekOffset}
            onOffsetChange={setActiveWeekOffset}
            onToggleTask={toggleTaskCompletion}
            onTaskClick={handleCardClick}
            onDeleteTask={deleteTask}
            onAddTask={(date) => {
              setInitialTaskDate(date || 'inbox');
              setSelectedTaskToEdit(null);
              setActiveTaskModal(true);
            }}
            selectedAssignee={selectedAssignee}
            onAssigneeChange={setSelectedAssignee}
            onNavigateTab={setActiveTab}
            onOpenTamagotchi={() => setActiveTamagotchiModal(true)}
            isWidgetMode={isWidgetMode}
          />
        )}

        {/* TAB 2: FINANCES & ЖКХ МОСКВЫ & CASHBACK */}
        {activeTab === 'finances' && !isWidgetMode && (
          <div className="h-full flex flex-col min-h-0 overflow-hidden rounded-[14px] bg-[#12161f]/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 [scrollbar-width:thin]">
              <FinancesModule />
            </div>
          </div>
        )}

        {/* TAB 3: WISHLIST («БЕРЕМ ИЛИ НЕТ?») + РЕМОНТ КВАРТИРЫ + СВИДАНИЯ */}
        {activeTab === 'wishlist' && !isWidgetMode && (
          <div className="h-full flex flex-col min-h-0 overflow-hidden rounded-[14px] bg-[#12161f]/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 [scrollbar-width:thin]">
              <WishlistModule />
            </div>
          </div>
        )}

        {/* TAB 4: ВШЭ x РУДН x Я-ПРОФИ (КАНБАН + РАДАР ЦФО/ДФО + РАСПИСАНИЕ & БРС) */}
        {activeTab === 'study-work' && !isWidgetMode && (
          <div className="h-full flex flex-col min-h-0 overflow-hidden rounded-[14px] bg-[#12161f]/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 [scrollbar-width:thin]">
              <StudyWorkModule />
            </div>
          </div>
        )}
      </main>

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
