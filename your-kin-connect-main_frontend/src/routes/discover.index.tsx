import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/phone-shell";
import { MatchCard } from "@/components/match-card";
import { SectionHeader } from "@/components/screen-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { matchesQuery, applyDiscoverFilters, filtersActive } from "@/lib/matches";
import { CITIES } from "@/lib/ncr-locations";
import { SlidersHorizontal, Users } from "lucide-react";
import { useAppStore, DEFAULT_FILTERS } from "@/lib/store";
import { requireOnboarded } from "@/lib/route-guards";

export const Route = createFileRoute("/discover/")({
  head: () => ({ meta: [{ title: "Discover — findyourKin" }] }),
  beforeLoad: () => requireOnboarded(),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQuery);
  },
  component: DiscoverPage,
});

function DiscoverPage() {
  const { data: matches } = useSuspenseQuery(matchesQuery);
  const passed = useAppStore((s) => s.passedIds);
  const filters = useAppStore((s) => s.discoverFilters);
  const setDiscoverFilters = useAppStore((s) => s.setDiscoverFilters);
  const notPassed = matches.filter((m) => !passed.includes(m.user_id));
  const list = applyDiscoverFilters(notPassed, filters);
  const hasActiveFilters = filtersActive(filters);
  const [top, ...rest] = list;
  const user = useAppStore((s) => s.user);
  const cityLabel = useAppStore(
    (s) => CITIES.find((c) => c.value === s.onboarding.city)?.label ?? "",
  );

  return (
    <PhoneShell showNav>
      <header className="sticky top-0 z-20 flex items-center justify-between bg-surface/95 backdrop-blur px-6 py-4">
        <div>
          <p className="text-xs text-muted-foreground">{cityLabel}</p>
          <h1 className="text-xl font-bold">Hi {user?.name ?? "there"} 👋</h1>
        </div>
        <Link
          to="/discover/filter"
          className="relative inline-flex size-10 items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/80"
          aria-label="Filters"
        >
          <SlidersHorizontal className="size-4" />
          {hasActiveFilters && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-accent ring-2 ring-surface" />
          )}
        </Link>
      </header>

      {top && (
        <div className="px-6">
          <div className="rounded-3xl bg-primary-soft p-4 mb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Top match today
            </p>
          </div>
          <MatchCard match={top} className="mb-2" />
          <Link
            to="/compatibility/$id"
            params={{ id: top.user_id }}
            className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm hover:border-primary/40 transition-colors"
          >
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{top.score}%</span> lifestyle match
            </span>
            <span className="font-medium text-primary">See why →</span>
          </Link>
        </div>
      )}

      {list.length === 0 && (
        <EmptyState
          icon={<Users className="size-6" />}
          title={hasActiveFilters ? "No one fits these filters" : "No matches yet"}
          description={
            hasActiveFilters
              ? "Try widening your filters — new people join every week."
              : "You're early! As more people in your city finish the quiz, matches will show up here."
          }
          action={
            hasActiveFilters ? (
              <Button onClick={() => setDiscoverFilters(DEFAULT_FILTERS)}>
                Clear filters
              </Button>
            ) : undefined
          }
          className="pt-10"
        />
      )}

      {rest.length > 0 && (
        <>
          <SectionHeader title="More for you" action="Filters" actionTo="/discover/filter" />
          <div className="grid grid-cols-2 gap-3 px-6 pb-8">
            {rest.map((m) => (
              <MatchCard key={m.user_id} match={m} />
            ))}
          </div>
        </>
      )}
    </PhoneShell>
  );
}
