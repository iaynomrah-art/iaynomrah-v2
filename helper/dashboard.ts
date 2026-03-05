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

interface RawUnitData {
  id: string;
  unit_name: string | null;
  status: string | null;
  user_account: {
    bot: {
      balance: number | null;
    }[];
  }[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const supabase = await createClient();

  const [
    { count: totalUnits },
    { count: runningUnits },
    { count: totalFranchises },
    { data: unitsData }
  ] = await Promise.all([
    supabase.from("units").select("*", { count: "exact", head: true }),
    supabase.from("units").select("*", { count: "exact", head: true }).eq("status", "connected"),
    supabase.from("franchise").select("*", { count: "exact", head: true }),
    supabase.from("units").select(`
      id,
      unit_name,
      status,
      user_account (
        bot (
          balance
        )
      )
    `).order("id", { ascending: true })
  ]);

  const mappedUnits: Units[] = ((unitsData as unknown as RawUnitData[]) || []).map((unit) => ({
    id: unit.id,
    units: unit.unit_name,
    pc_name: null,
    status: unit.status === 'connected' ? 'Running' : 'Offline',
    user_balance: unit.user_account?.[0]?.bot?.[0]?.balance ?? 0
  }));


  return {
    totalUnits: totalUnits || 0,
    runningUnits: runningUnits || 0,
    totalFranchises: totalFranchises || 0,
    units: mappedUnits
  };
};

