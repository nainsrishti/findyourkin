import { useState } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_LEN = 1000;

export function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = value.trim().slice(0, MAX_LEN);
    if (!t || disabled) return;
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
        maxLength={MAX_LEN}
        placeholder="Type a message"
        aria-label="Message"
        disabled={disabled}
        className="flex-1 h-11 rounded-full bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      />
      <Button
        type="submit"
        size="icon"
        aria-label="Send"
        className="size-11 rounded-full"
        disabled={!value.trim() || disabled}
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}
