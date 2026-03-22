-- Add personal profile fields to the existing public.users table
-- public.users already exists (created in initial-setup.sql)

alter table public.users
  add column if not exists phone text,
  add column if not exists job_title text,
  add column if not exists timezone text default 'America/New_York';

-- Ensure updated_at exists (initial-setup.sql has it but just in case)
alter table public.users
  add column if not exists updated_at timestamptz default now();

-- Allow users to update their own profile row
-- (initial-setup.sql only creates a SELECT policy)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'Users can update own profile'
  ) then
    execute 'create policy "Users can update own profile" on public.users
      for update using (auth.uid()::text = user_id)
      with check (auth.uid()::text = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'Users can insert own profile'
  ) then
    execute 'create policy "Users can insert own profile" on public.users
      for insert with check (auth.uid()::text = user_id)';
  end if;
end
$$;
