-- Fix infinite recursion in businesses RLS policies.
-- The original policy for businesses checked business_members,
-- which itself checked businesses, causing a circular loop.

-- Drop all old policies so we can replace them cleanly
drop policy if exists "Members can view their businesses"
  on public.businesses;
drop policy if exists "Owners can update their business"
  on public.businesses;
drop policy if exists "Anyone can create a business"
  on public.businesses;
drop policy if exists "Owners can delete their business"
  on public.businesses;
drop policy if exists "Members can view memberships"
  on public.business_members;
drop policy if exists "Owners can manage memberships"
  on public.business_members;
drop policy if exists "Members can view invitations"
  on public.business_invitations;
drop policy if exists "Owners can manage invitations"
  on public.business_invitations;

-- Security-definer function: returns the business_ids the current
-- user belongs to WITHOUT touching the businesses table, which
-- breaks the circular dependency.
create or replace function public.get_user_business_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select business_id
  from public.business_members
  where user_id = auth.uid()
    and is_active = true
$$;

-- Businesses: owner has full access; members can SELECT via the
-- security-definer helper (no recursion).
create policy "Owner full access to own businesses"
  on public.businesses for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Members can view their businesses"
  on public.businesses for select
  using (
    id in (select public.get_user_business_ids())
    or owner_id = auth.uid()
  );

-- Business members: users can see their own row (needed on first
-- insert before the helper can run) plus any row for businesses
-- they belong to; owners manage all rows in their businesses.
create policy "Users can view own membership"
  on public.business_members for select
  using (user_id = auth.uid());

create policy "Members can view same-business members"
  on public.business_members for select
  using (
    business_id in (select public.get_user_business_ids())
  );

create policy "Owners can manage their business members"
  on public.business_members for all
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  )
  with check (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

-- Business invitations
create policy "Owners can manage invitations"
  on public.business_invitations for all
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  )
  with check (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "Members can view invitations"
  on public.business_invitations for select
  using (
    business_id in (select public.get_user_business_ids())
  );

-- Update transactions RLS to allow business members access
-- (not just the row owner) so team members can see/edit data.
drop policy if exists "Users can only access their own transactions"
  on public.transactions;

create policy "Business members can access transactions"
  on public.transactions for all
  using (
    business_id in (select public.get_user_business_ids())
    or user_id = auth.uid()
  )
  with check (
    business_id in (select public.get_user_business_ids())
    or user_id = auth.uid()
  );

-- Update bank_accounts RLS similarly
drop policy if exists "Users can only access their own bank accounts"
  on public.bank_accounts;

create policy "Business members can access bank accounts"
  on public.bank_accounts for all
  using (
    business_id in (select public.get_user_business_ids())
    or user_id = auth.uid()
  )
  with check (
    business_id in (select public.get_user_business_ids())
    or user_id = auth.uid()
  );
