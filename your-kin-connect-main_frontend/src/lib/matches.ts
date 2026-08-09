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
  dimensions: { id: string; label: string; score: number }[];
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

// Client-side filtering for the Discover Filters screen. Only fields the
// matches endpoint actually returns can be filtered here — anything else
// (budget, neighborhood) would need the edge function to ship more data.
import type { DiscoverFilters } from "./store";

export function applyDiscoverFilters(
  list: MatchResult[],
  f: DiscoverFilters,
): MatchResult[] {
  return list.filter((m) => {
    if (f.situation !== "any" && m.situation !== f.situation) return false;
    if (f.ageRange !== "any") {
      if (m.age === null) return false;
      if (f.ageRange === "18-24" && (m.age < 18 || m.age > 24)) return false;
      if (f.ageRange === "25-30" && (m.age < 25 || m.age > 30)) return false;
      if (f.ageRange === "31plus" && m.age < 31) return false;
    }
    return true;
  });
}

export function filtersActive(f: DiscoverFilters): boolean {
  return f.situation !== "any" || f.ageRange !== "any";
}
