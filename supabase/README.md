# Supabase Setup

Run this SQL in your Supabase project to create the transactions table:

1. Go to supabase.com → your project → SQL Editor
2. Click "New query"
3. Copy and paste the contents of `migrations/001_transactions.sql`
4. Click "Run"

That's it — Row Level Security is enabled automatically so each user can only access their own transactions.
