/**
 * questionnaire.ts — findyourKin flatmate compatibility, Delhi NCR.
 *
 * THIS is the only file you edit when questions change. matcher.ts stays fixed.
 *
 * The model is a HYBRID, deliberately:
 *   • Hard filters      → non-negotiable set logic (city, budget floor, gender,
 *                          diet, smoking, move-in, situation, explicit dealbreakers)
 *   • Non-compensatory  → conflict style: a bad pairing CAPS the match
 *   • Compensatory      → everything else: weighted, importance-scaled sum
 *
 * Every scored dimension is classified by its true measurement type, not lumped
 * into "similarity". Read the comment on each to see why.
 */

import type { Questionnaire, Profile, HardFilter } from "./matcher";

// ── Ordered scales (index order matters for ordinal scoring) ──────────────
const BUDGET   = ["u8k", "8-12k", "12-18k", "18-25k", "25k+"];
const SLEEP    = ["before11", "11to1", "after1"];              // + neutral: irregular
const CLEAN    = ["messy", "chaos", "reasonable", "spotless"]; // low → high
const GUESTS   = ["rarely", "weekly", "often", "hub"];         // low → high sociability
const HOME_ENERGY = ["solitude", "guilty_alone", "flexible", "decompress", "enjoy"]; // low→high wanting-company
const WFH      = ["never", "hybrid", "mostly", "always"];
const PARTNER  = ["never", "occasional", "frequent", "livein"];
const STAY     = ["short", "6to12", "1to2yr", "longterm"];

export const questionnaire: Questionnaire = {
  dimensions: [
    // ── Ordinal similarities (closer = less daily friction) ──────────────
    {
      id: "sleep",
      label: "Sleep schedule",
      weight: 1.2,
      // Off-scale "irregular" scored neutral, not penalised as far from everyone.
      comparator: { kind: "ordinal", order: SLEEP, neutral: ["irregular"], falloff: 0.9 },
    },
    {
      id: "guests",
      label: "Having people over",
      weight: 1.0,
      comparator: { kind: "ordinal", order: GUESTS, falloff: 0.85 },
    },
    {
      id: "home_energy",
      label: "Social energy at home",
      weight: 1.0,
      // The "exhausted, flatmate wants to talk" question, mapped onto a
      // want-company continuum. Similar levels coexist; extremes chafe.
      comparator: { kind: "ordinal", order: HOME_ENERGY, falloff: 0.8 },
    },
    {
      id: "wfh",
      label: "Work-from-home frequency",
      weight: 0.8,
      // Two always-home people share the flat all day — matters, but survivable.
      comparator: { kind: "ordinal", order: WFH, falloff: 0.7 },
    },
    {
      id: "stay",
      label: "Expected stay length",
      weight: 0.9,
      // Both long-term = stable household. Short + long = churn risk.
      comparator: { kind: "ordinal", order: STAY, falloff: 0.75 },
    },
    {
      id: "partner",
      label: "Partner staying over",
      weight: 1.1,
      // Top-3 real conflict source. Similar expectations = peace.
      comparator: { kind: "ordinal", order: PARTNER, falloff: 1.0 },
    },

    // ── ASYMMETRIC ordinal: cleanliness ──────────────────────────────────
    {
      id: "cleanliness",
      label: "Cleanliness",
      weight: 1.4,
      // A tidy person paired with a messy one is FAR unhappier than the reverse.
      // downPenalty (they're messier than me) hurts; upPenalty (they're tidier)
      // barely registers. This asymmetry is the whole point.
      comparator: { kind: "ordinal", order: CLEAN, downPenalty: 1.0, upPenalty: 0.25 },
    },

    // ── Budget: ordinal soft score (hard floor lives in filters) ─────────
    {
      id: "budget",
      label: "Budget band",
      weight: 1.3,
      comparator: { kind: "ordinal", order: BUDGET, falloff: 0.9 },
    },

    // ── NON-COMPENSATORY asymmetric matrix: conflict style ───────────────
    {
      id: "conflict",
      label: "Handling conflict",
      weight: 1.5,
      // matrix[MINE][THEIRS] = how well I fare with their style.
      // Principle: a household is healthy iff problems get SURFACED. At least
      // one direct person rescues the pair; two avoidant people are a slow-motion
      // disaster. Hence the gate below — no shared-hobby score can rescue it.
      comparator: {
        kind: "categorical",
        matrix: {
          direct:      { direct: 1.00, hints: 0.75, wait: 0.70, internalize: 0.60 },
          hints:       { direct: 0.75, hints: 0.40, wait: 0.45, internalize: 0.30 },
          wait:        { direct: 0.70, hints: 0.45, wait: 0.35, internalize: 0.28 },
          internalize: { direct: 0.65, hints: 0.30, wait: 0.28, internalize: 0.10 },
        },
      },
      nonCompensatory: { floor: 0.30, cap: 0.45 },
    },

    // ── Directional preference (kept soft; hard cases are filters) ───────
    // "Situation" as a scored matrix on top of the host↔host hard reject.
    {
      id: "situation",
      label: "Living situation fit",
      weight: 1.2,
      comparator: {
        kind: "categorical",
        matrix: {
          host:   { seeker: 1.00, cohunt: 0.55, host: 0.00 },
          seeker: { host: 1.00, cohunt: 0.70, seeker: 0.60 },
          cohunt: { cohunt: 1.00, seeker: 0.70, host: 0.55 },
        },
      },
    },

    // ── Directional preference: neighborhoods ────────────────────────────
    // My answer is the set of localities I'd be happy in; we check it
    // against THEIR answer to the same question (their own accepted set).
    // Deliberately left out of `vocab` below — it stays a stage-2 (exact
    // scoring on the shortlist) signal only, not part of the stage-1 ANN
    // embedding, so it doesn't require resizing the pgvector column.
    {
      id: "locality",
      label: "Preferred neighborhoods",
      weight: 0.6,
      comparator: { kind: "preference", targetQuestion: "locality", partialCredit: 0.3 },
    },
  ],

  hardFilters: buildFilters(),

  // Skeptical until ~a third of weighted evidence is in; protects early users
  // who haven't answered everything from wild over-confident scores.
  confidenceK: undefined, // falls back to 30% of total weight
};

// ─────────────────────────────────────────────────────────────────────────
// Hard filters — mutual set logic. These run in SQL first (see schema.sql);
// re-checked here as the source of truth and for the local test harness.
// ─────────────────────────────────────────────────────────────────────────
function buildFilters(): HardFilter[] {
  return [
    {
      id: "city",
      // Same NCR city required. Locality is a soft bonus, not a gate.
      test: (v, c) => !!v.attrs?.city && v.attrs.city === c.attrs?.city,
    },
    {
      id: "budget_overlap",
      // Reject if bands are >1 apart (e.g. u8k vs 18-25k can't share rent).
      test: (v, c) => {
        const i = BUDGET.indexOf(v.answers.budget as string);
        const j = BUDGET.indexOf(c.answers.budget as string);
        return i < 0 || j < 0 ? true : Math.abs(i - j) <= 1;
      },
    },
    {
      id: "gender_pref",
      // Mutual: each person's gender must be acceptable to the other.
      test: (v, c) => {
        const vWants = (v.attrs?.gender_pref ?? ["any"]) as string[];
        const cWants = (c.attrs?.gender_pref ?? ["any"]) as string[];
        const okForV = vWants.includes("any") || vWants.includes(c.attrs?.gender);
        const okForC = cWants.includes("any") || cWants.includes(v.attrs?.gender);
        return okForV && okForC;
      },
    },
    {
      id: "diet_kitchen",
      // Asymmetric, checked both ways: a veg-only-kitchen person cannot pair
      // with someone who cooks non-veg. The reverse (non-veg person + veg
      // flatmate) is fine, so we only fail the strict direction.
      test: (v, c) => {
        const clash = (a: Profile, b: Profile) =>
          a.answers.kitchen === "veg_only" && b.answers.diet === "nonveg";
        return !clash(v, c) && !clash(c, v);
      },
    },
    {
      id: "smoking_home",
      // If I can't live with indoor smoking and they smoke indoors → out.
      test: (v, c) => {
        const clash = (a: Profile, b: Profile) =>
          a.answers.smoke_tolerance === "no_indoor" && b.answers.smokes_indoor === true;
        return !clash(v, c) && !clash(c, v);
      },
    },
    {
      id: "pets",
      // Allergy / no-pets vs has-pets → out (both directions).
      test: (v, c) => {
        const clash = (a: Profile, b: Profile) =>
          a.answers.pet_tolerance === "none" && b.answers.has_pets === true;
        return !clash(v, c) && !clash(c, v);
      },
    },
    {
      id: "move_in",
      // Move-in windows must be within 45 days (epoch days stored in attrs).
      test: (v, c) => {
        const a = v.attrs?.move_in_day, b = c.attrs?.move_in_day;
        return typeof a !== "number" || typeof b !== "number"
          ? true
          : Math.abs(a - b) <= 45;
      },
    },
    {
      id: "situation_hard",
      // Only the impossible combo is a hard reject: two people who each already
      // have a flat and just need to fill a room can't move in together.
      test: (v, c) =>
        !(v.answers.situation === "host" && c.answers.situation === "host"),
    },
    {
      id: "dealbreakers",
      // Multi-select. If the candidate exhibits ANY of my declared dealbreakers,
      // reject. This is what the free-text "bad experience" box should become.
      test: (v, c) => {
        const mine = (v.answers.dealbreakers ?? []) as string[];
        const theirTraits = (c.attrs?.traits ?? []) as string[];
        return !mine.some((d) => theirTraits.includes(d));
      },
    },
  ];
}

// ── pgvector vocab (stable ordered lists; length feeds vector(N) in schema) ─
export const vocab: Record<string, string[]> = {
  budget: BUDGET,
  sleep: [...SLEEP, "irregular"],
  cleanliness: CLEAN,
  guests: GUESTS,
  home_energy: HOME_ENERGY,
  wfh: WFH,
  partner: PARTNER,
  stay: STAY,
  conflict: ["direct", "hints", "wait", "internalize"],
  situation: ["host", "seeker", "cohunt"],
};

// ── Sample NCR profiles for the local harness ────────────────────────────
const DAY = 20300; // arbitrary epoch-day baseline for move-in windows

export const sampleProfiles: Profile[] = [
  {
    id: "aarav",
    attrs: {
      city: "gurgaon", locality: "sec-47", gender: "male", gender_pref: ["male"],
      move_in_day: DAY, traits: [],
    },
    answers: {
      budget: "12-18k", sleep: "before11", cleanliness: "spotless", guests: "weekly",
      home_energy: "flexible", wfh: "hybrid", stay: "1to2yr", partner: "occasional",
      conflict: "direct", situation: "seeker",
      diet: "veg", kitchen: "veg_only", smoke_tolerance: "no_indoor", smokes_indoor: false,
      pet_tolerance: "ok", has_pets: false, dealbreakers: ["parties", "smoking"],
    },
    importance: { cleanliness: "critical", conflict: "high", budget: "high", guests: "normal" },
  },
  {
    id: "ishaan",
    attrs: {
      city: "gurgaon", locality: "sec-52", gender: "male", gender_pref: ["male", "any"],
      move_in_day: DAY + 10, traits: [],
    },
    answers: {
      budget: "12-18k", sleep: "before11", cleanliness: "reasonable", guests: "weekly",
      home_energy: "flexible", wfh: "never", stay: "1to2yr", partner: "occasional",
      conflict: "direct", situation: "host",
      diet: "veg", kitchen: "okay_nonveg", smoke_tolerance: "ok", smokes_indoor: false,
      pet_tolerance: "ok", has_pets: false, dealbreakers: [],
    },
    importance: { cleanliness: "high", conflict: "normal" },
  },
  {
    id: "rohan",
    attrs: {
      city: "gurgaon", locality: "sec-14", gender: "male", gender_pref: ["any"],
      move_in_day: DAY + 5, traits: ["smoking"],
    },
    answers: {
      budget: "12-18k", sleep: "after1", cleanliness: "messy", guests: "hub",
      home_energy: "enjoy", wfh: "always", stay: "short", partner: "frequent",
      conflict: "internalize", situation: "seeker",
      diet: "nonveg", kitchen: "okay_nonveg", smoke_tolerance: "ok", smokes_indoor: true,
      pet_tolerance: "ok", has_pets: false, dealbreakers: [],
    },
    importance: {},
  },
  {
    id: "kabir",
    attrs: {
      city: "gurgaon", locality: "sec-49", gender: "male", gender_pref: ["male"],
      move_in_day: DAY + 20, traits: [],
    },
    answers: {
      budget: "8-12k", sleep: "before11", cleanliness: "spotless", guests: "rarely",
      home_energy: "solitude", wfh: "hybrid", stay: "longterm", partner: "never",
      conflict: "internalize", situation: "seeker",
      diet: "veg", kitchen: "veg_only", smoke_tolerance: "no_indoor", smokes_indoor: false,
      pet_tolerance: "none", has_pets: false, dealbreakers: ["smoking"],
    },
    importance: { conflict: "high", cleanliness: "high" },
  },
];
