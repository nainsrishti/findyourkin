import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { ChatBubble } from "@/components/chat-bubble";
import { MessageInput } from "@/components/message-input";
import { fetchMessages, getProfile, type Message } from "@/lib/mock-data";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/chat/$id")({
  head: () => ({ meta: [{ title: "Chat — findyourKin" }] }),
  loader: ({ params, context }) => {
    const profileId = params.id.replace(/^c_/, "");
    const profile = getProfile(profileId);
    if (!profile) throw notFound();
    context.queryClient.ensureQueryData(
      queryOptions({
        queryKey: ["messages", params.id],
        queryFn: () => fetchMessages(params.id),
      }),
    );
    return { profile };
  },
  component: ChatDetail,
});

const SUGGESTED = [
  "Loved your take on Sundays — same!",
  "How soon are you looking to move?",
  "Want to hop on a quick call?",
];

function ChatDetail() {
  const { id } = Route.useParams();
  const { profile } = Route.useLoaderData();
  const { data: initial } = useSuspenseQuery(
    queryOptions({ queryKey: ["messages", id], queryFn: () => fetchMessages(id) }),
  );
  const [msgs, setMsgs] = useState<Message[]>(initial);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const send = (text: string) => {
    const m: Message = { id: crypto.randomUUID(), chatId: id, from: "me", text, ts: Date.now() };
    setMsgs((prev) => [...prev, m]);
    // Simulate reply
    setTimeout(() => {
      setMsgs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          chatId: id,
          from: "them",
          text: "That sounds good — I'll get back to you tonight!",
          ts: Date.now(),
        },
      ]);
    }, 1200);
  };

  return (
    <PhoneShell scrollable={false}>
      <ScreenHeader
        title={profile.name}
        subtitle="Online"
        backTo="/chat"
        right={
          <Link
            to="/profile/$id"
            params={{ id: profile.id }}
            aria-label="View profile"
            className="relative"
          >
            <img src={profile.photo} alt={profile.name} className="size-9 rounded-full object-cover" />
            {profile.verified.length > 0 && (
              <ShieldCheck className="absolute -bottom-0.5 -right-0.5 size-3.5 text-[--color-success] bg-surface rounded-full" />
            )}
          </Link>
        }
      />

      {/* Compatibility banner */}
      <Link
        to="/compatibility/$id"
        params={{ id: profile.id }}
        className="mx-4 mt-3 flex items-center justify-between rounded-2xl bg-primary-soft px-4 py-3"
      >
        <div>
          <p className="text-xs text-primary/70 font-medium">Compatibility</p>
          <p className="text-sm font-semibold text-primary">{profile.compatibilityScore}% — {profile.insight.title}</p>
        </div>
        <span className="text-xs font-medium text-primary">Report →</span>
      </Link>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {msgs.map((m) => (
          <ChatBubble key={m.id} msg={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      {msgs.length <= 3 && (
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="flex-shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <MessageInput onSend={send} />
    </PhoneShell>
  );
}
