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

-- 5. Security policies: same verified migration as security_migration.sql
-- NEXUS security migration v1 | 2026-11-08
-- FAIL CLOSED. Run in Supabase SQL Editor by project owner after making a database backup.
-- Existing data is preserved. Members must be enrolled out-of-band by the owner.
-- Do NOT insert an arbitrary email or derive user identity from browser input.

begin;

create table if not exists public.nexus_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.nexus_members enable row level security;
revoke all on public.nexus_members from public, anon, authenticated;
grant select on public.nexus_members to authenticated;

create table if not exists public.nexus_sync (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  shared_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Remove ANY previous permissive or unknown policies on NEXUS tables.
-- This is intentional: unknown older policies can silently OR with restrictive policies.
do $nexus$
declare p record;
begin
  for p in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('nexus_members', 'nexus_tasks', 'nexus_wishlist',
                        'nexus_finances', 'nexus_study_work', 'nexus_sync')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end
$nexus$;

create policy nexus_members_self_read on public.nexus_members
  for select to authenticated
  using (user_id = (select auth.uid()));

-- No INSERT/UPDATE/DELETE privileges or RLS policies for membership from the client.
-- Only owner / service-role operations can authorize a new member.

do $nexus$
declare t text;
begin
  foreach t in array array['nexus_tasks','nexus_wishlist','nexus_finances','nexus_study_work','nexus_sync']
  loop
    -- Some installations have only nexus_sync; skip absent legacy tables.
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    -- Old finance rows have no owner_id: member-wide grants would expose personal
    -- spending to everyone. Keep that table inaccessible until row ownership exists.
    if t = 'nexus_finances' then
      continue;
    end if;
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);

    execute format(
      'create policy nexus_member_select on public.%I for select to authenticated using (exists (select 1 from public.nexus_members m where m.user_id = (select auth.uid())))', t);
    execute format(
      'create policy nexus_member_insert on public.%I for insert to authenticated with check (exists (select 1 from public.nexus_members m where m.user_id = (select auth.uid())))', t);
    execute format(
      'create policy nexus_member_update on public.%I for update to authenticated using (exists (select 1 from public.nexus_members m where m.user_id = (select auth.uid()))) with check (exists (select 1 from public.nexus_members m where m.user_id = (select auth.uid())))', t);
    execute format(
      'create policy nexus_member_delete on public.%I for delete to authenticated using (exists (select 1 from public.nexus_members m where m.user_id = (select auth.uid())))', t);
  end loop;
end
$nexus$;

-- Nobody gets automatically enrolled. Populate only with VERIFIED auth.users IDs
-- using Supabase dashboard SQL editor, after users register:
-- insert into public.nexus_members(user_id) values ('<ACTUAL_AUTH_USER_UUID>')
-- on conflict (user_id) do nothing;
-- Repeat once for each person. The client cannot enroll itself.

commit;
