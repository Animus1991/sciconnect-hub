import React, { useState, useRef, useCallback } from "react";
import { Send, Loader2, Sparkles, Mic, MicOff, Image, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSend: (text: string, images?: string[]) => void;
  disabled: boolean;
  isTyping: boolean;
}

const EMOJI_QUICK = ["👍", "🔬", "📊", "💡", "✅", "❌", "🤔", "🎯"];

const AIChatInput: React.FC<Props> = ({ onSend, disabled, isTyping }) => {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const send = useCallback(() => {
    if (!input.trim() || disabled || isTyping) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [input, disabled, isTyping, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }, [send]);

  const handleImageUpload = useCallback(() => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        onSend(`[Image: ${file.name}]`, [reader.result as string]);
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  }, [onSend]);

  const toggleVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setInput(prev => prev + t);
      setIsRecording(false);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
  }, [isRecording]);

  const autoResize = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  }, []);

  return (
    <div className="px-2.5 py-2 border-t border-border flex-shrink-0 relative">
      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-14 left-2.5 bg-card border border-border rounded-lg shadow-lg p-1.5 flex gap-1 z-10"
          >
            {EMOJI_QUICK.map(e => (
              <button
                key={e}
                onClick={() => { setInput(prev => prev + e); setShowEmoji(false); textareaRef.current?.focus(); }}
                className="w-7 h-7 hover:bg-secondary rounded text-sm flex items-center justify-center"
              >
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-1.5">
        {/* Action buttons */}
        <div className="flex items-center gap-0.5 pb-1">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground transition-colors"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleImageUpload}
            className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground transition-colors"
          >
            <Image className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleVoice}
            className={`p-1.5 rounded-lg transition-colors ${
              isRecording ? "bg-destructive/10 text-destructive" : "hover:bg-secondary/60 text-muted-foreground"
            }`}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={autoResize}
          placeholder="Ask AI anything…"
          rows={1}
          className="flex-1 px-3 py-1.5 rounded-xl bg-secondary/30 border border-border text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none min-h-[32px] max-h-[80px] leading-relaxed"
          style={{ height: "auto", overflow: "hidden" }}
        />

        {/* Send */}
        {input.trim() ? (
          <motion.button
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={send}
            disabled={isTyping || disabled}
            className="p-2 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-all flex-shrink-0 self-end shadow-sm disabled:opacity-50"
          >
            {isTyping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </motion.button>
        ) : (
          <div className="p-2 flex-shrink-0 self-end">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground/30" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatInput;
