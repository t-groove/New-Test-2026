-- Add split tracking columns to transactions table
alter table public.transactions
  add column if not exists is_split boolean default false,
  add column if not exists parent_id uuid
    references public.transactions(id)
    on delete cascade,
  add column if not exists split_index integer;

-- Index for finding children of a split transaction
create index if not exists transactions_parent_id_idx
  on public.transactions(parent_id);
