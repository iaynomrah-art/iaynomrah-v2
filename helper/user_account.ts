"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { UserAccount } from "@/types";

/* ── READ ── */

export async function getUserAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .select("*, bot(*, franchise(*)), credential(*, platform_website(*))")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user accounts:", error);
    return [];
  }
  return data;
}

export async function getUserAccountById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .select("*, bot(*), credential(*, platform_website(*))")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user account:", error);
    return null;
  }
  return data;
}


/* ── CREATE ── */

export async function createUserAccount(
  formData: Omit<UserAccount, "id" | "created_at">,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .insert([formData])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/betting-accounts/accounts");
  return data;
}

/* ── UPDATE ── */

export async function updateUserAccount(
  id: string,
  formData: Partial<Omit<UserAccount, "id" | "created_at">>,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .update(formData)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/betting-accounts/accounts");
  return data;
}

/* ── DELETE ── */

export async function deleteUserAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("user_account").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/betting-accounts/accounts");
  return true;
}
