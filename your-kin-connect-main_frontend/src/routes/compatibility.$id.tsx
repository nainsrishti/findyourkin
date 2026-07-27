import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { matchesQuery } from "@/lib/matches";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/compatibility/$id")({
  head: () => ({ meta: [{ title: "Compatibility report — findyourKin" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQuery);
  },
  component: CompatibilityPage,
});

function CompatibilityPage() {
  const { id } = Route.useParams();
  const { data: matches } = useSuspenseQuery(matchesQuery);
  const profile = matches.find((m) => m.user_id === id);
  if (!profile) throw notFound();

  const score = profile.score;
  const ring = 226;
  const dash = (score / 100) * ring;

  return (
    <PhoneShell>
      <ScreenHeader title="Compatibility" />
      <div className="px-6 pb-24">
        <div className="mt-4 flex flex-col items-center rounded-3xl bg-primary-soft p-8">
          <div className="relative flex size-32 items-center justify-center">
            <svg viewBox="0 0 80 80" className="size-32 -rotate-90">
              <circle cx="40" cy="40" r="36" fill="none" stroke="var(--color-border)" strokeWidth="6" />
              <motion.circle
                cx="40" cy="40" r="36" fill="none"
                stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={ring}
                initial={{ strokeDashoffset: ring }}
                animate={{ strokeDashoffset: ring - dash }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-3xl font-bold text-primary">{score}%</p>
              <p className="text-xs text-muted-foreground">match</p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground max-w-xs">
            You and{" "}
            <span className="font-semibold text-foreground">{profile.display_name ?? "this person"}</span> share
            a <span className="font-semibold text-foreground">{score >= 85 ? "high" : "good"}</span> lifestyle overlap.
          </p>
        </div>

        {profile.bio && (
          <section className="mt-8">
            <h2 className="mb-2 text-lg font-bold">About</h2>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold">Why you matched</h2>
          {profile.reasons.length > 0 ? (
            <div className="space-y-3">
              {profile.reasons.map((r) => (
                <div key={r} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-sm text-foreground">{r}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              A solid overall match — no single standout dimension, but it adds up.
            </p>
          )}
        </section>

        <Button asChild size="lg" className="mt-8 h-14 w-full rounded-lg text-base font-semibold">
          <Link to="/chat/$id" params={{ id: profile.user_id }}>
            <MessageCircle className="mr-2 size-5" />
            Message {profile.display_name ?? "them"}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="mt-3 h-14 w-full rounded-lg text-base font-semibold">
          <Link to="/discover">Back to discover</Link>
        </Button>
      </div>
    </PhoneShell>
  );
}
