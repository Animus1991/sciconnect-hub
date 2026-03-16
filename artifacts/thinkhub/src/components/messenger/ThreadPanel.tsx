import { motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import type { Message } from "./types";
import { getContactName, getContactById } from "./mockData";
import RichMessageContent from "./RichMessageContent";

interface ThreadPanelProps {
  rootMessage: Message;
  replies: Message[];
  onClose: () => void;
  onSendReply: (text: string) => void;
}

const ThreadPanel = ({ rootMessage, replies, onClose, onSendReply }: ThreadPanelProps) => {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendReply(input.trim());
    setInput("");
  };

  const senderName = getContactName(rootMessage.senderId);
  const senderContact = getContactById(rootMessage.senderId);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="border-l border-border bg-card flex flex-col overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-border flex-shrink-0">
        <h3 className="font-display font-semibold text-[15px] text-foreground">Thread</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Root message */}
          <div className="mb-4 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-7 h-7 ring-1 ring-border">
                <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-display font-semibold">
                  {senderContact?.initials ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[11px] font-display font-semibold text-foreground">{senderName}</p>
                <p className="text-[9px] text-muted-foreground tabular-nums">{rootMessage.time}</p>
              </div>
            </div>
            <div className="text-[13px] font-display text-foreground leading-relaxed">
              <RichMessageContent text={rootMessage.text} isMine={rootMessage.senderId === "me"} />
            </div>
          </div>

          {/* Replies */}
          <p className="text-[10px] font-display text-muted-foreground uppercase tracking-wider mb-2">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </p>
          <div className="space-y-3">
            {replies.map(r => {
              const rName = getContactName(r.senderId);
              const rContact = getContactById(r.senderId);
              return (
                <div key={r.id} className="flex gap-2">
                  <Avatar className="w-6 h-6 ring-1 ring-border flex-shrink-0 mt-0.5">
                    <AvatarFallback className="bg-primary/10 text-primary text-[7px] font-display font-semibold">
                      {rContact?.initials ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-display font-semibold text-foreground">{rName}</span>
                      <span className="text-[9px] text-muted-foreground tabular-nums">{r.time}</span>
                    </div>
                    <div className="text-[12px] font-display text-foreground/80 leading-relaxed">
                      <RichMessageContent text={r.text} isMine={r.senderId === "me"} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Reply in thread…"
            className="flex-1 px-3 py-2 rounded-lg bg-secondary/30 border border-border text-[13px] font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <Button size="icon" className="h-8 w-8 rounded-lg" onClick={handleSend} disabled={!input.trim()}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreadPanel;
