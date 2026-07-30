import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/phone-shell";
import { MatchCard } from "@/components/match-card";
import { matchesQuery } from "@/lib/matches";
import { useAppStore } from "@/lib/store";
import { EmptyState } from "@/components/empty-state";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/screen-header";
import { requireOnboarded } from "@/lib/route-guards";

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Matches — findyourKin" }] }),
  beforeLoad: () => requireOnboarded(),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQuery);
  },
  component: MatchesPage,
});

// Founder card — pinned at the top for everyone, independent of anyone's
// actual like history. Not wired into real chat (we can't reliably resolve
// a real user_id for her account from here), so "Say hi" opens a prefilled
// email instead — always works, no dependency on her having a matchable
// profile.
const FOUNDER = {
  name: "Srishti Singh",
  age: 23,
  designation: "Founder, findyourKin",
  city: "Gurgaon",
  photo: "/founder.jpg",
  bio: "Hey, I'm Srishti — I built findyourKin because finding a flatmate you actually get along with in Gurgaon, Delhi, or Noida shouldn't be this hard. Got feedback, found a bug, or just want to say hi? I'd love to hear from you.",
};
const FOUNDER_MAILTO = `mailto:nainasingh4524@gmail.com?subject=${encodeURIComponent(
  "Hey from findyourKin!",
)}&body=${encodeURIComponent("Hi Srishti,\n\n")}`;

function MatchesPage() {
  const { data } = useSuspenseQuery(matchesQuery);
  const liked = useAppStore((s) => s.likedIds);
  const matched = data.filter((m) => liked.includes(m.user_id));
  const newMatches = matched.slice(0, 3);

  return (
    <PhoneShell showNav>
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur px-6 py-4">
        <h1 className="text-2xl font-bold">Your matches</h1>
        <p className="text-xs text-muted-foreground">
          You've liked {matched.length} {matched.length === 1 ? "person" : "people"}
        </p>
      </header>

      <section className="px-6 pt-2">
        <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary-soft p-4">
          <img
            src={FOUNDER.photo}
            alt={FOUNDER.name}
            className="size-16 flex-shrink-0 rounded-full border-2 border-surface object-cover shadow"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">
              {FOUNDER.name}, {FOUNDER.age}
            </p>
            <p className="text-xs font-medium text-primary">
              {FOUNDER.designation} · {FOUNDER.city}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{FOUNDER.bio}</p>
          </div>
        </div>
        <Button asChild variant="outline" className="mt-2 h-10 w-full rounded-lg text-sm">
          <a href={FOUNDER_MAILTO}>Say hi to the founder</a>
        </Button>
      </section>

      {matched.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-6" />}
          title="No matches yet"
          description="Tap the heart on a profile in Discover to add them here."
          action={
            <Button asChild>
              <Link to="/discover">Discover people</Link>
            </Button>
          }
        />
      ) : (
        <>
          <SectionHeader title="New this week" />
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-6 pb-2">
            {newMatches.map((m) => (
              <MatchCard key={m.user_id} match={m} className="w-40 flex-shrink-0" />
            ))}
          </div>

          <SectionHeader title="All matches" />
          <div className="grid grid-cols-2 gap-3 px-6 pb-8">
            {matched.map((m) => (
              <MatchCard key={m.user_id} match={m} />
            ))}
          </div>
        </>
      )}
    </PhoneShell>
  );
}
