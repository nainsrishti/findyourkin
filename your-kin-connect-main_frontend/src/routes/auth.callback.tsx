import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PhoneShell } from "@/components/phone-shell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing you in — findyourKin" }] }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let settled = false;

    const proceed = async (userId: string) => {
      if (settled) return;
      settled = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      if (!cancelled) navigate({ to: profile ? "/discover" : "/onboarding/profile" });
    };

    // supabase-js parses the magic-link tokens out of the URL automatically
    // and fires this once that's done.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) proceed(session.user.id);
    });

    // Covers the case where the session was already parsed before we
    // attached the listener above.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) proceed(session.user.id);
    });

    const timeout = setTimeout(() => {
      if (!settled) {
        setError("That link didn't work — it may have expired. Try signing in again.");
      }
    }, 8000);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <PhoneShell scrollable={false}>
      <div className="flex h-full flex-1 flex-col items-center justify-center px-8 text-center">
        {error ? (
          <>
            <p className="text-sm text-muted-foreground">{error}</p>
            <a href="/login" className="mt-4 text-sm font-semibold text-primary">
              Back to login
            </a>
          </>
        ) : (
          <>
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Signing you in…</p>
          </>
        )}
      </div>
    </PhoneShell>
  );
}
