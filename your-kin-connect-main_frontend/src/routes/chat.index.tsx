import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/phone-shell";
import { fetchThreads } from "@/lib/chat";
import { formatDistanceToNowStrict } from "date-fns";
import { EmptyState } from "@/components/empty-state";
import { InitialsAvatar } from "@/components/initials-avatar";
import { MessageCircle } from "lucide-react";
import { requireOnboarded } from "@/lib/route-guards";

const threadsQuery = queryOptions({ queryKey: ["chat-threads"], queryFn: fetchThreads });

export const Route = createFileRoute("/chat/")({
  head: () => ({ meta: [{ title: "Chats — findyourKin" }] }),
  beforeLoad: () => requireOnboarded(),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(threadsQuery);
  },
  component: ChatListPage,
});

function ChatListPage() {
  const { data: threads } = useSuspenseQuery(threadsQuery);

  return (
    <PhoneShell showNav>
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur px-6 py-4 border-b border-border">
        <h1 className="text-2xl font-bold">Chats</h1>
      </header>

      {threads.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="size-6" />}
          title="No chats yet"
          description="Say hello to someone from Discover to start a conversation."
        />
      ) : (
        <ul className="divide-y divide-border">
          {threads.map((t) => (
            <li key={t.partner.id}>
              <Link
                to="/chat/$id"
                params={{ id: t.partner.id }}
                className="flex items-center gap-3 px-6 py-4 hover:bg-muted/50"
              >
                <div className="relative">
                  {t.partner.photo_url ? (
                    <img
                      src={t.partner.photo_url}
                      alt={t.partner.display_name ?? ""}
                      className="size-14 rounded-full object-cover"
                    />
                  ) : (
                    <InitialsAvatar
                      name={t.partner.display_name ?? "?"}
                      className="size-14 text-base"
                    />
                  )}
                  {t.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground ring-2 ring-surface">
                      {t.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-semibold text-foreground">
                      {t.partner.display_name ?? "findyourKin user"}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(t.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`truncate text-sm ${t.unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {t.lastMessage}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PhoneShell>
  );
}
