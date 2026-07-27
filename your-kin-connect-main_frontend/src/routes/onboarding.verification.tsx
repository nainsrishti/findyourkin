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

export const Route = createFileRoute("/onboarding/verification")({
  head: () => ({ meta: [{ title: "Get verified — findyourKin" }] }),
  component: VerificationStep,
});

const OPTIONS = [
  { key: "id", label: "Government ID", body: "Required for messaging. Fully private.", icon: IdCard },
  { key: "employment", label: "Employment", body: "Show your workplace or field of work.", icon: Briefcase },
  { key: "social", label: "Social profile", body: "Link Instagram or LinkedIn.", icon: Instagram },
];

function VerificationStep() {
  const navigate = useNavigate();
  const { onboarding, updateOnboarding } = useAppStore();
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

    updateOnboarding({ verifiedId: true });
    toast.success("You're set! Finding your matches…");
    navigate({ to: "/finding-matches" });
  };

  return (
    <PhoneShell>
      <ScreenHeader title="Step 5 of 5" backTo="/onboarding/preferences" />
      <div className="px-6 pb-32">
        <StepProgress step={5} total={5} />
        <div className="mt-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Get verified</h2>
            <p className="text-sm text-muted-foreground">Verified profiles get 3× more matches.</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <button
                key={o.key}
                onClick={() => toast(`${o.label} — mock verification passed`)}
                className="flex w-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 text-left hover:border-primary/40 transition-colors"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-muted text-foreground">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{o.label}</p>
                  <p className="text-xs text-muted-foreground">{o.body}</p>
                </div>
                <span className="text-sm font-medium text-primary">Verify</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your ID is never shared. We only display a verified badge.
        </p>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-surface/95 backdrop-blur px-6 py-4">
        <Button
          onClick={finish}
          size="lg"
          className="h-14 w-full rounded-lg text-base font-semibold"
          disabled={saving}
        >
          {saving ? "Saving…" : "Continue to matches"}
        </Button>
        <button
          onClick={finish}
          disabled={saving}
          className="text-center text-sm font-medium text-muted-foreground"
        >
          Skip for now
        </button>
      </div>
    </PhoneShell>
  );
}
