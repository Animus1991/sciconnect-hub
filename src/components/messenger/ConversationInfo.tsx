import { motion } from "framer-motion";
import {
  X, Users, Bell, BellOff, Pin, Search, Shield, Archive,
  Trash2, ChevronRight, Link2, FileText, Image as ImageIcon
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Conversation, Message } from "./types";
import { statusColor } from "./types";

interface ConversationInfoProps {
  conversation: Conversation;
  messages: Message[];
  onClose: () => void;
}

const ConversationInfo = ({ conversation, messages, onClose }: ConversationInfoProps) => {
  const pinnedMessages = messages.filter(m => m.pinned);
  const sharedFiles = messages.flatMap(m => (m.attachments || []).filter(a => a.type === "file"));
  const sharedImages = messages.flatMap(m => (m.attachments || []).filter(a => a.type === "image"));

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 280, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="border-l border-border bg-card flex flex-col overflow-hidden flex-shrink-0"
    >
      <div className="p-3 flex items-center justify-between border-b border-border flex-shrink-0">
        <h3 className="font-display font-semibold text-sm text-foreground">Details</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Profile */}
          <div className="text-center mb-4">
            <Avatar className="w-16 h-16 mx-auto mb-2 ring-2 ring-border">
              <AvatarFallback className={`text-lg font-display font-bold ${
                conversation.type === "group" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
              }`}>
                {conversation.initials}
              </AvatarFallback>
            </Avatar>
            <h4 className="font-display font-semibold text-foreground text-sm">{conversation.name}</h4>
            {conversation.type === "group" ? (
              <p className="text-[11px] text-muted-foreground font-display">{conversation.participants.length + 1} members</p>
            ) : (
              <p className="text-[11px] text-muted-foreground font-display">
                {conversation.online ? "Online" : conversation.participants[0]?.lastSeen ? `Last seen ${conversation.participants[0].lastSeen}` : "Offline"}
              </p>
            )}
            {conversation.description && (
              <p className="text-[11px] text-muted-foreground font-display mt-1 px-2">{conversation.description}</p>
            )}
          </div>

          <Separator className="my-3" />

          {/* Quick actions */}
          <div className="space-y-0.5 mb-3">
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/60 transition-colors text-left">
              {conversation.muted ? <Bell className="w-4 h-4 text-muted-foreground" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
              <span className="text-xs font-display text-foreground">{conversation.muted ? "Unmute" : "Mute"} notifications</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/60 transition-colors text-left">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-display text-foreground">Search in conversation</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/60 transition-colors text-left">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-display text-foreground">Blockchain verification</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
            </button>
          </div>

          <Separator className="my-3" />

          {/* Members (groups) */}
          {conversation.type === "group" && (
            <>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Members</p>
                  <span className="text-[10px] text-muted-foreground">{conversation.participants.length + 1}</span>
                </div>
                <div className="space-y-1">
                  {conversation.participants.map(p => (
                    <div key={p.id} className="flex items-center gap-2 px-1 py-1">
                      <div className="relative">
                        <Avatar className="w-7 h-7 ring-1 ring-border">
                          <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-display font-semibold">{p.initials}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${statusColor[p.status]} rounded-full ring-1 ring-card`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-display font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{p.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator className="my-3" />
            </>
          )}

          {/* Pinned messages */}
          {pinnedMessages.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Pin className="w-3 h-3" /> Pinned · {pinnedMessages.length}
              </p>
              <div className="space-y-1">
                {pinnedMessages.map(m => (
                  <div key={m.id} className="px-2.5 py-1.5 bg-secondary/40 rounded-lg">
                    <p className="text-[11px] font-display text-foreground line-clamp-2">{m.text}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{m.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared files */}
          <div className="mb-3">
            <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Files · {sharedFiles.length}
            </p>
            {sharedFiles.length > 0 ? (
              <div className="space-y-1">
                {sharedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-secondary/30 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-display text-foreground truncate">{f.name}</p>
                      {f.size && <p className="text-[9px] text-muted-foreground">{f.size}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground/60 font-display">No files shared yet</p>
            )}
          </div>

          {/* Shared images */}
          <div className="mb-3">
            <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Images · {sharedImages.length}
            </p>
            {sharedImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {sharedImages.map((_, i) => (
                  <div key={i} className="aspect-square bg-secondary/40 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground/60 font-display">No images shared yet</p>
            )}
          </div>

          <Separator className="my-3" />

          {/* Danger zone */}
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/60 transition-colors text-left">
              <Archive className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-display text-foreground">Archive conversation</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-left">
              <Trash2 className="w-4 h-4 text-destructive" />
              <span className="text-xs font-display text-destructive">Delete conversation</span>
            </button>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default ConversationInfo;
