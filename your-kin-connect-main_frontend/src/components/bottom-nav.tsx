import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Heart, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/matches", label: "Matches", icon: Heart },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Main"
      className="absolute bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md shadow-soft"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4 h-16">
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            pathname === to || (to !== "/discover" && pathname.startsWith(to));
          return (
            <li key={to} className="flex">
              <Link
                to={to}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                aria-current={active ? "page" : undefined}
                aria-label={label}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon
                  className={cn(
                    "size-5 transition-colors",
                    active && "text-primary",
                  )}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span className={cn(active && "text-primary")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
