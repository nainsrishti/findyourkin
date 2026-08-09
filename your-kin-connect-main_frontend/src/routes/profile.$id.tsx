import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy mock-data profile page — nothing links here anymore (cards go to
// /compatibility/$id and chat instead), and its old "Say hello" flow pointed
// at chat ids that don't exist. Kept only as a redirect so old links and
// direct URLs land somewhere sensible instead of crashing.
export const Route = createFileRoute("/profile/$id")({
  beforeLoad: () => {
    throw redirect({ to: "/discover" });
  },
});
