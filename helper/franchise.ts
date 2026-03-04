"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Franchise = {
  id: string;
  created_at?: string;
  name: string | null;
  code: string | null;
  description: string | null;
  investor_name: string | null;
};

/* ── READ ── */

export async function getFranchises() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("franchise")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching franchises:", error);
    return [];
  }
  return data;
}

export async function getFranchiseById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("franchise")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching franchise:", error);
    return null;
  }
  return data;
}

/* ── CREATE ── */

export async function createFranchise(
  formData: Omit<Franchise, "id" | "created_at">,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("franchise")
    .insert([formData])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/franchise");
  return data;
}

/* ── UPDATE ── */

export async function updateFranchise(
  id: string,
  formData: Partial<Omit<Franchise, "id" | "created_at">>,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("franchise")
    .update(formData)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/franchise");
  return data;
}

/* ── DELETE ── */

export async function deleteFranchise(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("franchise").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/franchise");
  return true;
}
