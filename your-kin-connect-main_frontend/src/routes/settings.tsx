import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Bell, ChevronRight, HelpCircle, Lock, Shield, Trash2 } from "lucide-react";
import { requireOnboarded } from "@/lib/route-guards";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — findyourKin" }] }),
  beforeLoad: () => requireOnboarded(),
  component: SettingsPage,
});

function SettingsPage() {
  const [notif, setNotif] = useState({ matches: true, messages: true, marketing: false });
  const [discoverable, setDiscoverable] = useState(true);

  return (
    <PhoneShell>
      <ScreenHeader title="Settings" backTo="/profile" />
      <div className="px-6 pt-4 pb-10 space-y-6">
        <Section title="Notifications">
          <ToggleRow id="n-matches" label="New matches" checked={notif.matches} onChange={(v) => setNotif({ ...notif, matches: v })} />
          <ToggleRow id="n-msgs" label="Messages" checked={notif.messages} onChange={(v) => setNotif({ ...notif, messages: v })} />
          <ToggleRow id="n-mkt" label="Product updates" checked={notif.marketing} onChange={(v) => setNotif({ ...notif, marketing: v })} />
        </Section>

        <Section title="Privacy">
          <ToggleRow id="discover" label="Show me on Discover" checked={discoverable} onChange={setDiscoverable} />
          <LinkRow icon={<Lock className="size-4" />} label="Blocked profiles" />
          <LinkRow icon={<Shield className="size-4" />} label="Safety center" to="/safety" />
        </Section>

        <Section title="Account">
          <LinkRow icon={<Bell className="size-4" />} label="Notification history" />
          <LinkRow icon={<HelpCircle className="size-4" />} label="Help & feedback" />
          <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-destructive hover:bg-muted/50">
            <div className="flex size-8 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="size-4" />
            </div>
            <span className="text-sm font-medium">Delete account</span>
          </button>
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

function ToggleRow({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function LinkRow({ icon, label, to }: { icon: React.ReactNode; label: string; to?: string }) {
  const inner = (
    <>
      <div className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">{icon}</div>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </>
  );
  if (to) {
    return (
      <Link to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50">
        {inner}
      </Link>
    );
  }
  return <button className="flex w-full items-center gap-3 px-4 py-3.5 hover:bg-muted/50">{inner}</button>;
}
