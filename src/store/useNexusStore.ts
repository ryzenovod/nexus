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
  SupabaseConfig,
  CoupleGamification,
  AtmosphereMode,
  TelegramConfig,
  BlueprintPin,
  DateScenario,
  HSECourseCalculator,
  RUDNSubjectBRS
} from '../types/nexus';
import { 
  initialTasks, 
  initialWishlist, 
  initialBudget, 
  initialTransactions, 
  initialCashbackCards, 
  initialUtilityBills, 
  initialStudyWorkItems,
  initialCoupleGamification 
} from '../data/nexusInitialData';
import {
  initialBlueprintPins,
  initialDateScenarios,
  initialHSECalculators,
  initialRUDNSubjects
} from '../data/blueprintAndDatesData';
import { getSupabaseClient } from '../services/supabaseClient';
import { cozyAudio } from '../utils/CozyAudioSynthesizer';
import { soundEffects } from '../utils/soundEffects';
import { telegramBotService } from '../services/telegramBotService';

export interface NexusState {
  // Tasks
  tasks: NexusTask[];
  searchQuery: string;
  selectedBracket: 'all' | BracketColor;
  selectedAssignee: Assignee;
  selectedRoom: RoomArea;
  selectedCategory: 'all' | TaskCategory;
  isSmartGrouped: boolean;
  activeWeekOffset: number;

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

  // Study & Work
  studyWorkItems: StudyWorkItem[];
  activeStudySpace: StudySpace;

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
  updateRUDNSubjectScore: (subjId: string, field: 'currentControl' | 'milestoneControl' | 'finalExam', value: number) => void;
  importCalendarTasks: (newTasks: NexusTask[]) => void;

  // Telegram Actions
  setTelegramConfig: (config: Partial<TelegramConfig>) => void;
  syncTelegramMessages: () => Promise<{ addedCount: number }>;
  sendTelegramPush: (type: 'shopping' | 'utilities' | 'test', extraText?: string) => Promise<{ success: boolean; error?: string }>;

  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'egorVote' | 'anyaVote' | 'status'>) => void;
  voteWishlist: (id: string, user: 'egor' | 'anya', vote: VoteStatus) => void;
  deleteWishlistItem: (id: string) => void;
  convertWishlistToTask: (id: string) => void;

  addTransaction: (tx: Omit<FinanceTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateBudgetContributions: (egor: number, anya: number, target: number) => void;
  toggleCashbackClaimed: (id: string) => void;
  updateMeterReadings: (billId: string, readings: { hotWater?: number; coldWater?: number; electricity?: number }) => void;
  payUtilityBill: (id: string) => void;

  addStudyWorkItem: (item: Omit<StudyWorkItem, 'id'>) => void;
  updateStudyWorkStatus: (id: string, status: StudyWorkItem['status']) => void;
  deleteStudyWorkItem: (id: string) => void;
  setActiveStudySpace: (space: StudySpace) => void;

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
      searchQuery: '',
      selectedBracket: 'all',
      selectedAssignee: 'all',
      selectedRoom: 'Все',
      selectedCategory: 'all',
      isSmartGrouped: true,
      activeWeekOffset: 0,

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

      studyWorkItems: initialStudyWorkItems,
      activeStudySpace: 'yaprofi-dfo',

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
            1: 'Новоселы в Москве 🏠',
            2: 'Уютный Тандем ☕️',
            3: 'Синхронные Лидеры 🚀',
            4: 'Дримтим Архитекторы Уюта ✨',
            5: 'Мастера Жизненной Системы 👑',
            6: 'Легендарная Пара NEXUS 🌌',
          };

          if (newXp >= nextLevelXp) {
            newXp -= nextLevelXp;
            level += 1;
            nextLevelXp = Math.round(nextLevelXp * 1.35);
            levelTitle = levelTitles[level] || `Гуру Жизни Ур. ${level} 🌟`;

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
        if ((gamification.treats || 0) <= 0) return;

        soundEffects.playEat();
        get().addXp(20);

        set((state) => ({
          gamification: {
            ...state.gamification,
            treats: Math.max(0, (state.gamification.treats || 0) - 1),
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
          title: `💕 Свидание: ${scenario.title}`,
          notes: `${scenario.description}\n\n📍 Локация: ${scenario.location}\n💰 Бюджет: ~${scenario.estimatedCost} ₽ (${scenario.budgetLabel})\n💳 Оплата: ${scenario.recommendedCard} (${scenario.cardBonusText})`,
          completed: false,
          bracketColor: 'cyber',
          category: '📋 Общее',
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
      },

      updateRUDNSubjectScore: (subjId, field, value) => {
        set((state) => ({
          rudnSubjects: state.rudnSubjects.map((subj) =>
            subj.id === subjId ? { ...subj, [field]: value } : subj
          ),
        }));
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
          messageText = extraText || '🐾 NEXUS Couple OS: Тестовое сообщение успешно отправлено!';
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
          gamification: initialCoupleGamification,
          blueprintPins: initialBlueprintPins,
          dateScenarios: initialDateScenarios,
          hseCalculators: initialHSECalculators,
          rudnSubjects: initialRUDNSubjects,
        });
      },
    }),
    {
      name: 'nexus-couple-os-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
