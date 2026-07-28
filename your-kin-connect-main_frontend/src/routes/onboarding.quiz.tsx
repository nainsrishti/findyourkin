import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { quizQuestions } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/onboarding/quiz")({
  head: () => ({ meta: [{ title: "Lifestyle quiz — findyourKin" }] }),
  component: QuizStep,
});

function QuizStep() {
  const navigate = useNavigate();
  const { onboarding, updateOnboarding } = useAppStore();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(onboarding.quiz);

  const q = quizQuestions[idx];
  const done = idx >= quizQuestions.length - 1;

  const answer = (value: string) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    setTimeout(() => {
      if (done) {
        updateOnboarding({ quiz: next });
        navigate({ to: "/onboarding/preferences" });
      } else {
        setIdx((i) => i + 1);
      }
    }, 220);
  };

  return (
    <PhoneShell>
      <ScreenHeader
        title="Step 4 of 6"
        backTo={idx === 0 ? "/onboarding/housing" : undefined}
        right={
          <button
            onClick={() =>
              idx > 0 ? setIdx((i) => i - 1) : navigate({ to: "/onboarding/housing" })
            }
            className="text-sm font-medium text-muted-foreground"
          >
            {idx > 0 ? "Prev" : ""}
          </button>
        }
      />
      <div className="px-6 pt-2">
        <StepProgress step={4} total={6} />

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {idx + 1} of {quizQuestions.length}</span>
          <span>{Object.keys(answers).length} answered</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold leading-tight">{q.question}</h2>
            <div className="mt-6 space-y-3">
              {q.options.map((opt) => {
                const active = answers[q.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => answer(opt.value)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>{opt.emoji}</span>
                      <span className="font-medium text-foreground">{opt.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 mt-8 border-t border-border bg-surface/95 backdrop-blur px-6 py-4">
        <Button
          onClick={() => {
            updateOnboarding({ quiz: answers });
            navigate({ to: "/onboarding/preferences" });
          }}
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-lg"
        >
          Skip for now
        </Button>
      </div>
    </PhoneShell>
  );
}
