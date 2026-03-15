import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Hash, AtSign, Paperclip, Smile, Pin, Search, Bell, MessageCircle, X, ArrowLeft } from "lucide-react";
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
  threadCount?: number;
  threadId?: string;
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

const EMOJI_GROUPS = [
  { label: "Frequent", emojis: ["👍", "❤️", "🎉", "🔬", "📝", "✅", "🚀", "💡"] },
  { label: "Reactions", emojis: ["😀", "😂", "🤔", "👀", "🙌", "💪", "🎯", "⭐"] },
  { label: "Science", emojis: ["🧬", "🔬", "🧪", "📊", "📈", "🤖", "🧠", "⚛️"] },
];

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
    { id: "m1", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "I've updated the variational circuit diagram in Figure 2. The new layout better shows the entanglement structure.", timestamp: "10:32 AM", reactions: [{ emoji: "👍", count: 2 }], threadCount: 2 },
    { id: "m2", sender: { name: "Prof. James Wilson", initials: "JW", color: "hsl(200, 50%, 50%)" }, content: "Great improvement! Can we also add error bars to the benchmark comparison in Table 3?", timestamp: "10:45 AM" },
    { id: "m3", sender: { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" }, content: "Good call. I'll re-run the experiments with confidence intervals. Should have results by tomorrow.", timestamp: "11:02 AM", pinned: true },
    { id: "m4", sender: { name: "Maria Garcia", initials: "MG", color: "hsl(280, 50%, 55%)" }, content: "I've finished the literature review section. Ready for your review @Dr. Alex Thompson", timestamp: "11:30 AM", attachment: { name: "lit-review-v3.pdf", type: "pdf" }, mentions: ["Dr. Alex Thompson"], threadCount: 1 },
    { id: "m5", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "Updated Figure 4 with new results from the latest training run. Loss convergence looks much better now! 🎉", timestamp: "2:15 PM", reactions: [{ emoji: "🎉", count: 3 }, { emoji: "🔬", count: 1 }] },
  ],
  ch4: [
    { id: "dm1", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "Hey Alex, can you review section 3 when you get a chance?", timestamp: "9:15 AM" },
    { id: "dm2", sender: { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" }, content: "Sure! I'll look at it this afternoon.", timestamp: "9:22 AM" },
    { id: "dm3", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "Thanks! Also, I think we should discuss the methodology before the group meeting.", timestamp: "9:30 AM" },
  ],
};

// Thread replies mock
const mockThreads: Record<string, ChatMessage[]> = {
  m1: [
    { id: "t1_1", sender: { name: "Prof. James Wilson", initials: "JW", color: "hsl(200, 50%, 50%)" }, content: "The entanglement gates look much clearer now. Could you also add labels for the qubit states?", timestamp: "10:40 AM" },
    { id: "t1_2", sender: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, content: "Good idea! I'll add state labels and a legend in the next revision.", timestamp: "10:52 AM" },
  ],
  m4: [
    { id: "t4_1", sender: { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" }, content: "Looks great! I'll add comments on the methodology section by tomorrow.", timestamp: "11:45 AM" },
  ],
};

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
      <span key={key++} className="bg-accent/15 text-accent font-semibold rounded px-0.5">{tag}</span>
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [threads, setThreads] = useState(mockThreads);
  const [threadReply, setThreadReply] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentChannel = channels.find(c => c.id === activeChannel);
  const currentMessages = messages[activeChannel] || [];

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: (ChatMessage & { channel: string })[] = [];
    for (const [chId, msgs] of Object.entries(messages)) {
      for (const msg of msgs) {
        if (msg.content.toLowerCase().includes(q) || msg.sender.name.toLowerCase().includes(q)) {
          results.push({ ...msg, channel: chId });
        }
      }
    }
    return results.slice(0, 10);
  }, [searchQuery, messages]);

  const mentionResults = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return teamMembers.filter(m => m.name.toLowerCase().includes(q)).slice(0, 5);
  }, [mentionQuery]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeChannel, currentMessages.length]);

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
    setMessage(`${before}@${member.name} `);
    setMentionQuery(null);
    inputRef.current?.focus();
  }, [message]);

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const extractMentions = (text: string): string[] =>
    teamMembers.filter(m => text.includes(`@${m.name}`)).map(m => m.name);

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
    if (mentions.length > 0) {
      toast.info(`Mentioned ${mentions.join(", ")}`, { description: `in #${currentChannel?.name}` });
    }
    setMessage("");
    setMentionQuery(null);
  };

  const sendThreadReply = () => {
    if (!threadReply.trim() || !activeThread) return;
    const reply: ChatMessage = {
      id: `tr_${Date.now()}`,
      sender: { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" },
      content: threadReply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setThreads(prev => ({ ...prev, [activeThread]: [...(prev[activeThread] || []), reply] }));
    // Update thread count on parent
    setMessages(prev => ({
      ...prev,
      [activeChannel]: prev[activeChannel]?.map(m =>
        m.id === activeThread ? { ...m, threadCount: (m.threadCount || 0) + 1 } : m
      ) || [],
    }));
    setThreadReply("");
  };

  const selectChannel = (id: string) => {
    setActiveChannel(id);
    setActiveThread(null);
    setChannels(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    const ch = channels.find(c => c.id === id);
    if (ch?.type === "dm" && ch.unread > 0) {
      toast.info("New direct message", { description: `${ch.name} sent you ${ch.unread} message${ch.unread > 1 ? "s" : ""}` });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionQuery !== null && mentionResults.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIdx(i => Math.min(i + 1, mentionResults.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setMentionIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === "Tab" || e.key === "Enter") { e.preventDefault(); insertMention(mentionResults[mentionIdx]); return; }
      if (e.key === "Escape") { setMentionQuery(null); return; }
    }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const threadMessages = activeThread ? (threads[activeThread] || []) : [];
  const threadParent = activeThread ? currentMessages.find(m => m.id === activeThread) : null;

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
              <button key={ch.id} onClick={() => selectChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${activeChannel === ch.id ? "bg-accent/10 text-accent" : "text-foreground/70 hover:bg-secondary/50"}`}>
                <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-display truncate flex-1">{ch.name}</span>
                {ch.unread > 0 && <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">{ch.unread}</span>}
              </button>
            ))}
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium px-2 mb-1 mt-3">Direct Messages</p>
            {channels.filter(c => c.type === "dm").map(ch => (
              <button key={ch.id} onClick={() => selectChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${activeChannel === ch.id ? "bg-accent/10 text-accent" : "text-foreground/70 hover:bg-secondary/50"}`}>
                <AtSign className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-display truncate flex-1">{ch.name}</span>
                {ch.unread > 0 && <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">{ch.unread}</span>}
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
            <button onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }} className={`p-1.5 rounded-lg transition-colors ${searchOpen ? "bg-accent/10 text-accent" : "hover:bg-secondary"}`}>
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-b border-border">
              <div className="px-4 py-2 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="flex-1 text-xs font-display bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)} className="p-1 hover:bg-secondary rounded"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>
              {searchResults.length > 0 && (
                <div className="px-4 pb-2 space-y-1 max-h-40 overflow-y-auto">
                  {searchResults.map(r => (
                    <div key={r.id} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="flex items-start gap-2 bg-secondary/30 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-secondary/50 transition-colors">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-primary-foreground flex-shrink-0" style={{ backgroundColor: r.sender.color }}>{r.sender.initials}</div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-display text-muted-foreground">{r.sender.name} · {r.timestamp}</p>
                        <p className="text-xs font-display text-foreground truncate">{r.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentMessages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-display font-bold text-primary-foreground flex-shrink-0 mt-0.5" style={{ backgroundColor: msg.sender.color }}>{msg.sender.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-display font-semibold text-foreground">{msg.sender.name}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                  {msg.pinned && <Pin className="w-3 h-3 text-gold" />}
                </div>
                <p className="text-sm text-foreground/90 font-display leading-relaxed mt-0.5">{renderContent(msg.content, msg.mentions)}</p>
                {msg.attachment && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 bg-secondary/50 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-secondary transition-colors">
                    <Paperclip className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] font-display text-foreground">{msg.attachment.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  {msg.reactions && msg.reactions.map((r, i) => (
                    <button key={i} className="inline-flex items-center gap-1 bg-secondary/50 hover:bg-secondary rounded-full px-2 py-0.5 text-[11px] transition-colors">
                      {r.emoji} <span className="text-muted-foreground">{r.count}</span>
                    </button>
                  ))}
                  {/* Thread button */}
                  <button
                    onClick={() => setActiveThread(activeThread === msg.id ? null : msg.id)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors opacity-0 group-hover:opacity-100 ${
                      activeThread === msg.id ? "bg-accent/10 text-accent" : "bg-secondary/50 hover:bg-secondary text-muted-foreground"
                    }`}
                  >
                    <MessageCircle className="w-3 h-3" />
                    {msg.threadCount ? `${msg.threadCount} replies` : "Reply"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Thread panel */}
        <AnimatePresence>
          {activeThread && threadParent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 200, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-1.5 bg-secondary/20 border-b border-border">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-display font-semibold text-foreground">Thread</span>
                  <span className="text-[10px] text-muted-foreground">replying to {threadParent.sender.name}</span>
                </div>
                <button onClick={() => setActiveThread(null)} className="p-1 rounded hover:bg-secondary"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>
              <ScrollArea className="flex-1 px-4 py-2">
                <div className="space-y-2">
                  {threadMessages.map(reply => (
                    <div key={reply.id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-display font-bold text-primary-foreground flex-shrink-0" style={{ backgroundColor: reply.sender.color }}>{reply.sender.initials}</div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10px] font-display font-semibold text-foreground">{reply.sender.name}</span>
                          <span className="text-[9px] text-muted-foreground">{reply.timestamp}</span>
                        </div>
                        <p className="text-xs text-foreground/90 font-display">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="px-3 py-2 border-t border-border flex items-center gap-2">
                <input
                  value={threadReply}
                  onChange={e => setThreadReply(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendThreadReply(); } }}
                  placeholder="Reply in thread..."
                  className="flex-1 text-xs font-display bg-secondary/30 rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button onClick={sendThreadReply} disabled={!threadReply.trim()} className="p-1.5 rounded-lg bg-accent text-accent-foreground disabled:opacity-40">
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input with @mention + emoji */}
        <div className="p-3 border-t border-border relative">
          {/* Mention autocomplete */}
          <AnimatePresence>
            {mentionQuery !== null && mentionResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-full left-3 right-3 mb-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10">
                <div className="p-1">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display px-2 py-1">Mention someone</p>
                  {mentionResults.map((member, i) => (
                    <button key={member.name} onClick={() => insertMention(member)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${i === mentionIdx ? "bg-accent/10" : "hover:bg-secondary/50"}`}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-display font-bold text-primary-foreground flex-shrink-0" style={{ backgroundColor: member.color }}>{member.initials}</div>
                      <span className="text-xs font-display text-foreground">{member.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emoji picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-full right-3 mb-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10 w-64">
                <div className="p-2">
                  {EMOJI_GROUPS.map(group => (
                    <div key={group.label} className="mb-2">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display mb-1">{group.label}</p>
                      <div className="flex flex-wrap gap-1">
                        {group.emojis.map(emoji => (
                          <button key={emoji} onClick={() => insertEmoji(emoji)}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors text-base">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-1.5">
            <button className="p-1 hover:bg-secondary rounded transition-colors"><Paperclip className="w-4 h-4 text-muted-foreground" /></button>
            <input ref={inputRef} value={message} onChange={e => handleInputChange(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={`Message #${currentChannel?.name || ""}... (type @ to mention)`}
              className="flex-1 bg-transparent text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none" />
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-1 rounded transition-colors ${showEmojiPicker ? "bg-accent/10 text-accent" : "hover:bg-secondary"}`}>
              <Smile className="w-4 h-4" />
            </button>
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
