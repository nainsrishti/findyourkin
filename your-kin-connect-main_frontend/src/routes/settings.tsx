import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, HelpCircle, Shield, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { requireOnboarded } from "@/lib/route-guards";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — findyourKin" }] }),
  beforeLoad: () => requireOnboarded(),
  component: SettingsPage,
});

const SUPPORT_EMAIL = "nainsrishtisingh@gmail.com";

const HELP_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Help & feedback — findyourKin",
)}`;

const DELETE_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Delete my findyourKin account",
)}&body=${encodeURIComponent(
  "Please delete my account and all my data.\n\nThe email I signed up with: ",
)}`;

function SettingsPage() {
  // Real setting: profiles.is_active controls whether others can see you on
  // Discover (the matching engine only returns active profiles).
  const [discoverable, setDiscoverable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) setDiscoverable(data?.is_active ?? true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDiscoverable = async (v: boolean) => {
    setDiscoverable(v);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: v })
      .eq("id", user.id);
    if (error) {
      setDiscoverable(!v);
      toast.error("Couldn't update — try again.");
    } else {
      toast.success(v ? "You're visible on Discover." : "You're hidden from Discover.");
    }
  };

  return (
    <PhoneShell>
      <ScreenHeader title="Settings" backTo="/profile" />
      <div className="px-6 pt-4 pb-10 space-y-6">
        <Section title="Privacy">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <Label htmlFor="discover" className="text-sm font-medium">
                Show me on Discover
              </Label>
              <p className="text-xs text-muted-foreground">
                Turn off to pause matching — no one new will see you.
              </p>
            </div>
            <Switch
              id="discover"
              checked={discoverable ?? true}
              disabled={discoverable === null}
              onCheckedChange={toggleDiscoverable}
            />
          </div>
          <LinkRow icon={<Shield className="size-4" />} label="Safety center" to="/safety" />
        </Section>

        <Section title="Account">
          <LinkRow
            icon={<HelpCircle className="size-4" />}
            label="Help & feedback"
            href={HELP_MAILTO}
          />
          <a
            href={DELETE_MAILTO}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-destructive hover:bg-muted/50"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="size-4" />
            </div>
            <span className="text-sm font-medium">Request account deletion</span>
          </a>
        </Section>

        <p className="text-center text-xs text-muted-foreground">findyourKin v1.0 · Made with care</p>
      </div>
    </PhoneShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function LinkRow({
  icon,
  label,
  to,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  to?: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">{icon}</div>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </>
  );
  if (href) {
    return (
      <a href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50">
        {inner}
      </a>
    );
  }
  return (
    <Link to={to!} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50">
      {inner}
    </Link>
  );
}
