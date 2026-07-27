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

    const run = async () => {
      const params = new URLSearchParams(window.location.search);

      // Supabase redirects here with ?error=...&error_description=... when
      // the link is expired, already used, or otherwise invalid.
      const urlError = params.get("error_description") || params.get("error");
      if (urlError) {
        setError(decodeURIComponent(urlError.replace(/\+/g, " ")));
        return;
      }

      // Modern Supabase links use the PKCE flow: a `?code=` param that has
      // to be explicitly exchanged for a session — it isn't picked up
      // automatically the way the older hash-based tokens were.
      const code = params.get("code");
      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );
        if (exchangeError) {
          setError(
            exchangeError.message.includes("both auth code and code verifier")
              ? "This link only works in the same browser you requested it from. Open it in the browser where you signed up."
              : exchangeError.message,
          );
          return;
        }
        if (data.session?.user) {
          proceed(data.session.user.id);
          return;
        }
      }

      // Fallback: older-style hash tokens, auto-parsed by the client on load.
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) proceed(session.user.id);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) proceed(session.user.id);
    });

    run();

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
