import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Hash, AtSign, Paperclip, Smile, Pin, Search, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: { name: string; initials: string; color: string };
  content: string;
  timestamp: string;
  pinned?: boolean;
  reactions?: { emoji: string; count: number }[];
  attachment?: { name: string; type: string };
  mentions?: string[];
}

interface Channel {
  id: string;
  name: string;
  type: "channel" | "dm";
  unread: number;
  lastMessage?: string;
}

interface TeamMember {
  name: string;
  initials: string;
  color: string;
}

const teamMembers: TeamMember[] = [
  { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" },
  { name: "Prof. James Wilson", initials: "JW", color: "hsl(200, 50%, 50%)" },
  { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" },
  { name: "Maria Garcia", initials: "MG", color: "hsl(280, 50%, 55%)" },
  { name: "Dr. Emily Park", initials: "EP", color: "hsl(200, 60%, 50%)" },
  { name: "Prof. Klaus Richter", initials: "KR", color: "hsl(280, 50%, 55%)" },
  { name: "Dr. Yuki Tanaka", initials: "YT", color: "hsl(340, 60%, 55%)" },
];

const mockChannels: Channel[] = [
  { id: "ch1", name: "quantum-ml-paper", type: "channel", unread: 3, lastMessage: "Updated Figure 4 with new results" },
  { id: "ch2", name: "general", type: "channel", unread: 0, lastMessage: "Team meeting moved to Friday" },
  { id: "ch3", name: "data-pipeline", type: "channel", unread: 1, lastMessage: "Pipeline v2.3 deployed" },
  { id: "ch4", name: "Dr. Sarah Chen", type: "dm", unread: 2, lastMessage: "Can you review section 3?" },
  { id: "ch5", name: "Prof. James Wilson", type: "dm", unread: 0, lastMessage: "Looks good to me!" },
];

const mockMessages: Record<string, ChatMessage[]> = {
  ch1: [
    { id: "m1", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "I've updated the variational circuit diagram in Figure 2. The new layout better shows the entanglement structure.", timestamp: "10:32 AM", reactions: [{ emoji: "👍", count: 2 }] },
    { id: "m2", sender: { name: "Prof. James Wilson", initials: "JW", color: "hsl(200, 50%, 50%)" }, content: "Great improvement! Can we also add error bars to the benchmark comparison in Table 3?", timestamp: "10:45 AM" },
    { id: "m3", sender: { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" }, content: "Good call. I'll re-run the experiments with confidence intervals. Should have results by tomorrow.", timestamp: "11:02 AM", pinned: true },
    { id: "m4", sender: { name: "Maria Garcia", initials: "MG", color: "hsl(280, 50%, 55%)" }, content: "I've finished the literature review section. Ready for your review @Dr. Alex Thompson", timestamp: "11:30 AM", attachment: { name: "lit-review-v3.pdf", type: "pdf" }, mentions: ["Dr. Alex Thompson"] },
    { id: "m5", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "Updated Figure 4 with new results from the latest training run. Loss convergence looks much better now! 🎉", timestamp: "2:15 PM", reactions: [{ emoji: "🎉", count: 3 }, { emoji: "🔬", count: 1 }] },
  ],
  ch4: [
    { id: "dm1", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "Hey Alex, can you review section 3 when you get a chance?", timestamp: "9:15 AM" },
    { id: "dm2", sender: { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" }, content: "Sure! I'll look at it this afternoon.", timestamp: "9:22 AM" },
    { id: "dm3", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "Thanks! Also, I think we should discuss the methodology before the group meeting.", timestamp: "9:30 AM" },
  ],
};

// Render message content with highlighted @mentions
const renderContent = (content: string, mentions?: string[]) => {
  if (!mentions || mentions.length === 0) return content;
  const parts: (string | React.ReactElement)[] = [];
  let remaining = content;
  let key = 0;
  for (const mention of mentions) {
    const tag = `@${mention}`;
    const idx = remaining.indexOf(tag);
    if (idx === -1) continue;
    if (idx > 0) parts.push(remaining.slice(0, idx));
    parts.push(
      <span key={key++} className="bg-accent/15 text-accent font-semibold rounded px-0.5">
        {tag}
      </span>
    );
    remaining = remaining.slice(idx + tag.length);
  }
  if (remaining) parts.push(remaining);
  return <>{parts}</>;
};

const TeamChat = () => {
  const [activeChannel, setActiveChannel] = useState("ch1");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [channels, setChannels] = useState(mockChannels);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIdx, setMentionIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentChannel = channels.find(c => c.id === activeChannel);
  const currentMessages = messages[activeChannel] || [];

  // Filter members for autocomplete
  const mentionResults = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return teamMembers.filter(m => m.name.toLowerCase().includes(q)).slice(0, 5);
  }, [mentionQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChannel, currentMessages.length]);

  // Detect @mention typing
  const handleInputChange = useCallback((val: string) => {
    setMessage(val);
    const atIdx = val.lastIndexOf("@");
    if (atIdx !== -1 && (atIdx === 0 || val[atIdx - 1] === " ")) {
      const query = val.slice(atIdx + 1);
      if (!query.includes(" ") || query.length < 20) {
        setMentionQuery(query);
        setMentionIdx(0);
        return;
      }
    }
    setMentionQuery(null);
  }, []);

  const insertMention = useCallback((member: TeamMember) => {
    const atIdx = message.lastIndexOf("@");
    const before = message.slice(0, atIdx);
    const newMsg = `${before}@${member.name} `;
    setMessage(newMsg);
    setMentionQuery(null);
    inputRef.current?.focus();
  }, [message]);

  const extractMentions = (text: string): string[] => {
    return teamMembers
      .filter(m => text.includes(`@${m.name}`))
      .map(m => m.name);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const mentions = extractMentions(message);
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" },
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mentions: mentions.length > 0 ? mentions : undefined,
    };
    setMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), newMsg] }));
    setChannels(prev => prev.map(c => c.id === activeChannel ? { ...c, lastMessage: message, unread: 0 } : c));

    // Push notification for mentions
    if (mentions.length > 0) {
      toast.info(`Mentioned ${mentions.join(", ")}`, {
        description: `in #${currentChannel?.name}`,
        icon: <Bell className="w-4 h-4" />,
      });
    }

    setMessage("");
    setMentionQuery(null);
  };

  const selectChannel = (id: string) => {
    setActiveChannel(id);
    setChannels(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));

    // Simulate DM notification
    const ch = channels.find(c => c.id === id);
    if (ch?.type === "dm" && ch.unread > 0) {
      toast.info("New direct message", {
        description: `${ch.name} sent you ${ch.unread} message${ch.unread > 1 ? "s" : ""}`,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionQuery !== null && mentionResults.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIdx(i => Math.min(i + 1, mentionResults.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIdx(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        insertMention(mentionResults[mentionIdx]);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[500px] bg-card rounded-xl border border-border overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 border-r border-border flex flex-col flex-shrink-0 max-md:hidden">
        <div className="p-3 border-b border-border">
          <h3 className="font-serif text-sm font-bold text-foreground">Team Chat</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium px-2 mb-1">Channels</p>
            {channels.filter(c => c.type === "channel").map(ch => (
              <button
                key={ch.id}
                onClick={() => selectChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${activeChannel === ch.id ? "bg-accent/10 text-accent" : "text-foreground/70 hover:bg-secondary/50"}`}
              >
                <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-display truncate flex-1">{ch.name}</span>
                {ch.unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">{ch.unread}</span>
                )}
              </button>
            ))}

            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium px-2 mb-1 mt-3">Direct Messages</p>
            {channels.filter(c => c.type === "dm").map(ch => (
              <button
                key={ch.id}
                onClick={() => selectChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${activeChannel === ch.id ? "bg-accent/10 text-accent" : "text-foreground/70 hover:bg-secondary/50"}`}
              >
                <AtSign className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-display truncate flex-1">{ch.name}</span>
                {ch.unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">{ch.unread}</span>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            {currentChannel?.type === "channel" ? <Hash className="w-4 h-4 text-muted-foreground" /> : <AtSign className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-display font-semibold text-foreground">{currentChannel?.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Pin className="w-3.5 h-3.5 text-muted-foreground" /></button>
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Search className="w-3.5 h-3.5 text-muted-foreground" /></button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentMessages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-display font-bold text-primary-foreground flex-shrink-0 mt-0.5" style={{ backgroundColor: msg.sender.color }}>
                {msg.sender.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-display font-semibold text-foreground">{msg.sender.name}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                  {msg.pinned && <Pin className="w-3 h-3 text-gold" />}
                </div>
                <p className="text-sm text-foreground/90 font-display leading-relaxed mt-0.5">
                  {renderContent(msg.content, msg.mentions)}
                </p>
                {msg.attachment && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 bg-secondary/50 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-secondary transition-colors">
                    <Paperclip className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] font-display text-foreground">{msg.attachment.name}</span>
                  </div>
                )}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {msg.reactions.map((r, i) => (
                      <button key={i} className="inline-flex items-center gap-1 bg-secondary/50 hover:bg-secondary rounded-full px-2 py-0.5 text-[11px] transition-colors">
                        {r.emoji} <span className="text-muted-foreground">{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input with @mention autocomplete */}
        <div className="p-3 border-t border-border relative">
          {/* Mention autocomplete popup */}
          <AnimatePresence>
            {mentionQuery !== null && mentionResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-full left-3 right-3 mb-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10"
              >
                <div className="p-1">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display px-2 py-1">Mention someone</p>
                  {mentionResults.map((member, i) => (
                    <button
                      key={member.name}
                      onClick={() => insertMention(member)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                        i === mentionIdx ? "bg-accent/10" : "hover:bg-secondary/50"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-display font-bold text-primary-foreground flex-shrink-0"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.initials}
                      </div>
                      <span className="text-xs font-display text-foreground">{member.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-1.5">
            <button className="p-1 hover:bg-secondary rounded transition-colors"><Paperclip className="w-4 h-4 text-muted-foreground" /></button>
            <input
              ref={inputRef}
              value={message}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${currentChannel?.name || ""}... (type @ to mention)`}
              className="flex-1 bg-transparent text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button className="p-1 hover:bg-secondary rounded transition-colors"><Smile className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={sendMessage} disabled={!message.trim()} className="p-1.5 rounded-lg bg-accent text-accent-foreground disabled:opacity-40 hover:opacity-90 transition-opacity">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
