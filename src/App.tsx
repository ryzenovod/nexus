import React, { useState, useEffect } from 'react';
import { useNexusStore } from './store/useNexusStore';
import { Navbar, DashboardTab } from './components/layout/Navbar';
import { ShadcnOverview } from './components/dashboard/ShadcnOverview';
import { NexusFinanceHub } from './components/finances/NexusFinanceHub';
import { ShadcnWishlist } from './components/wishlist/ShadcnWishlist';
import { ShadcnStudyWork } from './components/study-work/ShadcnStudyWork';
import { ShadcnTaskDialog } from './components/command-center/ShadcnTaskDialog';
import { CatRoomDialog } from './components/visual/CatRoomDialog';
import { CommandPalette } from './components/command-palette/CommandPalette';
import { SettingsModal } from './components/settings/SettingsModal';
import { NexusTask } from './types/nexus';

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
    <div className="min-h-screen nexus-ambient-bg text-foreground flex flex-col antialiased relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient layer */}
      <div className="nexus-ambient-bg pointer-events-none fixed inset-0 z-0" />

      {/* Subtle delicate stars layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8%" cy="12%" r="1" fill="#fff" opacity="0.6" />
          <circle cx="22%" cy="6%" r="1" fill="#fff" opacity="0.7" />
          <circle cx="38%" cy="18%" r="0.8" fill="#fff" opacity="0.5" />
          <circle cx="58%" cy="10%" r="1.2" fill="#fff" opacity="0.65" />
          <circle cx="75%" cy="20%" r="0.8" fill="#fff" opacity="0.5" />
          <circle cx="90%" cy="7%" r="1.1" fill="#fff" opacity="0.7" />
          <circle cx="15%" cy="38%" r="0.8" fill="#fff" opacity="0.4" />
          <circle cx="82%" cy="45%" r="1" fill="#fff" opacity="0.5" />
          <circle cx="30%" cy="65%" r="1" fill="#fff" opacity="0.55" />
          <circle cx="85%" cy="75%" r="0.8" fill="#fff" opacity="0.4" />
        </svg>
      </div>

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
        <main className="flex-1 flex flex-col relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full pt-6 overflow-y-auto">
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
        </main>
      </div>

      {/* ── shadcn Task Modal Dialog ── */}
      <ShadcnTaskDialog
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
      />

      {/* ── Room of Cyber Cat Mascot Dialog ── */}
      <CatRoomDialog
        isOpen={activeCatRoom}
        onClose={() => setActiveCatRoom(false)}
      />

      {/* ── Command Palette (⌘K) ── */}
      <CommandPalette
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
      />

      {/* ── Settings & Supabase Modal ── */}
      <SettingsModal
        isOpen={activeSettings}
        onClose={() => setActiveSettings(false)}
      />
    </div>
  );
};

export default App;
