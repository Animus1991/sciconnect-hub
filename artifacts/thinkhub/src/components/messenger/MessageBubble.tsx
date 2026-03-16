import { motion, AnimatePresence } from "framer-motion";
import {
  Check, CheckCheck, Reply, Forward, Trash2, Edit3, Pin, Smile,
  File, Mic, MapPin, Image as ImageIcon, Circle, Bookmark, BookmarkCheck,
  Shield, Tag, MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import type { Message, EvidenceTag } from "./types";
import { quickReactions, evidenceTypes } from "./types";
import { getContactName, getContactById } from "./mockData";
import RichMessageContent from "./RichMessageContent";

interface MessageBubbleProps {
  msg: Message;
  isMine: boolean;
  isGroup: boolean;
  showSender: boolean;
  isNDA: boolean;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onDelete: () => void;
  onEdit: () => void;
  onForward: () => void;
  onPin: () => void;
  onBookmark: () => void;
  onTagEvidence: (tag: EvidenceTag) => void;
  onStartThread?: () => void;
  threadCount?: number;
}

const MessageBubble = ({ msg, isMine, isGroup, showSender, isNDA, onReply, onReact, onDelete, onEdit, onForward, onPin, onBookmark, onTagEvidence, onStartThread, threadCount }: MessageBubbleProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showEvidenceMenu, setShowEvidenceMenu] = useState(false);

  if (msg.deleted) {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}>
        <div className="px-3 py-2 rounded-2xl bg-secondary/20 border border-border/20 max-w-[75%]">
          <p className="text-xs text-muted-foreground/50 font-display italic flex items-center gap-1.5">
            <Trash2 className="w-3 h-3" /> This message was deleted
          </p>
        </div>
      </div>
    );
  }

  const senderName = getContactName(msg.senderId);
  const senderContact = getContactById(msg.senderId);

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} ${showSender ? "mt-3" : "mt-0.5"} group/msg relative`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false); setShowEvidenceMenu(false); }}
    >
      {/* Avatar for group messages */}
      {isGroup && !isMine && (
        <div className="w-7 flex-shrink-0 self-end mr-1.5">
          {showSender && (
            <Avatar className="w-7 h-7 ring-1 ring-border">
              <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-display font-semibold">
                {senderContact?.initials || "?"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <div className="max-w-[70%] sm:max-w-[65%]">
        {/* Sender name */}
        {isGroup && !isMine && showSender && (
          <p className="text-[11px] font-display font-semibold text-accent/70 mb-0.5 ml-1">{senderName}</p>
        )}

        {/* Reply preview */}
        {msg.replyTo && (
          <div className={`mb-1 ${isMine ? "ml-auto" : ""}`}>
            <div className="bg-secondary/30 border-l-2 border-accent/30 rounded-md px-2.5 py-1.5">
              <p className="text-[10px] font-display font-semibold text-accent/70">{msg.replyTo.author}</p>
              <p className="text-[11px] font-display text-muted-foreground line-clamp-1">{msg.replyTo.text}</p>
            </div>
          </div>
        )}

        {/* Forwarded label */}
        {msg.forwarded && (
          <div className={`flex items-center gap-1 text-[10px] text-muted-foreground/60 font-display mb-0.5 ${isMine ? "justify-end" : ""}`}>
            <Forward className="w-2.5 h-2.5" /> Forwarded
          </div>
        )}

        {/* Evidence tag badge */}
        {msg.evidenceTag && (
          <div className={`mb-1 ${isMine ? "ml-auto text-right" : ""}`}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-medium bg-secondary/50 border border-border/50">
              {evidenceTypes.find(e => e.type === msg.evidenceTag!.type)?.icon}
              {msg.evidenceTag.label}
              {msg.evidenceTag.hash && (
                <span className="text-[8px] font-mono text-muted-foreground/50 ml-1">{msg.evidenceTag.hash.slice(0, 12)}</span>
              )}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div className={`rounded-2xl px-3.5 py-2 relative ${
          isMine
            ? "bg-accent text-accent-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md"
        }`}>
          {/* Pin indicator */}
          {msg.pinned && (
            <div className="absolute -top-2 -right-1">
              <Pin className="w-3 h-3 text-muted-foreground/50 fill-current" />
            </div>
          )}

          {/* Bookmark indicator */}
          {msg.bookmarked && (
            <div className="absolute -top-2 -left-1">
              <BookmarkCheck className="w-3 h-3 text-gold fill-current" />
            </div>
          )}

          {/* NDA watermark overlay */}
          {isNDA && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-[0.04]">
              <div className="absolute inset-0 flex items-center justify-center -rotate-45 text-foreground font-display font-bold text-[10px] tracking-widest uppercase whitespace-nowrap">
                CONFIDENTIAL · NDA
              </div>
            </div>
          )}

          {/* Attachments */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mb-1.5 space-y-1.5">
              {msg.attachments.map((att, i) => (
                <div key={i}>
                  {att.type === "image" && (
                    <div className="rounded-lg overflow-hidden w-full max-w-[260px]">
                      <div className="aspect-video bg-gradient-to-br from-secondary/60 to-secondary/20 flex items-center justify-center border border-border/20 rounded-lg">
                        <ImageIcon className={`w-8 h-8 ${isMine ? "text-accent-foreground/15" : "text-muted-foreground/15"}`} />
                      </div>
                      <p className={`text-[10px] mt-1 truncate ${isMine ? "text-accent-foreground/50" : "text-muted-foreground"}`}>{att.name}</p>
                    </div>
                  )}
                  {att.type === "file" && (
                    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                      isMine ? "bg-accent-foreground/10" : "bg-secondary/40"
                    }`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isMine ? "bg-accent-foreground/10" : "bg-accent/8"
                      }`}>
                        <File className={`w-4 h-4 ${isMine ? "text-accent-foreground/60" : "text-accent"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-display font-medium truncate ${isMine ? "text-accent-foreground" : "text-foreground"}`}>{att.name}</p>
                        {att.size && <p className={`text-[10px] ${isMine ? "text-accent-foreground/40" : "text-muted-foreground"}`}>{att.size}</p>}
                      </div>
                    </div>
                  )}
                  {att.type === "voice" && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isMine ? "bg-accent-foreground/10" : "bg-secondary/40"
                    }`}>
                      <Mic className={`w-4 h-4 flex-shrink-0 ${isMine ? "text-accent-foreground/60" : "text-accent"}`} />
                      <div className="flex-1">
                        <div className="flex gap-0.5 items-center h-4">
                          {Array.from({ length: 24 }).map((_, j) => (
                            <div key={j} className={`w-0.5 rounded-full ${isMine ? "bg-accent-foreground/25" : "bg-accent/25"}`} style={{ height: `${3 + Math.random() * 10}px` }} />
                          ))}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono ${isMine ? "text-accent-foreground/40" : "text-muted-foreground"}`}>{att.duration || "0:12"}</span>
                    </div>
                  )}
                  {att.type === "location" && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isMine ? "bg-accent-foreground/10" : "bg-secondary/40"
                    }`}>
                      <MapPin className={`w-4 h-4 flex-shrink-0 ${isMine ? "text-accent-foreground/60" : "text-accent"}`} />
                      <span className={`text-xs font-display ${isMine ? "text-accent-foreground" : "text-foreground"}`}>{att.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text with rich content */}
          <div className={`text-[13px] font-display leading-relaxed ${isMine ? "text-accent-foreground" : "text-foreground"}`}>
            <RichMessageContent text={msg.text} isMine={isMine} />
          </div>

          {/* Time + Status + Blockchain */}
          <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
            {msg.edited && <span className={`text-[9px] italic ${isMine ? "text-accent-foreground/35" : "text-muted-foreground/50"}`}>edited</span>}
            {msg.blockchainHash && (
              <span className={`text-[8px] font-mono ${isMine ? "text-accent-foreground/30" : "text-muted-foreground/40"} flex items-center gap-0.5`}>
                <Shield className="w-2 h-2" />{msg.blockchainHash}
              </span>
            )}
            <span className={`text-[10px] tabular-nums ${isMine ? "text-accent-foreground/45" : "text-muted-foreground/70"}`}>{msg.time}</span>
            {isMine && (
              <span className="flex items-center ml-0.5">
                {msg.status === "sending" && <Circle className="w-2.5 h-2.5 text-accent-foreground/25" />}
                {msg.status === "sent" && <Check className="w-3 h-3 text-accent-foreground/40" />}
                {msg.status === "delivered" && <CheckCheck className="w-3 h-3 text-accent-foreground/40" />}
                {msg.status === "read" && <CheckCheck className="w-3 h-3 text-accent-foreground/80" />}
              </span>
            )}
          </div>
        </div>

        {/* Reactions */}
        {msg.reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
            {msg.reactions.map((r, i) => (
              <button
                key={i}
                onClick={() => onReact(r.emoji)}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] transition-colors border ${
                  r.users.includes("me")
                    ? "bg-accent/10 border-accent/20"
                    : "bg-secondary/40 border-border hover:bg-secondary/60"
                }`}
              >
                <span>{r.emoji}</span>
                <span className="font-mono text-[9px] text-muted-foreground">{r.users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thread indicator */}
        {threadCount != null && threadCount > 0 && (
          <button
            onClick={onStartThread}
            className={`flex items-center gap-1.5 mt-1 px-2 py-1 rounded-lg hover:bg-secondary/50 transition-colors ${isMine ? "ml-auto" : ""}`}
          >
            <MessageSquare className="w-3 h-3 text-accent" />
            <span className="text-[11px] font-display font-medium text-accent">{threadCount} {threadCount === 1 ? "reply" : "replies"}</span>
          </button>
        )}

        {/* Quick actions (hover) */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
              className={`absolute top-0 ${isMine ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} flex items-center z-10`}
            >
              <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg shadow-md p-0.5">
                <button onClick={() => setShowReactions(!showReactions)} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="React">
                  <Smile className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={onReply} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Reply">
                  <Reply className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                {onStartThread && (
                  <button onClick={onStartThread} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Thread">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                <button onClick={() => setShowEvidenceMenu(!showEvidenceMenu)} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Tag as Evidence">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={onBookmark} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Bookmark">
                  {msg.bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-gold" /> : <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <button onClick={onForward} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Forward">
                  <Forward className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                {isMine && (
                  <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Edit">
                    <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                <button onClick={onPin} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Pin">
                  <Pin className={`w-3.5 h-3.5 ${msg.pinned ? "text-accent" : "text-muted-foreground"}`} />
                </button>
                {isMine && (
                  <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className={`absolute ${isMine ? "right-0" : "left-0"} -top-10 z-20 flex gap-0.5 px-2 py-1.5 rounded-full bg-card border border-border shadow-lg`}
            >
              {quickReactions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { onReact(emoji); setShowReactions(false); }}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary transition-all text-base hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Evidence tag picker */}
        <AnimatePresence>
          {showEvidenceMenu && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className={`absolute ${isMine ? "right-0" : "left-0"} -top-12 z-20 bg-card border border-border rounded-xl shadow-lg p-1.5 flex gap-1`}
            >
              {evidenceTypes.map(et => (
                <button
                  key={et.type}
                  onClick={() => {
                    onTagEvidence({ type: et.type, label: et.label, timestamp: Date.now(), hash: `sha256:${Math.random().toString(16).slice(2, 8)}` });
                    setShowEvidenceMenu(false);
                  }}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                  title={et.label}
                >
                  <span className="text-sm">{et.icon}</span>
                  <span className="text-[8px] font-display text-muted-foreground whitespace-nowrap">{et.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MessageBubble;
