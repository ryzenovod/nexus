import React, { useState, useEffect } from 'react';
import { useNexusStore } from './store/useNexusStore';
import { Navbar, DashboardTab } from './components/layout/Navbar';
import type { NexusTask } from './types/nexus';

// Open-source React.lazy code splitting. Heavy routes and dialogs load on demand.
const ShadcnOverview = React.lazy(() => import('./components/dashboard/ShadcnOverview').then(m => ({ default: m.ShadcnOverview })));
const NexusFinanceHub = React.lazy(() => import('./components/finances/NexusFinanceHub').then(m => ({ default: m.NexusFinanceHub })));
const ShadcnWishlist = React.lazy(() => import('./components/wishlist/ShadcnWishlist').then(m => ({ default: m.ShadcnWishlist })));
const ShadcnStudyWork = React.lazy(() => import('./components/study-work/ShadcnStudyWork').then(m => ({ default: m.ShadcnStudyWork })));
const ShadcnTaskDialog = React.lazy(() => import('./components/command-center/ShadcnTaskDialog').then(m => ({ default: m.ShadcnTaskDialog })));
const CatRoomDialog = React.lazy(() => import('./components/visual/CatRoomDialog').then(m => ({ default: m.CatRoomDialog })));
const CommandPalette = React.lazy(() => import('./components/command-palette/CommandPalette').then(m => ({ default: m.CommandPalette })));
const SettingsModal = React.lazy(() => import('./components/settings/SettingsModal').then(m => ({ default: m.SettingsModal })));

export const App: React.FC = () => {
  const {
    tasks,
    selectedAssignee,
    setSelectedAssignee,
    activeWeekOffset,
    setActiveWeekOffset,
    toggleTaskCompletion,
    addTask,
    updateTask,
    deleteTask,
    syncWithLivePipeline,
  } = useNexusStore();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [activeTaskDialog, setActiveTaskDialog] = useState(false);
  const [activeCatRoom, setActiveCatRoom] = useState(false);
  const [selectedTaskToEdit, setSelectedTaskToEdit] = useState<NexusTask | null>(null);
  const [initialTaskDate, setInitialTaskDate] = useState<string>('inbox');
  const [activeCommandPalette, setActiveCommandPalette] = useState(false);
  const [activeSettings, setActiveSettings] = useState(false);

  // Background live data sync on mount
  useEffect(() => {
    syncWithLivePipeline();
  }, [syncWithLivePipeline]);

  // Global hotkeys: 1-4 for tabs, 'n' for new task, ⌘K for search
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

      if (e.key === '1') setActiveTab('overview');
      if (e.key === '2') setActiveTab('finances');
      if (e.key === '3') setActiveTab('wishlist');
      if (e.key === '4') setActiveTab('study-work');
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setInitialTaskDate('inbox');
        setSelectedTaskToEdit(null);
        setActiveTaskDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewTask = (date: string = 'inbox') => {
    setInitialTaskDate(date);
    setSelectedTaskToEdit(null);
    setActiveTaskDialog(true);
  };

  const handleTaskClick = (task: NexusTask) => {
    setSelectedTaskToEdit(task);
    setActiveTaskDialog(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      <div className="relative z-10 flex flex-col flex-1">
        {/* ── Official shadcn/ui Navbar ── */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenNewTask={() => handleOpenNewTask('inbox')}
          onOpenSearch={() => setActiveCommandPalette(true)}
          onOpenCatRoom={() => setActiveCatRoom(true)}
          onOpenSettings={() => setActiveSettings(true)}
        />

        {/* ── Main Viewport ── */}
        <main className="flex-1 flex flex-col relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full pt-7 md:pt-9">
          <React.Suspense fallback={<div role="status" className="flex min-h-48 items-center justify-center text-sm text-zinc-400">Загрузка раздела NEXUS…</div>}>
          <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out w-full">
            {activeTab === 'overview' && (
              <ShadcnOverview
                tasks={tasks}
                onToggleTask={toggleTaskCompletion}
                onTaskClick={handleTaskClick}
                onAddTask={(date) => handleOpenNewTask(date || 'inbox')}
                onDeleteTask={deleteTask}
                activeWeekOffset={activeWeekOffset}
                onOffsetChange={setActiveWeekOffset}
                selectedAssignee={selectedAssignee}
                onAssigneeChange={setSelectedAssignee}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'finances' && <NexusFinanceHub />}

            {activeTab === 'wishlist' && <ShadcnWishlist />}

            {activeTab === 'study-work' && <ShadcnStudyWork />}
          </div>
          </React.Suspense>
        </main>
      </div>

      <React.Suspense fallback={null}>
      {/* ── shadcn Task Modal Dialog ── */}
      {activeTaskDialog && <ShadcnTaskDialog
        isOpen={activeTaskDialog}
        taskToEdit={selectedTaskToEdit}
        initialDate={initialTaskDate}
        onClose={() => {
          setActiveTaskDialog(false);
          setSelectedTaskToEdit(null);
        }}
        onSave={(data) => {
          addTask(data);
          setActiveTaskDialog(false);
          setSelectedTaskToEdit(null);
        }}
        onUpdate={(id, updates) => {
          updateTask(id, updates);
          setActiveTaskDialog(false);
          setSelectedTaskToEdit(null);
        }}
        onDelete={(id) => {
          deleteTask(id);
          setActiveTaskDialog(false);
          setSelectedTaskToEdit(null);
        }}
      />}

      {/* ── Room of Cyber Cat Mascot Dialog ── */}
      {activeCatRoom && <CatRoomDialog
        isOpen={activeCatRoom}
        onClose={() => setActiveCatRoom(false)}
      />}

      {/* ── Command Palette (⌘K) ── */}
      {activeCommandPalette && <CommandPalette
        isOpen={activeCommandPalette}
        onClose={() => setActiveCommandPalette(false)}
        onSelectTab={(tab) => {
          if (tab === 'command-center') setActiveTab('overview');
          else if (tab === 'finances') setActiveTab('finances');
          else if (tab === 'wishlist') setActiveTab('wishlist');
          else if (tab === 'study-work') setActiveTab('study-work');
        }}
        onToggleWidgetMode={() => {}}
        onOpenSettings={() => setActiveSettings(true)}
      />}

      {/* ── Settings & Supabase Modal ── */}
      {activeSettings && <SettingsModal
        isOpen={activeSettings}
        onClose={() => setActiveSettings(false)}
      />}
      </React.Suspense>
    </div>
  );
};

export default App;
