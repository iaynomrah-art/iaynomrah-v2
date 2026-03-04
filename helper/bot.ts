"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Bot = {
  id: string;
  created_at?: string;
  user_id: string | null;
  balance: number | null;
  status: string | null;
  bet: number | null;
  pattern: string | null;
  level: number | null;
  target_profit: number | null;
  command: boolean | null;
  duration: number | null;
  strategy: string | null;
};

export type BaccaratRecord = {
  id: number | string;
  level: number | null;
  pattern: string | null;
  target_profit: number | null;
  actions: string | null;
  units?: string | null;
  status?: string | null;
  user_balance?: number | string | null;
  bet_size?: number | string | null;
  strategy?: string | null;
  duration?: number | string | null;
  franchise_code?: string | null;
  platform_code?: string | null;
  assigned_user?: {
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
  } | null;
};

/* ── READ ── */

export async function getBots() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bot")
    .select("*, user_account(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bots:", error);
    return [];
  }
  return data;
}

export async function getBotById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bot")
    .select("*, user_account(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching bot:", error);
    return null;
  }
  return data;
}

/**
 * Fetch all bots and map fields for the Play Baccarat table view.
 * This is the primary data source for the play-baccarat page.
 */
export async function getBaccaratData(): Promise<BaccaratRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bot")
    .select(
      "id, user_id, status, balance, level, pattern, target_profit, bet, strategy, duration, command, user_account(first_name, middle_name, last_name)",
    )
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching baccarat / bot data:", error);
    return [];
  }

  const rows = (data || []) as any[];

  const mapped: BaccaratRecord[] = rows.map((row) => {
    const assignedUser = Array.isArray(row.user_account)
      ? row.user_account[0]
      : (row.user_account ?? null);

    return {
      id: row.id,
      units: row.id,
      status: row.status ?? null,
      bet_size: row.bet ?? null,
      user_balance: row.balance ?? null,
      level: row.level ?? null,
      pattern: row.pattern ?? null,
      target_profit: row.target_profit ?? null,
      strategy: row.strategy ?? null,
      duration: row.duration ?? null,
      franchise_code: null,
      platform_code: null,
      assigned_user: assignedUser,
      actions: null,
    };
  });

  return mapped;
}

/* ── CREATE ── */

export async function createBot(formData: Omit<Bot, "id" | "created_at">) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bot")
    .insert([formData])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trade/play-baccarat");
  return data;
}

export async function createBaccaratRow(payload: any): Promise<any[]> {
  const supabase = await createClient();

  const insertData: any = {
    status: payload.status
      ? payload.status.charAt(0).toUpperCase() +
        payload.status.slice(1).toLowerCase()
      : "Idle",
    level: payload.level,
    pattern: payload.pattern,
    target_profit: payload.target_profit,
    bet: payload.bet_size,
    strategy: payload.strategy,
    duration: payload.duration,
    user_id: payload.user_id,
  };

  const { data, error } = await supabase
    .from("bot")
    .insert([insertData])
    .select();

  if (error) {
    console.error("Error creating bot row:", error);
    throw error;
  }

  revalidatePath("/dashboard/trade/play-baccarat");
  return data || [];
}

/* ── UPDATE ── */

export async function updateBot(
  id: string,
  formData: Partial<Omit<Bot, "id" | "created_at">>,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bot")
    .update(formData)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trade/play-baccarat");
  return data;
}

type UpdateBaccaratPayload = {
  id: number | string;
  level: number | null;
  pattern: string | null;
  target_profit: number | null;
  bet_size?: number | null;
  strategy?: string | null;
  status?: string | null;
  command?: boolean;
  duration?: number | null;
  user_id?: string | null;
  platform_code?: string | null;
  [key: string]: any;
};

export async function updateBaccaratRow({
  id,
  level,
  pattern,
  target_profit,
  bet_size,
  strategy,
  status,
  command,
  duration,
  user_id,
}: UpdateBaccaratPayload): Promise<void> {
  const supabase = await createClient();

  const updateData: any = {
    level,
    pattern,
    target_profit,
  };

  if (status !== undefined && status !== null) {
    updateData.status =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  } else if (status === null) {
    updateData.status = null;
  }

  if (command !== undefined) updateData.command = command;
  if (bet_size !== undefined) updateData.bet = bet_size;
  if (strategy !== undefined) updateData.strategy = strategy;
  if (duration !== undefined) updateData.duration = duration;
  if (user_id !== undefined) updateData.user_id = user_id;

  const { error } = await supabase.from("bot").update(updateData).eq("id", id);

  if (error) {
    console.error("Error updating bot row:", error);
    throw error;
  }

  revalidatePath("/dashboard/trade/play-baccarat");
}

/* ── DELETE ── */

export async function deleteBot(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bot").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trade/play-baccarat");
  return true;
}

/* ── UTILITIES ── */

export async function getFranchiseUnitCount(
  franchiseId: number,
): Promise<number> {
  // Since the bot table no longer has franchise_id,
  // this returns 0. Adjust if franchise tracking is re-added.
  return 0;
}
