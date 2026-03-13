create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  description text not null,
  amount numeric(12,2) not null,
  type text not null check (type in ('income', 'expense')),
  category text not null default 'Uncategorized',
  account_name text,
  raw_csv_row text,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users can only access their own transactions"
  on public.transactions
  for all
  using (auth.uid() = user_id);

create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(date);
