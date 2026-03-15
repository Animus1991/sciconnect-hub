import { motion } from "framer-motion";
import {
  X, Users, Bell, BellOff, Pin, Shield, ShieldCheck, ShieldAlert, Archive,
  Trash2, ChevronRight, FileText, Image as ImageIcon, Link2,
  Download, Bookmark, Lock, Unlock
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import type { Conversation, Message, BlockchainLevel } from "./types";
import { statusColor, blockchainLevels, evidenceTypes } from "./types";
import { toast } from "sonner";

interface ConversationInfoProps {
  conversation: Conversation;
  messages: Message[];
  onClose: () => void;
  onSetBlockchainLevel: (level: BlockchainLevel) => void;
  onToggleNDA: () => void;
}

type InfoTab = "overview" | "media" | "research";

const ConversationInfo = ({ conversation, messages, onClose, onSetBlockchainLevel, onToggleNDA }: ConversationInfoProps) => {
  const [activeTab, setActiveTab] = useState<InfoTab>("overview");
  const pinnedMessages = messages.filter(m => m.pinned);
  const sharedFiles = messages.flatMap(m => (m.attachments || []).filter(a => a.type === "file"));
  const sharedImages = messages.flatMap(m => (m.attachments || []).filter(a => a.type === "image"));
  const evidenceMessages = messages.filter(m => m.evidenceTag);
  const bookmarkedMessages = messages.filter(m => m.bookmarked);
  const hashedMessages = messages.filter(m => m.blockchainHash);

  const bcLevel = conversation.blockchainLevel;
  const isNDA = conversation.ndaStatus === "accepted";
  const BlockchainIcon = bcLevel === "mutual" ? ShieldAlert : bcLevel === "unilateral" ? ShieldCheck : Shield;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 300, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="border-l border-border bg-card flex flex-col overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-border flex-shrink-0">
        <h3 className="font-display font-semibold text-sm text-foreground">Details</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0">
        {(["overview", "media", "research"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[11px] font-display font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeTab === "overview" && (
            <>
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
                  <p className="text-[11px] text-muted-foreground font-display mt-1.5 px-2 leading-relaxed">{conversation.description}</p>
                )}
              </div>

              {/* Linked project */}
              {conversation.linkedProject && (
                <div className="px-2.5 py-2 rounded-lg bg-secondary/30 border border-border/50 mb-3">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground font-display">Linked Project</p>
                      <p className="text-xs font-display font-medium text-foreground truncate">{conversation.linkedProject}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Blockchain & NDA status */}
              <div className="space-y-2 mb-3">
                <button
                  onClick={() => {
                    const next: BlockchainLevel = bcLevel === "off" ? "unilateral" : bcLevel === "unilateral" ? "mutual" : "off";
                    onSetBlockchainLevel(next);
                  }}
                  className="w-full px-2.5 py-2 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <BlockchainIcon className={`w-3.5 h-3.5 flex-shrink-0 ${
                      bcLevel === "mutual" ? "text-success" : bcLevel === "unilateral" ? "text-gold" : "text-muted-foreground"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground font-display">IP Verification</p>
                      <p className="text-xs font-display font-medium text-foreground">
                        {blockchainLevels.find(b => b.level === bcLevel)?.label}
                      </p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                  </div>
                </button>

                <button
                  onClick={onToggleNDA}
                  className="w-full px-2.5 py-2 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {isNDA ? <Lock className="w-3.5 h-3.5 text-destructive flex-shrink-0" /> : <Unlock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground font-display">NDA Mode</p>
                      <p className="text-xs font-display font-medium text-foreground">
                        {isNDA ? "Active — Confidential" : "Not enabled"}
                      </p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                  </div>
                </button>
              </div>

              <Separator className="my-3" />

              {/* Quick actions */}
              <div className="space-y-0.5 mb-3">
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/40 transition-colors text-left">
                  {conversation.muted ? <Bell className="w-4 h-4 text-muted-foreground" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-xs font-display text-foreground">{conversation.muted ? "Unmute" : "Mute"}</span>
                </button>
                <button
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/40 transition-colors text-left"
                  onClick={() => toast.success("Exporting as verified PDF with timestamps…")}
                >
                  <Download className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-display text-foreground">Export as Lab Record</span>
                </button>
              </div>

              <Separator className="my-3" />

              {/* Members */}
              {conversation.type === "group" && (
                <>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Members</p>
                      <span className="text-[10px] text-muted-foreground font-mono">{conversation.participants.length + 1}</span>
                    </div>
                    <div className="space-y-1">
                      {conversation.participants.map(p => (
                        <div key={p.id} className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-secondary/30 transition-colors">
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
                      <div key={m.id} className="px-2.5 py-1.5 bg-secondary/30 rounded-lg border border-border/30">
                        <p className="text-[11px] font-display text-foreground line-clamp-2">{m.text}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{m.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Danger zone */}
              <Separator className="my-3" />
              <div className="space-y-0.5">
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/40 transition-colors text-left">
                  <Archive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-display text-foreground">Archive</span>
                </button>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-destructive/8 transition-colors text-left">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <span className="text-xs font-display text-destructive">Delete conversation</span>
                </button>
              </div>
            </>
          )}

          {activeTab === "media" && (
            <>
              <div className="mb-4">
                <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Files · {sharedFiles.length}
                </p>
                {sharedFiles.length > 0 ? (
                  <div className="space-y-1">
                    {sharedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-2.5 py-2 bg-secondary/30 rounded-lg border border-border/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                        <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-display text-foreground truncate font-medium">{f.name}</p>
                          {f.size && <p className="text-[9px] text-muted-foreground">{f.size}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground/50 font-display py-4 text-center">No files shared yet</p>
                )}
              </div>
              <div>
                <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" /> Images · {sharedImages.length}
                </p>
                {sharedImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {sharedImages.map((_, i) => (
                      <div key={i} className="aspect-square bg-secondary/30 rounded-lg flex items-center justify-center border border-border/20 hover:bg-secondary/50 transition-colors cursor-pointer">
                        <ImageIcon className="w-4 h-4 text-muted-foreground/20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground/50 font-display py-4 text-center">No images shared yet</p>
                )}
              </div>
            </>
          )}

          {activeTab === "research" && (
            <>
              {/* Evidence tags */}
              <div className="mb-4">
                <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Bookmark className="w-3 h-3" /> Evidence Tags · {evidenceMessages.length}
                </p>
                {evidenceMessages.length > 0 ? (
                  <div className="space-y-1.5">
                    {evidenceMessages.map(m => (
                      <div key={m.id} className="px-2.5 py-2 bg-secondary/30 rounded-lg border border-border/30">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs">{evidenceTypes.find(e => e.type === m.evidenceTag?.type)?.icon}</span>
                          <span className="text-[10px] font-display font-semibold text-foreground">{m.evidenceTag?.label}</span>
                          {m.evidenceTag?.hash && (
                            <span className="text-[8px] font-mono text-muted-foreground/50 ml-auto">{m.evidenceTag.hash}</span>
                          )}
                        </div>
                        <p className="text-[11px] font-display text-foreground/80 line-clamp-2">{m.text}</p>
                        <p className="text-[9px] text-muted-foreground mt-1">{m.time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground/50 font-display py-4 text-center">No evidence tags yet. Hover over a message to tag it.</p>
                )}
              </div>

              {/* Blockchain audit */}
              <div className="mb-4">
                <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Blockchain Audit · {hashedMessages.length} hashed
                </p>
                <div className="px-3 py-3 rounded-lg bg-secondary/20 border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <BlockchainIcon className={`w-4 h-4 ${
                      bcLevel === "mutual" ? "text-success" : bcLevel === "unilateral" ? "text-gold" : "text-muted-foreground"
                    }`} />
                    <p className="text-xs font-display font-semibold text-foreground">
                      {blockchainLevels.find(b => b.level === bcLevel)?.label}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-display leading-relaxed">
                    {bcLevel === "off"
                      ? "Enable verification to create tamper-proof records of your research discussions."
                      : `${hashedMessages.length} messages hashed with SHA-256. Evidence-tagged messages provide cryptographic proof of idea priority and authorship.`}
                  </p>
                </div>
              </div>

              {/* Bookmarked */}
              {bookmarkedMessages.length > 0 && (
                <div>
                  <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Bookmark className="w-3 h-3" /> Bookmarked · {bookmarkedMessages.length}
                  </p>
                  <div className="space-y-1">
                    {bookmarkedMessages.map(m => (
                      <div key={m.id} className="px-2.5 py-1.5 bg-secondary/30 rounded-lg border border-border/30">
                        <p className="text-[11px] font-display text-foreground line-clamp-2">{m.text}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{m.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default ConversationInfo;
