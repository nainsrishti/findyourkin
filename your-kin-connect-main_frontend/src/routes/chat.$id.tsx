import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { ChatBubble } from "@/components/chat-bubble";
import { MessageInput } from "@/components/message-input";
import {
  fetchConversation,
  fetchPartner,
  sendMessage,
  subscribeToThread,
  markThreadRead,
  type ChatMessage,
} from "@/lib/chat";
import { supabase } from "@/lib/supabase";
import { User } from "lucide-react";

export const Route = createFileRoute("/chat/$id")({
  head: () => ({ meta: [{ title: "Chat — findyourKin" }] }),
  loader: async ({ params, context }) => {
    const partner = await context.queryClient.ensureQueryData(
      queryOptions({ queryKey: ["chat-partner", params.id], queryFn: () => fetchPartner(params.id) }),
    );
    await context.queryClient.ensureQueryData(
      queryOptions({ queryKey: ["messages", params.id], queryFn: () => fetchConversation(params.id) }),
    );
    return { partner };
  },
  component: ChatDetail,
});

function ChatDetail() {
  const { id } = Route.useParams();
  const { partner } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const { data: initial } = useSuspenseQuery(
    queryOptions({ queryKey: ["messages", id], queryFn: () => fetchConversation(id) }),
  );
  const [msgs, setMsgs] = useState<ChatMessage[]>(initial);
  const [meId, setMeId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    markThreadRead(id);
    const unsubscribe = subscribeToThread(id, (m) => {
      setMsgs((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    });
    return unsubscribe;
  }, [id, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const send = async (text: string) => {
    if (sending) return;
    const optimistic: ChatMessage = {
      id: -Date.now(),
      sender_id: meId ?? "me",
      receiver_id: id,
      content: text,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMsgs((prev) => [...prev, optimistic]);
    setSending(true);
    try {
      const saved = await sendMessage(id, text);
      setMsgs((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)));
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    } catch {
      setMsgs((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <PhoneShell scrollable={false}>
      <ScreenHeader
        title={partner.display_name ?? "findyourKin user"}
        backTo="/chat"
        right={
          <Link
            to="/compatibility/$id"
            params={{ id: partner.id }}
            aria-label="View compatibility"
            className="relative block size-9 overflow-hidden rounded-full bg-muted"
          >
            {partner.photo_url ? (
              <img src={partner.photo_url} alt={partner.display_name ?? ""} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <User className="size-4" />
              </div>
            )}
          </Link>
        }
      />

      <Link
        to="/compatibility/$id"
        params={{ id: partner.id }}
        className="mx-4 mt-3 flex items-center justify-between rounded-2xl bg-primary-soft px-4 py-3"
      >
        <div>
          <p className="text-xs text-primary/70 font-medium">
            {partner.occupation ?? "See compatibility"}
          </p>
          <p className="text-sm font-semibold text-primary">Why you'd match →</p>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {msgs.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Say hello to {partner.display_name ?? "them"} to start the conversation.
          </p>
        ) : (
          msgs.map((m) => (
            <ChatBubble key={m.id} mine={m.sender_id === meId} text={m.content} ts={m.created_at} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={send} disabled={sending} />
    </PhoneShell>
  );
}
