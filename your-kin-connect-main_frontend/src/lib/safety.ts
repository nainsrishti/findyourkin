import { supabase } from "./supabase";

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export const REPORT_REASONS = [
  "Fake or misleading profile",
  "Inappropriate messages",
  "Harassment or threats",
  "Spam or scam",
  "Other",
] as const;

export async function reportUser(targetId: string, reason: string, note?: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("reports")
    .insert({ reporter_id: me, reported_id: targetId, reason, note: note || null });
  if (error) throw error;
}

// Blocking writes an `interactions` row of kind 'blocked'. candidate_pool()
// already excludes anyone I've interacted with from MY future discover feed
// (any kind), and separately excludes ME from THEIR feed specifically when
// the row is kind='blocked' — so a single insert handles both directions.
export async function blockUser(targetId: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("interactions")
    .upsert(
      { actor_id: me, target_id: targetId, kind: "blocked" },
      { onConflict: "actor_id,target_id" },
    );
  if (error) throw error;
}
