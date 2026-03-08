import React, { useRef, useCallback, useMemo } from "react";
import { VariableSizeList as VirtualList } from "react-window";
import { motion } from "framer-motion";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import type { ChatMessage, AIProviderType } from "./types";
import { addFeedback, removeFeedback, getFeedback } from "@/lib/ai-feedback";

interface Props {
  messages: ChatMessage[];
  isTyping: boolean;
  providerIcon: string;
  providerId?: AIProviderType;
  conversationId?: string;
  onFeedbackChange?: (messageId: string, feedback: "up" | "down" | null) => void;
}

// Estimate row height based on content length
function estimateHeight(msg: ChatMessage): number {
  const lineLength = 45; // chars per line approx
  const lines = Math.ceil(msg.content.length / lineLength) + 1;
  const base = msg.role === "assistant" ? 60 : 48;
  return Math.max(base, base + (lines - 1) * 16);
}

const AIChatMessages: React.FC<Props> = ({
  messages, isTyping, providerIcon, providerId, conversationId, onFeedbackChange
}) => {
  const listRef = useRef<VirtualList>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  // Include typing indicator as virtual item
  const itemCount = messages.length + (isTyping ? 1 : 0);

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(itemCount - 1, "end");
    }
  }, [itemCount]);

  const getItemSize = useCallback((index: number) => {
    if (index >= messages.length) return 48; // typing indicator
    return estimateHeight(messages[index]);
  }, [messages]);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }, []);

  const handleFeedback = useCallback((msg: ChatMessage, type: "up" | "down") => {
    const current = getFeedback(msg.id);
    if (current === type) {
      removeFeedback(msg.id);
      onFeedbackChange?.(msg.id, null);
    } else {
      addFeedback({
        messageId: msg.id,
        conversationId: conversationId ?? "default",
        provider: providerId ?? "gemini",
        feedback: type,
        timestamp: Date.now(),
        messagePreview: msg.content.slice(0, 80),
      });
      onFeedbackChange?.(msg.id, type);
    }
  }, [conversationId, providerId, onFeedbackChange]);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    // Typing indicator
    if (index >= messages.length) {
      return (
        <div style={style} className="px-3 py-1">
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
        </div>
      );
    }

    const msg = messages[index];
    const currentFeedback = getFeedback(msg.id);

    return (
      <div style={style} className="px-3 py-1">
        <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
                {msg.piiScrubbed && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[8px] text-muted-foreground/60 bg-muted/30 px-1.5 py-0.5 rounded">🔒 PII scrubbed</span>
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-1.5 mt-0.5 ${msg.role === "user" ? "justify-end" : ""}`}>
                <span className="text-[8px] text-muted-foreground/50 tabular-nums">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {msg.model && (
                  <span className="text-[7px] text-muted-foreground/40 font-mono">{msg.model}</span>
                )}
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copy(msg.content)}
                      className="p-0.5 hover:bg-secondary rounded"
                    >
                      <Copy className="w-2.5 h-2.5 text-muted-foreground/40" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg, "up")}
                      className={`p-0.5 rounded transition-colors ${
                        currentFeedback === "up" ? "bg-accent/15 text-accent" : "hover:bg-secondary text-muted-foreground/40"
                      }`}
                    >
                      <ThumbsUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg, "down")}
                      className={`p-0.5 rounded transition-colors ${
                        currentFeedback === "down" ? "bg-destructive/15 text-destructive" : "hover:bg-secondary text-muted-foreground/40"
                      }`}
                    >
                      <ThumbsDown className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [messages, providerIcon, copy, handleFeedback]);

  return (
    <div className="flex-1 overflow-hidden" ref={outerRef}>
      <VirtualList
        ref={listRef}
        height={outerRef.current?.clientHeight ?? 400}
        width="100%"
        itemCount={itemCount}
        itemSize={getItemSize}
        overscanCount={5}
        className="scrollbar-thin"
        style={{ overflow: "auto" }}
      >
        {Row}
      </VirtualList>
    </div>
  );
};

export default AIChatMessages;
