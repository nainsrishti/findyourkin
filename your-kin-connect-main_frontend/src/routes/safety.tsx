import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { AlertTriangle, ChevronRight, MessageSquareWarning, Phone, ShieldCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/safety")({
  head: () => ({ meta: [{ title: "Safety center — findyourKin" }] }),
  component: SafetyPage,
});

const RESOURCES = [
  { icon: MessageSquareWarning, title: "Report a profile", body: "Flag anything that feels off. Reports stay anonymous." },
  { icon: UserX, title: "Block someone", body: "Blocked profiles can no longer see or message you." },
  { icon: Phone, title: "24/7 helpline", body: "Talk to a support advisor — always free." },
];

const TIPS = [
  "Meet in a public place before deciding to share a home.",
  "Video call before agreeing to a viewing.",
  "Never share bank details or send a deposit before signing.",
  "Trust your gut. If it feels off, walk away.",
];

function SafetyPage() {
  return (
    <PhoneShell>
      <ScreenHeader title="Safety center" backTo="/profile" />
      <div className="px-6 pt-4 pb-12">
        <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/15">
            <ShieldCheck className="size-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Your safety comes first</h2>
          <p className="mt-2 text-sm text-white/85">
            Every profile is verified. If something ever feels wrong, we're one tap away.
          </p>
          <Button
            variant="secondary"
            className="mt-4 h-11 rounded-lg bg-white text-primary hover:bg-white/90"
          >
            Contact support
          </Button>
        </div>

        <section className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">Get help</h3>
          <div className="mt-3 rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
            {RESOURCES.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.title}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.body}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">Meeting-in-person tips</h3>
          <ul className="mt-3 space-y-2">
            {TIPS.map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-xl bg-muted p-3 text-sm text-foreground">
                <AlertTriangle className="mt-0.5 size-4 flex-shrink-0 text-accent" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          In an emergency, call your local emergency number.{" "}
          <Link to="/settings" className="font-medium text-primary">Manage privacy</Link>
        </p>
      </div>
    </PhoneShell>
  );
}
