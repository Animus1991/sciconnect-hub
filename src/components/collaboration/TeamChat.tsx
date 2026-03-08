import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Hash, AtSign, Paperclip, Smile, ChevronDown, Pin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  sender: { name: string; initials: string; color: string };
  content: string;
  timestamp: string;
  pinned?: boolean;
  reactions?: { emoji: string; count: number }[];
  attachment?: { name: string; type: string };
}

interface Channel {
  id: string;
  name: string;
  type: "channel" | "dm";
  unread: number;
  lastMessage?: string;
}

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
    { id: "m4", sender: { name: "Maria Garcia", initials: "MG", color: "hsl(280, 50%, 55%)" }, content: "I've finished the literature review section. Ready for your review.", timestamp: "11:30 AM", attachment: { name: "lit-review-v3.pdf", type: "pdf" } },
    { id: "m5", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "Updated Figure 4 with new results from the latest training run. Loss convergence looks much better now! 🎉", timestamp: "2:15 PM", reactions: [{ emoji: "🎉", count: 3 }, { emoji: "🔬", count: 1 }] },
  ],
  ch4: [
    { id: "dm1", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "Hey Alex, can you review section 3 when you get a chance?", timestamp: "9:15 AM" },
    { id: "dm2", sender: { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" }, content: "Sure! I'll look at it this afternoon.", timestamp: "9:22 AM" },
    { id: "dm3", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "Thanks! Also, I think we should discuss the methodology before the group meeting.", timestamp: "9:30 AM" },
  ],
};

const TeamChat = () => {
  const [activeChannel, setActiveChannel] = useState("ch1");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [channels, setChannels] = useState(mockChannels);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentChannel = channels.find(c => c.id === activeChannel);
  const currentMessages = messages[activeChannel] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChannel, currentMessages.length]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" },
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), newMsg] }));
    setChannels(prev => prev.map(c => c.id === activeChannel ? { ...c, lastMessage: message, unread: 0 } : c));
    setMessage("");
  };

  const selectChannel = (id: string) => {
    setActiveChannel(id);
    setChannels(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  return (
    <div className="flex h-[500px] bg-card rounded-xl border border-border overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 border-r border-border flex flex-col flex-shrink-0">
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
                <p className="text-sm text-foreground/90 font-display leading-relaxed mt-0.5">{msg.content}</p>
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

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-1.5">
            <button className="p-1 hover:bg-secondary rounded transition-colors"><Paperclip className="w-4 h-4 text-muted-foreground" /></button>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder={`Message #${currentChannel?.name || ""}...`}
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
