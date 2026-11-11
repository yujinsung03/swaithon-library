-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Creates the Feedback Book table. Each (anonymous or logged-in) user only sees their own rows.

create table if not exists public.feedback_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('speak', 'listen')),
  korean      text not null,
  memo        text not null default '',
  -- kind-specific fields:
  --   speak:  { sourceText, intentEnglish, tone, corrections: [{ before, after, reason }] }
  --   listen: { english, expressions: [{ word, tag, explanation }] }
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists feedback_entries_user_created_idx
  on public.feedback_entries (user_id, created_at desc);

alter table public.feedback_entries enable row level security;

drop policy if exists "Users read own feedback" on public.feedback_entries;
create policy "Users read own feedback" on public.feedback_entries
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own feedback" on public.feedback_entries;
create policy "Users insert own feedback" on public.feedback_entries
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own feedback" on public.feedback_entries;
create policy "Users update own feedback" on public.feedback_entries
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own feedback" on public.feedback_entries;
create policy "Users delete own feedback" on public.feedback_entries
  for delete to authenticated using ((select auth.uid()) = user_id);
