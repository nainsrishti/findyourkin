import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/tag";
import { HOUSING_TYPES } from "@/lib/mock-data";
import { CITIES, NEIGHBORHOODS_BY_CITY } from "@/lib/ncr-locations";
import { useAppStore } from "@/lib/store";
import { Check } from "lucide-react";

export const Route = createFileRoute("/onboarding/housing")({
  head: () => ({ meta: [{ title: "Housing — findyourKin" }] }),
  component: HousingStep,
});

function HousingStep() {
  const navigate = useNavigate();
  const { onboarding, updateOnboarding } = useAppStore();
  const [choice, setChoice] = useState(onboarding.housingChoice);
  const [city, setCity] = useState(onboarding.city);
  const [hoods, setHoods] = useState<string[]>(onboarding.neighborhoods);
  const [budget, setBudget] = useState<[number, number]>(onboarding.budget);

  const availableHoods = NEIGHBORHOODS_BY_CITY[city] ?? [];

  const pickCity = (c: string) => {
    setCity(c);
    setHoods([]); // neighborhoods are city-specific — clear on city change
  };

  const toggleHood = (h: string) =>
    setHoods((prev) => (prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]));

  const next = () => {
    updateOnboarding({ housingChoice: choice, city, neighborhoods: hoods, budget });
    navigate({ to: "/onboarding/quiz" });
  };

  return (
    <PhoneShell>
      <ScreenHeader title="Step 2 of 5" backTo="/onboarding/profile" />
      <div className="px-6 pb-32">
        <StepProgress step={2} total={5} />
        <h2 className="mt-6 text-2xl font-bold">Where are you looking?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us your housing situation and where you'd like to live.
        </p>

        <div className="mt-6 space-y-3">
          {HOUSING_TYPES.map((h) => {
            const active = choice === h.value;
            return (
              <button
                type="button"
                key={h.value}
                onClick={() => setChoice(h.value)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  active
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-surface hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{h.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{h.body}</p>
                  </div>
                  {active && (
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">City</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Tag key={c.value} onClick={() => pickCity(c.value)} selected={city === c.value}>
                {c.label}
              </Tag>
            ))}
          </div>
        </div>

        {availableHoods.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-foreground">Preferred neighborhoods</h3>
            <p className="text-xs text-muted-foreground">Pick as many as you like.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableHoods.map((n) => (
                <Tag key={n.value} onClick={() => toggleHood(n.value)} selected={hoods.includes(n.value)}>
                  {n.label}
                </Tag>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-foreground">Monthly budget</h3>
            <p className="text-sm font-medium text-primary">
              ₹{budget[0].toLocaleString()} – ₹{budget[1].toLocaleString()}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground">
              Min
              <input
                type="number"
                min={5000}
                step={1000}
                value={budget[0]}
                onChange={(e) => setBudget([Number(e.target.value), budget[1]])}
                className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Max
              <input
                type="number"
                min={budget[0]}
                step={1000}
                value={budget[1]}
                onChange={(e) => setBudget([budget[0], Number(e.target.value)])}
                className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface/95 backdrop-blur px-6 py-4">
        <Button
          onClick={next}
          size="lg"
          className="h-14 w-full rounded-lg text-base font-semibold"
          disabled={!choice || !city}
        >
          Continue
        </Button>
      </div>
    </PhoneShell>
  );
}
