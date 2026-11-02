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
      className={`h-screen w-screen overflow-hidden flex select-none antialiased font-sans text-[#ededef] relative ${
        atmosphereMode === 'transparent' || isWidgetMode
          ? 'bg-transparent'
          : 'bg-[#08080a]'
      }`}
    >
      {/* Soft Apple/Craft ambient glow */}
      {!isWidgetMode && atmosphereMode !== 'transparent' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Soft indigo glow top-center */}
          <div
            className="absolute -top-[15%] left-[20%] w-[60vw] h-[50vw] rounded-full blur-[140px] opacity-40"
            style={{
              background:
                'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.08) 40%, transparent 70%)',
            }}
          />
          {/* Warm twilight amber glow top-right */}
          <div
            className="absolute -top-[10%] -right-[5%] w-[45vw] h-[45vw] rounded-full blur-[150px] opacity-35"
            style={{
              background:
                'radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, rgba(245, 158, 11, 0.04) 50%, transparent 70%)',
            }}
          />
        </div>
      )}

      {/* Procedural Animated Canvas: Starry Twilight with subtle depth */}
      <StarryTwilightCanvas mode={atmosphereMode} />

      {/* 1. DESKTOP APP SHELL - LEFT SIDEBAR (No border-r, native Linear look) */}
      {!isWidgetMode && (
        <div className="hidden md:flex relative z-10">
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

      {/* 2. FLOATING INSET CANVAS (The Linear / Amie Signature Inset Panel Architecture) */}
      <main
        className={`flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 transition-all ${
          isWidgetMode
            ? 'h-screen p-2 bg-transparent'
            : 'my-2 mr-2 rounded-[10px] bg-[#0f1014] border border-[#1e2028] shadow-[0_0_0_1px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.04)]'
        }`}
      >
        {/* TAB 1: BENTO DASHBOARD (Top Row 135px + Amie Week Ribbon + 3 Life Spheres) */}
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
          <div className="h-full flex flex-col min-h-0 overflow-hidden">
            <div className="h-[44px] px-4 border-b border-[#1c1d24] flex items-center justify-between shrink-0 bg-[#0f1014]">
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#ededef]">
                <span className="text-[#8a8f98]">NEXUS</span>
                <span className="text-[#5e636e]">›</span>
                <span>Финансы & ЖКХ Москвы</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 [scrollbar-width:thin]">
              <FinancesModule />
            </div>
          </div>
        )}

        {/* TAB 3: WISHLIST («БЕРЕМ ИЛИ НЕТ?») + РЕМОНТ КВАРТИРЫ + СВИДАНИЯ */}
        {activeTab === 'wishlist' && !isWidgetMode && (
          <div className="h-full flex flex-col min-h-0 overflow-hidden">
            <div className="h-[44px] px-4 border-b border-[#1c1d24] flex items-center justify-between shrink-0 bg-[#0f1014]">
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#ededef]">
                <span className="text-[#8a8f98]">NEXUS</span>
                <span className="text-[#5e636e]">›</span>
                <span>Вишлист & Интерактивный План</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 [scrollbar-width:thin]">
              <WishlistModule />
            </div>
          </div>
        )}

        {/* TAB 4: ВШЭ x РУДН x Я-ПРОФИ (КАНБАН + РАДАР ЦФО/ДФО + РАСПИСАНИЕ & БРС) */}
        {activeTab === 'study-work' && !isWidgetMode && (
          <div className="h-full flex flex-col min-h-0 overflow-hidden">
            <div className="h-[44px] px-4 border-b border-[#1c1d24] flex items-center justify-between shrink-0 bg-[#0f1014]">
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#ededef]">
                <span className="text-[#8a8f98]">NEXUS</span>
                <span className="text-[#5e636e]">›</span>
                <span>Учеба & Я-Профессионал</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 [scrollbar-width:thin]">
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
