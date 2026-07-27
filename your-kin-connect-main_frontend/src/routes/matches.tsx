import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/phone-shell";
import { fetchProfiles } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { EmptyState } from "@/components/empty-state";
import { Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/screen-header";

const profilesQuery = queryOptions({ queryKey: ["profiles"], queryFn: fetchProfiles });

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Matches — findyourKin" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(profilesQuery);
  },
  component: MatchesPage,
});

function MatchesPage() {
  const { data } = useSuspenseQuery(profilesQuery);
  const liked = useAppStore((s) => s.likedIds);
  // Fallback: seed with top profiles so page isn't empty on first visit
  const ids = liked.length ? liked : data.slice(0, 3).map((p) => p.id);
  const matched = data.filter((p) => ids.includes(p.id));
  const newMatches = matched.slice(0, 3);
  const older = matched.slice(3);

  return (
    <PhoneShell showNav>
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur px-6 py-4">
        <h1 className="text-2xl font-bold">Your matches</h1>
        <p className="text-xs text-muted-foreground">
          You've mutually liked {matched.length} people
        </p>
      </header>

      {matched.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-6" />}
          title="No matches yet"
          description="Keep exploring — new profiles are added every day."
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
            {newMatches.map((p) => (
              <Link
                key={p.id}
                to="/profile/$id"
                params={{ id: p.id }}
                className="flex-shrink-0 w-32"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-muted">
                  <img src={p.photo} alt={p.name} className="size-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-xs font-semibold text-white">{p.name}, {p.age}</p>
                    <p className="text-[10px] text-white/85">{p.compatibilityScore}% match</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <SectionHeader title="All matches" />
          <ul className="divide-y divide-border">
            {matched.map((p) => (
              <li key={p.id}>
                <Link
                  to="/chat/$id"
                  params={{ id: `c_${p.id}` }}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50"
                >
                  <img src={p.photo} alt={p.name} className="size-14 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-foreground">{p.name}, {p.age}</p>
                      {p.verified.length > 0 && <ShieldCheck className="size-3.5 text-[--color-success]" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.neighborhood} · {p.compatibilityScore}% match</p>
                  </div>
                  <span className="text-xs font-medium text-primary">Chat →</span>
                </Link>
              </li>
            ))}
          </ul>
          {older.length > 0 && <div className="h-4" />}
        </>
      )}
    </PhoneShell>
  );
}
