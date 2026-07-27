import type { OnboardingState } from "./store";

/**
 * Translates the onboarding UI's collected answers into the shape
 * matcher.ts / questionnaire.ts expect (see supabase/functions/save-profile).
 *
 * This is a best-effort mapping — the current quiz doesn't ask about
 * work-from-home frequency, expected stay length, partner-staying-over, or
 * conflict style, so those scoring dimensions are left unanswered (the
 * matcher excludes unanswered dimensions rather than penalizing them, so
 * nothing breaks — matches are just less precise until those questions
 * exist). Worth adding to the quiz later, especially "conflict style" —
 * it's the one non-compensatory dimension that can cap a bad match.
 */

const BUDGET_BANDS: { max: number; band: string }[] = [
  { max: 8_000, band: "u8k" },
  { max: 12_000, band: "8-12k" },
  { max: 18_000, band: "12-18k" },
  { max: 25_000, band: "18-25k" },
  { max: Infinity, band: "25k+" },
];

function bandFromRange([min, max]: [number, number]): string {
  const mid = (min + max) / 2;
  return BUDGET_BANDS.find((b) => mid <= b.max)!.band;
}

const GENDER_MAP: Record<string, string> = {
  Woman: "female",
  Man: "male",
  "Non-binary": "nonbinary",
  "Prefer not to say": "nonbinary",
};

const SITUATION_MAP: Record<string, string> = {
  "have-place": "host",
  "need-place": "seeker",
  together: "cohunt",
};

const SLEEP_MAP: Record<string, string> = { early: "before11", mid: "11to1", late: "after1" };
const CLEAN_MAP: Record<string, string> = { spotless: "spotless", tidy: "reasonable", chill: "messy" };
const GUESTS_MAP: Record<string, string> = { rare: "rarely", some: "weekly", often: "often" };
const ENERGY_MAP: Record<string, string> = { "hi-bye": "solitude", friendly: "flexible", friends: "enjoy" };

export function buildSaveProfilePayload(o: OnboardingState) {
  const budget_band = bandFromRange(o.budget);
  const situation = SITUATION_MAP[o.housingChoice] ?? "seeker";

  return {
    display_name: o.displayName,
    city: o.city,
    gender: GENDER_MAP[o.gender] ?? "nonbinary",
    gender_pref: ["any"],
    budget_band,
    // No move-in date picker in the UI yet — defaults to ~2 weeks out.
    move_in_day: Math.floor(Date.now() / 86_400_000) + 14,
    situation,
    traits: [],
    age: o.age ?? undefined,
    occupation: o.occupation,
    bio: o.bio,
    photo_url: o.photoUrl,
    answers: {
      sleep: SLEEP_MAP[o.quiz.wake],
      cleanliness: CLEAN_MAP[o.quiz.clean],
      guests: GUESTS_MAP[o.quiz.guests],
      home_energy: ENERGY_MAP[o.quiz.social],
      budget: budget_band,
      situation,
      diet: o.preferences.vegetarian ? "veg" : "nonveg",
      kitchen: o.preferences.vegetarian ? "veg_only" : "okay_nonveg",
      smoke_tolerance: o.preferences.smoker ? "ok" : "no_indoor",
      smokes_indoor: false,
      pet_tolerance: o.preferences.pets ? "ok" : "none",
      has_pets: false,
      dealbreakers: [],
      // Preference-type dimension: the set of neighborhoods I'd accept,
      // also doubles as "where I might be found" when someone else's
      // preferred list is checked against mine.
      locality: o.neighborhoods,
    },
  };
}
