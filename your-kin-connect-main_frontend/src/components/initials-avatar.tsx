import { cn } from "@/lib/utils";

// A small rotating palette pulled from the design system (primary / accent /
// success plus a couple of complementary tones) so avatars feel varied
// without needing any external photo source.
const PALETTE = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-[oklch(0.55_0.14_200)] text-white",
  "bg-[oklch(0.6_0.14_140)] text-white",
  "bg-[oklch(0.55_0.18_310)] text-white",
  "bg-[oklch(0.62_0.17_60)] text-white",
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function InitialsAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const palette = PALETTE[hashName(name) % PALETTE.length];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        palette,
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
