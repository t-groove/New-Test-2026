-- Fix: invited users cannot activate their own pending membership.
--
-- The existing RLS policies only allow OWNERS to UPDATE business_members rows.
-- When an invited user accepts and calls supabase.update({ is_active: true }),
-- the update is silently blocked (0 rows affected), leaving them with
-- is_active=false so getCurrentBusinessId never finds their business.
--
-- This migration adds a policy that lets any user UPDATE their own row,
-- and refreshes the SELECT policy for completeness.

-- Allow users to activate their own pending membership
-- (needed when accepting an invitation)
create policy "Users can activate own pending membership"
  on public.business_members
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Re-create the SELECT policy so users can read their own membership
-- regardless of is_active status (the original is identical, but this
-- makes the intent explicit and allows re-running safely).
drop policy if exists "Users can view own membership"
  on public.business_members;

create policy "Users can view own membership"
  on public.business_members
  for select
  using (user_id = auth.uid());
