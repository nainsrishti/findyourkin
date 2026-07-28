import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sparkles,
  Users,
  MessageCircle,
  IndianRupee,
  ShieldCheck,
  Flag,
  Lock,
  Home,
  Search,
  Wallet,
  Sofa,
  Wind,
  UserCheck,
  Calendar,
  Heart,
  Wifi,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About findyourKin — Compatibility-first flatmate matching in Delhi NCR" },
      {
        name: "description",
        content:
          "findyourKin matches flatmates on lifestyle, not just budget — 11 real compatibility dimensions, zero broker fees, built for Gurgaon, Delhi, and Noida.",
      },
    ],
  }),
  component: AboutPage,
});

const DIMENSIONS = [
  { icon: Moon, label: "Sleep schedule" },
  { icon: Sofa, label: "Cleanliness" },
  { icon: Users, label: "Having people over" },
  { icon: Wind, label: "Social energy at home" },
  { icon: MessageCircle, label: "Handling conflict", highlight: true },
  { icon: Wallet, label: "Budget band" },
  { icon: Wifi, label: "Work-from-home frequency" },
  { icon: Heart, label: "Partner staying over" },
  { icon: Calendar, label: "Expected stay length" },
];

const HARD_FILTERS = ["Diet & shared kitchen", "Smoking", "Pets", "City & move-in window"];

const STATS = [
  { value: "11", label: "compatibility dimensions scored" },
  { value: "₹0", label: "broker fees, ever" },
  { value: "1", label: "rule that catches bad pairings, not just averages them" },
  { value: "3", label: "cities we're actually built for" },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <Dimensions />
      <Differentiators />
      <ExamplePreview />
      <TrustSafety />
      <ForEveryone />
      <ScopeHonesty />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="text-lg font-bold tracking-tight text-foreground">
          find<span className="text-primary">your</span>Kin
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#compatibility" className="hover:text-foreground">Compatibility</a>
          <a href="#trust" className="hover:text-foreground">Trust & safety</a>
          <Link to="/demo" className="hover:text-foreground">Example matches</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-lg">
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 md:pb-24 md:pt-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            Gurgaon · Delhi · Noida
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl">
            A calmer way to find flatmates you'll actually get along with.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Most sites match you to a room. We match you to a person — scored across 11 real lifestyle
            dimensions, not just who posted first. No broker fees, no cold calls, no guessing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-lg px-6 text-base font-semibold">
              <Link to="/signup">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-lg px-6 text-base font-medium">
              <Link to="/demo">See example matches</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-elevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center -space-x-3">
                <img src="https://i.pravatar.cc/150?u=Ananya Kapoor" alt="" className="size-11 rounded-full border-2 border-surface object-cover" />
                <img src="https://i.pravatar.cc/150?u=Ishita Verma" alt="" className="size-11 rounded-full border-2 border-surface object-cover" />
              </div>
              <div className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">92% match</div>
            </div>
            <div className="mt-4 space-y-2.5">
              {[
                { label: "Sleep schedule", score: 95 },
                { label: "Cleanliness", score: 90 },
                { label: "Handling conflict", score: 100 },
              ].map((d) => (
                <div key={d.label}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <span className="font-medium text-foreground">{d.label}</span>
                    <span className="font-semibold text-primary">{d.score}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${d.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Ananya, 26 · Product Designer, Gurgaon &amp; Ishita, 25 · Marketing Associate, Gurgaon
            </p>
          </div>
          <div className="absolute -right-4 -top-4 -z-10 size-32 rounded-full bg-accent-soft blur-2xl" />
          <div className="absolute -bottom-6 -left-6 -z-10 size-40 rounded-full bg-primary-soft blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-border bg-surface py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <p className="text-3xl font-bold text-primary">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Sparkles,
      title: "Answer real questions",
      body: "A short quiz on sleep schedule, cleanliness, guests, conflict style, and more — takes about 3 minutes, not a personality-test slog.",
    },
    {
      icon: Search,
      title: "Get matched and scored",
      body: "Hard filters (city, budget, diet, smoking) narrow the pool. Then we score what's left across 11 weighted dimensions — with one rule that caps a match outright if conflict styles clash, instead of quietly averaging it away.",
    },
    {
      icon: MessageCircle,
      title: "Chat, on your terms",
      body: "See exactly why you matched before you say a word. Message directly in the app — no phone number handed out until you're ready.",
    },
  ];
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">How it works</h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground">
        Three steps. No listings to scroll through, no broker to call back.
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <s.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">
              <span className="mr-2 text-muted-foreground">0{i + 1}</span>
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Dimensions() {
  return (
    <section id="compatibility" className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
          Compatibility that actually matters
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">
          We score the things that make or break living together — not just budget and a floor plan.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3">
          {DIMENSIONS.map((d) => (
            <div
              key={d.label}
              className={`flex items-center gap-3 rounded-2xl border p-4 ${
                d.highlight ? "border-primary/30 bg-primary-soft" : "border-border bg-background"
              }`}
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                  d.highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <d.icon className="size-4" />
              </div>
              <span className="text-sm font-medium text-foreground">{d.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-sm text-primary">
          <span className="font-semibold">Handling conflict is non-compensatory.</span> If both people
          tend to avoid conflict instead of raising it, we cap the match score outright — no amount of
          shared taste in sleep schedules or cleanliness papers over that risk.
        </div>

        <p className="mt-8 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Handled automatically, not scored
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {HARD_FILTERS.map((f) => (
            <span key={f} className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Differentiators() {
  const items = [
    {
      icon: Sparkles,
      title: "We score fit, not just filter listings",
      body: "Most sites let you filter a wall of ads by rent and locality. We start from your lifestyle and work outward — the compatibility score is the product, not an add-on.",
    },
    {
      icon: ShieldCheck,
      title: "One rule most matching apps skip",
      body: "A weighted average can hide a real problem behind a lot of shared small talk. Our conflict-style gate won't let that happen — it caps the score, in the open, and tells you why.",
    },
    {
      icon: Lock,
      title: "Real chat, not a number handed to strangers",
      body: "Your phone number stays private until you choose to share it. Talk inside the app first, on your own timeline.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-8 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="rounded-3xl border border-border bg-surface p-6 shadow-card">
            <div className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
              <it.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExamplePreview() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">See it before you sign up</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Four real examples of the scoring in action — including a pairing that looks great on paper
          until the conflict-style gate steps in.
        </p>
        <Link
          to="/demo"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Walk through the examples
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function TrustSafety() {
  const items = [
    { icon: UserCheck, title: "Verified sign-up", body: "Every account is confirmed by a one-time code sent to a real inbox before anyone can be discovered." },
    { icon: Lock, title: "Phone number stays private", body: "Kept out of your profile entirely — visible only to you and used solely if you'd like the team to reach out." },
    { icon: Flag, title: "Report & block, built in", body: "One tap to report or block someone — they lose the ability to see or message you immediately, in both directions." },
  ];
  return (
    <section id="trust" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">Your safety is non-negotiable</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="rounded-2xl border border-border bg-surface p-5">
            <it.icon className="size-5 text-primary" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">{it.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ForEveryone() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
          Whether you have a place or need one
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background p-6">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Search className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">Looking for a room</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tell us your budget, area, and how you actually live. We surface people and places that
              genuinely fit — not everything within a five-kilometre radius.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Home className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">Have a room to offer</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Add a few photos of the place. We only surface you to people your lifestyle actually holds
              up against — fewer, better-fitting enquiries instead of a flood of no's.
            </p>
          </div>
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm font-medium text-muted-foreground">
          <IndianRupee className="size-4" /> Zero brokerage, either way.
        </p>
      </div>
    </section>
  );
}

function ScopeHonesty() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Built for Delhi NCR, on purpose</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        We're live in Gurgaon, Delhi, and Noida — not fifteen cities at once. We'd rather get the
        matching right for the people actually using it here than spread thin chasing a bigger map.
        More cities, when we're ready to do them properly.
      </p>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Ready to find your kin?</h2>
        <p className="mt-3 text-sm text-white/85">
          Takes about five minutes. No broker calls, no scrolling through a hundred listings.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-7 h-12 rounded-lg bg-white px-8 text-base font-semibold text-primary hover:bg-white/90"
        >
          <Link to="/signup">Get started</Link>
        </Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <p className="font-semibold text-foreground">
          find<span className="text-primary">your</span>Kin
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#compatibility" className="hover:text-foreground">Compatibility</a>
          <Link to="/demo" className="hover:text-foreground">Example matches</Link>
          <Link to="/safety" className="hover:text-foreground">Safety center</Link>
        </div>
        <p>© {new Date().getFullYear()} findyourKin</p>
      </div>
    </footer>
  );
}
