import { useEffect } from "react";
import { supabase } from "./supabase";
import { useAppStore } from "./store";

/**
 * Keeps the zustand store's `isAuthed`/`user` in sync with the real
 * Supabase session, instead of the old fake setAuthed() calls. Mount once,
 * near the root of the app.
 */
export function useSyncAuth() {
  const setAuthed = useAppStore((s) => s.setAuthed);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    const applySession = async (session: { user: { id: string; email?: string | null } } | null) => {
      if (!session?.user) {
        logout();
        return;
      }
      // Fallback only — real name comes from profiles.display_name below,
      // which onboarding sets. This is just what shows before that loads,
      // or for a signed-in user who somehow hasn't finished onboarding.
      const fallbackName = session.user.email?.split("@")[0] ?? "You";
      setAuthed({ id: session.user.id, email: session.user.email ?? "", name: fallbackName });

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .maybeSingle();
      if (profile?.display_name) {
        setAuthed({ id: session.user.id, email: session.user.email ?? "", name: profile.display_name });
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => applySession(session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => sub.subscription.unsubscribe();
  }, [setAuthed, logout]);
}
