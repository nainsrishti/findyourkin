import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BottomNav } from "./bottom-nav";

interface PhoneShellProps {
  children: ReactNode;
  className?: string;
  showNav?: boolean;
  scrollable?: boolean;
  /** Pull content up under a header/hero */
  contentClassName?: string;
}

/**
 * Centered 420px phone frame for the whole app.
 * On mobile it fills the viewport; on desktop it becomes a card.
 */
export function PhoneShell({
  children,
  className,
  showNav = false,
  scrollable = true,
  contentClassName,
}: PhoneShellProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-background flex justify-center md:py-6">
      <main
        className={cn(
          "relative w-full max-w-[420px] bg-surface md:rounded-3xl md:shadow-elevated overflow-hidden flex flex-col",
          "min-h-[100dvh] md:min-h-[860px] md:max-h-[calc(100dvh-3rem)]",
          className,
        )}
      >
        <div
          className={cn(
            "flex-1 no-scrollbar",
            scrollable
              ? "overflow-y-auto overflow-x-hidden"
              : // Non-scrollable pages (chat) manage their own inner scroll
                // area, so they need a full-height flex column to size
                // against — without this, flex-1/overflow-y-auto children
                // silently do nothing and content gets clipped.
                "flex min-h-0 flex-col overflow-hidden",
            showNav && "pb-24",
            contentClassName,
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="page"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={scrollable ? "min-h-full" : "flex min-h-0 flex-1 flex-col"}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        {showNav && <BottomNav />}
      </main>
    </div>
  );
}
