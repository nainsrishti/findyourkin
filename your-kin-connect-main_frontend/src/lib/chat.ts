import { supabase } from "./supabase";

export interface ChatMessage {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface ChatPartner {
  id: string;
  display_name: string | null;
  age: number | null;
  occupation: string | null;
  photo_url: string | null;
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export async function fetchPartner(otherId: string): Promise<ChatPartner> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, age, occupation, photo_url")
    .eq("id", otherId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchConversation(otherId: string): Promise<ChatMessage[]> {
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${me},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${me})`,
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(receiverId: string, content: string): Promise<ChatMessage> {
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: me, receiver_id: receiverId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Live-updates a chat thread: calls onInsert for any new message between me
// and otherId, in either direction. Returns an unsubscribe function.
export function subscribeToThread(otherId: string, onInsert: (m: ChatMessage) => void) {
  let unsubscribed = false;
  let cleanup = () => {};

  currentUserId().then((me) => {
    if (unsubscribed) return;
    // Only listen for messages FROM the other person. My own sends are
    // already added to state directly by sendMessage()'s return value —
    // also listening for my own inserts here would add them a second time.
    const channel = supabase
      .channel(`messages:${[me, otherId].sort().join(":")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${otherId}` },
        (payload) => onInsert(payload.new as ChatMessage),
      )
      .subscribe();
    cleanup = () => supabase.removeChannel(channel);
  });

  return () => {
    unsubscribed = true;
    cleanup();
  };
}

export interface ChatThread {
  partner: ChatPartner;
  lastMessage: string;
  updatedAt: string;
  unread: number;
}

// Builds the chat list: one row per person I've exchanged messages with,
// most recent first.
export async function fetchThreads(): Promise<ChatThread[]> {
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${me},receiver_id.eq.${me}`)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const byPartner = new Map<string, ChatMessage[]>();
  for (const m of data ?? []) {
    const otherId = m.sender_id === me ? m.receiver_id : m.sender_id;
    const list = byPartner.get(otherId) ?? [];
    list.push(m);
    byPartner.set(otherId, list);
  }

  const partnerIds = [...byPartner.keys()];
  if (partnerIds.length === 0) return [];

  const { data: partners, error: pErr } = await supabase
    .from("profiles")
    .select("id, display_name, age, occupation, photo_url")
    .in("id", partnerIds);
  if (pErr) throw pErr;

  return partnerIds
    .map((id) => {
      const partner = partners?.find((p) => p.id === id);
      const msgs = byPartner.get(id)!;
      const latest = msgs[0];
      const unread = msgs.filter((m) => m.receiver_id === me && !m.read_at).length;
      return partner
        ? { partner, lastMessage: latest.content, updatedAt: latest.created_at, unread }
        : null;
    })
    .filter((t): t is ChatThread => t !== null);
}

export async function markThreadRead(otherId: string): Promise<void> {
  const me = await currentUserId();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", otherId)
    .eq("receiver_id", me)
    .is("read_at", null);
}
