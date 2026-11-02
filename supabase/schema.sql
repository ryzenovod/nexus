-- =========================================================
-- NEXUS COUPLE LIFE OS // DATABASE MIGRATION SCRIPT
-- Egor & Anya Moscow Life OS (Offline-First + Supabase Sync)
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

-- 2. Wishlist & Household Purchases Table («Берем или нет?»)
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

-- 4. Study & Work Items (HSE, RUDN, Ya-Profi)
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

-- 6. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE nexus_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE nexus_wishlist;
ALTER PUBLICATION supabase_realtime ADD TABLE nexus_finances;
ALTER PUBLICATION supabase_realtime ADD TABLE nexus_study_work;
