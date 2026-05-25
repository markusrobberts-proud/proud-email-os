-- Migrate auth from Supabase Auth (uuid IDs) to Clerk (text IDs).
-- Clerk user IDs look like "user_2xY7..." so we recast every user-id column
-- from uuid to text.
--
-- IDEMPOTENCY: this migration is destructive on first run (wipes
-- public.users + public.brand_members and recasts FKs). A `do $$` block
-- can only abort itself, not the whole script, so we raise an exception
-- when the migration is already applied. That stops the rest of the
-- script from running and shows a clear message in the SQL editor.
-- We detect "already applied" by checking whether public.users.id is
-- already a text column.
do $$
declare
  uid_type text;
begin
  select data_type into uid_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'users'
    and column_name = 'id';
  if uid_type = 'text' then
    raise exception 'Clerk migration 0004 has already been applied (public.users.id is text). Aborting to avoid wiping data.';
  end if;
end $$;

-- 1. Drop the old auth-mirror trigger and helper. Clerk doesn't write to auth.users.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_auth_user;

-- 2. Drop every RLS policy that touches a user-id column or auth.uid().
--    They all need to be recreated (or replaced) anyway because we no longer
--    have Supabase Auth populating auth.uid().
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- 3. Drop foreign keys that reference public.users so we can change the type.
alter table public.brand_members drop constraint if exists brand_members_user_id_fkey;
alter table public.brands drop constraint if exists brands_digital_lead_id_fkey;
alter table public.brands drop constraint if exists brands_designer_id_fkey;
alter table public.knowledge_items drop constraint if exists knowledge_items_added_by_user_id_fkey;
alter table public.proud_strategy_sections drop constraint if exists proud_strategy_sections_updated_by_user_id_fkey;
alter table public.proud_strategy_revisions drop constraint if exists proud_strategy_revisions_edited_by_user_id_fkey;
alter table public.campaign_plans drop constraint if exists campaign_plans_approved_by_user_id_fkey;
alter table public.approval_links drop constraint if exists approval_links_created_by_user_id_fkey;
alter table public.audit_log drop constraint if exists audit_log_user_id_fkey;
alter table public.users drop constraint if exists users_id_fkey;

-- 4. Clean slate for users + brand_members. Also null out every other
--    user-id reference so the recreated foreign keys don't choke on
--    orphans from the wiped users table.
delete from public.brand_members;
delete from public.users;
update public.brands set digital_lead_id = null, designer_id = null;
update public.knowledge_items set added_by_user_id = null;
update public.proud_strategy_sections set updated_by_user_id = null;
update public.proud_strategy_revisions set edited_by_user_id = null;
update public.campaign_plans set approved_by_user_id = null;
update public.approval_links set created_by_user_id = null;
update public.audit_log set user_id = null;

-- 5. Recast every user_id column from uuid to text.
alter table public.users alter column id type text using id::text;
alter table public.brand_members alter column user_id type text using user_id::text;
alter table public.brands
  alter column digital_lead_id type text using digital_lead_id::text,
  alter column designer_id type text using designer_id::text;
alter table public.knowledge_items alter column added_by_user_id type text using added_by_user_id::text;
alter table public.proud_strategy_sections
  alter column updated_by_user_id type text using updated_by_user_id::text;
alter table public.proud_strategy_revisions
  alter column edited_by_user_id type text using edited_by_user_id::text;
alter table public.campaign_plans
  alter column approved_by_user_id type text using approved_by_user_id::text;
alter table public.approval_links
  alter column created_by_user_id type text using created_by_user_id::text;
alter table public.audit_log alter column user_id type text using user_id::text;

-- 6. Recreate foreign keys against the text id.
alter table public.brand_members
  add constraint brand_members_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;
alter table public.brands
  add constraint brands_digital_lead_id_fkey
  foreign key (digital_lead_id) references public.users(id) on delete set null,
  add constraint brands_designer_id_fkey
  foreign key (designer_id) references public.users(id) on delete set null;
alter table public.knowledge_items
  add constraint knowledge_items_added_by_user_id_fkey
  foreign key (added_by_user_id) references public.users(id) on delete set null;
alter table public.proud_strategy_sections
  add constraint proud_strategy_sections_updated_by_user_id_fkey
  foreign key (updated_by_user_id) references public.users(id) on delete set null;
alter table public.proud_strategy_revisions
  add constraint proud_strategy_revisions_edited_by_user_id_fkey
  foreign key (edited_by_user_id) references public.users(id) on delete set null;
alter table public.campaign_plans
  add constraint campaign_plans_approved_by_user_id_fkey
  foreign key (approved_by_user_id) references public.users(id) on delete set null;
alter table public.approval_links
  add constraint approval_links_created_by_user_id_fkey
  foreign key (created_by_user_id) references public.users(id) on delete set null;
alter table public.audit_log
  add constraint audit_log_user_id_fkey
  foreign key (user_id) references public.users(id) on delete set null;

-- 7. current_user_role() is no longer used by the app. Server code authenticates
-- via Clerk and writes through the Supabase service-role client (RLS-exempt).
-- Return null so any leftover SQL caller never accidentally elevates privileges.
create or replace function public.current_user_role() returns user_role
language sql stable security definer set search_path = public as $$
  select null::user_role
$$;

-- 8. RLS posture after migration.
-- All app access goes through the service-role server client, which bypasses
-- RLS. We keep RLS enabled on every table (defence in depth) with no
-- permissive policies, so any future anon/authenticated client query is
-- denied by default. Add scoped policies later if/when we wire Clerk's JWT
-- as a third-party Supabase auth provider.
--
-- (Nothing to do here. The previous step already dropped every policy and
-- RLS is still enabled from 0001_init.sql.)
