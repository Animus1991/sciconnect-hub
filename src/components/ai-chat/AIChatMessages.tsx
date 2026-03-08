import React, { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import type { ChatMessage } from "./types";

interface Props {
  messages: ChatMessage[];
  isTyping: boolean;
  providerIcon: string;
}

const AIChatMessages: React.FC<Props> = ({ messages, isTyping, providerIcon }) => {
  const endRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5 scrollbar-thin">
      {messages.map(msg => (
        <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[85%] ${msg.role === "user" ? "" : "flex gap-2"}`}>
            {msg.role === "assistant" && (
              <Avatar className="w-5 h-5 ring-1 ring-accent/20 flex-shrink-0 mt-1">
                <AvatarFallback className="bg-accent/10 text-accent text-[7px] font-bold">
                  {providerIcon}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="group">
              <div className={`rounded-2xl px-3 py-2 ${
                msg.role === "user"
                  ? "bg-accent text-accent-foreground rounded-br-md"
                  : "bg-secondary/40 border border-border/50 rounded-bl-md"
              }`}>
                <div className="text-[12px] leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
              <div className={`flex items-center gap-1.5 mt-0.5 ${msg.role === "user" ? "justify-end" : ""}`}>
                <span className="text-[8px] text-muted-foreground/50 tabular-nums">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {msg.model && (
                  <span className="text-[7px] text-muted-foreground/40 font-mono">{msg.model}</span>
                )}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => copy(msg.content)}
                    className="p-0.5 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-2.5 h-2.5 text-muted-foreground/40" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex gap-2">
          <Avatar className="w-5 h-5 ring-1 ring-accent/20 flex-shrink-0">
            <AvatarFallback className="bg-accent/10 text-accent text-[7px] font-bold">
              {providerIcon}
            </AvatarFallback>
          </Avatar>
          <div className="bg-secondary/40 border border-border/50 rounded-2xl rounded-bl-md px-3 py-2">
            <div className="flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent/40"
                  animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};

export default AIChatMessages;
