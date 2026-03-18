-- Store Plaid access tokens per bank account
alter table public.bank_accounts
  add column if not exists plaid_access_token text,
  add column if not exists plaid_item_id text,
  add column if not exists plaid_account_id text,
  add column if not exists plaid_institution_name text,
  add column if not exists plaid_institution_id text,
  add column if not exists plaid_last_synced_at timestamptz,
  add column if not exists plaid_cursor text,
  add column if not exists is_plaid_connected boolean default false;

-- Index for finding Plaid connected accounts
create index if not exists bank_accounts_plaid_item_id_idx
  on public.bank_accounts(plaid_item_id);
