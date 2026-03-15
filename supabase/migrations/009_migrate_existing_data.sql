-- For existing users: create a default business and
-- migrate their data to it.

-- Create businesses for all existing users who have data
insert into public.businesses (name, owner_id)
select distinct
  'My Business' as name,
  user_id as owner_id
from public.transactions
where user_id not in (select owner_id from public.businesses)
on conflict do nothing;

-- Also create businesses for users who have bank accounts but no transactions
insert into public.businesses (name, owner_id)
select distinct
  'My Business' as name,
  user_id as owner_id
from public.bank_accounts
where user_id not in (select owner_id from public.businesses)
on conflict do nothing;

-- Add owner as member of their own business
insert into public.business_members
  (business_id, user_id, role, accepted_at)
select
  b.id as business_id,
  b.owner_id as user_id,
  'owner' as role,
  now() as accepted_at
from public.businesses b
where b.owner_id not in (
  select user_id from public.business_members
  where business_id = b.id
)
on conflict do nothing;

-- Migrate transactions to business
update public.transactions t
set business_id = b.id
from public.businesses b
where t.user_id = b.owner_id
  and t.business_id is null;

-- Migrate bank accounts to business
update public.bank_accounts ba
set business_id = b.id
from public.businesses b
where ba.user_id = b.owner_id
  and ba.business_id is null;

-- Migrate journal entries to business
update public.journal_entries je
set business_id = b.id
from public.businesses b
where je.user_id = b.owner_id
  and je.business_id is null;
