import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { buildSaveProfilePayload } from "@/lib/build-profile-payload";
import { Briefcase, IdCard, Instagram, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { requireSession } from "@/lib/route-guards";

export const Route = createFileRoute("/onboarding/verification")({
  head: () => ({ meta: [{ title: "Get verified — findyourKin" }] }),
  beforeLoad: () => requireSession(),
  component: VerificationStep,
});

const OPTIONS = [
  { key: "id", label: "Government ID", body: "Coming soon.", icon: IdCard },
  { key: "employment", label: "Employment", body: "Coming soon.", icon: Briefcase },
  { key: "social", label: "Social profile", body: "Coming soon.", icon: Instagram },
];

function VerificationStep() {
  const navigate = useNavigate();
  const { onboarding } = useAppStore();
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    const { error } = await supabase.functions.invoke("save-profile", {
      body: buildSaveProfilePayload(onboarding),
    });
    setSaving(false);

    if (error) {
      toast.error("Couldn't save your profile — try again.");
      return;
    }

    toast.success("You're set! Finding your matches…");
    navigate({ to: "/finding-matches" });
  };

  return (
    <PhoneShell>
      <ScreenHeader title="Step 6 of 6" backTo="/onboarding/preferences" />
      <div className="px-6 pb-32">
        <StepProgress step={6} total={6} />
        <div className="mt-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Get verified</h2>
            <p className="text-sm text-muted-foreground">
              Verification isn't live yet — it's on the way.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <div
                key={o.key}
                className="flex w-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 text-left opacity-60"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-muted text-foreground">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{o.label}</p>
                  <p className="text-xs text-muted-foreground">{o.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Nothing to do here yet — verification won't affect your matches.
        </p>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface/95 backdrop-blur px-6 py-4">
        <Button
          onClick={finish}
          size="lg"
          className="h-14 w-full rounded-lg text-base font-semibold"
          disabled={saving}
        >
          {saving ? "Saving your profile…" : "Finish & see matches"}
        </Button>
      </div>
    </PhoneShell>
  );
}
