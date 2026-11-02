import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  NexusTask, 
  WishlistItem, 
  FinanceTransaction, 
  JointBudget, 
  CashbackCard, 
  UtilityBill, 
  StudyWorkItem 
} from '../types/nexus';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey);
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createClient(url, anonKey);
    // Simple ping to check credentials
    const { error } = await client.from('nexus_tasks').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "nexus_tasks" does not exist')) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown network error';
    return { success: false, error: message };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- =========================================================
-- NEXUS COUPLE LIFE OS // DATABASE MIGRATION SCRIPT
-- Run this script in your Supabase Project -> SQL Editor
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tasks Table (Command Center & Inbox)
CREATE TABLE IF NOT EXISTS nexus_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  bracket_color TEXT NOT NULL DEFAULT 'active',
  category TEXT NOT NULL DEFAULT '📦 Для дома!',
  room TEXT DEFAULT 'Все',
  assignee TEXT NOT NULL DEFAULT 'together',
  date TEXT NOT NULL DEFAULT 'inbox',
  is_overdue BOOLEAN DEFAULT FALSE,
  is_regular BOOLEAN DEFAULT FALSE,
  regular_period TEXT,
  is_hub BOOLEAN DEFAULT FALSE,
  subtask_count INTEGER DEFAULT 0,
  price NUMERIC,
  link TEXT,
  tags TEXT[],
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Wishlist & Household Purchases Table
CREATE TABLE IF NOT EXISTS nexus_wishlist (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_price NUMERIC DEFAULT 0,
  link TEXT,
  notes TEXT,
  egor_vote TEXT,
  anya_vote TEXT,
  status TEXT DEFAULT 'pending',
  added_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Finance Transactions
CREATE TABLE IF NOT EXISTS nexus_finances (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense',
  category TEXT NOT NULL,
  paid_by TEXT NOT NULL,
  split_ratio TEXT NOT NULL DEFAULT '50/50',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Study & Work Items
CREATE TABLE IF NOT EXISTS nexus_study_work (
  id TEXT PRIMARY KEY,
  space TEXT NOT NULL,
  "user" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  course_or_project TEXT,
  status TEXT NOT NULL DEFAULT 'backlog',
  priority TEXT NOT NULL DEFAULT 'medium',
  deadline TEXT,
  timezone_note TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS) - Public anon access for couple sync
ALTER TABLE nexus_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_study_work ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public anon access for nexus_tasks" ON nexus_tasks;
CREATE POLICY "Allow public anon access for nexus_tasks" ON nexus_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon access for nexus_wishlist" ON nexus_wishlist;
CREATE POLICY "Allow public anon access for nexus_wishlist" ON nexus_wishlist FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon access for nexus_finances" ON nexus_finances;
CREATE POLICY "Allow public anon access for nexus_finances" ON nexus_finances FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon access for nexus_study_work" ON nexus_study_work;
CREATE POLICY "Allow public anon access for nexus_study_work" ON nexus_study_work FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE nexus_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE nexus_wishlist;
ALTER PUBLICATION supabase_realtime ADD TABLE nexus_finances;
ALTER PUBLICATION supabase_realtime ADD TABLE nexus_study_work;
`;

export interface SyncPayload {
  tasks: NexusTask[];
  wishlist: WishlistItem[];
  finances: FinanceTransaction[];
  studyWork: StudyWorkItem[];
}

export async function executeBidirectionalSync(
  client: SupabaseClient,
  payload: SyncPayload
): Promise<SyncPayload> {
  // 1. Sync Tasks: Upsert local tasks
  if (payload.tasks.length > 0) {
    const taskRows = payload.tasks.map((task) => ({
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
      updated_at: new Date().toISOString(),
    }));
    await client.from('nexus_tasks').upsert(taskRows, { onConflict: 'id' });
  }

  // Fetch all tasks from Supabase
  const { data: remoteTasks } = await client
    .from('nexus_tasks')
    .select('*')
    .order('order', { ascending: true });

  const mappedTasks: NexusTask[] = remoteTasks && remoteTasks.length > 0
    ? remoteTasks.map((row: any) => ({
        id: row.id,
        title: row.title,
        notes: row.notes,
        completed: Boolean(row.completed),
        bracketColor: row.bracket_color,
        category: row.category,
        room: row.room,
        assignee: row.assignee,
        date: row.date,
        isOverdue: Boolean(row.is_overdue),
        isRegular: Boolean(row.is_regular),
        regularPeriod: row.regular_period,
        isHub: Boolean(row.is_hub),
        subtaskCount: row.subtask_count,
        price: row.price ? Number(row.price) : undefined,
        link: row.link,
        tags: row.tags,
        createdAt: row.created_at,
        order: row.order || 0,
      }))
    : payload.tasks;

  // 2. Sync Wishlist
  if (payload.wishlist.length > 0) {
    const wishlistRows = payload.wishlist.map((w) => ({
      id: w.id,
      title: w.title,
      category: w.category,
      estimated_price: w.estimatedPrice,
      link: w.link,
      notes: w.notes,
      egor_vote: w.egorVote,
      anya_vote: w.anyaVote,
      status: w.status,
      added_by: w.addedBy,
    }));
    await client.from('nexus_wishlist').upsert(wishlistRows, { onConflict: 'id' });
  }

  const { data: remoteWishlist } = await client
    .from('nexus_wishlist')
    .select('*')
    .order('created_at', { ascending: false });

  const mappedWishlist: WishlistItem[] = remoteWishlist && remoteWishlist.length > 0
    ? remoteWishlist.map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        estimatedPrice: Number(row.estimated_price) || 0,
        link: row.link,
        notes: row.notes,
        egorVote: row.egor_vote,
        anyaVote: row.anya_vote,
        status: row.status,
        addedBy: row.added_by,
        createdAt: row.created_at,
      }))
    : payload.wishlist;

  // 3. Sync Finances
  if (payload.finances.length > 0) {
    const financeRows = payload.finances.map((f) => ({
      id: f.id,
      date: f.date,
      title: f.title,
      amount: f.amount,
      type: f.type,
      category: f.category,
      paid_by: f.paidBy,
      split_ratio: f.splitRatio,
      notes: f.notes,
    }));
    await client.from('nexus_finances').upsert(financeRows, { onConflict: 'id' });
  }

  const { data: remoteFinances } = await client
    .from('nexus_finances')
    .select('*')
    .order('date', { ascending: false });

  const mappedFinances: FinanceTransaction[] = remoteFinances && remoteFinances.length > 0
    ? remoteFinances.map((row: any) => ({
        id: row.id,
        date: row.date,
        title: row.title,
        amount: Number(row.amount),
        type: row.type,
        category: row.category,
        paidBy: row.paid_by,
        splitRatio: row.split_ratio,
        notes: row.notes,
        createdAt: row.created_at,
      }))
    : payload.finances;

  // 4. Sync Study & Work
  if (payload.studyWork.length > 0) {
    const studyRows = payload.studyWork.map((s) => ({
      id: s.id,
      space: s.space,
      user: s.user,
      title: s.title,
      description: s.description,
      course_or_project: s.courseOrProject,
      status: s.status,
      priority: s.priority,
      deadline: s.deadline,
      timezone_note: s.timezoneNote,
      tags: s.tags,
    }));
    await client.from('nexus_study_work').upsert(studyRows, { onConflict: 'id' });
  }

  const { data: remoteStudy } = await client
    .from('nexus_study_work')
    .select('*')
    .order('created_at', { ascending: false });

  const mappedStudy: StudyWorkItem[] = remoteStudy && remoteStudy.length > 0
    ? remoteStudy.map((row: any) => ({
        id: row.id,
        space: row.space,
        user: row.user,
        title: row.title,
        description: row.description || '',
        courseOrProject: row.course_or_project || '',
        status: row.status,
        priority: row.priority,
        deadline: row.deadline || '',
        timezoneNote: row.timezone_note,
        tags: row.tags || [],
      }))
    : payload.studyWork;

  return {
    tasks: mappedTasks,
    wishlist: mappedWishlist,
    finances: mappedFinances,
    studyWork: mappedStudy,
  };
}
