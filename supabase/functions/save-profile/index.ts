/**
 * supabase/functions/save-profile/index.ts
 *
 * Deploy:  supabase functions deploy save-profile
 * Call:    POST /functions/v1/save-profile   (with the user's JWT)
 *          body: {
 *            display_name: string,
 *            city: string,
 *            gender: string,               // 'male' | 'female' | 'nonbinary'
 *            gender_pref?: string[],        // default ['any']
 *            budget_band: string,           // one of vocab.budget, e.g. "12-18k"
 *            move_in_day: number,           // epoch day (Math.floor(Date.now() / 86400000))
 *            situation: string,             // 'host' | 'seeker' | 'cohunt'
 *            traits?: string[],
 *            age?: number,
 *            occupation?: string,
 *            bio?: string,
 *            photo_url?: string,
 *            answers: Record<string, AnswerValue>,
 *            importance?: Record<string, Importance>,
 *          }
 *
 * Handles BOTH the first-ever save (onboarding — inserts the row, all the
 * NOT NULL columns above are required) and later edits (just upsert again;
 * unspecified columns fall back to nothing changing since Postgres upsert
 * only touches columns you send... except NOT NULL ones, which is why
 * onboarding must send the full set every time it calls this).
 *
 * Flow:  auth → validate body → toVector(answers) for ANN retrieval
 *              → upsert the whole profiles row, including embedding
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { toVector, type AnswerValue, type Importance, type Profile } from "./matcher.ts";
import { questionnaire, vocab } from "./questionnaire.ts";

interface SaveProfileBody {
  display_name?: string;
  city?: string;
  gender?: string;
  gender_pref?: string[];
  budget_band?: string;
  move_in_day?: number;
  situation?: string;
  traits?: string[];
  age?: number;
  occupation?: string;
  bio?: string;
  photo_url?: string;
  answers?: Record<string, AnswerValue>;
  importance?: Record<string, Importance>;
}

Deno.serve(async (req) => {
  // Browsers send a CORS preflight OPTIONS request before the real POST —
  // must answer it (with the same CORS headers) or the browser blocks the
  // actual request before it's ever sent.
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  let body: SaveProfileBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const {
    display_name, city, gender, gender_pref, budget_band,
    move_in_day, situation, traits, age, occupation, bio, photo_url,
    answers, importance,
  } = body ?? {};

  const missing = ["display_name", "city", "gender", "budget_band", "move_in_day", "situation"]
    .filter((k) => (body as Record<string, unknown>)[k] === undefined || (body as Record<string, unknown>)[k] === null);
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) missing.push("answers");
  if (missing.length) {
    return json({ error: `missing required field(s): ${missing.join(", ")}` }, 400);
  }

  const budget_idx = vocab.budget.indexOf(budget_band!);
  if (budget_idx < 0) {
    return json({ error: `budget_band must be one of: ${vocab.budget.join(", ")}` }, 400);
  }

  // Same shape matcher.ts expects everywhere else — encode straight to the
  // pgvector column so candidate_pool()'s ANN shortlist sees this profile.
  const profile: Profile = { id: user.id, answers: answers!, importance };
  const embedding = toVector(profile, questionnaire, vocab);

  const row = {
    id: user.id,
    display_name,
    city,
    gender,
    gender_pref: gender_pref?.length ? gender_pref : ["any"],
    budget_band,
    budget_idx,
    move_in_day,
    situation,
    traits: traits ?? [],
    age: age ?? null,
    occupation: occupation ?? null,
    bio: bio ?? null,
    photo_url: photo_url ?? null,
    answers,
    importance: importance ?? {},
    embedding,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(row, { onConflict: "id" })
    .select("id, display_name, city, gender, budget_band, situation, age, occupation, bio, photo_url, answers, importance, embedding")
    .single();

  if (error) return json({ error: error.message }, 500);

  return json({ profile: data });
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
