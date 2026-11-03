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
  StudySpaceColumn,
  BracketColor, 
  Assignee, 
  RoomArea, 
  TaskCategory,
  VoteStatus,
  StudySpace,
  SupabaseConfig,
  CoupleGamification,
  AtmosphereMode,
  TelegramConfig,
  BlueprintPin,
  DateScenario,
  HSECourseCalculator,
  RUDNSubjectBRS,
  GCalEvent
} from '../types/nexus';
import { 
  initialTasks, 
  initialWishlist, 
  initialBudget, 
  initialTransactions, 
  initialCashbackCards, 
  initialUtilityBills, 
  initialStudyWorkItems,
  initialCoupleGamification,
  initialGcalEvents
} from '../data/nexusInitialData';
import {
  initialBlueprintPins,
  initialDateScenarios,
  initialHSECalculators,
  initialRUDNSubjects
} from '../data/blueprintAndDatesData';
import { 
  getSupabaseClient, 
  executeBidirectionalSync,
  fetchNexusSyncFeed,
  pushSharedStateToNexusSync
} from '../services/supabaseClient';
import { cozyAudio } from '../utils/CozyAudioSynthesizer';
import { soundEffects } from '../utils/soundEffects';
import { telegramBotService } from '../services/telegramBotService';

export interface NexusState {
  // Tasks
  tasks: NexusTask[];
  gcalEvents: GCalEvent[];
  searchQuery: string;
  selectedBracket: 'all' | BracketColor;
  selectedAssignee: Assignee;
  selectedRoom: RoomArea;
  selectedCategory: 'all' | TaskCategory;
  isSmartGrouped: boolean;
  activeWeekOffset: number;
  isSyncingLive: boolean;
  lastSyncTime: string | null;

  // Atmosphere & Sound
  atmosphereMode: AtmosphereMode;
  soundAmbiance: 'off' | 'rain' | 'fireplace' | 'chimes';
  soundMuted: boolean;

  // Gamification & Mascot
  gamification: CoupleGamification;

  // Blueprint & Home Repair
  blueprintPins: BlueprintPin[];
  selectedBlueprintRoom: RoomArea;

  // Date Night Roulette
  dateScenarios: DateScenario[];

  // Academic Calculators
  hseCalculators: HSECourseCalculator[];
  rudnSubjects: RUDNSubjectBRS[];

  // Telegram Bridge
  telegramConfig: TelegramConfig;
  isTelegramSyncing: boolean;

  // Wishlist
  wishlist: WishlistItem[];

  // Finances
  budget: JointBudget;
  transactions: FinanceTransaction[];
  cashbackCards: CashbackCard[];
  utilityBills: UtilityBill[];
  completedTaskIds: string[];
  deletedTaskIds: string[];
  gpbCashbackClaimed: boolean;

  // Study & Work
  studyWorkItems: StudyWorkItem[];
  customStudySpaces: StudySpaceColumn[];
  activeStudySpace: string;

  // Pomodoro
  pomodoroMode: 'work' | 'shortBreak' | 'longBreak';
  pomodoroTimeLeft: number;
  pomodoroIsRunning: boolean;
  pomodoroUser: 'egor' | 'anya' | 'together';
  pomodoroCompletedSessions: number;

  // Supabase
  supabaseConfig: SupabaseConfig;
  isSyncing: boolean;

  // Actions
  addTask: (task: Omit<NexusTask, 'id' | 'createdAt' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<NexusTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  moveTaskToDate: (taskId: string, targetDate: string) => void;
  reorderTasks: (tasks: NexusTask[]) => void;

  setSearchQuery: (query: string) => void;
  setSelectedBracket: (bracket: 'all' | BracketColor) => void;
  setSelectedAssignee: (assignee: Assignee) => void;
  setSelectedRoom: (room: RoomArea) => void;
  setSelectedCategory: (category: 'all' | TaskCategory) => void;
  setIsSmartGrouped: (grouped: boolean) => void;
  setActiveWeekOffset: (offset: number) => void;

  setAtmosphereMode: (mode: AtmosphereMode) => void;
  setSoundAmbiance: (mode: 'off' | 'rain' | 'fireplace' | 'chimes') => void;
  setSoundMuted: (muted: boolean) => void;

  addXp: (amount: number) => void;
  equipCosmetic: (cosmetic: CoupleGamification['equippedCosmetic']) => void;
  feedMascot: () => void;

  // Blueprint Actions
  setSelectedBlueprintRoom: (room: RoomArea) => void;
  updatePinStatus: (id: string, status: BlueprintPin['status']) => void;
  addBlueprintPin: (pin: Omit<BlueprintPin, 'id'>) => void;

  // Date Actions
  scheduleDateScenario: (scenario: DateScenario, targetDate?: string) => void;

  // Academic Actions
  updateHSEComponentScore: (calcId: string, compId: string, score: number) => void;
  updateHSEComponentWeight: (calcId: string, compId: string, weight: number) => void;
  updateRUDNSubjectScore: (subjId: string, field: 'currentControl' | 'milestoneControl' | 'finalExam', value: number) => void;
  importCalendarTasks: (newTasks: NexusTask[]) => void;

  // Telegram Actions
  setTelegramConfig: (config: Partial<TelegramConfig>) => void;
  syncTelegramMessages: () => Promise<{ addedCount: number }>;
  sendTelegramPush: (type: 'shopping' | 'utilities' | 'test', extraText?: string) => Promise<{ success: boolean; error?: string }>;

  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'egorVote' | 'anyaVote' | 'status'>) => void;
  updateWishlistItem: (id: string, updates: Partial<WishlistItem>) => void;
  voteWishlist: (id: string, user: 'egor' | 'anya', vote: VoteStatus) => void;
  deleteWishlistItem: (id: string) => void;
  convertWishlistToTask: (id: string) => void;

  addTransaction: (tx: Omit<FinanceTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateBudgetContributions: (egor: number, anya: number, target: number) => void;
  claimGpbCashback: (amount: number) => void;
  claimCashbackForCard: (cardId: string, amount: number, taskTitle?: string) => void;
  updateBudgetBalance: (balance: number) => void;
  addCashbackCard: (card: Omit<CashbackCard, 'id'> & { id?: string }) => void;
  updateCashbackCard: (id: string, updates: Partial<CashbackCard>) => void;
  deleteCashbackCard: (id: string) => void;
  toggleCashbackClaimed: (id: string) => void;
  addCashbackCategory: (cardId: string, category: string, percent: number) => void;
  removeCashbackCategory: (cardId: string, categoryIndex: number) => void;
  updateMeterReadings: (billId: string, readings: { hotWater?: number; coldWater?: number; electricity?: number }) => void;
  payUtilityBill: (id: string) => void;

  // Live Data Pipeline Sync
  setGcalEvents: (events: GCalEvent[]) => void;
  syncWithLivePipeline: () => Promise<{ success: boolean; count?: number; error?: string; source?: string }>;
  pushCloudState: () => Promise<boolean>;
  saveSupabaseToLocalEnv: (url: string, key: string) => Promise<{ success: boolean; message?: string }>;

  addStudyWorkItem: (item: Omit<StudyWorkItem, 'id'>) => void;
  updateStudyWorkItem: (id: string, updates: Partial<StudyWorkItem>) => void;
  updateStudyWorkStatus: (id: string, status: StudyWorkItem['status']) => void;
  deleteStudyWorkItem: (id: string) => void;
  toggleStudyWorkSubtask: (itemId: string, subtaskId: string) => void;
  addStudyWorkSubtask: (itemId: string, title: string) => void;
  deleteStudyWorkSubtask: (itemId: string, subtaskId: string) => void;
  addStudySpace: (space: StudySpaceColumn) => void;
  deleteStudySpace: (spaceId: string) => void;
  setActiveStudySpace: (space: string) => void;

  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;
  setPomodoroMode: (mode: 'work' | 'shortBreak' | 'longBreak') => void;
  setPomodoroUser: (user: 'egor' | 'anya' | 'together') => void;

  setSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  syncWithSupabase: () => Promise<void>;
  resetToDefaultData: () => void;
}

export const useNexusStore = create<NexusState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: initialTasks,
      gcalEvents: initialGcalEvents,
      searchQuery: '',
      selectedBracket: 'all',
      selectedAssignee: 'all',
      selectedRoom: 'Все',
      selectedCategory: 'all',
      isSmartGrouped: false,
      activeWeekOffset: 0,
      isSyncingLive: false,
      lastSyncTime: null,

      atmosphereMode: 'twilight',
      soundAmbiance: 'off',
      soundMuted: false,

      gamification: initialCoupleGamification,

      // Blueprint & Repair
      blueprintPins: initialBlueprintPins,
      selectedBlueprintRoom: 'Ванная',

      // Date Scenarios
      dateScenarios: initialDateScenarios,

      // Academic Calculators
      hseCalculators: initialHSECalculators,
      rudnSubjects: initialRUDNSubjects,

      // Telegram Bridge
      telegramConfig: {
        botToken: '',
        chatIdEgor: '',
        chatIdAnya: '',
        chatIdJoint: '',
        isConnected: false,
        autoNotifyWishlist: true,
        autoNotifyTasks: true,
        autoNotifyUtilities: true,
      },
      isTelegramSyncing: false,

      wishlist: initialWishlist,

      budget: initialBudget,
      transactions: initialTransactions,
      cashbackCards: initialCashbackCards,
      utilityBills: initialUtilityBills,
      completedTaskIds: [],
      deletedTaskIds: [],
      gpbCashbackClaimed: false,

      studyWorkItems: initialStudyWorkItems,
      customStudySpaces: [],
      activeStudySpace: 'yaprofi-dfo',

      pomodoroMode: 'work',
      pomodoroTimeLeft: 25 * 60,
      pomodoroIsRunning: false,
      pomodoroUser: 'together',
      pomodoroCompletedSessions: 0,

      supabaseConfig: {
        url: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || 'https://sdkuyfcjmwtcevsyvbwl.supabase.co',
        anonKey: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) || 'sb_publishable_DUr8B1CJtEw-0ZMSACL-2A_mJMG4LD1',
        isConnected: true,
        autoSync: true,
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
        get().pushCloudState().catch(() => {});
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
        get().pushCloudState().catch(() => {});
      },

      deleteTask: (id) => {
        set((state) => ({
          deletedTaskIds: Array.from(new Set([...state.deletedTaskIds, id])),
          completedTaskIds: state.completedTaskIds.filter((tid) => tid !== id),
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
        get().pushCloudState().catch(() => {});
      },

      toggleTaskCompletion: (id) => {
        const currentTask = get().tasks.find((t) => t.id === id);
        const willBeCompleted = currentTask ? !currentTask.completed : false;

        if (willBeCompleted) {
          // 1. Confetti burst
          try {
            confetti({
              particleCount: 55,
              spread: 65,
              origin: { y: 0.8 },
              colors: ['#a855f7', '#ec4899', '#f59e0b', '#22c55e', '#38bdf8'],
            });
          } catch {
            // safe fallback
          }

          // 2. Dispatch event for shooting star meteor in StarryTwilightCanvas
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nexus-task-completed'));
          }

          // 3. Play cozy celebration audio chime & procedural sound effect
          try {
            soundEffects.playSuccess();
            cozyAudio.playCelebrationChime();
          } catch {
            // audio context fallback
          }

          // 4. Grant XP to couple gamification (+25 XP) + 1 treat for Cyber-Cat
          get().addXp(25);
          set((state) => ({
            gamification: {
              ...state.gamification,
              treats: (state.gamification.treats || 0) + 1,
            },
          }));

          // 5. Telegram push notification to partner if enabled
          const { telegramConfig } = get();
          if (telegramConfig.isConnected && telegramConfig.autoNotifyTasks && telegramConfig.botToken && currentTask) {
            const partnerChatId = currentTask.assignee === 'egor'
              ? (telegramConfig.chatIdAnya || telegramConfig.chatIdJoint)
              : (telegramConfig.chatIdEgor || telegramConfig.chatIdJoint);

            if (partnerChatId) {
              const msg = telegramBotService.formatTaskCompletedMessage(currentTask.title, currentTask.assignee, 25);
              telegramBotService.sendMessage(telegramConfig.botToken, partnerChatId, msg).catch(() => {});
            }
          }

          // 6. Real TickTick completion via local dev bridge or Supabase cloud queue
          const pid = (currentTask as any)?.projectId || '6abeae1535d42cc80be02175';
          fetch('/api/ticktick/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: id, projectId: pid }),
          }).catch(() => {});

          // Remote queue push for mobile devices (iPhone, Android, Windows)
          const { supabaseConfig } = get();
          if (supabaseConfig.url && supabaseConfig.anonKey) {
            pushSharedStateToNexusSync(supabaseConfig.url, supabaseConfig.anonKey, {
              pendingTickTickCompletions: [{ projectId: pid, taskId: id, timestamp: Date.now() }],
            }).catch(() => {});
          }
        }

        set((state) => {
          const updatedCompleted = willBeCompleted
            ? Array.from(new Set([...state.completedTaskIds, id]))
            : state.completedTaskIds.filter((tid) => tid !== id);

          return {
            completedTaskIds: updatedCompleted,
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, completed: willBeCompleted } : task
            ),
          };
        });
        get().pushCloudState().catch(() => {});
      },

      moveTaskToDate: (taskId, targetDate) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, date: targetDate } : task
          ),
        }));
        get().pushCloudState().catch(() => {});
      },

      reorderTasks: (newTasks) => {
        set({ tasks: newTasks });
      },

      // --- Atmosphere & Sound Actions ---
      setAtmosphereMode: (mode) => set({ atmosphereMode: mode }),
      setSoundAmbiance: (mode) => {
        if (mode === 'rain') {
          cozyAudio.startRain();
        } else if (mode === 'fireplace') {
          cozyAudio.startFireplace();
        } else if (mode === 'chimes') {
          cozyAudio.startChimes();
        } else {
          cozyAudio.stop();
        }
        set({ soundAmbiance: mode });
      },

      // --- Gamification Actions ---
      addXp: (amount) => {
        set((state) => {
          let { level, levelTitle, xp, nextLevelXp, unlockedCosmetics } = state.gamification;
          let newXp = xp + amount;

          // Level up titles
          const levelTitles: Record<number, string> = {
            1: 'Новоселы в Москве',
            2: 'Уютный Тандем',
            3: 'Синхронные Лидеры',
            4: 'Дримтим Архитекторы Уюта',
            5: 'Мастера Жизненной Системы',
            6: 'Легендарная Пара NEXUS',
          };

          if (newXp >= nextLevelXp) {
            newXp -= nextLevelXp;
            level += 1;
            nextLevelXp = Math.round(nextLevelXp * 1.35);
            levelTitle = levelTitles[level] || `Гуру Жизни Ур. ${level}`;

            // Unlock cosmetics on specific levels
            if (level >= 2 && !unlockedCosmetics.includes('glasses')) {
              unlockedCosmetics.push('glasses');
            }
            if (level >= 3 && !unlockedCosmetics.includes('scarf')) {
              unlockedCosmetics.push('scarf');
            }
            if (level >= 4 && !unlockedCosmetics.includes('crown')) {
              unlockedCosmetics.push('crown');
            }

            try {
              confetti({
                particleCount: 100,
                spread: 90,
                origin: { y: 0.5 },
                colors: ['#facc15', '#a855f7', '#ec4899'],
              });
              soundEffects.playLevelUp();
            } catch {
              // ignore
            }
          }

          return {
            gamification: {
              ...state.gamification,
              level,
              levelTitle,
              xp: newXp,
              nextLevelXp,
              unlockedCosmetics,
            },
          };
        });
      },

      equipCosmetic: (cosmetic) => {
        set((state) => ({
          gamification: {
            ...state.gamification,
            equippedCosmetic: cosmetic,
          },
        }));
      },

      feedMascot: () => {
        const { gamification } = get();
        const currentTreats = gamification.treats !== undefined ? gamification.treats : 18;
        if (currentTreats <= 0) return;

        soundEffects.playEat();
        get().addXp(20);

        set((state) => ({
          gamification: {
            ...state.gamification,
            treats: Math.max(0, currentTreats - 1),
            hungerLevel: Math.min(100, (state.gamification.hungerLevel || 80) + 15),
          },
        }));
      },

      setSoundMuted: (muted) => {
        soundEffects.setMuted(muted);
        set({ soundMuted: muted });
      },

      // --- Blueprint & Repair Actions ---
      setSelectedBlueprintRoom: (room) => set({ selectedBlueprintRoom: room }),
      updatePinStatus: (id, status) => {
        set((state) => ({
          blueprintPins: state.blueprintPins.map((pin) =>
            pin.id === id ? { ...pin, status } : pin
          ),
        }));
        if (status === 'solved') {
          soundEffects.playSuccess();
          get().addXp(30);
        }
      },
      addBlueprintPin: (pinData) => {
        const newPin: BlueprintPin = {
          ...pinData,
          id: `pin-${Date.now()}`,
        };
        set((state) => ({
          blueprintPins: [...state.blueprintPins, newPin],
        }));
      },

      // --- Date Roulette Actions ---
      scheduleDateScenario: (scenario, targetDate = '2026-11-04') => {
        const newTask: NexusTask = {
          id: `task-date-${scenario.id}-${Date.now()}`,
          title: `Свидание: ${scenario.title}`,
          notes: `${scenario.description}\n\nЛокация: ${scenario.location}\nБюджет: ~${scenario.estimatedCost} ₽ (${scenario.budgetLabel})\nОплата: ${scenario.recommendedCard} (${scenario.cardBonusText})`,
          completed: false,
          bracketColor: 'cyber',
          category: 'Общее',
          room: scenario.vibe === 'home' ? 'Комната' : 'Все',
          assignee: 'together',
          date: targetDate,
          price: scenario.estimatedCost,
          createdAt: new Date().toISOString(),
          order: 0,
          tags: ['свидание', '4-ноября', ...scenario.tags],
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));

        soundEffects.playLevelUp();
        try {
          confetti({
            particleCount: 70,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#ec4899', '#a855f7', '#f43f5e'],
          });
        } catch {
          // ignore
        }
      },

      // --- Academic Actions ---
      updateHSEComponentScore: (calcId, compId, score) => {
        set((state) => ({
          hseCalculators: state.hseCalculators.map((calc) =>
            calc.id === calcId
              ? {
                  ...calc,
                  components: calc.components.map((comp) =>
                    comp.id === compId ? { ...comp, score } : comp
                  ),
                }
              : calc
          ),
        }));
        get().pushCloudState().catch(() => {});
      },

      updateHSEComponentWeight: (calcId, compId, weight) => {
        set((state) => ({
          hseCalculators: state.hseCalculators.map((calc) =>
            calc.id === calcId
              ? {
                  ...calc,
                  components: calc.components.map((comp) =>
                    comp.id === compId ? { ...comp, weight } : comp
                  ),
                }
              : calc
          ),
        }));
        get().pushCloudState().catch(() => {});
      },

      updateRUDNSubjectScore: (subjId, field, value) => {
        set((state) => ({
          rudnSubjects: state.rudnSubjects.map((subj) =>
            subj.id === subjId ? { ...subj, [field]: value } : subj
          ),
        }));
        get().pushCloudState().catch(() => {});
      },

      importCalendarTasks: (newTasks) => {
        set((state) => ({
          tasks: [...newTasks, ...state.tasks],
        }));
        soundEffects.playSuccess();
      },

      // --- Telegram Bridge Actions ---
      setTelegramConfig: (config) => {
        set((state) => ({
          telegramConfig: { ...state.telegramConfig, ...config },
        }));
      },

      syncTelegramMessages: async () => {
        const { telegramConfig } = get();
        if (!telegramConfig.botToken) {
          return { addedCount: 0 };
        }

        set({ isTelegramSyncing: true });
        try {
          const res = await telegramBotService.getUpdates(
            telegramConfig.botToken,
            (telegramConfig.lastUpdateId || 0) + 1
          );

          if (!res.success || !res.updates || res.updates.length === 0) {
            return { addedCount: 0 };
          }

          let added = 0;
          let maxUpdateId = telegramConfig.lastUpdateId || 0;

          for (const u of res.updates) {
            if (u.update_id > maxUpdateId) {
              maxUpdateId = u.update_id;
            }

            if (u.message && u.message.text) {
              const text = u.message.text;
              // Ignore bot commands like /start
              if (text.startsWith('/start')) continue;

              const parsed = telegramBotService.parseTelegramMessageToTask(text);
              get().addTask({
                title: parsed.title,
                notes: `Импортировано из Telegram от @${u.message.from.username || u.message.from.first_name}`,
                completed: false,
                bracketColor: parsed.bracketColor,
                category: parsed.category,
                room: parsed.room,
                assignee: parsed.assignee,
                date: parsed.date,
                price: parsed.price,
                tags: ['telegram', 'бот'],
              });
              added++;
            }
          }

          if (added > 0) {
            soundEffects.playAlert();
          }

          set((state) => ({
            telegramConfig: {
              ...state.telegramConfig,
              lastUpdateId: maxUpdateId,
              lastSyncAt: new Date().toISOString(),
              isConnected: true,
            },
          }));

          return { addedCount: added };
        } catch {
          return { addedCount: 0 };
        } finally {
          set({ isTelegramSyncing: false });
        }
      },

      sendTelegramPush: async (type, extraText) => {
        const { telegramConfig, wishlist, utilityBills } = get();
        if (!telegramConfig.botToken) {
          return { success: false, error: 'Токен бота не настроен' };
        }

        const targetChatId =
          telegramConfig.chatIdJoint || telegramConfig.chatIdEgor || telegramConfig.chatIdAnya;

        if (!targetChatId) {
          return { success: false, error: 'Chat ID не указан в настройках' };
        }

        let messageText = '';
        if (type === 'shopping') {
          messageText = telegramBotService.formatShoppingListMessage(wishlist);
        } else if (type === 'utilities') {
          messageText = telegramBotService.formatUtilityReminderMessage(utilityBills);
        } else {
          messageText = extraText || 'NEXUS Couple OS: Тестовое сообщение успешно отправлено!';
        }

        const res = await telegramBotService.sendMessage(
          telegramConfig.botToken,
          targetChatId,
          messageText
        );

        if (res.success) {
          soundEffects.playSuccess();
        }

        return res;
      },

      // --- Filters ---
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
        get().pushCloudState().catch(() => {});
      },

      updateWishlistItem: (id, updates) => {
        set((state) => ({
          wishlist: state.wishlist.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }));
        get().pushCloudState().catch(() => {});
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
          get().addXp(35);

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nexus-task-completed'));
          }

          try {
            confetti({
              particleCount: 85,
              spread: 85,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#22c55e', '#ec4899', '#8b5cf6'],
            });
            soundEffects.playLevelUp();
            cozyAudio.playCelebrationChime();
          } catch {
            // ignore
          }

          // Telegram push notification on mutual wishlist approval
          const { telegramConfig } = get();
          if (telegramConfig.isConnected && telegramConfig.autoNotifyWishlist && telegramConfig.botToken) {
            const targetChat = telegramConfig.chatIdJoint || telegramConfig.chatIdEgor || telegramConfig.chatIdAnya;
            if (targetChat) {
              const msg = telegramBotService.formatWishlistMatchMessage(item.title, item.estimatedPrice);
              telegramBotService.sendMessage(telegramConfig.botToken, targetChat, msg).catch(() => {});
            }
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

        // Mirror to Cloud
        get().pushCloudState().catch(() => {});
      },

      deleteWishlistItem: (id) => {
        set((state) => ({
          wishlist: state.wishlist.filter((w) => w.id !== id),
        }));
        get().pushCloudState().catch(() => {});
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
          category: 'Покупки',
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
        get().pushCloudState().catch(() => {});

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
        get().pushCloudState().catch(() => {});
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
        get().pushCloudState().catch(() => {});
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
        get().pushCloudState().catch(() => {});
      },

      updateBudgetBalance: (balance) => {
        set((state) => ({
          budget: {
            ...state.budget,
            currentBalance: balance,
            lastUpdated: new Date().toISOString(),
          },
        }));
        get().pushCloudState().catch(() => {});
      },

      claimGpbCashback: (amount) => {
        get().claimCashbackForCard('cb-gpb', amount, 'Кэшбэк: Газпромбанк');
      },

      claimCashbackForCard: (cardId, amount, taskTitle) => {
        const card = get().cashbackCards.find((c) => c.id === cardId);
        const bankTitle = card ? card.bankName : 'Банк';
        const currentBal = get().budget.currentBalance;
        const newBal = currentBal + amount;

        const newTx: FinanceTransaction = {
          id: `tx-cb-${Date.now()}`,
          title: taskTitle || `Кэшбэк: ${bankTitle}`,
          amount,
          type: 'income',
          category: 'Кэшбэк',
          paidBy: card?.user === 'anya' ? 'anya' : card?.user === 'egor' ? 'egor' : 'joint',
          splitRatio: '50/50',
          date: new Date().toISOString().slice(0, 10),
          notes: `Зачисление кэшбэка по карте ${bankTitle} в общий бюджет пары`,
        };

        // Find any uncompleted task in tasks matching "кэшбэк"/"кэшбек" and bank name
        const bankLower = bankTitle.toLowerCase();
        let matchedTaskId: string | null = null;
        const updatedTasks = get().tasks.map((t) => {
          if (t.completed) return t;
          const tLower = t.title.toLowerCase();
          const isCashback = tLower.includes('кэшбэк') || tLower.includes('кэшбек');
          const isBank =
            (bankLower.includes('газпром') && (tLower.includes('газпром') || tLower.includes('гпб'))) ||
            ((bankLower.includes('тинькофф') || bankLower.includes('т-банк')) &&
              (tLower.includes('т-банк') || tLower.includes('тинькофф') || tLower.includes('t-bank'))) ||
            (bankLower.includes('сбер') && tLower.includes('сбер')) ||
            (bankLower.includes('альфа') && tLower.includes('альфа')) ||
            ((bankLower.includes('wb') || bankLower.includes('вайлдбер')) &&
              (tLower.includes('wb') || tLower.includes('вайлдбер') || tLower.includes('вб'))) ||
            tLower.includes(bankLower);

          if (isCashback && isBank) {
            matchedTaskId = t.id;
            return { ...t, completed: true };
          }
          return t;
        });

        const newCompletedIds = matchedTaskId
          ? Array.from(new Set([...get().completedTaskIds, matchedTaskId]))
          : get().completedTaskIds;

        set((state) => ({
          budget: {
            ...state.budget,
            currentBalance: newBal,
            lastUpdated: new Date().toISOString(),
          },
          transactions: [newTx, ...state.transactions],
          tasks: matchedTaskId ? updatedTasks : state.tasks,
          completedTaskIds: newCompletedIds,
          gpbCashbackClaimed: cardId === 'cb-gpb' || bankLower.includes('газпром') ? true : state.gpbCashbackClaimed,
        }));

        if (matchedTaskId) {
          fetch('/api/ticktick/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: matchedTaskId }),
          }).catch(() => {});
        }

        try {
          soundEffects.playSuccess();
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#fff'],
          });
        } catch {}

        get().pushCloudState().catch(() => {});
      },

      addCashbackCard: (cardData) => {
        const id = cardData.id || `cb-${Date.now()}`;
        const newCard: CashbackCard = {
          id,
          bankName: cardData.bankName,
          bankColor: cardData.bankColor || '#3b82f6',
          user: cardData.user || 'joint',
          activeMonth: cardData.activeMonth || 'Ноябрь 2026',
          categories: cardData.categories || [],
          claimed: cardData.claimed !== undefined ? cardData.claimed : true,
          claimDeadline: cardData.claimDeadline || 'Выбран',
          specialFeature: cardData.specialFeature || `${cardData.bankName} · ${cardData.user === 'anya' ? 'Аня' : cardData.user === 'egor' ? 'Егор' : 'Общий'}`,
          digits: cardData.digits || '0000',
          gradientPreset: cardData.gradientPreset || 'sapphire',
          cardHolder: cardData.cardHolder || (cardData.user === 'anya' ? 'ANYA' : cardData.user === 'egor' ? 'EGOR' : 'EGOR & ANYA'),
        };
        set((state) => ({
          cashbackCards: [...state.cashbackCards, newCard],
        }));
        get().pushCloudState().catch(() => {});
      },

      updateCashbackCard: (id, updates) => {
        set((state) => ({
          cashbackCards: state.cashbackCards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
        get().pushCloudState().catch(() => {});
      },

      deleteCashbackCard: (id) => {
        set((state) => ({
          cashbackCards: state.cashbackCards.filter((c) => c.id !== id),
        }));
        get().pushCloudState().catch(() => {});
      },

      toggleCashbackClaimed: (id) => {
        set((state) => ({
          cashbackCards: state.cashbackCards.map((card) =>
            card.id === id ? { ...card, claimed: !card.claimed } : card
          ),
        }));
        get().pushCloudState().catch(() => {});
      },

      addCashbackCategory: (cardId, category, percent) => {
        set((state) => ({
          cashbackCards: state.cashbackCards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  categories: [...card.categories, { category, percent }],
                }
              : card
          ),
        }));
        get().pushCloudState().catch(() => {});
      },

      removeCashbackCategory: (cardId, categoryIndex) => {
        set((state) => ({
          cashbackCards: state.cashbackCards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  categories: card.categories.filter((_, idx) => idx !== categoryIndex),
                }
              : card
          ),
        }));
        get().pushCloudState().catch(() => {});
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
          subtasks: itemData.subtasks || [],
        };
        set((state) => ({
          studyWorkItems: [newItem, ...state.studyWorkItems],
        }));
        get().pushCloudState().catch(() => {});
      },

      updateStudyWorkItem: (id, updates) => {
        set((state) => ({
          studyWorkItems: state.studyWorkItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
        get().pushCloudState().catch(() => {});
      },

      updateStudyWorkStatus: (id, status) => {
        const isDone = status === 'done';
        if (isDone) {
          get().addXp(15);
          try {
            soundEffects.playSuccess();
          } catch {}
        }
        set((state) => ({
          studyWorkItems: state.studyWorkItems.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        }));
        get().pushCloudState().catch(() => {});
      },

      deleteStudyWorkItem: (id) => {
        set((state) => ({
          studyWorkItems: state.studyWorkItems.filter((item) => item.id !== id),
        }));
        get().pushCloudState().catch(() => {});
      },

      toggleStudyWorkSubtask: (itemId, subtaskId) => {
        set((state) => ({
          studyWorkItems: state.studyWorkItems.map((item) => {
            if (item.id !== itemId) return item;
            const updatedSubtasks = (item.subtasks || []).map((sub) =>
              sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
            );
            return { ...item, subtasks: updatedSubtasks };
          }),
        }));
        get().pushCloudState().catch(() => {});
      },

      addStudyWorkSubtask: (itemId, title) => {
        if (!title.trim()) return;
        set((state) => ({
          studyWorkItems: state.studyWorkItems.map((item) => {
            if (item.id !== itemId) return item;
            const newSub = { id: `sub-${Date.now()}`, title: title.trim(), completed: false };
            return { ...item, subtasks: [...(item.subtasks || []), newSub] };
          }),
        }));
        get().pushCloudState().catch(() => {});
      },

      deleteStudyWorkSubtask: (itemId, subtaskId) => {
        set((state) => ({
          studyWorkItems: state.studyWorkItems.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              subtasks: (item.subtasks || []).filter((sub) => sub.id !== subtaskId),
            };
          }),
        }));
        get().pushCloudState().catch(() => {});
      },

      addStudySpace: (space) => {
        set((state) => ({
          customStudySpaces: [...state.customStudySpaces, space],
        }));
        get().pushCloudState().catch(() => {});
      },

      deleteStudySpace: (spaceId) => {
        set((state) => ({
          customStudySpaces: state.customStudySpaces.filter((s) => s.id !== spaceId),
        }));
        get().pushCloudState().catch(() => {});
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
            
            get().addXp(50);
            try {
              confetti({ particleCount: 75, spread: 75 });
              cozyAudio.playCelebrationChime();
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
            const { tasks, wishlist, transactions, studyWorkItems } = get();
            const synced = await executeBidirectionalSync(client, {
              tasks,
              wishlist,
              finances: transactions,
              studyWork: studyWorkItems,
            });

            set((state) => ({
              tasks: synced.tasks,
              wishlist: synced.wishlist,
              transactions: synced.finances,
              studyWorkItems: synced.studyWork,
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

      setGcalEvents: (events) => {
        set({ gcalEvents: events });
      },

      syncWithLivePipeline: async () => {
        set({ isSyncingLive: true });
        try {
          let rawData: any = null;
          let syncSource = 'live-data.json';
          const { supabaseConfig } = get();

          // 1. Try local dev-middleware /api/live-sync
          try {
            const resp = await fetch('/api/live-sync', { signal: AbortSignal.timeout(5000) });
            if (resp.ok) {
              rawData = await resp.json();
              syncSource = 'local-bridge (/api/live-sync)';
            }
          } catch {
            // Not local or bridge not reachable
          }

          // 2. Try Supabase REST feed if configured (for iPhone, Windows & Android remote sync)
          if (!rawData && supabaseConfig.url && supabaseConfig.anonKey) {
            try {
              const cloudData = await fetchNexusSyncFeed(supabaseConfig.url, supabaseConfig.anonKey);
              if (cloudData && cloudData.payload) {
                rawData = cloudData.payload;
                syncSource = 'supabase-cloud (nexus_sync)';

                // If cloud has shared_state (couple votes, custom expenses, cards, tasks), merge it
                if (cloudData.shared_state) {
                  const ss = cloudData.shared_state;
                  set((state) => {
                    const mergedCompleted = Array.from(new Set([...(state.completedTaskIds || []), ...(ss.completedTaskIds || [])]));
                    const mergedDeleted = Array.from(new Set([...(state.deletedTaskIds || []), ...(ss.deletedTaskIds || [])]));
                    const deletedSet = new Set(mergedDeleted);
                    const completedSet = new Set(mergedCompleted);

                    const existingTaskIds = new Set(state.tasks.map((t) => t.id));
                    const incomingCustomTasks: NexusTask[] = (ss.customTasks || []).filter(
                      (ct: NexusTask) => !existingTaskIds.has(ct.id) && !deletedSet.has(ct.id)
                    );

                    const updatedTasks = state.tasks
                      .filter((t) => !deletedSet.has(t.id))
                      .map((t) => ({
                        ...t,
                        completed: completedSet.has(t.id) || t.completed,
                      }));

                    return {
                      wishlist: ss.wishlist || state.wishlist,
                      transactions: ss.transactions || state.transactions,
                      budget: ss.budget || state.budget,
                      cashbackCards: ss.cashbackCards || state.cashbackCards,
                      studyWorkItems: ss.studyWorkItems || state.studyWorkItems,
                      customStudySpaces: ss.customStudySpaces || state.customStudySpaces,
                      completedTaskIds: mergedCompleted,
                      deletedTaskIds: mergedDeleted,
                      tasks: [...updatedTasks, ...incomingCustomTasks],
                    };
                  });
                }
              }
            } catch (e) {
              console.warn('Supabase cloud sync failed:', e);
            }
          }

          // 3. Fallback to public live-data.json snapshot
          if (!rawData) {
            const resp = await fetch('./live-data.json', { cache: 'no-cache' });
            if (resp.ok) {
              rawData = await resp.json();
              syncSource = 'static-snapshot (live-data.json)';
            }
          }

          if (!rawData) {
            throw new Error('Данные недоступны');
          }

          // Parse GCal
          const gcalItems: GCalEvent[] = (rawData.gcal?.items || []).map((ev: any, idx: number) => {
            let timeStr = 'весь день';
            if (ev.start?.dateTime) {
              const d = new Date(ev.start.dateTime);
              timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            }
            return {
              id: ev.id || `gcal-${idx}`,
              summary: ev.summary || '(Без названия)',
              start: ev.start,
              end: ev.end,
              timeStr,
            };
          });

          // Automatically extract all questions with '?' from ticktick.inbox into wishlist!
          const inboxItems: any[] = rawData.ticktick?.inbox || [];
          const currentWishlist = get().wishlist;
          const existingTitles = new Set(currentWishlist.map((w) => w.title.toLowerCase().trim()));
          const newWishes: WishlistItem[] = [];

          for (const item of inboxItems) {
            const title = (item.plainTitle || item.title || '').trim();
            const titleLower = title.toLowerCase();
            const isExcluded =
              titleLower.includes('ноябр') ||
              titleLower.includes('делаем') ||
              titleLower.includes('когда') ||
              titleLower.includes('куда') ||
              titleLower.includes('перестановка');

            if (title.includes('?') && !isExcluded && !existingTitles.has(titleLower)) {
              const isBathroom = titleLower.includes('ванн') || titleLower.includes('коврик');
              const isRoom = titleLower.includes('комнат') || titleLower.includes('подушка');
              const cat = isBathroom ? 'Ванная' : isRoom ? 'Комната' : 'Кухня';

              newWishes.push({
                id: `wish-${item.id || Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                title,
                category: cat,
                estimatedPrice: 0,
                link: '',
                notes: 'Автоматически подтянуто из TickTick',
                egorVote: null,
                anyaVote: null,
                status: 'pending',
                addedBy: 'together',
                createdAt: item.createdTime || new Date().toISOString(),
              });
              existingTitles.add(titleLower);
            }
          }

          // Also update task deadlines and parentId from TickTick live items, AND import brand-new tasks!
          const timedItems: any[] = rawData.ticktick?.results || [];
          if (timedItems.length > 0 || inboxItems.length > 0) {
            const allLive = [...timedItems, ...inboxItems];
            const liveTasksMap = new Map<string, any>();
            allLive.forEach((t) => {
              if (t.id) liveTasksMap.set(t.id, t);
            });

            set((state) => {
              const completedSet = new Set(state.completedTaskIds || []);
              const deletedSet = new Set(state.deletedTaskIds || []);
              const existingIds = new Set(state.tasks.map((t) => t.id));

              // 1. Update existing tasks
              const updatedTasks = state.tasks
                .filter((t) => !deletedSet.has(t.id))
                .map((existingTask) => {
                  const isCompleted = completedSet.has(existingTask.id) || existingTask.completed;
                  const live = liveTasksMap.get(existingTask.id);
                  if (live) {
                    return {
                      ...existingTask,
                      completed: isCompleted,
                      parentId: live.parentId || existingTask.parentId,
                      date: live.dueDateLocal || (live.dueDate ? live.dueDate.slice(0, 10) : existingTask.date),
                      isOverdue: Boolean(live.isOverdue),
                    };
                  }
                  return {
                    ...existingTask,
                    completed: isCompleted,
                  };
                });

              // 2. Discover brand-new tasks from TickTick not yet in state.tasks
              const newlyAddedTasks: NexusTask[] = [];
              allLive.forEach((liveItem) => {
                if (!liveItem.id || existingIds.has(liveItem.id) || deletedSet.has(liveItem.id)) {
                  return;
                }

                const titleLower = (liveItem.title || '').toLowerCase();
                let category: TaskCategory = 'Дом';
                let bracketColor: BracketColor = 'neutral';
                let room: RoomArea = 'Все';

                if (titleLower.includes('ванн')) { room = 'Ванная'; category = 'Дом'; }
                else if (titleLower.includes('кухн')) { room = 'Кухня'; category = 'Дом'; }
                else if (titleLower.includes('балкон')) { room = 'Балкон'; category = 'Дом'; }
                else if (titleLower.includes('комнат') || titleLower.includes('спальн')) { room = 'Комната'; category = 'Дом'; }
                else if (titleLower.includes('жкх') || titleLower.includes('мосэнерго') || titleLower.includes('домиленд') || titleLower.includes('счет')) {
                  category = 'Финансы'; bracketColor = 'finance';
                } else if (titleLower.includes('вшэ')) {
                  category = 'ВШЭ'; bracketColor = 'active';
                } else if (titleLower.includes('рудн')) {
                  category = 'РУДН'; bracketColor = 'active';
                } else if (titleLower.includes('я-профи')) {
                  category = 'Я-Профи'; bracketColor = 'active';
                } else if (titleLower.includes('работа') || titleLower.includes('openmap')) {
                  category = 'Работа'; bracketColor = 'active';
                }

                if (liveItem.isOverdue) bracketColor = 'critical';

                const newTask: NexusTask = {
                  id: liveItem.id,
                  title: liveItem.title || 'Новая задача',
                  notes: liveItem.notes || liveItem.content || undefined,
                  completed: completedSet.has(liveItem.id) || Boolean(liveItem.completed || liveItem.status === 2),
                  bracketColor,
                  category,
                  room,
                  assignee: 'together',
                  date: liveItem.dueDateLocal || (liveItem.dueDate ? liveItem.dueDate.slice(0, 10) : 'inbox'),
                  isOverdue: Boolean(liveItem.isOverdue),
                  parentId: liveItem.parentId || undefined,
                  isHub: Boolean(liveItem.isHub),
                  subtasks: (liveItem.items || []).map((it: any) => ({
                    id: it.id,
                    title: it.title,
                    completed: it.status === 1 || it.completed,
                  })),
                  subtaskCount: liveItem.subtaskCount || (liveItem.items ? liveItem.items.length : 0),
                  createdAt: liveItem.createdTime || new Date().toISOString(),
                  order: liveItem.order || 99,
                };

                newlyAddedTasks.push(newTask);
                existingIds.add(liveItem.id);
              });

              return {
                tasks: [...updatedTasks, ...newlyAddedTasks],
              };
            });
          }

          set((state) => ({
            gcalEvents: gcalItems.length > 0 ? gcalItems : state.gcalEvents,
            wishlist: newWishes.length > 0 ? [...state.wishlist, ...newWishes] : state.wishlist,
            lastSyncTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          }));

          return {
            success: true,
            count: (rawData.ticktick?.results?.length || 0) + inboxItems.length,
            source: syncSource,
          };
        } catch (err: any) {
          console.warn('Sync failed:', err);
          return { success: false, error: err.message };
        } finally {
          set({ isSyncingLive: false });
        }
      },

      pushCloudState: async () => {
        const {
          supabaseConfig,
          wishlist,
          budget,
          transactions,
          cashbackCards,
          studyWorkItems,
          customStudySpaces,
          completedTaskIds,
          deletedTaskIds,
          tasks,
        } = get();
        if (!supabaseConfig.url || !supabaseConfig.anonKey) return false;
        try {
          return await pushSharedStateToNexusSync(supabaseConfig.url, supabaseConfig.anonKey, {
            wishlist,
            budget,
            transactions,
            cashbackCards,
            studyWorkItems,
            customStudySpaces,
            completedTaskIds,
            deletedTaskIds,
            customTasks: tasks.filter((t) => t.id.startsWith('task-')),
          });
        } catch (e) {
          console.warn('Push cloud state failed:', e);
          return false;
        }
      },

      saveSupabaseToLocalEnv: async (url: string, key: string) => {
        try {
          const resp = await fetch('/api/save-supabase-env', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, key }),
          });
          if (resp.ok) {
            return { success: true, message: 'Ключи успешно сохранены в ~/.config/ubersicht-dashboard/.env!' };
          }
        } catch {
          // not in local dev server
        }
        return { 
          success: false, 
          message: `Выполните в терминале на Маке:\necho "SUPABASE_URL=\\"${url}\\"\\nSUPABASE_KEY=\\"${key}\\"" > ~/.config/ubersicht-dashboard/.env` 
        };
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
          customStudySpaces: [],
          gamification: initialCoupleGamification,
          blueprintPins: initialBlueprintPins,
          dateScenarios: initialDateScenarios,
          hseCalculators: initialHSECalculators,
          rudnSubjects: initialRUDNSubjects,
        });
      },
    }),
    {
      name: 'nexus-real-sync-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Ensure completedTaskIds and deletedTaskIds exist
        if (!state.completedTaskIds) state.completedTaskIds = [];
        if (!state.deletedTaskIds) state.deletedTaskIds = [];
        if (!state.customStudySpaces) state.customStudySpaces = [];
        if (!state.studyWorkItems || state.studyWorkItems.length === 0) {
          state.studyWorkItems = initialStudyWorkItems;
        } else {
          // If items don't have work-projects items yet, seed them
          const hasWorkProjects = state.studyWorkItems.some((i) => i.space === 'work-projects');
          if (!hasWorkProjects) {
            const missing = initialStudyWorkItems.filter((i) => i.space === 'work-projects');
            state.studyWorkItems.push(...missing);
          }
        }

        // Apply completed and deleted filters to persisted tasks
        const completedSet = new Set(state.completedTaskIds);
        const deletedSet = new Set(state.deletedTaskIds);

        // Ensure initial banks are present if empty
        if (!state.cashbackCards || state.cashbackCards.length === 0) {
          state.cashbackCards = initialCashbackCards;
        } else {
          // Sanitize card holders (strictly EGOR or ANYA, zero BELOUSOV)
          state.cashbackCards = state.cashbackCards.map((c) => ({
            ...c,
            cardHolder: c.user === 'anya' ? 'ANYA' : c.user === 'egor' ? 'EGOR' : 'EGOR & ANYA',
          }));
        }

        // Clean out questions that aren't purchases like "Что делаем 4 ноября?" from wishlist
        state.wishlist = (state.wishlist || []).filter((w) => {
          const t = (w.title || '').toLowerCase();
          return !t.includes('ноябр') && !t.includes('делаем') && !t.includes('когда') && !t.includes('куда');
        });
        // Purge any legacy fake demo events
        state.gcalEvents = (state.gcalEvents || []).filter((e) => {
          if (!e || !e.id || e.id.startsWith('gcal-')) return false;
          const summary = (e.summary || '').toLowerCase();
          if (
            summary.includes('синхронизация по деплою') ||
            summary.includes('леруа мерлен') ||
            summary.includes('свидание пары') ||
            summary.includes('созвон с амбассадорами') ||
            summary.includes('семинар по нир') ||
            summary.includes('лекции и тестирование')
          ) {
            return false;
          }
          return true;
        });
        // Ensure honest zero budget contributions if legacy 40000 was set
        if (state.budget && state.budget.egorContribution === 40000 && state.budget.anyaContribution === 40000 && state.budget.currentBalance === 0) {
          state.budget.egorContribution = 0;
          state.budget.anyaContribution = 0;
        }
        // Ensure parentId and isHub are preserved on tasks in rehydrated state, and user completed status is kept!
        if (state.tasks && state.tasks.length > 0) {
          const initialMap = new Map(initialTasks.map((t) => [t.id, t]));
          state.tasks = state.tasks
            .filter((t) => !deletedSet.has(t.id))
            .map((task) => {
              const init = initialMap.get(task.id);
              const isDone = completedSet.has(task.id) || task.completed;
              if (init) {
                return {
                  ...task,
                  completed: isDone,
                  parentId: task.parentId || init.parentId,
                  isHub: init.isHub !== undefined ? init.isHub : task.isHub,
                  subtaskCount: init.subtaskCount !== undefined ? init.subtaskCount : task.subtaskCount,
                };
              }
              return {
                ...task,
                completed: isDone,
              };
            });

          // If GPB cashback was claimed, ensure task is marked completed
          if (state.gpbCashbackClaimed) {
            state.tasks = state.tasks.map((t) =>
              t.id === '6ad8cacebf00032b8b10c84f' || t.title.toLowerCase().includes('газпром')
                ? { ...t, completed: true }
                : t
            );
          }

          // Ensure 'диаскин' is present if missing
          if (!state.tasks.some((t) => t.title.toLowerCase().includes('диаскин')) && !deletedSet.has('6ae3301b18a69177e38ba64a')) {
            const diaskin = initialTasks.find((t) => t.title.toLowerCase().includes('диаскин'));
            if (diaskin) state.tasks.push(diaskin);
          }
        }
      }
    }
  )
);
