-- 0008_welcome_seen.sql
-- Tracks when each user has dismissed (or finished) the role-aware
-- welcome tour. Null = haven't seen it yet, so the dashboard layout
-- pops the tour modal on their first visit. The /guide page can always
-- be revisited regardless of this flag.

alter table public.users
  add column if not exists welcome_seen_at timestamptz;
