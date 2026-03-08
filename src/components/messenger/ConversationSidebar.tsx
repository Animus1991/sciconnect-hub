import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Edit3, Pin, Users, VolumeX, MessageCircle, UserPlus,
  Archive, Filter
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import type { Conversation, Contact } from "./types";
import { statusColor } from "./types";
import { contacts } from "./mockData";

/* ─── Conversation List Item ─── */
const ConversationItem = ({ conv, isActive, onClick }: {
  conv: Conversation; isActive: boolean; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
      isActive
        ? "bg-accent/10 border border-accent/20 shadow-sm"
        : "hover:bg-secondary/60 border border-transparent"
    }`}
  >
    <div className="relative flex-shrink-0">
      <Avatar className="w-11 h-11 ring-1 ring-border">
        <AvatarFallback className={`font-display font-semibold text-xs ${
          conv.type === "group" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
        }`}>
          {conv.initials}
        </AvatarFallback>
      </Avatar>
      {conv.type === "direct" && conv.online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-card" />
      )}
      {conv.type === "group" && (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-card rounded-full flex items-center justify-center ring-1 ring-border">
          <Users className="w-2.5 h-2.5 text-muted-foreground" />
        </span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {conv.pinned && <Pin className="w-2.5 h-2.5 text-gold flex-shrink-0 fill-gold" />}
          <span className={`text-[13px] font-display truncate ${conv.unread > 0 ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
            {conv.name}
          </span>
        </div>
        <span className={`text-[10px] font-display flex-shrink-0 ml-2 ${conv.unread > 0 ? "text-accent font-semibold" : "text-muted-foreground"}`}>
          {conv.lastMessageTime}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {conv.typing ? (
            <span className="text-xs text-accent font-display italic flex items-center gap-1">
              <span className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-1 h-1 rounded-full bg-accent" animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} />
                ))}
              </span>
              typing…
            </span>
          ) : (
            <p className={`text-xs truncate ${conv.unread > 0 ? "text-foreground/90 font-medium" : "text-muted-foreground"}`}>
              {conv.lastMessage}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {conv.muted && <VolumeX className="w-3 h-3 text-muted-foreground/50" />}
          {conv.unread > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-mono font-bold flex items-center justify-center">
              {conv.unread > 99 ? "99+" : conv.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  </button>
);

/* ─── New Conversation Modal (inline) ─── */
const NewConversationPanel = ({ onSelect, onClose }: { onSelect: (contactId: string) => void; onClose: () => void }) => {
  const [search, setSearch] = useState("");
  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.role?.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="absolute inset-x-0 top-0 bottom-0 z-20 bg-card border-r border-border flex flex-col"
    >
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-sm text-foreground">New Message</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7">Cancel</Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search researchers..."
            autoFocus
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary/50 border border-border text-xs font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors text-left"
            >
              <div className="relative flex-shrink-0">
                <Avatar className="w-10 h-10 ring-1 ring-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-display font-semibold">{c.initials}</AvatarFallback>
                </Avatar>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${statusColor[c.status]} rounded-full ring-2 ring-card`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-display font-medium text-foreground truncate">{c.name}</p>
                <p className="text-[11px] text-muted-foreground font-display truncate">{c.role}</p>
              </div>
              <span className={`text-[10px] font-display capitalize px-1.5 py-0.5 rounded-md ${
                c.status === "online" ? "text-success bg-success/10" :
                c.status === "away" ? "text-gold bg-gold/10" :
                c.status === "busy" ? "text-destructive bg-destructive/10" :
                "text-muted-foreground bg-muted"
              }`}>{c.status}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
};

/* ─── Main Sidebar Component ─── */
interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConvId: string | null;
  onSelectConversation: (id: string) => void;
  className?: string;
}

const ConversationSidebar = ({ conversations, activeConvId, onSelectConversation, className }: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [convFilter, setConvFilter] = useState<"all" | "unread" | "groups" | "archived">("all");
  const [showNewConv, setShowNewConv] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 200);

  const filteredConversations = useMemo(() => {
    let result = [...conversations];
    if (convFilter === "archived") {
      result = result.filter(c => c.archived);
    } else {
      result = result.filter(c => !c.archived);
      if (convFilter === "unread") result = result.filter(c => c.unread > 0);
      if (convFilter === "groups") result = result.filter(c => c.type === "group");
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
    }
    // Pinned first, then by timestamp
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
      return b.lastMessageTimestamp - a.lastMessageTimestamp;
    });
    return result;
  }, [conversations, debouncedSearch, convFilter]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const onlineContacts = contacts.filter(c => c.status === "online");

  return (
    <div className={`flex-shrink-0 border-r border-border flex flex-col bg-card relative ${className}`}>
      <AnimatePresence>
        {showNewConv && (
          <NewConversationPanel
            onSelect={(id) => { onSelectConversation(id); setShowNewConv(false); }}
            onClose={() => setShowNewConv(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-3 pb-2 border-b border-border">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-lg font-bold text-foreground">Messages</h1>
            {totalUnread > 0 && (
              <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-[10px] font-mono">
                {totalUnread}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowNewConv(true)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">New message</p></TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search conversations…"
            className="w-full h-8 pl-9 pr-3 rounded-lg bg-secondary/50 border border-border text-xs font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0.5">
          {(["all", "unread", "groups", "archived"] as const).map(f => (
            <button
              key={f}
              onClick={() => setConvFilter(f)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-display font-medium transition-all capitalize ${
                convFilter === f
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div className="p-1.5 space-y-0.5">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-display">
                {debouncedSearch ? "No results found" : convFilter === "archived" ? "No archived conversations" : "No conversations yet"}
              </p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onClick={() => onSelectConversation(conv.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Online contacts strip */}
      {onlineContacts.length > 0 && (
        <div className="p-3 pt-2 border-t border-border">
          <p className="text-[10px] font-display text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Active Now · {onlineContacts.length}
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {onlineContacts.map(c => (
              <Tooltip key={c.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectConversation(c.id)}
                    className="relative flex-shrink-0 group"
                  >
                    <Avatar className="w-9 h-9 ring-1 ring-border group-hover:ring-accent transition-all">
                      <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-display font-semibold">{c.initials}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-card" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs font-display">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.role}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationSidebar;
