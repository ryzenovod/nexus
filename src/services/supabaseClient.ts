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
-- Unified table for Live Feed from fetch_data.py + Couple Shared State
-- Run this script in your Supabase Project -> SQL Editor
-- =========================================================

create table if not exists public.nexus_sync (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  shared_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.nexus_sync enable row level security;

drop policy if exists "Allow public read/write for couple" on public.nexus_sync;
create policy "Allow public read/write for couple" on public.nexus_sync for all using (true) with check (true);

-- Enable Realtime for instant push across all 4 devices
alter publication supabase_realtime add table public.nexus_sync;
`;

export async function fetchNexusSyncFeed(url: string, anonKey: string): Promise<{ payload: any; shared_state?: any } | null> {
  try {
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/nexus_sync?id=eq.main_feed&select=*`;
    const resp = await fetch(endpoint, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    if (!resp.ok) return null;
    const rows = await resp.json();
    if (Array.isArray(rows) && rows.length > 0) {
      return {
        payload: rows[0].payload,
        shared_state: rows[0].shared_state,
      };
    }
    return null;
  } catch (e) {
    console.warn('Failed to fetch from Supabase nexus_sync:', e);
    return null;
  }
}

export async function pushSharedStateToNexusSync(url: string, anonKey: string, sharedState: any): Promise<boolean> {
  try {
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/nexus_sync`;
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: 'main_feed',
        shared_state: sharedState,
        updated_at: new Date().toISOString(),
      }),
    });
    return resp.ok;
  } catch (e) {
    console.warn('Failed to push shared state to Supabase:', e);
    return false;
  }
}

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
