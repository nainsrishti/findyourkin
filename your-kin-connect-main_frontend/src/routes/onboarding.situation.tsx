import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { HOUSING_TYPES } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { Check } from "lucide-react";
import { requireSession } from "@/lib/route-guards";

export const Route = createFileRoute("/onboarding/situation")({
  head: () => ({ meta: [{ title: "Your situation — findyourKin" }] }),
  beforeLoad: () => requireSession(),
  component: SituationStep,
});

function SituationStep() {
  const navigate = useNavigate();
  const { onboarding, updateOnboarding } = useAppStore();
  const [choice, setChoice] = useState(onboarding.housingChoice);

  const next = () => {
    updateOnboarding({ housingChoice: choice });
    navigate({ to: "/onboarding/profile" });
  };

  return (
    <PhoneShell>
      <ScreenHeader title="Step 1 of 6" backTo="/otp" />
      <div className="px-6 pb-32">
        <StepProgress step={1} total={6} />
        <h2 className="mt-6 text-2xl font-bold">What's your situation?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This is the first thing people will know about you — it shapes who you'll see and who'll see you.
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
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface/95 backdrop-blur px-6 py-4">
        <Button
          onClick={next}
          size="lg"
          className="h-14 w-full rounded-lg text-base font-semibold"
          disabled={!choice}
        >
          Continue
        </Button>
      </div>
    </PhoneShell>
  );
}
