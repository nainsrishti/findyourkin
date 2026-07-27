import { useState } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = value.trim();
    if (!t) return;
    onSend(t);
    setValue("");
  };
  return (
    <form
      onSubmit={submit}
      className="sticky bottom-0 z-30 flex items-center gap-2 border-t border-border bg-surface/95 backdrop-blur px-3 py-3"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        aria-label="Emoji"
        className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <Smile className="size-5" />
      </button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message"
        aria-label="Message"
        className="flex-1 h-11 rounded-full bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button
        type="submit"
        size="icon"
        aria-label="Send"
        className="size-11 rounded-full"
        disabled={!value.trim()}
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}
