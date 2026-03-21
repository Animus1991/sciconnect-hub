import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, X, Search, Send, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { conversations } from "@/components/messenger/mockData";
import type { Conversation } from "@/components/messenger/types";
import { statusColor } from "@/components/messenger/types";
import { cn } from "@/lib/utils";

/* ── mini mock messages for popup ── */
const MINI_MESSAGES: Record<string, { from: "me" | "them"; text: string; time: string }[]> = {
  c1: [
    { from: "them", text: "Hey! I finished the reproducibility analysis.", time: "10:24" },
    { from: "me", text: "That's great! Which baseline did you use?", time: "10:25" },
    { from: "them", text: "I'll send you the dataset link shortly", time: "10:28" },
  ],
  c2: [
    { from: "them", text: "Meeting moved to Thursday", time: "09:00" },
    { from: "me", text: "Works for me, I'll update my calendar.", time: "09:03" },
  ],
  c3: [
    { from: "them", text: "Thanks for the review feedback!", time: "Yesterday" },
    { from: "me", text: "Of course — let me know if you need more.", time: "Yesterday" },
  ],
};

function ConvAvatar({ conv }: { conv: Conversation }) {
  const isGroup = conv.type === "group";
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "flex items-center justify-center rounded-full text-xs font-bold text-white",
          isGroup ? "w-9 h-9 bg-primary/70" : "w-9 h-9 bg-primary"
        )}
      >
        {conv.initials}
      </div>
      {!isGroup && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[hsl(var(--background))]",
            conv.online ? statusColor.online : statusColor.offline
          )}
        />
      )}
    </div>
  );
}

const MessagesBubble = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);

  /* ── ALL hooks must be before any early return ── */

  /* Close popup on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Reset to list view on route change */
  useEffect(() => {
    setOpen(false);
    setActiveConv(null);
  }, [location.pathname]);

  /* Hide on /messages and /login — AFTER all hooks */
  if (location.pathname === "/messages" || location.pathname === "/login") return null;

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);
  const filtered = conversations.filter(
    c => !c.archived && c.name.toLowerCase().includes(search.toLowerCase())
  );
  const miniMsgs = activeConv ? (MINI_MESSAGES[activeConv.id] ?? []) : [];

  const handleBubbleClick = () => {
    setOpen(prev => {
      if (prev) setActiveConv(null);
      return !prev;
    });
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    setInputText("");
  };

  return (
    <>
      {/* ── Popup window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="fixed z-[200] shadow-2xl rounded-2xl overflow-hidden border border-border/60 bg-card"
            style={{
              bottom: "calc(1.5rem + 52px + 12px)",
              right: "84px",
              width: activeConv ? 380 : 340,
              maxHeight: 520,
            }}
          >
            {activeConv ? (
              /* ── Active conversation chat view ── */
              <div className="flex flex-col" style={{ height: 480 }}>
                {/* Chat header */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border/50 bg-card shrink-0">
                  <button
                    onClick={() => setActiveConv(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Back to conversations"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <ConvAvatar conv={activeConv} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate leading-tight">{activeConv.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {activeConv.typing
                        ? <span className="text-primary">typing...</span>
                        : activeConv.online ? "Active now" : "Offline"}
                    </p>
                  </div>
                  <button
                    onClick={() => { navigate("/messages"); setOpen(false); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Open in Messenger"
                    aria-label="Open in full Messenger"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-background/40">
                  {miniMsgs.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.from === "me" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[78%] rounded-2xl px-3 py-1.5 text-sm leading-snug",
                          msg.from === "me"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}
                      >
                        {msg.text}
                        <span className={cn("block text-[10px] mt-0.5 text-right opacity-70")}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                  {activeConv.typing && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 block"
                            animate={{ opacity: [0.4, 1, 0.4], y: [0, -3, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border/50 bg-card shrink-0">
                  <input
                    className="flex-1 text-sm bg-muted/60 rounded-full px-3 py-1.5 outline-none placeholder:text-muted-foreground border border-transparent focus:border-primary/40 transition-colors"
                    placeholder="Message..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                    aria-label="Send"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* ── Conversations list ── */
              <div className="flex flex-col" style={{ height: 480 }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
                  <span className="font-semibold text-sm">Messages</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { navigate("/messages"); setOpen(false); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Open full Messenger"
                      aria-label="Open full Messenger"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="px-3 pt-2.5 pb-1.5 shrink-0">
                  <div className="flex items-center gap-2 bg-muted/60 rounded-full px-3 py-1.5">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <input
                      className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                      placeholder="Search conversations..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2 py-8">
                      <MessageSquare className="w-8 h-8 opacity-30" />
                      <span>No conversations found</span>
                    </div>
                  ) : (
                    filtered.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConv(conv)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                      >
                        <ConvAvatar conv={conv} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={cn("text-sm truncate", conv.unread > 0 ? "font-semibold" : "font-medium")}>
                              {conv.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{conv.lastMessageTime}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className={cn("text-xs truncate", conv.unread > 0 ? "text-foreground" : "text-muted-foreground")}>
                              {conv.typing ? <span className="text-primary text-xs">typing...</span> : conv.lastMessage}
                            </span>
                            {conv.unread > 0 && (
                              <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-border/50 px-4 py-2.5 shrink-0">
                  <button
                    onClick={() => { navigate("/messages"); setOpen(false); }}
                    className="text-xs text-primary hover:underline font-medium w-full text-center"
                  >
                    Open full Messenger →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating bubble button ── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.6 }}
        className="fixed bottom-6 right-[84px] z-50"
      >
        <button
          onClick={handleBubbleClick}
          aria-label={open ? "Close Messages" : "Open Messages"}
          className="relative flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all duration-150"
          style={{ width: 52, height: 52 }}
        >
          {/* Icon toggles between MessageSquare and X */}
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="msg"
                initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
              >
                <MessageSquare className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Unread badge — only when popup is closed */}
          <AnimatePresence>
            {!open && totalUnread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-background pointer-events-none"
              >
                {totalUnread > 99 ? "99+" : totalUnread}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Pulse ring — only when popup is closed */}
          {!open && (
            <motion.span
              className="absolute inset-0 rounded-2xl bg-primary"
              animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
              style={{ zIndex: -1 }}
            />
          )}
        </button>
      </motion.div>
    </>
  );
};

export default MessagesBubble;
