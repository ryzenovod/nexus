import { 
  NexusTask, 
  WishlistItem, 
  FinanceTransaction, 
  JointBudget, 
  CashbackCard, 
  UtilityBill, 
  StudyWorkItem,
  CoupleGamification,
  GCalEvent
} from '../types/nexus';

export const initialCoupleGamification: CoupleGamification = { level: 1, levelTitle: 'Начало', xp: 0, nextLevelXp: 1000, treats: 0, hungerLevel: 100, equippedCosmetic: 'none', unlockedCosmetics: ['none'] };

export const initialTasks: NexusTask[] = [];

export const initialWishlist: WishlistItem[] = [];

// Clean zero balance: user will enter manual balance when ready
export const initialBudget: JointBudget = { totalTarget: 0, egorContribution: 0, anyaContribution: 0, currentBalance: 0, depositDates: '', lastUpdated: '' };

export const initialTransactions: FinanceTransaction[] = [];

// Exact 5 Banks for Egor and Anya (Apple Pay 2026 specs)
export const initialCashbackCards: CashbackCard[] = [{ id: 'cb-placeholder', bankName: 'Добавьте свою карту', user: 'egor', categories: [], specialFeature: 'Заполните свои данные локально' }];

export const initialGcalEvents: GCalEvent[] = [];

export const initialUtilityBills: UtilityBill[] = [];

export const initialStudyWorkItems: StudyWorkItem[] = [];
