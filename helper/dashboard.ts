"use server";

import { createClient } from "@/lib/supabase/server";

export interface Units {
  id: string | number;
  units: string | null;
  pc_name: string | null;
  status: string | null;
  user_balance: number | string | null;
}

export interface DashboardData {
  totalUnits: number;
  runningUnits: number;
  totalFranchises: number;
  units: Units[];
}
import { Bot } from "@/types";

export const getDashboardData = async (): Promise<DashboardData> => {
  const supabase = await createClient();

  const [
    { count: totalUnits },
    { count: runningUnits },
    { count: totalFranchises },
    { data: botData }
  ] = await Promise.all([
    supabase.from("bot").select("*", { count: "exact", head: true }),
    supabase.from("bot").select("*", { count: "exact", head: true }).eq("status", "connected"),
    supabase.from("franchise").select("*", { count: "exact", head: true }),
    supabase.from("bot").select(`
      id,
      unit_name,
      status,
      balance
    `).order("id", { ascending: true })
  ]);

  const mappedUnits: Units[] = ((botData as Bot[]) || []).map((bot) => ({
    id: bot.id,
    units: bot.unit_name,
    pc_name: bot.unit_name,
    status: bot.status === 'connected' ? 'Running' : (bot.status || 'Offline'),
    user_balance: bot.balance ?? 0
  }));




  return {
    totalUnits: totalUnits || 0,
    runningUnits: runningUnits || 0,
    totalFranchises: totalFranchises || 0,
    units: mappedUnits
  };
};

