import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Small pill tag used for interests / tags on profiles. */
export function Tag({
  children,
  variant = "default",
  className,
  onClick,
  selected,
}: {
  children: ReactNode;
  variant?: "default" | "primary" | "accent";
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}) {
  const styles = {
    default: "bg-muted text-foreground",
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
  } as const;

  const Cmp = onClick ? "button" : "span";
  return (
    <Cmp
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        selected ? "bg-primary text-primary-foreground" : styles[variant],
        onClick && "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {children}
    </Cmp>
  );
}
