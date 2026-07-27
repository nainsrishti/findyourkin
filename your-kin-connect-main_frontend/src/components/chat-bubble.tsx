import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/mock-data";
import { motion } from "framer-motion";

export function ChatBubble({ msg }: { msg: Message }) {
  const mine = msg.from === "me";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex mb-2", mine ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[78%]", mine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-snug shadow-sm",
            mine
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md",
          )}
        >
          {msg.text}
        </div>
        <div
          className={cn(
            "mt-1 text-[10px] text-muted-foreground px-1",
            mine ? "text-right" : "text-left",
          )}
        >
          {format(msg.ts, "p")}
        </div>
      </div>
    </motion.div>
  );
}
