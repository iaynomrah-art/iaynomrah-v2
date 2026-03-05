"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Unit = {
  id: string;
  created_at?: string;
  unit_name: string | null;
  api_base_url: string | null;
  franchise_id: string | null;
  guid: string | null;
  status: string | null;
};

/* ── READ ── */

export async function getUnits() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("units")
    .select("*, franchise(*), user_account(*, bot(*))")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching units:", error);
    return [];
  }
  return data;
}

export async function getUnitById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("units")
    .select("*, franchise(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching unit:", error);
    return null;
  }
  return data;
}

/* ── CREATE ── */

export async function createUnit(formData: Omit<Unit, "id" | "created_at">) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("units")
    .insert([formData])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trading-units/my-units");
  return data;
}

/* ── UPDATE ── */

export async function updateUnit(
  id: string,
  formData: Partial<Omit<Unit, "id" | "created_at">>,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("units")
    .update(formData)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trading-units/my-units");
  return data;
}

/* ── DELETE ── */

export async function deleteUnit(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("units").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trading-units/my-units");
  return true;
}
