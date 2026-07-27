import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  backTo?: string;
  className?: string;
  transparent?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  backTo,
  className,
  transparent,
}: ScreenHeaderProps) {
  const router = useRouter();

  const back = () => {
    if (backTo) router.navigate({ to: backTo });
    else router.history.back();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3",
        transparent
          ? "bg-transparent"
          : "bg-surface/95 backdrop-blur border-b border-border",
        className,
      )}
    >
      <button
        onClick={back}
        aria-label="Go back"
        className="inline-flex size-10 items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-5" />
      </button>
      <div className="min-w-0 flex-1 text-center">
        {title && (
          <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
        )}
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="min-w-10 flex items-center justify-end">{right}</div>
    </header>
  );
}

export function SectionHeader({
  title,
  action,
  actionTo,
}: {
  title: string;
  action?: string;
  actionTo?: string;
}) {
  return (
    <div className="flex items-baseline justify-between px-6 pt-6 pb-3">
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      {action &&
        (actionTo ? (
          <Link to={actionTo} className="text-sm font-medium text-primary">
            {action}
          </Link>
        ) : (
          <span className="text-sm font-medium text-primary">{action}</span>
        ))}
    </div>
  );
}
