import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { MatchResult } from "@/lib/matches";
import { InitialsAvatar } from "@/components/initials-avatar";
import { cn } from "@/lib/utils";

export function MatchCard({ match, className }: { match: MatchResult; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-surface shadow-card border border-border",
        className,
      )}
    >
      <Link
        to="/compatibility/$id"
        params={{ id: match.user_id }}
        className="block focus-visible:outline-none"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {match.photo_url ? (
            <img
              src={match.photo_url}
              alt={`Portrait of ${match.display_name ?? "a potential flatmate"}`}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <InitialsAvatar
                name={match.display_name ?? "?"}
                className="size-20 text-2xl"
              />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-3 right-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 shadow">
            {match.score}% match
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-lg font-bold leading-tight">
              {match.display_name ?? "findyourKin user"}
              {match.age ? `, ${match.age}` : ""}
            </h3>
            {match.occupation && <p className="mt-0.5 text-xs text-white/85">{match.occupation}</p>}
          </div>
        </div>
      </Link>
      <Link
        to="/chat/$id"
        params={{ id: match.user_id }}
        aria-label={`Chat with ${match.display_name ?? "this person"}`}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 left-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-surface/90 text-primary shadow backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MessageCircle className="size-4" />
      </Link>
    </motion.div>
  );
}
