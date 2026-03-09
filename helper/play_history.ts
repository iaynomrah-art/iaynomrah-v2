"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { PlayHistory } from "@/types";

/* ── READ ── */

export async function getPlayHistory() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("play_history")
    .select("*, bot(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching play history:", error);
    return [];
  }
  return data;
}

export async function getPlayHistoryById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("play_history")
    .select("*, bot(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching play history record:", error);
    return null;
  }
  return data;
}

export async function getPlayHistoryByBotId(botId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("play_history")
    .select("*")
    .eq("bot_id", botId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching play history for bot:", error);
    return [];
  }
  return data;
}

/* ── CREATE ── */

export async function createPlayHistory(
  formData: Omit<PlayHistory, "id" | "created_at">,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("play_history")
    .insert([formData])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trade/history");
  return data;
}

/* ── UPDATE ── */

export async function updatePlayHistory(
  id: string,
  formData: Partial<Omit<PlayHistory, "id" | "created_at">>,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("play_history")
    .update(formData)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trade/history");
  return data;
}

/* ── DELETE ── */

export async function deletePlayHistory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("play_history").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trade/history");
  return true;
}
