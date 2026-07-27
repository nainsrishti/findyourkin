/**
 * matcher.ts — pure, dependency-free compatibility engine.
 *
 * Nothing in here knows about your questions. It reads a Questionnaire config
 * (see questionnaire.ts) and scores any two profiles against it.
 *
 * Three stages, in order:
 *   1. hardFilter()  — binary elimination (cheap, run in SQL where possible)
 *   2. scorePair()   — weighted, DIRECTIONAL scoring + mutual reconciliation
 *   3. rank()        — sort, explain, serve
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type AnswerValue = string | string[] | number | boolean | null | undefined;

/** How much THIS user cares about THIS question. OkCupid's key insight. */
export type Importance = "irrelevant" | "low" | "normal" | "high" | "critical";

export const IMPORTANCE_WEIGHT: Record<Importance, number> = {
  irrelevant: 0,
  low: 1,
  normal: 3,
  high: 8,
  critical: 20,
};

export interface Profile {
  id: string;
  /** questionId -> answer */
  answers: Record<string, AnswerValue>;
  /** questionId -> how much this user cares. Optional; defaults to "normal". */
  importance?: Record<string, Importance>;
  /** Structured fields used by hard filters (age, geo, gender, etc.) */
  attrs?: Record<string, any>;
}

/**
 * A comparator turns (myAnswer, theirAnswer) into a raw 0..1 compatibility score.
 * Return `null` to mean "can't score this pair" (missing data) — it will be
 * excluded from the weighted average rather than counted as a zero.
 */
export type Comparator =
  /** Multi-select tags/interests. Jaccard by default; "dice" is more forgiving. */
  | { kind: "set_overlap"; metric?: "jaccard" | "dice" | "coverage" }
  /** Likert / numeric. Closer = better. */
  | { kind: "scale_similarity"; min: number; max: number; tolerance?: number }
  /** Likert / numeric. Further apart = better (complementary skills, energy, etc.) */
  | { kind: "scale_complement"; min: number; max: number }
  /** Single-select. Exact match = 1, else 0 — unless a matrix defines partial credit.
   *  The matrix is read as matrix[MY answer][THEIR answer], so it may be ASYMMETRIC —
   *  which is the whole point for things like cleanliness. */
  | { kind: "categorical"; matrix?: Record<string, Record<string, number>> }
  /**
   * Ranked options (budget bands, sleep times, cleanliness). Distance along the
   * order = penalty. `neutral` lists off-scale answers ("Completely irregular")
   * scored at 0.5.
   *
   * ASYMMETRY: penalties differ by direction relative to ME. With order listed
   * low→high, `downPenalty` applies when THEY sit below me, `upPenalty` when they
   * sit above. Cleanliness is the canonical case: a spotless person suffers when
   * paired with someone messier (high downPenalty) but barely notices someone
   * tidier (low upPenalty). Omit both to get symmetric `falloff`.
   */
  | { kind: "ordinal"; order: string[]; falloff?: number; neutral?: string[];
      downPenalty?: number; upPenalty?: number }
  /**
   * Directional preference: "what I want" vs "what you are".
   * My answer to this question is a list of acceptable values;
   * we look up THEIR answer to `targetQuestion`.
   */
  | { kind: "preference"; targetQuestion: string; partialCredit?: number }
  /** Escape hatch for anything weird. */
  | { kind: "custom"; fn: (mine: AnswerValue, theirs: AnswerValue, a: Profile, b: Profile) => number | null };

export interface Dimension {
  id: string;
  label: string;
  /** Baseline importance in your model, before per-user importance. */
  weight: number;
  comparator: Comparator;
  /** If false, per-user Importance is ignored for this dimension. */
  userWeightable?: boolean;
  /**
   * NON-COMPENSATORY GATE. A weighted sum is *compensatory*: a great music-taste
   * score can paper over a terrible conflict-style score. For a few make-or-break
   * dimensions that's wrong — two conflict-avoidant people are a bad match no
   * matter how much else they share. If the mutual raw score on this dimension
   * falls below `floor`, the whole match is capped at `cap`, regardless of
   * everything else. This turns the model into a hybrid: conjunctive on the
   * critical few, compensatory on the rest — which is how humans actually judge
   * a living situation.
   */
  nonCompensatory?: { floor: number; cap: number };
}

export interface HardFilter {
  id: string;
  /** Return true to KEEP the candidate. */
  test: (viewer: Profile, candidate: Profile) => boolean;
}

export interface Questionnaire {
  dimensions: Dimension[];
  hardFilters: HardFilter[];
  /**
   * Shrinkage constant. If a pair has answered few questions, their score is
   * pulled toward neutral (0.5) rather than trusted. Higher = more skeptical.
   * Sensible default: ~30% of total dimension weight.
   */
  confidenceK?: number;
}

export interface DimensionScore {
  id: string;
  label: string;
  raw: number;        // 0..1 before weighting
  weight: number;     // effective weight after user importance
}

export interface PairScore {
  score: number;              // 0..1, mutual, confidence-adjusted — THE number
  rawMutual: number;          // before confidence shrinkage
  aToB: number;               // how much A should like B
  bToA: number;               // how much B should like A
  coverage: number;           // 0..1, share of weight actually scoreable
  breakdown: DimensionScore[];// per-dimension, sorted by contribution
  gatedBy: string[];          // dimension ids that capped the score (empty if none)
}

// ─────────────────────────────────────────────────────────────
// Comparators
// ─────────────────────────────────────────────────────────────

const asSet = (v: AnswerValue): Set<string> | null =>
  Array.isArray(v) ? new Set(v.map(String)) : null;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function compare(
  cmp: Comparator,
  mine: AnswerValue,
  theirs: AnswerValue,
  a: Profile,
  b: Profile
): number | null {
  const missing = (v: AnswerValue) =>
    v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);

  switch (cmp.kind) {
    case "custom":
      return cmp.fn(mine, theirs, a, b);

    case "preference": {
      // "mine" = list of values I'll accept. "theirs" = their actual attribute.
      const want = asSet(mine) ?? (missing(mine) ? null : new Set([String(mine)]));
      const has = b.answers[cmp.targetQuestion];
      if (!want || want.size === 0 || missing(has)) return null;
      const hasVals = Array.isArray(has) ? has.map(String) : [String(has)];
      const hit = hasVals.some((v) => want.has(v));
      return hit ? 1 : (cmp.partialCredit ?? 0);
    }
  }

  if (missing(mine) || missing(theirs)) return null;

  switch (cmp.kind) {
    case "set_overlap": {
      const A = asSet(mine), B = asSet(theirs);
      if (!A || !B) return null;
      let inter = 0;
      for (const x of A) if (B.has(x)) inter++;
      const metric = cmp.metric ?? "jaccard";
      if (metric === "jaccard") {
        const union = A.size + B.size - inter;
        return union === 0 ? null : inter / union;
      }
      if (metric === "dice") return (2 * inter) / (A.size + B.size);
      // "coverage": what fraction of MY interests do they share? (directional)
      return A.size === 0 ? null : inter / A.size;
    }

    case "scale_similarity": {
      const span = cmp.max - cmp.min;
      const d = Math.abs(Number(mine) - Number(theirs)) / span;
      const tol = cmp.tolerance ?? 0;
      return clamp01(1 - Math.max(0, d - tol) / (1 - tol || 1));
    }

    case "scale_complement": {
      const span = cmp.max - cmp.min;
      const d = Math.abs(Number(mine) - Number(theirs)) / span;
      return clamp01(d);
    }

    case "categorical": {
      const m = String(mine), t = String(theirs);
      if (cmp.matrix) {
        const row = cmp.matrix[m];
        if (row && row[t] !== undefined) return clamp01(row[t]);
      }
      return m === t ? 1 : 0;
    }

    case "ordinal": {
      const neutral = new Set(cmp.neutral ?? []);
      if (neutral.has(String(mine)) || neutral.has(String(theirs))) return 0.5;
      const mIdx = cmp.order.indexOf(String(mine));
      const tIdx = cmp.order.indexOf(String(theirs));
      if (mIdx < 0 || tIdx < 0) return null;
      const span = cmp.order.length - 1 || 1;
      const gap = (tIdx - mIdx) / span;          // + = they rank above me
      const up = cmp.upPenalty ?? cmp.falloff ?? 1;
      const down = cmp.downPenalty ?? cmp.falloff ?? 1;
      const penalty = gap >= 0 ? gap * up : -gap * down;
      return clamp01(1 - penalty);
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// Stage 1 — hard filters
// ─────────────────────────────────────────────────────────────

export function passesFilters(viewer: Profile, candidate: Profile, q: Questionnaire): boolean {
  if (viewer.id === candidate.id) return false;
  return q.hardFilters.every((f) => f.test(viewer, candidate));
}

// ─────────────────────────────────────────────────────────────
// Stage 2 — scoring
// ─────────────────────────────────────────────────────────────

/** How well does A's questionnaire, weighted by A's priorities, rate B? */
function scoreDirectional(a: Profile, b: Profile, q: Questionnaire) {
  let weighted = 0;
  let coveredWeight = 0;
  let totalWeight = 0;
  const breakdown: DimensionScore[] = [];
  const rawById: Record<string, number> = {};

  for (const dim of q.dimensions) {
    const userMult =
      dim.userWeightable === false
        ? IMPORTANCE_WEIGHT.normal
        : IMPORTANCE_WEIGHT[a.importance?.[dim.id] ?? "normal"];

    const w = dim.weight * userMult;
    if (w === 0) continue;           // user marked it irrelevant → skip entirely
    totalWeight += w;

    const raw = compare(dim.comparator, a.answers[dim.id], b.answers[dim.id], a, b);
    if (raw === null) continue;      // unanswered → excluded, not penalised

    rawById[dim.id] = raw;
    weighted += w * raw;
    coveredWeight += w;
    breakdown.push({ id: dim.id, label: dim.label, raw, weight: w });
  }

  const score = coveredWeight === 0 ? 0.5 : weighted / coveredWeight;
  const coverage = totalWeight === 0 ? 0 : coveredWeight / totalWeight;
  return { score, coverage, coveredWeight, breakdown, rawById };
}

/** Punishes lopsided matches harder than a plain average would. */
const harmonicMean = (x: number, y: number) =>
  x <= 0 || y <= 0 ? 0 : (2 * x * y) / (x + y);

export function scorePair(a: Profile, b: Profile, q: Questionnaire): PairScore {
  const ab = scoreDirectional(a, b, q);
  const ba = scoreDirectional(b, a, q);

  const rawMutual = harmonicMean(ab.score, ba.score);

  // Confidence shrinkage: thin data → pull toward neutral.
  const totalDimWeight = q.dimensions.reduce(
    (s, d) => s + d.weight * IMPORTANCE_WEIGHT.normal, 0
  );
  const k = q.confidenceK ?? totalDimWeight * 0.3;
  const evidence = Math.min(ab.coveredWeight, ba.coveredWeight);
  const shrink = evidence / (evidence + k);
  let score = 0.5 + (rawMutual - 0.5) * shrink;

  // Non-compensatory gates: a make-or-break dimension that scores badly for
  // EITHER person caps the whole match, no matter how strong everything else is.
  const gates: string[] = [];
  for (const dim of q.dimensions) {
    if (!dim.nonCompensatory) continue;
    const mine = ab.rawById[dim.id];
    const theirs = ba.rawById[dim.id];
    // Only gate on data we actually have (both directions answered).
    if (mine === undefined && theirs === undefined) continue;
    const gateRaw = Math.min(mine ?? 1, theirs ?? 1);
    if (gateRaw < dim.nonCompensatory.floor) {
      score = Math.min(score, dim.nonCompensatory.cap);
      gates.push(dim.id);
    }
  }

  const breakdown = [...ab.breakdown].sort(
    (x, y) => y.weight * y.raw - x.weight * x.raw
  );

  return {
    score: clamp01(score),
    rawMutual,
    aToB: ab.score,
    bToA: ba.score,
    coverage: Math.min(ab.coverage, ba.coverage),
    breakdown,
    gatedBy: gates,
  };
}

// ─────────────────────────────────────────────────────────────
// Stage 3 — ranking + explanation
// ─────────────────────────────────────────────────────────────

export interface Match extends PairScore {
  candidateId: string;
  reasons: string[];
}

export function rank(
  viewer: Profile,
  candidates: Profile[],
  q: Questionnaire,
  opts: { limit?: number; minScore?: number } = {}
): Match[] {
  const { limit = 20, minScore = 0 } = opts;

  return candidates
    .filter((c) => passesFilters(viewer, c, q))
    .map((c) => {
      const s = scorePair(viewer, c, q);
      return { ...s, candidateId: c.id, reasons: explain(s) };
    })
    .filter((m) => m.score >= minScore)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit);
}

/** Human-readable "why you matched" — feeds straight into your UI. */
export function explain(s: PairScore, topN = 3): string[] {
  return s.breakdown
    .filter((d) => d.raw >= 0.7)
    .slice(0, topN)
    .map((d) => `Strong alignment on ${d.label.toLowerCase()}`);
}

/**
 * Encode a profile as a fixed-length numeric vector for pgvector / ANN retrieval.
 * This is NOT your scoring function — it's a cheap way to shortlist ~200
 * candidates out of 100k before running the real (expensive) scorePair on them.
 */
export function toVector(p: Profile, q: Questionnaire, vocab: Record<string, string[]>): number[] {
  const v: number[] = [];
  for (const dim of q.dimensions) {
    const ans = p.answers[dim.id];
    const c = dim.comparator;
    if (c.kind === "scale_similarity" || c.kind === "scale_complement") {
      const n = Number(ans);
      v.push(Number.isFinite(n) ? (n - c.min) / (c.max - c.min) : 0.5);
    } else if (c.kind === "ordinal") {
      // Encode as a single position-on-the-scale number (0..1), same idea as
      // scale_similarity — NOT one-hot, since order is what matters here.
      const order = c.order;
      const idx = order.indexOf(String(ans));
      const denom = (order.length - 1) || 1;
      v.push(idx >= 0 ? idx / denom : 0.5); // unanswered/unknown -> neutral midpoint
    } else if (c.kind === "set_overlap" || c.kind === "categorical" || c.kind === "preference") {
      const terms = vocab[dim.id] ?? [];
      const set = asSet(ans) ?? new Set(ans == null ? [] : [String(ans)]);
      for (const t of terms) v.push(set.has(t) ? 1 : 0);
    }
  }
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
}
