import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneShell } from "@/components/phone-shell";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ChevronRight, Edit3, LogOut, Settings, ShieldCheck, Sparkles, Heart } from "lucide-react";
import { Tag } from "@/components/tag";

export const Route = createFileRoute("/profile/")({
  head: () => ({ meta: [{ title: "Your profile — findyourKin" }] }),
  component: MyProfile,
});

function MyProfile() {
  const navigate = useNavigate();
  const { user, onboarding, likedIds, logout } = useAppStore();

  const name = onboarding.displayName || user?.name || "Guest";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <PhoneShell showNav>
      <header className="sticky top-0 z-20 flex items-center justify-between bg-surface/95 backdrop-blur px-6 py-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link
          to="/settings"
          aria-label="Settings"
          className="flex size-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80"
        >
          <Settings className="size-4" />
        </Link>
      </header>

      <div className="px-6">
        <div className="flex items-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {initials || "U"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xl font-bold">{name}{onboarding.age ? `, ${onboarding.age}` : ""}</p>
              {onboarding.verifiedId && (
                <ShieldCheck className="size-4 text-[--color-success]" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {onboarding.occupation || "Add your occupation"} · {onboarding.city}
            </p>
          </div>
          <Button variant="outline" size="icon" aria-label="Edit profile" className="rounded-full">
            <Edit3 className="size-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Likes" value={likedIds.length.toString()} />
          <Stat label="Profile" value={onboarding.verifiedId ? "Verified" : "Basic"} />
          <Stat label="Quiz" value={`${Object.keys(onboarding.quiz).length}/5`} />
        </div>

        {/* Tags */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold">Your vibes</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Early bird", "Neat freak", "Plant parent", "WFH"].map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </section>

        {/* Menu */}
        <section className="mt-8 rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
          <MenuRow icon={<Sparkles className="size-4" />} label="Retake lifestyle quiz" to="/onboarding/quiz" />
          <MenuRow icon={<Heart className="size-4" />} label="Your likes & passes" to="/matches" />
          <MenuRow icon={<ShieldCheck className="size-4" />} label="Verification" to="/onboarding/verification" />
          <MenuRow icon={<Settings className="size-4" />} label="Settings" to="/settings" />
        </section>

        <button
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface py-3 text-sm font-medium text-destructive hover:bg-muted"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </div>
    </PhoneShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-3 text-center">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function MenuRow({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50">
      <div className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">{icon}</div>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
