import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Pin, Trash2, MessageSquare, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { listConversations, deleteConversation, togglePin } from "@/lib/ai-conversations";
import type { SavedConversation, AIProviderType } from "./types";
import { toast } from "sonner";

interface Props {
  providerId?: AIProviderType;
  onResume: (conversation: SavedConversation) => void;
}

const AIChatHistory: React.FC<Props> = ({ providerId, onResume }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const conversations = useMemo(
    () => listConversations(providerId),
    [providerId, refreshKey, open]
  );

  const filtered = useMemo(
    () => conversations.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase())
    ),
    [conversations, search]
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
    setRefreshKey(k => k + 1);
    toast.success("Conversation deleted");
  };

  const handlePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    togglePin(id);
    setRefreshKey(k => k + 1);
  };

  const handleResume = (conv: SavedConversation) => {
    onResume(conv);
    setOpen(false);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setOpen(!open)}
          >
            <History className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p className="text-[10px]">History</p></TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-12 left-2 right-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
            style={{ maxHeight: 320 }}
          >
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-semibold text-foreground">Conversation History</span>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setOpen(false)}>
                <X className="w-2.5 h-2.5" />
              </Button>
            </div>

            {conversations.length > 3 && (
              <div className="px-3 py-1.5 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-6 pl-7 pr-2 rounded-md bg-secondary text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              </div>
            )}

            <div className="overflow-y-auto max-h-[240px] scrollbar-thin">
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <MessageSquare className="w-5 h-5 text-muted-foreground/30 mx-auto mb-1.5" />
                  <p className="text-[10px] text-muted-foreground">No saved conversations</p>
                </div>
              ) : (
                filtered.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleResume(conv)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary/50 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {conv.pinned && <Pin className="w-2.5 h-2.5 text-accent flex-shrink-0" />}
                        <span className="text-[11px] font-medium text-foreground truncate">{conv.title}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground truncate">
                        {conv.messages.length} messages · {formatDate(conv.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => handlePin(e, conv.id)}
                        className={`p-0.5 rounded hover:bg-secondary ${conv.pinned ? "text-accent" : "text-muted-foreground/40"}`}
                      >
                        <Pin className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={e => handleDelete(e, conv.id)}
                        className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatHistory;
