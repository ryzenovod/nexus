import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import confetti from 'canvas-confetti';
import { 
  NexusTask, 
  WishlistItem, 
  FinanceTransaction, 
  JointBudget, 
  CashbackCard, 
  UtilityBill, 
  StudyWorkItem, 
  BracketColor, 
  Assignee, 
  RoomArea, 
  TaskCategory,
  VoteStatus,
  StudySpace,
  SupabaseConfig
} from '../types/nexus';
import { 
  initialTasks, 
  initialWishlist, 
  initialBudget, 
  initialTransactions, 
  initialCashbackCards, 
  initialUtilityBills, 
  initialStudyWorkItems 
} from '../data/initialNexusData';
import { getSupabaseClient } from '../services/supabaseClient';

export interface NexusState {
  // Tasks
  tasks: NexusTask[];
  searchQuery: string;
  selectedBracket: 'all' | BracketColor;
  selectedAssignee: Assignee;
  selectedRoom: RoomArea;
  selectedCategory: 'all' | TaskCategory;
  isSmartGrouped: boolean; // fold into hub room cards vs flat grid
  activeWeekOffset: number; // 0 = current week, 1 = next, -1 = prev

  // Wishlist
  wishlist: WishlistItem[];

  // Finances
  budget: JointBudget;
  transactions: FinanceTransaction[];
  cashbackCards: CashbackCard[];
  utilityBills: UtilityBill[];

  // Study & Work
  studyWorkItems: StudyWorkItem[];
  activeStudySpace: StudySpace;

  // Pomodoro
  pomodoroMode: 'work' | 'shortBreak' | 'longBreak';
  pomodoroTimeLeft: number; // in seconds
  pomodoroIsRunning: boolean;
  pomodoroUser: 'egor' | 'anya' | 'together';
  pomodoroCompletedSessions: number;

  // Supabase Settings
  supabaseConfig: SupabaseConfig;
  isSyncing: boolean;

  // Task Actions
  addTask: (task: Omit<NexusTask, 'id' | 'createdAt' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<NexusTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  moveTaskToDate: (taskId: string, targetDate: string) => void;
  reorderTasks: (tasks: NexusTask[]) => void;

  // Filters
  setSearchQuery: (query: string) => void;
  setSelectedBracket: (bracket: 'all' | BracketColor) => void;
  setSelectedAssignee: (assignee: Assignee) => void;
  setSelectedRoom: (room: RoomArea) => void;
  setSelectedCategory: (category: 'all' | TaskCategory) => void;
  setIsSmartGrouped: (grouped: boolean) => void;
  setActiveWeekOffset: (offset: number) => void;

  // Wishlist Actions
  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'egorVote' | 'anyaVote' | 'status'>) => void;
  voteWishlist: (id: string, user: 'egor' | 'anya', vote: VoteStatus) => void;
  deleteWishlistItem: (id: string) => void;
  convertWishlistToTask: (id: string) => void;

  // Finance Actions
  addTransaction: (tx: Omit<FinanceTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateBudgetContributions: (egor: number, anya: number, target: number) => void;
  toggleCashbackClaimed: (id: string) => void;
  updateMeterReadings: (billId: string, readings: { hotWater?: number; coldWater?: number; electricity?: number }) => void;
  payUtilityBill: (id: string) => void;

  // Study & Work Actions
  addStudyWorkItem: (item: Omit<StudyWorkItem, 'id'>) => void;
  updateStudyWorkStatus: (id: string, status: StudyWorkItem['status']) => void;
  deleteStudyWorkItem: (id: string) => void;
  setActiveStudySpace: (space: StudySpace) => void;

  // Pomodoro Actions
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;
  setPomodoroMode: (mode: 'work' | 'shortBreak' | 'longBreak') => void;
  setPomodoroUser: (user: 'egor' | 'anya' | 'together') => void;

  // Supabase Settings Actions
  setSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  syncWithSupabase: () => Promise<void>;
  resetToDefaultData: () => void;
}

export const useNexusStore = create<NexusState>()(
  persist(
    (set, get) => ({
      // Initial States
      tasks: initialTasks,
      searchQuery: '',
      selectedBracket: 'all',
      selectedAssignee: 'all',
      selectedRoom: 'Все',
      selectedCategory: 'all',
      isSmartGrouped: true,
      activeWeekOffset: 0,

      wishlist: initialWishlist,

      budget: initialBudget,
      transactions: initialTransactions,
      cashbackCards: initialCashbackCards,
      utilityBills: initialUtilityBills,

      studyWorkItems: initialStudyWorkItems,
      activeStudySpace: 'study-anya',

      pomodoroMode: 'work',
      pomodoroTimeLeft: 25 * 60,
      pomodoroIsRunning: false,
      pomodoroUser: 'together',
      pomodoroCompletedSessions: 0,

      supabaseConfig: {
        url: '',
        anonKey: '',
        isConnected: false,
        autoSync: false,
        lastSyncAt: null,
      },
      isSyncing: false,

      // --- Task Actions ---
      addTask: (taskData) => {
        const newTask: NexusTask = {
          ...taskData,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          createdAt: new Date().toISOString(),
          order: get().tasks.length,
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTaskCompletion: (id) => {
        const currentTask = get().tasks.find((t) => t.id === id);
        const willBeCompleted = currentTask ? !currentTask.completed : false;

        if (willBeCompleted) {
          // Play confetti effect
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#22c55e', '#f59e0b', '#38bdf8', '#ef4444'],
            });
          } catch {
            // Safe fallback if canvas is not ready
          }
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: willBeCompleted } : task
          ),
        }));
      },

      moveTaskToDate: (taskId, targetDate) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, date: targetDate } : task
          ),
        }));
      },

      reorderTasks: (newTasks) => {
        set({ tasks: newTasks });
      },

      // --- Filter Actions ---
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedBracket: (bracket) => set({ selectedBracket: bracket }),
      setSelectedAssignee: (assignee) => set({ selectedAssignee: assignee }),
      setSelectedRoom: (room) => set({ selectedRoom: room }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setIsSmartGrouped: (grouped) => set({ isSmartGrouped: grouped }),
      setActiveWeekOffset: (offset) => set({ activeWeekOffset: offset }),

      // --- Wishlist Actions ---
      addWishlistItem: (itemData) => {
        const newItem: WishlistItem = {
          ...itemData,
          id: `wish-${Date.now()}`,
          egorVote: null,
          anyaVote: null,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          wishlist: [newItem, ...state.wishlist],
        }));
      },

      voteWishlist: (id, user, vote) => {
        const item = get().wishlist.find((w) => w.id === id);
        if (!item) return;

        const updatedEgorVote = user === 'egor' ? vote : item.egorVote;
        const updatedAnyaVote = user === 'anya' ? vote : item.anyaVote;

        let status: 'pending' | 'approved' | 'rejected' = item.status;

        // Auto approve when both vote YES
        if (updatedEgorVote === 'yes' && updatedAnyaVote === 'yes') {
          status = 'approved';
          try {
            confetti({
              particleCount: 80,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#22c55e', '#ec4899', '#8b5cf6'],
            });
          } catch {
            // ignore
          }
        } else if (updatedEgorVote === 'no' && updatedAnyaVote === 'no') {
          status = 'rejected';
        } else {
          status = 'pending';
        }

        set((state) => ({
          wishlist: state.wishlist.map((w) =>
            w.id === id
              ? {
                  ...w,
                  egorVote: updatedEgorVote,
                  anyaVote: updatedAnyaVote,
                  status,
                }
              : w
          ),
        }));
      },

      deleteWishlistItem: (id) => {
        set((state) => ({
          wishlist: state.wishlist.filter((w) => w.id !== id),
        }));
      },

      convertWishlistToTask: (id) => {
        const item = get().wishlist.find((w) => w.id === id);
        if (!item) return;

        const newTask: NexusTask = {
          id: `task-from-wish-${Date.now()}`,
          title: `Купить: ${item.title.replace('?', '')}`,
          notes: item.notes || `Одобрено в вишлисте. Бюджет: ${item.estimatedPrice} ₽`,
          completed: false,
          bracketColor: 'active',
          category: '🛒 Покупки',
          room: 'Кухня',
          assignee: 'together',
          date: 'inbox',
          price: item.estimatedPrice,
          link: item.link,
          createdAt: new Date().toISOString(),
          order: 0,
          tags: ['покупки', 'из-вишлиста'],
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks],
          wishlist: state.wishlist.filter((w) => w.id !== id),
        }));

        try {
          confetti({ particleCount: 40, spread: 50 });
        } catch {
          // ignore
        }
      },

      // --- Finance Actions ---
      addTransaction: (txData) => {
        const newTx: FinanceTransaction = {
          ...txData,
          id: `tx-${Date.now()}`,
        };
        set((state) => {
          let updatedBalance = state.budget.currentBalance;
          if (newTx.type === 'expense') {
            updatedBalance -= newTx.amount;
          } else if (newTx.type === 'transfer' || newTx.type === 'income') {
            updatedBalance += newTx.amount;
          }

          return {
            transactions: [newTx, ...state.transactions],
            budget: {
              ...state.budget,
              currentBalance: updatedBalance,
              lastUpdated: new Date().toISOString(),
            },
          };
        });
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },

      updateBudgetContributions: (egor, anya, target) => {
        set((state) => ({
          budget: {
            ...state.budget,
            egorContribution: egor,
            anyaContribution: anya,
            totalTarget: target,
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      toggleCashbackClaimed: (id) => {
        set((state) => ({
          cashbackCards: state.cashbackCards.map((card) =>
            card.id === id ? { ...card, claimed: !card.claimed } : card
          ),
        }));
      },

      updateMeterReadings: (billId, readings) => {
        set((state) => ({
          utilityBills: state.utilityBills.map((bill) =>
            bill.id === billId
              ? {
                  ...bill,
                  currentReadings: { ...bill.currentReadings, ...readings },
                }
              : bill
          ),
        }));
      },

      payUtilityBill: (id) => {
        set((state) => ({
          utilityBills: state.utilityBills.map((bill) =>
            bill.id === id ? { ...bill, status: 'paid' } : bill
          ),
        }));
      },

      // --- Study & Work Actions ---
      addStudyWorkItem: (itemData) => {
        const newItem: StudyWorkItem = {
          ...itemData,
          id: `sw-${Date.now()}`,
        };
        set((state) => ({
          studyWorkItems: [newItem, ...state.studyWorkItems],
        }));
      },

      updateStudyWorkStatus: (id, status) => {
        set((state) => ({
          studyWorkItems: state.studyWorkItems.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        }));
      },

      deleteStudyWorkItem: (id) => {
        set((state) => ({
          studyWorkItems: state.studyWorkItems.filter((item) => item.id !== id),
        }));
      },

      setActiveStudySpace: (space) => set({ activeStudySpace: space }),

      // --- Pomodoro Actions ---
      startPomodoro: () => set({ pomodoroIsRunning: true }),
      pausePomodoro: () => set({ pomodoroIsRunning: false }),
      resetPomodoro: () => {
        const mode = get().pomodoroMode;
        const time = mode === 'work' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
        set({ pomodoroTimeLeft: time, pomodoroIsRunning: false });
      },
      tickPomodoro: () => {
        const { pomodoroTimeLeft, pomodoroIsRunning, pomodoroMode, pomodoroCompletedSessions } = get();
        if (!pomodoroIsRunning) return;

        if (pomodoroTimeLeft > 1) {
          set({ pomodoroTimeLeft: pomodoroTimeLeft - 1 });
        } else {
          // Finished session!
          if (pomodoroMode === 'work') {
            const nextCount = pomodoroCompletedSessions + 1;
            const nextMode = nextCount % 4 === 0 ? 'longBreak' : 'shortBreak';
            const nextTime = nextMode === 'longBreak' ? 15 * 60 : 5 * 60;
            try {
              confetti({ particleCount: 70, spread: 70 });
            } catch {
              // ignore
            }
            set({
              pomodoroCompletedSessions: nextCount,
              pomodoroMode: nextMode,
              pomodoroTimeLeft: nextTime,
              pomodoroIsRunning: false,
            });
          } else {
            set({
              pomodoroMode: 'work',
              pomodoroTimeLeft: 25 * 60,
              pomodoroIsRunning: false,
            });
          }
        }
      },
      setPomodoroMode: (mode) => {
        const time = mode === 'work' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
        set({ pomodoroMode: mode, pomodoroTimeLeft: time, pomodoroIsRunning: false });
      },
      setPomodoroUser: (user) => set({ pomodoroUser: user }),

      // --- Supabase Settings Actions ---
      setSupabaseConfig: (config) => {
        set((state) => ({
          supabaseConfig: { ...state.supabaseConfig, ...config },
        }));
      },

      syncWithSupabase: async () => {
        const { supabaseConfig } = get();
        if (!supabaseConfig.url || !supabaseConfig.anonKey) return;

        set({ isSyncing: true });
        try {
          const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey);
          if (client) {
            // Push tasks to Supabase
            const { tasks } = get();
            for (const task of tasks) {
              await client.from('nexus_tasks').upsert({
                id: task.id,
                title: task.title,
                notes: task.notes,
                completed: task.completed,
                bracket_color: task.bracketColor,
                category: task.category,
                room: task.room,
                assignee: task.assignee,
                date: task.date,
                is_overdue: task.isOverdue,
                is_regular: task.isRegular,
                regular_period: task.regularPeriod,
                is_hub: task.isHub,
                subtask_count: task.subtaskCount,
                price: task.price,
                link: task.link,
                tags: task.tags,
                order: task.order,
              });
            }
            set((state) => ({
              supabaseConfig: {
                ...state.supabaseConfig,
                isConnected: true,
                lastSyncAt: new Date().toISOString(),
              },
            }));
          }
        } catch (e) {
          console.warn('Sync failed:', e);
        } finally {
          set({ isSyncing: false });
        }
      },

      resetToDefaultData: () => {
        set({
          tasks: initialTasks,
          wishlist: initialWishlist,
          budget: initialBudget,
          transactions: initialTransactions,
          cashbackCards: initialCashbackCards,
          utilityBills: initialUtilityBills,
          studyWorkItems: initialStudyWorkItems,
        });
      },
    }),
    {
      name: 'nexus-couple-os-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
