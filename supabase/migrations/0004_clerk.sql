-- Migrate auth from Supabase Auth (uuid IDs) to Clerk (text IDs).
-- Clerk user IDs look like "user_2xY7..." so we recast every user-id column
-- from uuid to text. Sam confirmed clean slate for users + brand_members.

-- 1. Drop the old auth-mirror trigger and helper. Clerk doesn't write to auth.users.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_auth_user;

-- 2. Drop foreign keys that reference public.users so we can change the type.
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

-- 3. Clean slate for users. Brands, knowledge, plans stay.
delete from public.brand_members;
delete from public.users;

-- 4. Recast every user_id column to text.
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

-- 5. Recreate foreign keys. They now reference public.users(id) which is text.
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

-- 6. The current_user_role() helper used auth.uid() (Supabase Auth).
-- With Clerk we use the service-role server client for all writes, so RLS
-- still works for direct anon reads but we don't rely on auth.uid().
-- has_brand_access() and is_admin() still work for service-role queries
-- (they bypass RLS) and for anon reads they'll just return false unless
-- a Clerk JWT is set up later as a third-party Supabase auth provider.

create or replace function public.current_user_role() returns user_role
language sql stable security definer set search_path = public as $$
  select null::user_role
$$;
