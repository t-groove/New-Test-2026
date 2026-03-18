import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid/client'
import { createClient } from '../../../../../supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    public_token,
    plaid_account_id,
    institution_name,
    institution_id,
    account_name,
    account_mask,
    account_subtype,
    existing_account_id,
    business_id,
  } = await req.json()

  const tokenResponse = await plaidClient.itemPublicTokenExchange({ public_token })
  const accessToken = tokenResponse.data.access_token
  const itemId = tokenResponse.data.item_id

  const accountTypeMap: Record<string, string> = {
    checking: 'checking',
    savings: 'savings',
    credit: 'credit_card',
    paypal: 'other',
  }
  const accountType = accountTypeMap[account_subtype as string] ?? 'checking'

  if (existing_account_id) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update({
        plaid_access_token: accessToken,
        plaid_item_id: itemId,
        plaid_account_id,
        plaid_institution_name: institution_name,
        plaid_institution_id: institution_id,
        is_plaid_connected: true,
        last_four: account_mask,
        bank_name: institution_name,
      })
      .eq('id', existing_account_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, account: data })
  } else {
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        user_id: user.id,
        business_id,
        name: account_name,
        bank_name: institution_name,
        account_type: accountType,
        last_four: account_mask,
        plaid_access_token: accessToken,
        plaid_item_id: itemId,
        plaid_account_id,
        plaid_institution_name: institution_name,
        plaid_institution_id: institution_id,
        is_plaid_connected: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, account: data })
  }
}
