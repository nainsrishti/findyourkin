import { redirect } from "@tanstack/react-router";
import { supabase } from "./supabase";

/**
 * Throws a redirect to /login if there's no active Supabase session.
 * Use on routes that just require being signed in (e.g. onboarding steps —
 * the profile doesn't exist yet, that's what onboarding is for).
 */
export async function requireSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw redirect({ to: "/login" });
  }
  return session;
}

/**
 * Guards routes that need a fully onboarded user — i.e. a row in `profiles`.
 * Signed-out users get bounced to /login; signed-in users who never
 * finished onboarding (or landed here via a direct URL) get sent back into
 * the onboarding flow instead of being able to skip straight to the app.
 */
export async function requireOnboarded() {
  const session = await requireSession();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", session.user.id)
    .maybeSingle();
  if (!profile) {
    throw redirect({ to: "/onboarding/situation" });
  }
  return session;
}
