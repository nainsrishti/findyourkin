import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck } from "lucide-react";
import type { Profile } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Tag } from "./tag";

export function ProfileCard({ profile, className }: { profile: Profile; className?: string }) {
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
      <Link to="/profile/$id" params={{ id: profile.id }} className="block focus-visible:outline-none">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={profile.photo}
            alt={`Portrait of ${profile.name}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-3 right-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 shadow">
            {profile.compatibilityScore}% match
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-bold leading-tight">
                {profile.name}, {profile.age}
              </h3>
              {profile.verified.length > 0 && (
                <ShieldCheck className="size-4 text-white/90" aria-label="Verified" />
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/85">
              <MapPin className="size-3.5" /> {profile.neighborhood}
            </p>
          </div>
        </div>
        <div className="px-3 py-3 flex flex-wrap gap-1.5">
          {profile.tags.slice(0, 3).map((t) => (
            <Tag key={t} className="px-2.5 py-1 text-xs">
              {t}
            </Tag>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
