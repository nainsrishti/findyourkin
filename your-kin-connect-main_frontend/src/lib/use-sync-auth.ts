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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthed({
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.email?.split("@")[0] ?? "You",
        });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthed({
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.email?.split("@")[0] ?? "You",
        });
      } else {
        logout();
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [setAuthed, logout]);
}
