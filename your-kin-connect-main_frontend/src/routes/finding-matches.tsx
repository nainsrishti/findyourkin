import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhoneShell } from "@/components/phone-shell";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/finding-matches")({
  head: () => ({ meta: [{ title: "Finding your matches — findyourKin" }] }),
  component: FindingMatches,
});

const STEPS = [
  "Analyzing your lifestyle answers…",
  "Scanning verified profiles nearby…",
  "Scoring compatibility…",
  "Almost there — surfacing your top matches…",
];

function FindingMatches() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 900);
    const to = setTimeout(() => navigate({ to: "/discover" }), 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(to);
    };
  }, [navigate]);

  return (
    <PhoneShell scrollable={false}>
      <div className="relative flex h-full flex-1 flex-col items-center justify-center bg-gradient-to-b from-primary to-[#1a1082] text-white px-8">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex size-24 items-center justify-center rounded-full bg-white/15 backdrop-blur-md"
        >
          <Sparkles className="size-10" />
        </motion.div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight">Finding your kin</h1>
        <p className="mt-2 text-sm text-white/80">Hang tight — this takes a few seconds.</p>

        <div className="mt-10 w-full max-w-xs space-y-2 text-center">
          {STEPS.map((s, i) => (
            <motion.p
              key={s}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: i <= step ? 1 : 0.3, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-white/90"
            >
              {s}
            </motion.p>
          ))}
        </div>

        <div className="mt-10 h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "linear" }}
          />
        </div>
      </div>
    </PhoneShell>
  );
}
