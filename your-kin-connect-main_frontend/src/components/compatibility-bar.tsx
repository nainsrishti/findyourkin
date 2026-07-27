import { cn } from "@/lib/utils";

export function CompatibilityBar({
  label,
  value,
  hint,
  tone = "primary",
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "primary" | "accent";
}) {
  const tier = value >= 85 ? "High Match" : value >= 65 ? "Good Match" : "Moderate";
  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <span className="font-medium text-foreground">{label}</span>
        <span className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {tier}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            tone === "accent" ? "bg-accent" : "bg-primary",
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
