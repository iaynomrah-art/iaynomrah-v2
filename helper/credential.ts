"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Credential } from "@/types";

/* ── READ ── */

export async function getCredentials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credential")
    .select("*, user_account(*), platform_website(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching credentials:", error);
    return [];
  }
  return data;
}

export async function getCredentialById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credential")
    .select("*, user_account(*), platform_website(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching credential:", error);
    return null;
  }
  return data;
}

/* ── CREATE ── */

export async function createCredential(
  formData: Omit<Credential, "id" | "created_at">,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credential")
    .insert([formData])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/betting-accounts/credentials");
  return data;
}

/* ── UPDATE ── */

export async function updateCredential(
  id: string,
  formData: Partial<Omit<Credential, "id" | "created_at">>,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credential")
    .update(formData)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/betting-accounts/credentials");
  return data;
}

/* ── DELETE ── */

export async function deleteCredential(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("credential").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/betting-accounts/credentials");
  return true;
}
