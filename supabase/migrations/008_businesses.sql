-- Businesses table
create table if not exists public.businesses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references auth.users(id)
    on delete restrict not null,
  entity_type text default 'LLC'
    check (entity_type in (
      'LLC', 'S-Corp', 'C-Corp', 'Sole Proprietor',
      'Partnership', 'Non-Profit', 'Other'
    )),
  tax_year_end text default 'December',
  accounting_method text default 'cash'
    check (accounting_method in ('cash', 'accrual')),
  industry text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  website text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Business memberships
create table if not exists public.business_members (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id)
    on delete cascade not null,
  user_id uuid references auth.users(id)
    on delete cascade not null,
  role text not null default 'bookkeeper'
    check (role in (
      'owner', 'accountant', 'bookkeeper', 'readonly'
    )),
  invited_email text,
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(business_id, user_id)
);

-- Pending invitations
create table if not exists public.business_invitations (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id)
    on delete cascade not null,
  invited_email text not null,
  role text not null default 'bookkeeper'
    check (role in (
      'owner', 'accountant', 'bookkeeper', 'readonly'
    )),
  invited_by uuid references auth.users(id) not null,
  token uuid default gen_random_uuid() unique not null,
  accepted_at timestamptz,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

-- Add business_id to all data tables
alter table public.transactions
  add column if not exists business_id uuid
    references public.businesses(id) on delete cascade;

alter table public.bank_accounts
  add column if not exists business_id uuid
    references public.businesses(id) on delete cascade;

alter table public.journal_entries
  add column if not exists business_id uuid
    references public.businesses(id) on delete cascade;

-- Indexes
create index if not exists businesses_owner_id_idx
  on public.businesses(owner_id);
create index if not exists business_members_user_id_idx
  on public.business_members(user_id);
create index if not exists business_members_business_id_idx
  on public.business_members(business_id);
create index if not exists transactions_business_id_idx
  on public.transactions(business_id);
create index if not exists bank_accounts_business_id_idx
  on public.bank_accounts(business_id);
create index if not exists journal_entries_business_id_idx
  on public.journal_entries(business_id);

-- RLS policies for businesses
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.business_invitations enable row level security;

create policy "Members can view their businesses"
  on public.businesses for select
  using (
    id in (
      select business_id from public.business_members
      where user_id = auth.uid() and is_active = true
    )
  );

create policy "Owners can update their business"
  on public.businesses for update
  using (owner_id = auth.uid());

create policy "Anyone can create a business"
  on public.businesses for insert
  with check (owner_id = auth.uid());

create policy "Owners can delete their business"
  on public.businesses for delete
  using (owner_id = auth.uid());

create policy "Members can view memberships"
  on public.business_members for select
  using (
    business_id in (
      select business_id from public.business_members
      where user_id = auth.uid() and is_active = true
    )
  );

create policy "Owners can manage memberships"
  on public.business_members for all
  using (
    business_id in (
      select id from public.businesses
      where owner_id = auth.uid()
    )
  );

create policy "Members can view invitations"
  on public.business_invitations for select
  using (
    business_id in (
      select business_id from public.business_members
      where user_id = auth.uid() and is_active = true
    )
  );

create policy "Owners can manage invitations"
  on public.business_invitations for all
  using (
    business_id in (
      select id from public.businesses
      where owner_id = auth.uid()
    )
  );
