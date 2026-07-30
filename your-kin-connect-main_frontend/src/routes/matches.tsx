import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/phone-shell";
import { InitialsAvatar } from "@/components/initials-avatar";
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

// The founder is pinned as the first card everywhere on this page —
// present regardless of anyone's actual like history. Not wired into real
// chat (we can't reliably resolve a real user_id for her account from
// here), so tapping her card opens a prefilled email instead — always
// works, no dependency on her having a matchable profile.
const FOUNDER_MAILTO = `mailto:nainasingh4524@gmail.com?subject=${encodeURIComponent(
  "Hey from findyourKin!",
)}&body=${encodeURIComponent("Hi Srishti,\n\n")}`;

interface DisplayItem {
  id: string;
  name: string;
  age: number | null;
  photo: string | null;
  subtitle: string;
  score: number | null;
  founder?: boolean;
}

const FOUNDER_ITEM: DisplayItem = {
  id: "founder",
  name: "Srishti Singh",
  age: 23,
  photo: "/founder.jpg",
  subtitle: "Founder, findyourKin · Gurgaon",
  score: null,
  founder: true,
};

function MatchesPage() {
  const { data } = useSuspenseQuery(matchesQuery);
  const liked = useAppStore((s) => s.likedIds);
  const realMatches = data.filter((m) => liked.includes(m.user_id));

  const items: DisplayItem[] = [
    FOUNDER_ITEM,
    ...realMatches.map((m) => ({
      id: m.user_id,
      name: m.display_name ?? "findyourKin user",
      age: m.age,
      photo: m.photo_url,
      subtitle: m.occupation ?? "",
      score: m.score,
    })),
  ];
  const newMatches = items.slice(0, 3);

  return (
    <PhoneShell showNav>
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur px-6 py-4">
        <h1 className="text-2xl font-bold">Your matches</h1>
        <p className="text-xs text-muted-foreground">
          You've mutually liked {realMatches.length} people
        </p>
      </header>

      {realMatches.length === 0 && (
        <EmptyState
          icon={<Heart className="size-6" />}
          title="No matches yet"
          description="Tap the heart on a profile in Discover to add them here."
          action={
            <Button asChild>
              <Link to="/discover">Discover people</Link>
            </Button>
          }
          className="pb-4"
        />
      )}

      <SectionHeader title="New this week" />
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-6 pb-2">
        {newMatches.map((item) => (
          <StripCard key={item.id} item={item} />
        ))}
      </div>

      <SectionHeader title="All matches" />
      <ul className="divide-y divide-border pb-8">
        {items.map((item) => (
          <ListRow key={item.id} item={item} />
        ))}
      </ul>
    </PhoneShell>
  );
}

function StripCard({ item }: { item: DisplayItem }) {
  const inner = (
    <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-muted">
      {item.photo ? (
        <img src={item.photo} alt={item.name} className="size-full object-cover" />
      ) : (
        <InitialsAvatar name={item.name} className="size-full rounded-none text-3xl" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-xs font-semibold text-white">
          {item.name}
          {item.age ? `, ${item.age}` : ""}
        </p>
        <p className="text-[10px] text-white/85">
          {item.founder ? "Say hi 👋" : `${item.score}% match`}
        </p>
      </div>
    </div>
  );

  if (item.founder) {
    return (
      <a href={FOUNDER_MAILTO} className="flex-shrink-0 w-32">
        {inner}
      </a>
    );
  }
  return (
    <Link to="/compatibility/$id" params={{ id: item.id }} className="flex-shrink-0 w-32">
      {inner}
    </Link>
  );
}

function ListRow({ item }: { item: DisplayItem }) {
  const inner = (
    <>
      {item.photo ? (
        <img src={item.photo} alt={item.name} className="size-14 rounded-full object-cover" />
      ) : (
        <InitialsAvatar name={item.name} className="size-14 text-base" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">
          {item.name}
          {item.age ? `, ${item.age}` : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.subtitle}
          {item.founder ? "" : ` · ${item.score}% match`}
        </p>
      </div>
      <span className="text-xs font-medium text-primary">{item.founder ? "Say hi →" : "Chat →"}</span>
    </>
  );

  if (item.founder) {
    return (
      <li>
        <a href={FOUNDER_MAILTO} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50">
          {inner}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link
        to="/chat/$id"
        params={{ id: item.id }}
        className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50"
      >
        {inner}
      </Link>
    </li>
  );
}
