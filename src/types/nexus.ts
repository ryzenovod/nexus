export type BracketColor = 'critical' | 'active' | 'finance' | 'cyber' | 'neutral';

export type Assignee = 'all' | 'egor' | 'anya' | 'together';

export type TaskCategory = 
  | '📦 Для дома!'
  | '🎓 ВШЭ (Егор)'
  | '🎓 РУДН (Аня)'
  | '🏆 Я-Профессионал'
  | '💼 Работа (Егор)'
  | '🚀 Проекты'
  | '💰 Финансы'
  | '🛒 Покупки'
  | '📋 Общее';

export type RoomArea = 
  | 'Ванная'
  | 'Балкон'
  | 'Комната'
  | 'Кухня'
  | 'Коридор'
  | 'Все';

export interface NexusTask {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  bracketColor: BracketColor;
  category: TaskCategory;
  room?: RoomArea;
  assignee: Assignee;
  date: string; // 'inbox' or 'YYYY-MM-DD'
  isOverdue?: boolean;
  isRegular?: boolean;
  regularPeriod?: string; // e.g. "15-26 числа каждого месяца"
  isHub?: boolean; // hub card like "ванная", "балкон", "кухня", "комната", "Коммунальные"
  subtaskCount?: number;
  price?: number;
  link?: string;
  tags?: string[];
  createdAt: string;
  order: number;
}

export type VoteStatus = 'yes' | 'maybe' | 'no' | null;

export interface WishlistItem {
  id: string;
  title: string;
  category: string;
  estimatedPrice: number;
  link?: string;
  notes?: string;
  egorVote: VoteStatus;
  anyaVote: VoteStatus;
  status: 'pending' | 'approved' | 'rejected';
  addedBy: 'egor' | 'anya';
  createdAt: string;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category: string;
  paidBy: 'egor' | 'anya' | 'joint';
  splitRatio: '50/50' | 'egor_100' | 'anya_100' | 'custom';
  notes?: string;
}

export interface JointBudget {
  totalTarget: number;
  egorContribution: number;
  anyaContribution: number;
  currentBalance: number;
  depositDates: string; // e.g. "10 и 25 числа"
  lastUpdated: string;
}

export interface CashbackCategory {
  category: string;
  percent: number;
  note?: string;
}

export interface CashbackCard {
  id: string;
  bankName: string;
  bankColor: string;
  user: 'egor' | 'anya';
  activeMonth: string;
  categories: CashbackCategory[];
  claimed: boolean;
  claimDeadline: string;
  actionRequired?: string;
  specialFeature?: string;
}

export interface UtilityReading {
  month: string;
  amount: number;
  status: 'paid' | 'pending' | 'due' | 'overdue';
}

export interface UtilityBill {
  id: string;
  serviceName: string;
  provider: string;
  amount: number;
  commission: number;
  dueDate: string;
  periodText: string;
  status: 'paid' | 'due' | 'overdue';
  readingsRequired: boolean;
  readingsWindow?: string; // e.g. "15-26 число"
  currentReadings?: {
    hotWater?: number;
    coldWater?: number;
    electricity?: number;
  };
  linkUrl: string;
  history: UtilityReading[];
}

export type StudySpace = 
  | 'hse-egor' 
  | 'rudn-anya' 
  | 'yaprofi-dfo' 
  | 'yaprofi-cfo' 
  | 'work-egor' 
  | 'projects-anya';

export interface StudyWorkItem {
  id: string;
  space: StudySpace;
  user: 'egor' | 'anya' | 'together';
  title: string;
  description: string;
  courseOrProject: string;
  status: 'backlog' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  tags: string[];
  timezoneNote?: string; // for DFO +7h coordination
}

export interface CoupleGamification {
  level: number;
  levelTitle: string;
  xp: number;
  nextLevelXp: number;
  treats: number; // treats earned from finishing chores/tasks
  hungerLevel: number; // 0-100%
  equippedCosmetic: 'none' | 'glasses' | 'crown' | 'scarf' | 'wings' | 'cat_headphones';
  unlockedCosmetics: string[];
}

export type AtmosphereMode = 'twilight' | 'cyber' | 'transparent';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncAt: string | null;
}

export interface TelegramConfig {
  botToken: string;
  chatIdEgor: string;
  chatIdAnya: string;
  chatIdJoint: string;
  isConnected: boolean;
  autoNotifyWishlist: boolean;
  autoNotifyTasks: boolean;
  autoNotifyUtilities: boolean;
  lastUpdateId?: number;
  lastSyncAt?: string;
}

export interface BlueprintPin {
  id: string;
  title: string;
  room: RoomArea;
  x: number; // percentage 0-100 on blueprint
  y: number; // percentage 0-100 on blueprint
  status: 'problem' | 'in_progress' | 'solved';
  category: 'water' | 'electricity' | 'repair' | 'cleaning' | 'furniture';
  notes?: string;
  estimatedCost?: number;
}

export interface DateScenario {
  id: string;
  title: string;
  emoji: string;
  vibe: 'home' | 'gastro' | 'art' | 'gaming' | 'walk';
  vibeLabel: string;
  budget: 'free' | 'low' | 'medium' | 'festive';
  budgetLabel: string;
  estimatedCost: number;
  duration: string;
  description: string;
  location: string;
  recommendedCard: string;
  cardBonusText: string;
  tags: string[];
}

export interface HSEGradeComponent {
  id: string;
  name: string;
  weight: number; // e.g. 0.3 for 30%
  score: number; // 0 to 10
}

export interface HSECourseCalculator {
  id: string;
  courseName: string;
  components: HSEGradeComponent[];
  targetScore: number;
}

export interface RUDNSubjectBRS {
  id: string;
  subjectName: string;
  currentControl: number; // 0 to 60
  milestoneControl: number; // 0 to 20
  finalExam: number; // 0 to 20
}
