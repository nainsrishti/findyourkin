import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PhoneShell } from "@/components/phone-shell";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "findyourKin — Flatmates you'll actually get along with" },
      {
        name: "description",
        content:
          "Compatibility-first flatmate matching. Take the quiz, meet your kin.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <PhoneShell scrollable={false}>
      <div className="relative flex h-full min-h-[100dvh] md:min-h-[860px] flex-col overflow-hidden">
        {/* Decorative background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=70')",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/70 to-primary"
          aria-hidden
        />

        <div className="relative flex flex-1 flex-col px-8 py-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="size-3.5" />
              Compatibility-first flatmates
            </div>
          </motion.div>

          <div className="mt-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold leading-[1.05] tracking-tight"
            >
              Find your <span className="italic text-accent">kin.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-4 max-w-xs text-base text-white/85"
            >
              A calmer way to find flatmates you'll actually get along with — matched on lifestyle, not just rent.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="mt-10 flex flex-col gap-3"
            >
              <Button asChild size="lg" className="h-14 rounded-lg bg-white text-primary hover:bg-white/90 text-base font-semibold">
                <Link to="/signup">Get started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 rounded-lg bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white text-base font-medium"
              >
                <Link to="/login">I already have an account</Link>
              </Button>
              <p className="mt-2 text-center text-xs text-white/70">
                By continuing you agree to our Terms and Privacy Policy.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
