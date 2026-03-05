"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PlatformWebsite } from "@/types";

/* ── READ ── */

export async function getPlatformWebsites() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_website")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching platform websites:", error);
    return [];
  }
  return data as PlatformWebsite[];
}

export async function getPlatformWebsiteById(id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_website")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching platform website:", error);
    return null;
  }
  return data as PlatformWebsite;
}

/* ── CREATE ── */

export async function createPlatformWebsite(
  formData: Omit<PlatformWebsite, "id" | "created_at">,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_website")
    .insert([formData])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/betting-accounts/platforms");
  return data;
}

/* ── UPDATE ── */

export async function updatePlatformWebsite(
  id: number,
  formData: Partial<Omit<PlatformWebsite, "id" | "created_at">>,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_website")
    .update(formData)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/betting-accounts/platforms");
  return data;
}

/* ── DELETE ── */

export async function deletePlatformWebsite(id: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("platform_website")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/betting-accounts/platforms");
  return true;
}
