import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/phone-shell";
import { fetchChats, getProfile } from "@/lib/mock-data";
import { formatDistanceToNowStrict } from "date-fns";
import { EmptyState } from "@/components/empty-state";
import { MessageCircle } from "lucide-react";

const chatsQuery = queryOptions({ queryKey: ["chats"], queryFn: fetchChats });

export const Route = createFileRoute("/chat/")({
  head: () => ({ meta: [{ title: "Chats — findyourKin" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(chatsQuery);
  },
  component: ChatListPage,
});

function ChatListPage() {
  const { data: chats } = useSuspenseQuery(chatsQuery);

  return (
    <PhoneShell showNav>
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur px-6 py-4 border-b border-border">
        <h1 className="text-2xl font-bold">Chats</h1>
      </header>

      {chats.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="size-6" />}
          title="No chats yet"
          description="Say hello to someone from your matches to start a conversation."
        />
      ) : (
        <ul className="divide-y divide-border">
          {chats.map((c) => {
            const p = getProfile(c.profileId)!;
            return (
              <li key={c.id}>
                <Link
                  to="/chat/$id"
                  params={{ id: c.id }}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-muted/50"
                >
                  <div className="relative">
                    <img src={p.photo} alt={p.name} className="size-14 rounded-full object-cover" />
                    {c.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground ring-2 ring-surface">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold text-foreground">{p.name}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNowStrict(c.updatedAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`truncate text-sm ${c.unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {c.lastMessage}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PhoneShell>
  );
}
