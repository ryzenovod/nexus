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
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS) - Public anon access for couple sync
ALTER TABLE nexus_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_study_work ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public anon access for nexus_tasks" ON nexus_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access for nexus_wishlist" ON nexus_wishlist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access for nexus_finances" ON nexus_finances FOR ALL USING (true) WITH CHECK (true);
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
  budget: JointBudget;
  cashback: CashbackCard[];
  utilityBills: UtilityBill[];
  studyWork: StudyWorkItem[];
}
