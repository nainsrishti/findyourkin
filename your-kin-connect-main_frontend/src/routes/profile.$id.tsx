import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MapPin, MoreHorizontal, Send, ShieldCheck, ArrowLeft } from "lucide-react";
import { PhoneShell } from "@/components/phone-shell";
import { Tag } from "@/components/tag";
import { CompatibilityBar } from "@/components/compatibility-bar";
import { getProfile } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { requireOnboarded } from "@/lib/route-guards";
import { InitialsAvatar } from "@/components/initials-avatar";

export const Route = createFileRoute("/profile/$id")({
  head: () => ({ meta: [{ title: "Profile — findyourKin" }] }),
  beforeLoad: () => requireOnboarded(),
  loader: ({ params }) => {
    const profile = getProfile(params.id);
    if (!profile) throw notFound();
    return { profile };
  },
  component: ProfileDetail,
});

function ProfileDetail() {
  const { profile } = Route.useLoaderData();
  const navigate = useNavigate();
  const like = useAppStore((s) => s.like);
  const [scroll, setScroll] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScroll(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const sayHello = () => {
    like(profile.id);
    toast.success(`You said hello to ${profile.name}`);
    navigate({ to: "/chat/$id", params: { id: `c_${profile.id}` } });
  };

  return (
    <PhoneShell scrollable={false}>
      {/* Custom scroll container so we can do parallax */}
      <div ref={scrollRef} className="relative h-full flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Floating top actions */}
        <div className="fixed left-0 right-0 top-0 z-40 mx-auto max-w-[420px] flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-4">
          <button
            onClick={() => window.history.back()}
            aria-label="Back"
            className="flex size-10 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md hover:bg-white/35"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            aria-label="More"
            className="flex size-10 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md hover:bg-white/35"
          >
            <MoreHorizontal className="size-5" />
          </button>
        </div>

        <div className="relative h-[380px] w-full overflow-hidden bg-muted">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={`Portrait of ${profile.name}`}
              className="size-full object-cover object-top will-change-transform"
              style={{ transform: `translateY(${scroll * 0.4}px)` }}
            />
          ) : (
            <InitialsAvatar name={profile.name} className="size-full rounded-none text-6xl" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute right-4 top-4 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold shadow-lg" style={{ marginTop: 60 }}>
            {profile.compatibilityScore}% match
          </div>
        </div>

        <div className="relative -mt-6 rounded-t-3xl bg-surface z-10">
          <div className="border-b border-border px-6 pb-4 pt-6">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold leading-tight">
                {profile.name}, {profile.age}
              </h1>
              {profile.verified.length > 0 && (
                <span className="flex size-6 items-center justify-center rounded-full bg-success-soft text-[--color-success]">
                  <ShieldCheck className="size-4" />
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {profile.neighborhood}, {profile.location}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.tags.map((t: string) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>

          <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent-soft p-4">
            <div className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
              ♥
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{profile.insight.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{profile.insight.body}</p>
            </div>
          </div>

          <div className="px-6 py-8">
            <h2 className="mb-6 text-xl font-bold">Why you'll get along</h2>
            <div className="space-y-6">
              <CompatibilityBar label="Cleanliness" value={profile.traits.cleanliness} hint="She prefers a spotless kitchen, just like you." />
              <CompatibilityBar label="Social Battery" value={profile.traits.social} hint="Enjoys occasional dinners together but values alone time." />
              <CompatibilityBar
                label="Work Hours"
                value={profile.traits.workHours}
                tone="accent"
                hint="She works hybrid — you might overlap at home on Thursdays."
              />
              <CompatibilityBar label="Sleep Schedule" value={profile.traits.sleepSchedule} hint="Both wind down around the same time." />
            </div>
            <Link
              to="/compatibility/$id"
              params={{ id: profile.id }}
              className="mt-6 block text-center text-sm font-medium text-primary"
            >
              See full compatibility report →
            </Link>
          </div>

          <div className="border-t border-border px-6 pb-6 pt-8">
            <h2 className="mb-3 text-xl font-bold">About {profile.name}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
          </div>

          <div className="border-t border-border px-6 py-8 space-y-5">
            <h2 className="text-xl font-bold">A few prompts</h2>
            {profile.prompts.map((p: { q: string; a: string }, i: number) => (
              <div key={i} className="rounded-2xl bg-muted p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.q}</p>
                <p className="mt-1 text-sm font-medium text-foreground">"{p.a}"</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border px-6 py-8">
            <h2 className="mb-3 text-xl font-bold">Housing</h2>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Budget" value={`₹${profile.budgetRange[0] / 1000}k–${profile.budgetRange[1] / 1000}k`} />
              <Stat label="Type" value={profile.housingType} />
              <Stat label="Move-in" value={profile.moveIn} />
              <Stat label="Verified" value={`${profile.verified.length} badges`} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-surface via-surface to-transparent px-6 pb-6 pt-12">
        <Button
          onClick={sayHello}
          size="lg"
          className="pointer-events-auto h-14 w-full rounded-lg text-base font-semibold gap-2 shadow-elevated"
        >
          Say hello <Send className="size-4" />
        </Button>
      </div>
    </PhoneShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
