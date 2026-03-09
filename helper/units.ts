"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getFranchiseUnitCount } from "./bot";

import { Unit } from "@/types";

/* ── READ ── */

export async function getUnits() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bot")
    .select("*, franchise:franchise!bot_franchise_id_fkey(*), user_account(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching units:", error);
    return [];
  }
  
  return (data || []).map(item => ({
    ...item,
    franchise_id: item.franchise_id,
  }));
}

export async function getUnitById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bot")
    .select("*, franchise:franchise!bot_franchise_id_fkey(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching unit:", error);
    return null;
  }
  
  return {
    ...data,
    franchise_id: data.franchise_id,
  };
}

/* ── CREATE ── */

export async function createUnit(formData: Omit<Unit, "id" | "created_at">) {
  const supabase = await createClient();
  
  let unit_name = formData.unit_name;
  
  if (formData.franchise_id) {
    const { data: franchise } = await supabase
      .from('franchise')
      .select('code, name')
      .eq('id', formData.franchise_id)
      .single();
      
    if (franchise) {
      const count = await getFranchiseUnitCount(formData.franchise_id);
      const prefix = franchise.code || franchise.name || "UNIT";
      unit_name = `${prefix}-${(count + 1).toString().padStart(2, '0')}`;
    }
  }

  const { data, error } = await supabase
    .from("bot")
    .insert([{ 
      ...formData, 
      unit_name,
      franchise_id: formData.franchise_id 
    }])
    .select("*, franchise:franchise!bot_franchise_id_fkey(*)");

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/units");
  return data;
}

/* ── UPDATE ── */

export async function updateUnit(
  id: string,
  formData: Partial<Omit<Unit, "id" | "created_at">>,
) {
  const supabase = await createClient();
  
  const updateData: Record<string, unknown> = { ...formData };
  
  // If franchise_id is changing, we should probably update the name too
  if (formData.franchise_id) {
    updateData.franchise_id = formData.franchise_id;
    
    // Auto-update name if it's currently matching an old franchise pattern or if user wants it
    // The user said "automatically name change" - usually implies whenever assigned.
    const { data: franchise } = await supabase
      .from('franchise')
      .select('code, name')
      .eq('id', formData.franchise_id)
      .single();
      
    if (franchise) {
      const count = await getFranchiseUnitCount(formData.franchise_id);
      const prefix = franchise.code || franchise.name || "UNIT";
      updateData.unit_name = `${prefix}-${(count + 1).toString().padStart(2, '0')}`;
    }
  }

  const { data, error } = await supabase
    .from("bot")
    .update(updateData)
    .eq("id", id)
    .select("*, franchise:franchise!bot_franchise_id_fkey(*)");

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/units");
  return data;
}

/* ── DELETE ── */

export async function deleteUnit(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bot").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/units");
  return true;
}

