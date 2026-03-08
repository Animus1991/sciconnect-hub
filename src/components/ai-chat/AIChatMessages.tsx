import React, { useRef, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, ThumbsUp, ThumbsDown, Link2, Shield } from "lucide-react";
import { useVerifyDocument } from "@/hooks/use-blockchain";
import { shortHash } from "@/lib/blockchain-utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
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

const AIChatMessages: React.FC<Props> = ({
  messages, isTyping, providerIcon, providerId, conversationId, onFeedbackChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);
  const [anchoredMessages, setAnchoredMessages] = useState<Set<string>>(new Set());
  const verifyDoc = useVerifyDocument();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

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
    forceUpdate(n => n + 1);
  }, [conversationId, providerId, onFeedbackChange]);

  const anchorIdea = useCallback(async (msg: ChatMessage) => {
    if (anchoredMessages.has(msg.id)) {
      toast.info("Already anchored to blockchain");
      return;
    }

    const ideaData = {
      documentType: "ai_chat_idea",
      documentId: msg.id,
      title: `AI Idea: ${msg.content.slice(0, 50)}...`,
      content: `Proof-of-Ideation via AI Chat\n\nTimestamp: ${new Date(msg.timestamp).toISOString()}\nProvider: ${providerId || 'unknown'}\nConversation: ${conversationId || 'default'}\n\nContent:\n${msg.content}`,
      author: "AI Assistant"
    };

    try {
      const result = await verifyDoc.mutateAsync(ideaData);
      setAnchoredMessages(prev => new Set([...prev, msg.id]));
      toast.success(`Idea anchored to blockchain! Hash: ${shortHash(result.hashDigest)}`);
    } catch (error) {
      toast.error("Failed to anchor idea to blockchain");
    }
  }, [anchoredMessages, verifyDoc, providerId, conversationId]);

  const renderMessage = useCallback((msg: ChatMessage) => {
    const currentFeedback = getFeedback(msg.id);

    return (
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
              {msg.role === "assistant" ? (
                <div className="text-[12px] leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1.5 prose-code:text-[11px] prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted/50 prose-pre:rounded-lg prose-pre:p-2 prose-pre:text-[11px]">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-[12px] leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              )}
              {msg.piiScrubbed && (
                <div className="mt-1">
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
                  <button onClick={() => copy(msg.content)} className="p-0.5 hover:bg-secondary rounded">
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
    );
  }, [providerIcon, copy, handleFeedback]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5 scrollbar-thin">
      {messages.map(renderMessage)}

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
