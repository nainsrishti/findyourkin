import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tag } from "@/components/tag";
import { useAppStore } from "@/lib/store";
import { requireSession } from "@/lib/route-guards";

export const Route = createFileRoute("/onboarding/preferences")({
  head: () => ({ meta: [{ title: "Preferences — findyourKin" }] }),
  beforeLoad: () => requireSession(),
  component: PreferencesStep,
});

const GUESTS = [
  { v: "rare", l: "Rarely" },
  { v: "some", l: "Sometimes" },
  { v: "often", l: "Often" },
];

function PreferencesStep() {
  const navigate = useNavigate();
  const { onboarding, updateOnboarding } = useAppStore();
  const [p, setP] = useState(onboarding.preferences);

  const next = () => {
    updateOnboarding({ preferences: p });
    navigate({ to: "/onboarding/verification" });
  };

  const Row = ({ id, label, checked, onChange }: any) => (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <PhoneShell>
      <ScreenHeader title="Step 5 of 6" backTo="/onboarding/quiz" />
      <div className="px-6 pb-32">
        <StepProgress step={5} total={6} />
        <h2 className="mt-6 text-2xl font-bold">Your preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll use these as filters — not deal-breakers.
        </p>

        <div className="mt-6 space-y-3">
          <Row id="pets" label="OK with pets" checked={p.pets} onChange={(v: boolean) => setP({ ...p, pets: v })} />
          <Row id="smoker" label="OK with smokers" checked={p.smoker} onChange={(v: boolean) => setP({ ...p, smoker: v })} />
          <Row id="veg" label="Vegetarian household" checked={p.vegetarian} onChange={(v: boolean) => setP({ ...p, vegetarian: v })} />
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">Guests over</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {GUESTS.map((g) => (
              <Tag key={g.v} onClick={() => setP({ ...p, guests: g.v })} selected={p.guests === g.v}>
                {g.l}
              </Tag>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface/95 backdrop-blur px-6 py-4">
        <Button onClick={next} size="lg" className="h-14 w-full rounded-lg text-base font-semibold">
          Continue
        </Button>
      </div>
    </PhoneShell>
  );
}
