import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { reportUser, blockUser, REPORT_REASONS } from "@/lib/safety";
import { supabase } from "@/lib/supabase";
import { MoreVertical, Flag, ShieldOff } from "lucide-react";
import { InitialsAvatar } from "@/components/initials-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: initial } = useSuspenseQuery(
    queryOptions({ queryKey: ["messages", id], queryFn: () => fetchConversation(id) }),
  );
  const [msgs, setMsgs] = useState<ChatMessage[]>(initial);
  const [meId, setMeId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [reportNote, setReportNote] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
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

  const handleBlock = async () => {
    const ok = window.confirm(
      `Block ${partner.display_name ?? "this person"}? They won't be able to see or message you again, and you won't see them in Discover.`,
    );
    if (!ok) return;
    try {
      await blockUser(partner.id);
      toast.success(`Blocked ${partner.display_name ?? "this person"}.`);
      navigate({ to: "/chat" });
    } catch {
      toast.error("Couldn't block — try again.");
    }
  };

  const submitReport = async () => {
    if (!reportReason) return;
    setSubmittingReport(true);
    try {
      await reportUser(partner.id, reportReason, reportNote.trim() || undefined);
      toast.success("Report submitted. Thanks for flagging this.");
      setReportOpen(false);
      setReportReason(null);
      setReportNote("");
    } catch {
      toast.error("Couldn't submit the report — try again.");
    } finally {
      setSubmittingReport(false);
    }
  };

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
          <div className="flex items-center gap-1">
            <Link
              to="/compatibility/$id"
              params={{ id: partner.id }}
              aria-label="View compatibility"
              className="relative block size-9 overflow-hidden rounded-full bg-muted"
            >
              {partner.photo_url ? (
                <img src={partner.photo_url} alt={partner.display_name ?? ""} className="size-full object-cover" />
              ) : (
                <InitialsAvatar
                  name={partner.display_name ?? "?"}
                  className="size-full text-sm"
                />
              )}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="More options"
                  className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <MoreVertical className="size-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setReportOpen(true)}>
                  <Flag className="mr-2 size-4" />
                  Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBlock} className="text-destructive focus:text-destructive">
                  <ShieldOff className="mr-2 size-4" />
                  Block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {partner.display_name ?? "this person"}</DialogTitle>
            <DialogDescription>
              This goes to the findyourKin team for review — it isn't shared with the person you're reporting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReportReason(r)}
                className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                  reportReason === r
                    ? "border-primary bg-primary-soft text-primary font-medium"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {r}
              </button>
            ))}
            <textarea
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder="Anything else we should know? (optional)"
              rows={3}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={submitReport}
              disabled={!reportReason || submittingReport}
              className="w-full sm:w-auto"
            >
              {submittingReport ? "Submitting…" : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
