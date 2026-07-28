import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, X } from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "See example matches — findyourKin" },
      {
        name: "description",
        content:
          "A few real examples of how findyourKin scores flatmate compatibility — including why a bad conflict-style pairing gets capped, not averaged away.",
      },
    ],
  }),
  component: DemoPage,
});

// Illustrative examples, not live data — built from the same dimensions and
// rules the real matcher uses (see kinfiles_matcher/questionnaire.ts):
// weighted scored dimensions (sleep, cleanliness, guests, budget, conflict —
// shown as bars), plus hard filters (diet/kitchen, smoking, pets — shown as
// pass/fail, since those aren't percentages in the real app either).
interface DemoDimension {
  label: string;
  score: number;
}
interface DemoFilter {
  label: string;
  ok: boolean;
}
interface DemoMatch {
  personA: { name: string; age: number; role: string; area: string };
  personB: { name: string; age: number; role: string; area: string };
  score: number;
  gated?: { rawScore: number; reason: string };
  dimensions: DemoDimension[];
  filters: DemoFilter[];
  note: string;
}

const avatarUrl = (seed: string) => `https://i.pravatar.cc/150?u=${seed}`;

const EXAMPLES: DemoMatch[] = [
  {
    personA: { name: "Ananya Kapoor", age: 26, role: "Product Designer", area: "DLF Phase 2, Gurgaon" },
    personB: { name: "Ishita Verma", age: 25, role: "Marketing Associate", area: "Sushant Lok, Gurgaon" },
    score: 92,
    dimensions: [
      { label: "Sleep schedule", score: 95 },
      { label: "Cleanliness", score: 90 },
      { label: "Having people over", score: 85 },
      { label: "Handling conflict", score: 100 },
      { label: "Budget band", score: 95 },
    ],
    filters: [
      { label: "Diet & kitchen", ok: true },
      { label: "Smoking", ok: true },
      { label: "Pets", ok: true },
    ],
    note: "Both early sleepers, both spotless, both say what's bugging them right away. Little to reconcile.",
  },
  {
    personA: { name: "Rohan Malhotra", age: 28, role: "Software Engineer", area: "Sector 62, Noida" },
    personB: { name: "Aditya Bansal", age: 27, role: "Data Analyst", area: "Sector 18, Noida" },
    score: 79,
    dimensions: [
      { label: "Sleep schedule", score: 80 },
      { label: "Cleanliness", score: 88 },
      { label: "Having people over", score: 55 },
      { label: "Handling conflict", score: 75 },
      { label: "Budget band", score: 90 },
    ],
    filters: [
      { label: "Diet & kitchen", ok: true },
      { label: "Smoking", ok: true },
      { label: "Pets", ok: true },
    ],
    note: "Rohan hosts often, Aditya prefers a quiet flat — the one real friction point, everything else lines up.",
  },
  {
    personA: { name: "Priya Nair", age: 24, role: "UX Researcher", area: "Hauz Khas, Delhi" },
    personB: { name: "Meera Joshi", age: 26, role: "Content Writer", area: "Saket, Delhi" },
    score: 45,
    gated: {
      rawScore: 83,
      reason:
        "Both handle conflict by staying quiet and hoping it resolves itself. On paper the rest of this match looks great — but two conflict-avoidant flatmates is how small annoyances turn into someone moving out. We don't average that away.",
    },
    dimensions: [
      { label: "Sleep schedule", score: 88 },
      { label: "Cleanliness", score: 82 },
      { label: "Having people over", score: 90 },
      { label: "Handling conflict", score: 10 },
      { label: "Budget band", score: 85 },
    ],
    filters: [
      { label: "Diet & kitchen", ok: true },
      { label: "Smoking", ok: true },
      { label: "Pets", ok: true },
    ],
    note: "Capped, not averaged — see why below.",
  },
  {
    personA: { name: "Karan Chadha", age: 29, role: "Startup Founder", area: "Golf Course Road, Gurgaon" },
    personB: { name: "Vivek Rao", age: 26, role: "Chartered Accountant", area: "Sector 29, Gurgaon" },
    score: 68,
    dimensions: [
      { label: "Sleep schedule", score: 70 },
      { label: "Cleanliness", score: 60 },
      { label: "Having people over", score: 72 },
      { label: "Handling conflict", score: 100 },
      { label: "Budget band", score: 80 },
    ],
    filters: [
      { label: "Diet & kitchen", ok: true },
      { label: "Smoking", ok: true },
      { label: "Pets", ok: false },
    ],
    note: "Karan's WFH full-time and wants a tidier flat than Vivek keeps — workable, not effortless. Pets are the one hard no.",
  },
];

function DemoPage() {
  return (
    <PhoneShell>
      <ScreenHeader title="Example matches" backTo="/" />
      <div className="px-6 pb-10">
        <h2 className="mt-6 text-2xl font-bold">What a match actually looks like</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Four real examples of how we score compatibility — not signed-up users, just illustrating the method
          before you try it yourself.
        </p>

        <div className="mt-8 space-y-6">
          {EXAMPLES.map((m, i) => (
            <motion.div
              key={m.personA.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="rounded-3xl border border-border bg-surface p-5 shadow-card"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center -space-x-3">
                  <img
                    src={avatarUrl(m.personA.name)}
                    alt=""
                    className="size-12 rounded-full border-2 border-surface object-cover"
                  />
                  <img
                    src={avatarUrl(m.personB.name)}
                    alt=""
                    className="size-12 rounded-full border-2 border-surface object-cover"
                  />
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    m.gated
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary-soft text-primary"
                  }`}
                >
                  {m.score}% match
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground">{m.personA.name}, {m.personA.age}</p>
                  <p className="text-xs text-muted-foreground">{m.personA.role}</p>
                  <p className="text-xs text-muted-foreground">{m.personA.area}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{m.personB.name}, {m.personB.age}</p>
                  <p className="text-xs text-muted-foreground">{m.personB.role}</p>
                  <p className="text-xs text-muted-foreground">{m.personB.area}</p>
                </div>
              </div>

              {m.gated && (
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p className="text-xs leading-relaxed text-foreground">
                    <span className="font-semibold">Capped at {m.score}%, not averaged.</span> Raw average
                    across everything else would've scored {m.gated.rawScore}% — {m.gated.reason}
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-2.5">
                {m.dimensions.map((d) => (
                  <div key={d.label}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-xs font-medium text-foreground">{d.label}</span>
                      <span className="text-xs font-semibold text-primary">{d.score}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={`h-full rounded-full ${d.score < 30 ? "bg-destructive" : "bg-primary"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${d.score}%` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {m.filters.map((f) => (
                  <span
                    key={f.label}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      f.ok ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {f.ok ? <Check className="size-3" /> : <X className="size-3" />}
                    {f.label}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-xs text-muted-foreground">{m.note}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-primary-soft p-5 text-center">
          <p className="text-sm font-medium text-primary">
            This is what you'll see for real matches near you — same dimensions, same rules.
          </p>
          <Button asChild size="lg" className="mt-4 h-14 w-full rounded-lg text-base font-semibold">
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </PhoneShell>
  );
}
