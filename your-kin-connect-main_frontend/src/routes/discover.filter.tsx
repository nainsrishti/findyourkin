import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/tag";
import { NEIGHBORHOODS } from "@/lib/mock-data";
import { Label } from "@/components/ui/label";
import { requireOnboarded } from "@/lib/route-guards";

export const Route = createFileRoute("/discover/filter")({
  head: () => ({ meta: [{ title: "Filter — findyourKin" }] }),
  beforeLoad: () => requireOnboarded(),
  component: FilterPage,
});

const HOUSING = ["Any", "Studio", "1BHK", "2BHK", "3BHK"];
const AGE_RANGES = ["18–24", "25–30", "31–35", "36+"];

function FilterPage() {
  const navigate = useNavigate();
  const [hoods, setHoods] = useState<string[]>([]);
  const [housing, setHousing] = useState("Any");
  const [age, setAge] = useState("25–30");
  const [budget, setBudget] = useState<[number, number]>([15000, 30000]);
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  const toggle = (h: string) =>
    setHoods((p) => (p.includes(h) ? p.filter((x) => x !== h) : [...p, h]));

  return (
    <PhoneShell>
      <ScreenHeader
        title="Filters"
        backTo="/discover"
        right={
          <button
            onClick={() => {
              setHoods([]);
              setHousing("Any");
              setAge("25–30");
              setBudget([15000, 30000]);
              setVerifiedOnly(false);
            }}
            className="text-sm font-medium text-primary"
          >
            Reset
          </button>
        }
      />
      <div className="px-6 pb-32 pt-4 space-y-6">
        <div>
          <Label className="text-sm font-semibold">Neighborhood</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {NEIGHBORHOODS.map((n) => (
              <Tag key={n} onClick={() => toggle(n)} selected={hoods.includes(n)}>
                {n}
              </Tag>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold">Housing type</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {HOUSING.map((h) => (
              <Tag key={h} onClick={() => setHousing(h)} selected={housing === h}>
                {h}
              </Tag>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold">Age</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {AGE_RANGES.map((a) => (
              <Tag key={a} onClick={() => setAge(a)} selected={age === a}>
                {a}
              </Tag>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <Label className="text-sm font-semibold">Monthly budget</Label>
            <p className="text-sm font-medium text-primary">
              ₹{budget[0].toLocaleString()} – ₹{budget[1].toLocaleString()}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              type="number"
              value={budget[0]}
              onChange={(e) => setBudget([Number(e.target.value), budget[1]])}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
            />
            <input
              type="number"
              value={budget[1]}
              onChange={(e) => setBudget([budget[0], Number(e.target.value)])}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
        </div>

        <label className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
          <span className="text-sm font-medium">Verified profiles only</span>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="size-5 accent-primary"
          />
        </label>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface/95 backdrop-blur px-6 py-4">
        <Button
          onClick={() => navigate({ to: "/discover" })}
          size="lg"
          className="h-14 w-full rounded-lg text-base font-semibold"
        >
          Show results
        </Button>
      </div>
    </PhoneShell>
  );
}
