import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { AlertTriangle, ChevronRight, MessageSquareWarning, Phone, ShieldCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireOnboarded } from "@/lib/route-guards";

export const Route = createFileRoute("/safety")({
  head: () => ({ meta: [{ title: "Safety center — findyourKin" }] }),
  beforeLoad: () => requireOnboarded(),
  component: SafetyPage,
});

const SUPPORT_MAILTO = `mailto:nainsrishtisingh@gmail.com?subject=${encodeURIComponent(
  "Safety concern — findyourKin",
)}`;

// Informational — the actual report/block actions live in each chat's ⋮ menu.
const RESOURCES: {
  icon: typeof MessageSquareWarning;
  title: string;
  body: string;
  href?: string;
}[] = [
  { icon: MessageSquareWarning, title: "Report a profile", body: "Open a chat with them and tap ⋮ → Report. Reports stay anonymous." },
  { icon: UserX, title: "Block someone", body: "In their chat, tap ⋮ → Block. They won't see or message you again." },
  { icon: Phone, title: "Email the team", body: "Anything urgent or uncomfortable — we read every message.", href: SUPPORT_MAILTO },
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
            If something ever feels wrong, report it from the chat or write to
            us directly — we read everything.
          </p>
          <Button
            asChild
            variant="secondary"
            className="mt-4 h-11 rounded-lg bg-white text-primary hover:bg-white/90"
          >
            <a href={SUPPORT_MAILTO}>Contact support</a>
          </Button>
        </div>

        <section className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">Get help</h3>
          <div className="mt-3 rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
            {RESOURCES.map((r) => {
              const Icon = r.icon;
              const inner = (
                <>
                  <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.body}</p>
                  </div>
                  {r.href && <ChevronRight className="size-4 text-muted-foreground" />}
                </>
              );
              return r.href ? (
                <a
                  key={r.title}
                  href={r.href}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50"
                >
                  {inner}
                </a>
              ) : (
                <div key={r.title} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                  {inner}
                </div>
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
