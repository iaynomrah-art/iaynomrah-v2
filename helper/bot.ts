"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Bot } from "@/types";

export type CredentialRecord = {
  id: string;
  username: string;
  platform_website?: {
    id: number;
    platform_name: string | null;
    platform_code: string | null;
  } | null;
};


export type BaccaratRecord = {
  id: number | string;
  level: number | null;
  pattern: string | null;
  target_profit: number | null;
  actions: string | null;
  units?: string | null;
  unit_name?: string | null;
  status?: string | null;
  bot_status?: 'run' | 'stop' | null;
  user_balance?: number | string | null;
  bet_size?: number | string | null;
  strategy?: string | null;
  duration?: number | string | null;
  franchise_code?: string | null;
  platform_code?: string | null;
  credential_id?: string | null;
  available_credentials?: CredentialRecord[];
  assigned_user?: {
    id: string;
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    units?: unknown;
    credential?: CredentialRecord[];
  } | null;
  franchise_id?: string | number | null;
  pc_name?: string | null;
};

export type PlatformWebsiteRecord = {
  id: number;
  platform_name: string | null;
  platform_code: string | null;
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

export async function getPlatforms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_website")
    .select("id, platform_name, platform_code")
    .order("platform_name", { ascending: true });

  if (error) {
    console.error("Error fetching platforms:", error);
    return [];
  }
  return data as PlatformWebsiteRecord[];
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

  // Fetch bots with their relationships
  const { data, error } = await supabase
    .from("bot")
    .select(
      `
      id, user_id, status, bot_status, balance, level, pattern, target_profit, bet, strategy, duration, command, credential_id, unit_name,
      user_account(
        id, first_name, middle_name, last_name, 
        credential(*, platform_website(*))
      ), 
      credential(id, platform_website(id, platform_name, platform_code))
      `
    )
    .order("id", { ascending: true });

  // Fetch ALL credentials to populate the platform dropdown
  const { data: allCredentials, error: credError } = await supabase
    .from("credential")
    .select("id, username, platform_website(id, platform_name, platform_code)");

  if (error) {
    console.error("Error fetching baccarat / bot data:", error);
    return [];
  }
  if (credError) {
    console.error("Error fetching all credentials:", credError);
  }

  // Map all credentials to CredentialRecord format
  const allCreds: CredentialRecord[] = (allCredentials || []).map((c) => {
    const pw = Array.isArray(c.platform_website) ? c.platform_website[0] : (c.platform_website ?? null);
    return {
      id: c.id,
      username: c.username ?? '',
      platform_website: pw ? {
        id: pw.id,
        platform_name: pw.platform_name ?? null,
        platform_code: pw.platform_code ?? null,
      } : null,
    };
  });

  const rows = (data || []);

  const mapped: BaccaratRecord[] = rows.map((row) => {
    const assignedUser = Array.isArray(row.user_account)
      ? row.user_account[0]
      : (row.user_account ?? null);
    
    // Units are now unified - name is directly on the bot row
    const unitName = row.unit_name || row.id;

    const currentCredential = Array.isArray(row.credential)
      ? row.credential[0]
      : (row.credential ?? null);

    
    let platformWebsite: unknown = currentCredential?.platform_website;
    if (Array.isArray(platformWebsite)) {
        platformWebsite = (platformWebsite as unknown[])[0];
    }
    const pw = platformWebsite as { platform_name: string; platform_code: string } | null;

    return {
      id: row.id,
      units: unitName,
      unit_name: unitName,
      status: row.status ?? null,
      bot_status: row.bot_status ?? 'stop',
      bet_size: row.bet ?? null,
      user_balance: row.balance ?? null,
      level: row.level ?? null,
      pattern: row.pattern ?? null,
      target_profit: row.target_profit ?? null,
      strategy: row.strategy ?? null,
      duration: row.duration ?? null,
      franchise_code: null,
      platform_code: pw?.platform_code || pw?.platform_name || null,
      credential_id: row.credential_id ?? null,
      available_credentials: allCreds,
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

export async function createBaccaratRow(payload: Partial<BaccaratRecord & { user_id: string }>): Promise<unknown[]> {
  const supabase = await createClient();

  const insertData: Record<string, unknown> = {
    status: payload.status
      ? payload.status.charAt(0).toUpperCase() +
        payload.status.slice(1).toLowerCase()
      : "Idle",
    level: payload.level,
    pattern: payload.pattern,
    target_profit: payload.target_profit,
    bet: typeof payload.bet_size === 'string' ? parseFloat(payload.bet_size) : payload.bet_size,
    strategy: payload.strategy,
    duration: typeof payload.duration === 'string' ? parseInt(payload.duration) : payload.duration,
    user_id: payload.user_id,
    unit_name: payload.unit_name || payload.pc_name,
    franchise_id: payload.franchise_id,
  };

  // Auto-name logic if franchise is present but name is not
  if (payload.franchise_id && !insertData.unit_name) {
    const { data: franchise } = await supabase
      .from('franchise')
      .select('code, name')
      .eq('id', payload.franchise_id)
      .single();
      
    if (franchise) {
      const count = await getFranchiseUnitCount(payload.franchise_id as string);
      const prefix = franchise.code || franchise.name || "UNIT";
      insertData.unit_name = `${prefix}-${(count + 1).toString().padStart(2, '0')}`;
    }
  }

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
  franchise_id?: string | number | null;
  pc_name?: string | null;
  unit_name?: string | null;
  [key: string]: unknown;
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
  ...payload
}: UpdateBaccaratPayload): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
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
  if (payload.unit_name !== undefined) updateData.unit_name = payload.unit_name;
  if (payload.pc_name !== undefined) updateData.unit_name = payload.pc_name;
  if (payload.franchise_id !== undefined) updateData.franchise_id = payload.franchise_id;

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

export async function getFranchiseUnitCount(franchiseId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("bot")
    .select("*", { count: "exact", head: true })
    .eq("franchise_id", franchiseId);

  if (error) {
    console.error("Error fetching franchise unit count:", error);
    return 0;
  }
  return count || 0;
}

