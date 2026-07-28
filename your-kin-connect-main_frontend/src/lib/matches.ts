import { queryOptions } from "@tanstack/react-query";
import { supabase } from "./supabase";

export interface MatchResult {
  user_id: string;
  score: number; // 0-100
  reasons: string[];
  display_name: string | null;
  age: number | null;
  occupation: string | null;
  bio: string | null;
  photo_url: string | null;
  situation: string | null;
  flat_photos: string[];
}

export async function fetchMatches(): Promise<MatchResult[]> {
  const { data, error } = await supabase.functions.invoke<{ matches: MatchResult[] }>(
    "matches",
    { method: "GET" },
  );
  if (error) throw error;
  return data?.matches ?? [];
}

// Shared query so discover + compatibility pages read from the same cache
// instead of each re-fetching the ranked list.
export const matchesQuery = queryOptions({
  queryKey: ["matches"],
  queryFn: fetchMatches,
});
