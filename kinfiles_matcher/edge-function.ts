/**
 * supabase/functions/matches/index.ts
 *
 * Deploy:  supabase functions deploy matches
 * Call:    GET /functions/v1/matches?limit=20   (with the user's JWT)
 *
 * Flow:  auth → candidate_pool() in SQL (hard filters + ANN, ~200 rows)
 *              → scorePair() in TS on those 200 → rank → return top N.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { rank, type Profile } from "./matcher.ts";
import { questionnaire } from "./questionnaire.ts";

Deno.serve(async (req) => {
  // Browsers send a CORS preflight OPTIONS request before the real GET —
  // must answer it (with the same CORS headers) or the browser blocks the
  // actual request before it's ever sent.
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  const limit = Number(new URL(req.url).searchParams.get("limit") ?? 20);

  // Viewer
  const { data: me, error: meErr } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (meErr || !me) return json({ error: "profile not found" }, 404);

  // Stage 1 — hard filters + ANN shortlist, done by Postgres
  const { data: pool, error: poolErr } = await supabase
    .rpc("candidate_pool", { viewer: user.id, pool_size: 200 });
  if (poolErr) return json({ error: poolErr.message }, 500);

  const toProfile = (r: any): Profile => ({
    id: r.id,
    answers: r.answers ?? {},
    importance: r.importance ?? {},
    attrs: {
      city: r.city,
      gender: r.gender,
      gender_pref: r.gender_pref ?? ["any"],
      move_in_day: r.move_in_day,
      traits: r.traits ?? [],
      // Diet / smoking / pets / dealbreakers live inside `answers`, so the TS
      // hard filters (source of truth) re-check them exactly here — SQL only
      // did the coarse city/budget/gender/move-in cut.
    },
  });

  // Stages 2 & 3 — real scoring on the shortlist only
  const matches = rank(toProfile(me), (pool ?? []).map(toProfile), questionnaire, { limit });

  // Display-only fields (name/photo/bio/etc.) came back from candidate_pool
  // alongside the scoring data — look them back up by id for the response.
  const byId = new Map((pool ?? []).map((r: any) => [r.id, r]));

  return json({
    matches: matches.map((m) => {
      const r = byId.get(m.candidateId);
      return {
        user_id: m.candidateId,
        score: Math.round(m.score * 100),   // show a 0-100 % to users
        reasons: m.reasons,
        display_name: r?.display_name ?? null,
        age: r?.age ?? null,
        occupation: r?.occupation ?? null,
        bio: r?.bio ?? null,
        photo_url: r?.photo_url ?? null,
        situation: r?.situation ?? null,
        flat_photos: r?.situation === "host" ? (r?.flat_photos ?? []) : [],
        // don't ship `breakdown`/`answers` — that leaks the other person's raw answers
      };
    }),
  });
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
