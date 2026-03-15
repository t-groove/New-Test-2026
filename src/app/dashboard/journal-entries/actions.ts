"use server";

import { createClient } from "../../../../supabase/server";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
  asset_name: string | null;
  depreciation_method: string | null;
  notes: string | null;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  description: string;
  entry_type: string;
  is_balanced: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  journal_entry_lines: JournalEntryLine[];
}

export interface CreateJournalEntryLine {
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
  asset_name?: string;
  depreciation_method?: string;
  notes?: string;
}

// ── Fetch all journal entries with nested lines ────────────────────────────────

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*, journal_entry_lines(*)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error || !data) return [];
  return data as JournalEntry[];
}

// ── Create a complete journal entry with lines ─────────────────────────────────

export async function createJournalEntry(data: {
  date: string;
  description: string;
  entry_type: string;
  notes?: string;
  lines: CreateJournalEntryLine[];
}): Promise<{ success: true; entry: JournalEntry } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const totalDebits = data.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredits = data.lines.reduce((s, l) => s + l.credit, 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;

    if (!isBalanced) {
      return {
        success: false,
        error: `Debits ($${totalDebits.toFixed(2)}) must equal credits ($${totalCredits.toFixed(2)})`,
      };
    }

    const { data: entry, error: entryError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        date: data.date,
        description: data.description,
        entry_type: data.entry_type,
        notes: data.notes ?? null,
        is_balanced: isBalanced,
      })
      .select()
      .single();

    if (entryError || !entry) {
      return { success: false, error: entryError?.message ?? "Failed to create entry" };
    }

    const { error: linesError } = await supabase.from("journal_entry_lines").insert(
      data.lines.map((l) => ({
        journal_entry_id: entry.id,
        account_name: l.account_name,
        account_type: l.account_type,
        debit: l.debit,
        credit: l.credit,
        asset_name: l.asset_name ?? null,
        depreciation_method: l.depreciation_method ?? null,
        notes: l.notes ?? null,
      }))
    );

    if (linesError) {
      await supabase.from("journal_entries").delete().eq("id", entry.id);
      return { success: false, error: linesError.message };
    }

    const { data: fullEntry, error: fetchError } = await supabase
      .from("journal_entries")
      .select("*, journal_entry_lines(*)")
      .eq("id", entry.id)
      .single();

    if (fetchError || !fullEntry) {
      return { success: false, error: "Entry created but could not be fetched" };
    }

    return { success: true, entry: fullEntry as JournalEntry };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ── Delete a journal entry (cascades to lines) ────────────────────────────────

export async function deleteJournalEntry(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ── Get accumulated depreciation for balance sheet ────────────────────────────

export async function getAccumulatedDepreciation(asOfDate: string): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data: entries } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("user_id", user.id)
      .lte("date", asOfDate);

    if (!entries || entries.length === 0) return 0;
    const ids = entries.map((e: { id: string }) => e.id);

    const { data: lines } = await supabase
      .from("journal_entry_lines")
      .select("credit")
      .in("journal_entry_id", ids)
      .eq("account_name", "Accumulated Depreciation");

    return (lines ?? []).reduce((sum: number, l: { credit: number }) => sum + Number(l.credit), 0);
  } catch {
    return 0;
  }
}

// ── Get depreciation expense for P&L ─────────────────────────────────────────

export async function getDepreciationExpense(year: number): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data: entries } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("user_id", user.id)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`);

    if (!entries || entries.length === 0) return 0;
    const ids = entries.map((e: { id: string }) => e.id);

    const { data: lines } = await supabase
      .from("journal_entry_lines")
      .select("debit")
      .in("journal_entry_id", ids)
      .eq("account_name", "Depreciation Expense");

    return (lines ?? []).reduce((sum: number, l: { debit: number }) => sum + Number(l.debit), 0);
  } catch {
    return 0;
  }
}
