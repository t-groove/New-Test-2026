-- Journal entry headers
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id)
    on delete cascade not null,
  date date not null,
  description text not null,
  entry_type text not null default 'manual'
    check (entry_type in (
      'depreciation', 'amortization', 'accrual',
      'prepaid', 'adjustment', 'manual'
    )),
  is_balanced boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Journal entry lines (debits and credits)
create table if not exists public.journal_entry_lines (
  id uuid default gen_random_uuid() primary key,
  journal_entry_id uuid references public.journal_entries(id)
    on delete cascade not null,
  account_name text not null,
  account_type text not null
    check (account_type in (
      'Income', 'Expense', 'Asset', 'Equity', 'Liability'
    )),
  debit numeric(12,2) not null default 0,
  credit numeric(12,2) not null default 0,
  asset_name text,
  depreciation_method text
    check (depreciation_method in (
      'straight_line', 'manual', null
    )),
  notes text
);

-- RLS policies
alter table public.journal_entries
  enable row level security;
alter table public.journal_entry_lines
  enable row level security;

create policy "Users own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id);

create policy "Users own journal entry lines"
  on public.journal_entry_lines for all
  using (
    journal_entry_id in (
      select id from public.journal_entries
      where user_id = auth.uid()
    )
  );

create index journal_entries_user_id_idx
  on public.journal_entries(user_id);
create index journal_entries_date_idx
  on public.journal_entries(date);
create index journal_entry_lines_entry_id_idx
  on public.journal_entry_lines(journal_entry_id);
