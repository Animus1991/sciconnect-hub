import { motion, AnimatePresence } from "framer-motion";
import {
  Check, CheckCheck, Reply, Forward, Trash2, Edit3, Pin, Smile,
  File, Mic, MapPin, Image as ImageIcon, Circle, Link2
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import type { Message } from "./types";
import { quickReactions } from "./types";
import { getContactName, getContactById } from "./mockData";

interface MessageBubbleProps {
  msg: Message;
  isMine: boolean;
  isGroup: boolean;
  showSender: boolean; // show name+avatar for consecutive messages from diff senders in groups
  onReply: () => void;
  onReact: (emoji: string) => void;
  onDelete: () => void;
  onEdit: () => void;
  onForward: () => void;
  onPin: () => void;
}

const MessageBubble = ({ msg, isMine, isGroup, showSender, onReply, onReact, onDelete, onEdit, onForward, onPin }: MessageBubbleProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  if (msg.deleted) {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}>
        <div className="px-3 py-2 rounded-xl bg-secondary/30 border border-border/30 max-w-[75%]">
          <p className="text-xs text-muted-foreground/60 font-display italic flex items-center gap-1.5">
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
      onMouseLeave={() => { setShowActions(false); setShowReactions(false); }}
    >
      {/* Avatar for group messages (non-mine) */}
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

      <div className={`max-w-[70%] sm:max-w-[60%]`}>
        {/* Sender name in groups */}
        {isGroup && !isMine && showSender && (
          <p className="text-[11px] font-display font-semibold text-accent/80 mb-0.5 ml-1">{senderName}</p>
        )}

        {/* Reply preview */}
        {msg.replyTo && (
          <div className={`mb-1 ${isMine ? "ml-auto" : ""}`}>
            <div className="bg-secondary/40 border-l-2 border-accent/40 rounded-md px-2.5 py-1.5">
              <p className="text-[10px] font-display font-semibold text-accent/80">{msg.replyTo.author}</p>
              <p className="text-[11px] font-display text-muted-foreground line-clamp-1">{msg.replyTo.text}</p>
            </div>
          </div>
        )}

        {/* Forwarded label */}
        {msg.forwarded && (
          <div className={`flex items-center gap-1 text-[10px] text-muted-foreground font-display mb-0.5 ${isMine ? "justify-end" : ""}`}>
            <Forward className="w-2.5 h-2.5" /> Forwarded
          </div>
        )}

        {/* Bubble */}
        <div className={`rounded-2xl px-3.5 py-2 relative ${
          isMine
            ? "bg-accent text-accent-foreground rounded-br-sm"
            : "bg-card border border-border rounded-bl-sm"
        }`}>
          {/* Pin indicator */}
          {msg.pinned && (
            <div className="absolute -top-2 -right-1">
              <Pin className="w-3 h-3 text-gold fill-gold" />
            </div>
          )}

          {/* Attachments */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {msg.attachments.map((att, i) => (
                <div key={i}>
                  {att.type === "image" && (
                    <div className="rounded-lg overflow-hidden w-full max-w-[260px]">
                      <div className="aspect-video bg-gradient-to-br from-secondary/80 to-secondary/30 flex items-center justify-center border border-border/30 rounded-lg">
                        <ImageIcon className={`w-8 h-8 ${isMine ? "text-accent-foreground/20" : "text-muted-foreground/20"}`} />
                      </div>
                      <p className={`text-[10px] mt-1 truncate ${isMine ? "text-accent-foreground/60" : "text-muted-foreground"}`}>{att.name}</p>
                    </div>
                  )}
                  {att.type === "file" && (
                    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                      isMine ? "bg-accent-foreground/10" : "bg-secondary/60"
                    }`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isMine ? "bg-accent-foreground/10" : "bg-accent/10"
                      }`}>
                        <File className={`w-4 h-4 ${isMine ? "text-accent-foreground/70" : "text-accent"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-display font-medium truncate ${isMine ? "text-accent-foreground" : "text-foreground"}`}>{att.name}</p>
                        {att.size && <p className={`text-[10px] ${isMine ? "text-accent-foreground/50" : "text-muted-foreground"}`}>{att.size}</p>}
                      </div>
                    </div>
                  )}
                  {att.type === "voice" && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isMine ? "bg-accent-foreground/10" : "bg-secondary/60"
                    }`}>
                      <Mic className={`w-4 h-4 flex-shrink-0 ${isMine ? "text-accent-foreground/70" : "text-accent"}`} />
                      <div className="flex-1">
                        <div className="flex gap-0.5 items-center h-4">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full ${isMine ? "bg-accent-foreground/30" : "bg-accent/30"}`}
                              style={{ height: `${4 + Math.random() * 12}px` }}
                            />
                          ))}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono ${isMine ? "text-accent-foreground/50" : "text-muted-foreground"}`}>{att.duration || "0:12"}</span>
                    </div>
                  )}
                  {att.type === "location" && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isMine ? "bg-accent-foreground/10" : "bg-secondary/60"
                    }`}>
                      <MapPin className={`w-4 h-4 flex-shrink-0 ${isMine ? "text-accent-foreground/70" : "text-accent"}`} />
                      <span className={`text-xs font-display ${isMine ? "text-accent-foreground" : "text-foreground"}`}>{att.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text */}
          <p className={`text-[13px] font-display leading-relaxed whitespace-pre-wrap break-words ${isMine ? "text-accent-foreground" : "text-foreground"}`}>
            {msg.text}
          </p>

          {/* Time + Status */}
          <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
            {msg.edited && <span className={`text-[9px] italic ${isMine ? "text-accent-foreground/40" : "text-muted-foreground/60"}`}>edited</span>}
            <span className={`text-[10px] ${isMine ? "text-accent-foreground/50" : "text-muted-foreground"}`}>{msg.time}</span>
            {isMine && (
              <span className="flex items-center ml-0.5">
                {msg.status === "sending" && <Circle className="w-2.5 h-2.5 text-accent-foreground/30" />}
                {msg.status === "sent" && <Check className="w-3 h-3 text-accent-foreground/50" />}
                {msg.status === "delivered" && <CheckCheck className="w-3 h-3 text-accent-foreground/50" />}
                {msg.status === "read" && <CheckCheck className="w-3 h-3 text-accent-foreground" />}
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
                    ? "bg-accent/10 border-accent/20 text-foreground"
                    : "bg-secondary/50 border-border hover:bg-secondary text-foreground/80"
                }`}
              >
                <span>{r.emoji}</span>
                <span className="font-mono text-[9px]">{r.users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick actions (hover) */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
              className={`absolute top-0 ${isMine ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} flex items-center gap-0.5 z-10`}
            >
              <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg shadow-md p-0.5">
                <button onClick={() => setShowReactions(!showReactions)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                  <Smile className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={onReply} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                  <Reply className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={onForward} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                  <Forward className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                {isMine && (
                  <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                    <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                <button onClick={onPin} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                  <Pin className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                {isMine && (
                  <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors">
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
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary transition-all text-base hover:scale-125"
                >
                  {emoji}
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
