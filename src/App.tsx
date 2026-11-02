import React, { useState, useEffect } from 'react';
import { useNexusStore } from './store/useNexusStore';
import { Navbar, DashboardTab } from './components/layout/Navbar';
import { ShadcnOverview } from './components/dashboard/ShadcnOverview';
import { ShadcnFinances } from './components/finances/ShadcnFinances';
import { ShadcnWishlist } from './components/wishlist/ShadcnWishlist';
import { ShadcnStudyWork } from './components/study-work/ShadcnStudyWork';
import { ShadcnTaskDialog } from './components/command-center/ShadcnTaskDialog';
import { CatRoomDialog } from './components/visual/CatRoomDialog';
import { CommandPalette } from './components/command-palette/CommandPalette';
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
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* ── Official shadcn/ui Navbar ── */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTask={() => handleOpenNewTask('inbox')}
        onOpenSearch={() => setActiveCommandPalette(true)}
        onOpenCatRoom={() => setActiveCatRoom(true)}
      />

      {/* ── Main Viewport ── */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
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

        {activeTab === 'finances' && <ShadcnFinances />}

        {activeTab === 'wishlist' && <ShadcnWishlist />}

        {activeTab === 'study-work' && <ShadcnStudyWork />}
      </main>

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
        onOpenSettings={() => {}}
      />
    </div>
  );
};

export default App;
