import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/tag";
import { Label } from "@/components/ui/label";
import { useAppStore, DEFAULT_FILTERS } from "@/lib/store";
import { requireOnboarded } from "@/lib/route-guards";

export const Route = createFileRoute("/discover/filter")({
  head: () => ({ meta: [{ title: "Filter — findyourKin" }] }),
  beforeLoad: () => requireOnboarded(),
  component: FilterPage,
});

// Only filters the matches data can actually answer live here. City, budget
// and move-in window are already applied by the matching engine itself
// (you only ever see people compatible on those), so they're not repeated.
const SITUATIONS = [
  { v: "any", l: "Everyone" },
  { v: "host", l: "Has a place" },
  { v: "seeker", l: "Needs a place" },
  { v: "cohunt", l: "Find one together" },
];

const AGE_RANGES = [
  { v: "any", l: "Any age" },
  { v: "18-24", l: "18–24" },
  { v: "25-30", l: "25–30" },
  { v: "31plus", l: "31+" },
];

function FilterPage() {
  const navigate = useNavigate();
  const saved = useAppStore((s) => s.discoverFilters);
  const setDiscoverFilters = useAppStore((s) => s.setDiscoverFilters);
  const [situation, setSituation] = useState(saved.situation);
  const [ageRange, setAgeRange] = useState(saved.ageRange);

  const apply = () => {
    setDiscoverFilters({ situation, ageRange });
    navigate({ to: "/discover" });
  };

  return (
    <PhoneShell>
      <ScreenHeader
        title="Filters"
        backTo="/discover"
        right={
          <button
            onClick={() => {
              setSituation(DEFAULT_FILTERS.situation);
              setAgeRange(DEFAULT_FILTERS.ageRange);
            }}
            className="text-sm font-medium text-primary"
          >
            Reset
          </button>
        }
      />
      <div className="px-6 pb-32 pt-4 space-y-6">
        <div>
          <Label className="text-sm font-semibold">Their situation</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {SITUATIONS.map((s) => (
              <Tag key={s.v} onClick={() => setSituation(s.v)} selected={situation === s.v}>
                {s.l}
              </Tag>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold">Age</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {AGE_RANGES.map((a) => (
              <Tag key={a.v} onClick={() => setAgeRange(a.v)} selected={ageRange === a.v}>
                {a.l}
              </Tag>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          City, budget and move-in timing are already matched for you — everyone
          you see on Discover fits yours.
        </p>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface/95 backdrop-blur px-6 py-4">
        <Button
          onClick={apply}
          size="lg"
          className="h-14 w-full rounded-lg text-base font-semibold"
        >
          Show results
        </Button>
      </div>
    </PhoneShell>
  );
}
