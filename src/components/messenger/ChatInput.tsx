import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Smile, Plus, Mic, X, Image as ImageIcon, Camera, File,
  MapPin, Users, Gift, Code2, Beaker
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Message, Conversation } from "./types";
import { emojiCategories } from "./types";
import { toast } from "sonner";

/* ─── Attachment Menu ─── */
const AttachmentMenu = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 8, scale: 0.95 }}
    className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-xl shadow-lg p-2 grid grid-cols-3 gap-1 min-w-[220px]"
  >
    {[
      { icon: ImageIcon, label: "Photo", color: "text-accent" },
      { icon: Camera, label: "Camera", color: "text-accent" },
      { icon: File, label: "Document", color: "text-info" },
      { icon: Code2, label: "Code", color: "text-highlight" },
      { icon: Beaker, label: "Protocol", color: "text-success" },
      { icon: Gift, label: "GIF", color: "text-gold" },
    ].map(item => (
      <button
        key={item.label}
        onClick={() => { toast.info(`${item.label} picker would open`); onClose(); }}
        className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-secondary/60 transition-colors"
      >
        <div className={`w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center ${item.color}`}>
          <item.icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-display text-muted-foreground">{item.label}</span>
      </button>
    ))}
  </motion.div>
);

/* ─── Emoji Picker ─── */
const EmojiPicker = ({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-xl shadow-lg w-[300px] overflow-hidden"
    >
      {/* Tabs */}
      <div className="flex border-b border-border">
        {emojiCategories.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setActiveTab(i)}
            className={`flex-1 px-2 py-2 text-[10px] font-display font-medium transition-colors ${
              activeTab === i ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {/* Grid */}
      <div className="p-2 max-h-[240px] overflow-y-auto">
        <div className="flex flex-wrap gap-0.5">
          {emojiCategories[activeTab].emojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => { onSelect(emoji); onClose(); }}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Main Chat Input ─── */
interface ChatInputProps {
  activeConv: Conversation | null;
  replyingTo: Message | null;
  editingMsg: Message | null;
  onSend: (text: string) => void;
  onCancelReply: () => void;
  onCancelEdit: () => void;
}

const ChatInput = ({ activeConv, replyingTo, editingMsg, onSend, onCancelReply, onCancelEdit }: ChatInputProps) => {
  const [inputText, setInputText] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync editing text
  useEffect(() => {
    if (editingMsg) {
      setInputText(editingMsg.text);
      textareaRef.current?.focus();
    }
  }, [editingMsg]);

  useEffect(() => {
    if (replyingTo) textareaRef.current?.focus();
  }, [replyingTo]);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  useEffect(() => { adjustHeight(); }, [inputText, adjustHeight]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSend(inputText.trim());
    setInputText("");
    setShowAttachments(false);
    setShowEmojiPicker(false);
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card flex-shrink-0">
      {/* Reply/Edit bar */}
      <AnimatePresence>
        {(replyingTo || editingMsg) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2 flex items-center gap-2 bg-secondary/20 border-b border-border">
              <div className="w-1 h-8 rounded-full bg-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-display font-semibold text-accent">
                  {editingMsg ? "Editing message" : `Replying to ${replyingTo?.senderId === "me" ? "yourself" : activeConv?.name}`}
                </p>
                <p className="text-xs font-display text-muted-foreground truncate">{editingMsg?.text || replyingTo?.text}</p>
              </div>
              <button
                onClick={() => { editingMsg ? onCancelEdit() : onCancelReply(); setInputText(""); }}
                className="p-1 hover:bg-secondary rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="px-3 sm:px-4 py-2.5">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <div className="relative flex-shrink-0 self-end">
            <AnimatePresence>
              {showAttachments && <AttachmentMenu onClose={() => setShowAttachments(false)} />}
            </AnimatePresence>
            <button
              onClick={() => { setShowAttachments(!showAttachments); setShowEmojiPicker(false); }}
              className={`p-2 rounded-lg transition-all ${showAttachments ? "bg-accent/10 text-accent rotate-45" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              <Plus className="w-5 h-5 transition-transform" />
            </button>
          </div>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              className="w-full px-4 py-2 rounded-xl bg-secondary/50 border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-hidden leading-relaxed min-h-[40px] max-h-[120px]"
            />
          </div>

          {/* Emoji button */}
          <div className="relative flex-shrink-0 self-end">
            <AnimatePresence>
              {showEmojiPicker && (
                <EmojiPicker
                  onSelect={emoji => setInputText(prev => prev + emoji)}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </AnimatePresence>
            <button
              onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachments(false); }}
              className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Send / Voice button */}
          {inputText.trim() ? (
            <button
              onClick={handleSend}
              className="p-2.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-all flex-shrink-0 self-end shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              onMouseDown={() => { setIsRecording(true); toast.info("🎙 Recording…"); }}
              onMouseUp={() => { setIsRecording(false); toast.info("Voice message recorded"); }}
              onMouseLeave={() => isRecording && setIsRecording(false)}
              className={`p-2.5 rounded-xl transition-all flex-shrink-0 self-end ${
                isRecording ? "bg-destructive text-destructive-foreground scale-110 shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
