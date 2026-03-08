import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  X, Minus, Maximize2, Minimize2, GripHorizontal,
  Wifi, WifiOff, MoreVertical, Trash2, StopCircle,
  Save, Shield, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChatWindow, ChatMessage, SavedConversation } from "./types";
import AIChatMessages from "./AIChatMessages";
import AIChatInput from "./AIChatInput";
import AIChatHistory from "./AIChatHistory";
import { streamChatCompletion } from "@/lib/api/aiChat";
import { scrubPII } from "@/lib/pii-scrubber";
import { saveConversation } from "@/lib/ai-conversations";
import { toast } from "sonner";
import type { PageContext } from "@/hooks/use-page-context";

interface Props {
  window: ChatWindow;
  providerIcon: string;
  providerName: string;
  isConnected: boolean;
  layoutMode: "floating" | "sticky";
  pageContext: PageContext;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onPositionChange: (id: string, pos: { x: number; y: number }) => void;
  onSizeChange: (id: string, size: { w: number; h: number }) => void;
  onMessagesUpdate: (id: string, msgs: ChatMessage[]) => void;
}

const MIN_W = 300;
const MIN_H = 340;
const MAX_W = 600;
const MAX_H = 700;

const AIChatWindow: React.FC<Props> = ({
  window: win, providerIcon, providerName, isConnected,
  layoutMode, pageContext, onClose, onMinimize, onFocus, onPositionChange, onSizeChange, onMessagesUpdate
}) => {
  const [contextEnabled, setContextEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [piiEnabled, setPiiEnabled] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; originW: number; originH: number; corner: string } | null>(null);
  const prevSize = useRef<{ w: number; h: number; x: number; y: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Drag handlers
  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (layoutMode !== "floating" || isMaximized) return;
    e.preventDefault();
    onFocus(win.id);
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: win.position.x, originY: win.position.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      onPositionChange(win.id, {
        x: Math.max(0, Math.min(window.innerWidth - 100, dragRef.current.originX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 60, dragRef.current.originY + dy)),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [layoutMode, isMaximized, win.id, win.position, onFocus, onPositionChange]);

  // Resize handlers
  const onResizeStart = useCallback((e: React.MouseEvent, corner: string) => {
    if (layoutMode !== "floating" || isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus(win.id);
    resizeRef.current = { startX: e.clientX, startY: e.clientY, originW: win.size.w, originH: win.size.h, corner };

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = ev.clientX - resizeRef.current.startX;
      const dy = ev.clientY - resizeRef.current.startY;
      let newW = resizeRef.current.originW;
      let newH = resizeRef.current.originH;

      if (corner.includes("r")) newW = Math.max(MIN_W, Math.min(MAX_W, resizeRef.current.originW + dx));
      if (corner.includes("b")) newH = Math.max(MIN_H, Math.min(MAX_H, resizeRef.current.originH + dy));
      if (corner.includes("l")) newW = Math.max(MIN_W, Math.min(MAX_W, resizeRef.current.originW - dx));
      if (corner.includes("t")) newH = Math.max(MIN_H, Math.min(MAX_H, resizeRef.current.originH - dy));

      onSizeChange(win.id, { w: newW, h: newH });
    };
    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [layoutMode, isMaximized, win.id, win.size, onFocus, onSizeChange]);

  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      if (prevSize.current) {
        onPositionChange(win.id, { x: prevSize.current.x, y: prevSize.current.y });
        onSizeChange(win.id, { w: prevSize.current.w, h: prevSize.current.h });
      }
      setIsMaximized(false);
    } else {
      prevSize.current = { ...win.size, ...win.position };
      onPositionChange(win.id, { x: 0, y: 0 });
      onSizeChange(win.id, { w: window.innerWidth, h: window.innerHeight });
      setIsMaximized(true);
    }
  }, [isMaximized, win.id, win.size, win.position, onPositionChange, onSizeChange]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsTyping(false);
  }, []);

  const handleSend = useCallback(async (text: string, images?: string[]) => {
    // PII scrubbing
    let processedText = text;
    let piiScrubbed = false;
    if (piiEnabled) {
      const result = scrubPII(text);
      processedText = result.text;
      piiScrubbed = result.scrubbed;
      if (result.scrubbed) {
        toast.info(`PII detected & scrubbed: ${result.detectedTypes.join(", ")}`);
      }
    }

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: processedText,
      timestamp: Date.now(),
      images,
      piiScrubbed,
    };
    const withUser = [...win.messages, userMsg];
    onMessagesUpdate(win.id, withUser);
    setIsTyping(true);

    const assistantId = `a_${Date.now()}`;
    const provider = win.providerId;
    let accumulated = "";

    const assistantBase: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      provider,
      model: providerName,
    };

    onMessagesUpdate(win.id, [...withUser, assistantBase]);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      await streamChatCompletion(
        provider,
        withUser,
        (token) => {
          accumulated += token;
          onMessagesUpdate(win.id, [
            ...withUser,
            { ...assistantBase, content: accumulated },
          ]);
        },
        () => {
          setIsTyping(false);
          abortRef.current = null;
        },
        abort.signal
      );
    } catch {
      onMessagesUpdate(win.id, [
        ...withUser,
        { ...assistantBase, content: accumulated || "Connection error. Please try again." },
      ]);
      setIsTyping(false);
    }
  }, [win.id, win.messages, win.providerId, providerName, onMessagesUpdate, piiEnabled]);

  const handleSaveConversation = useCallback(() => {
    const convId = win.conversationId ?? `conv_${win.id}_${Date.now()}`;
    saveConversation(convId, win.providerId, win.messages);
    toast.success("Conversation saved");
  }, [win]);

  const handleResumeConversation = useCallback((conv: SavedConversation) => {
    onMessagesUpdate(win.id, conv.messages);
    toast.success(`Resumed: ${conv.title}`);
  }, [win.id, onMessagesUpdate]);

  const clearChat = useCallback(() => {
    onMessagesUpdate(win.id, [{
      id: `sys_${Date.now()}`,
      role: "assistant",
      content: "Chat cleared. How can I help you?",
      timestamp: Date.now(),
      provider: win.providerId,
      model: providerName,
    }]);
  }, [win.id, win.providerId, providerName, onMessagesUpdate]);

  // Minimized pill
  if (win.minimized) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={() => onMinimize(win.id)}
        className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-shadow"
        style={{ zIndex: win.zIndex }}
      >
        <span className="text-sm">{providerIcon}</span>
        <span className="text-[10px] font-semibold text-foreground">{providerName}</span>
        {isTyping && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
        <Button
          variant="ghost" size="icon" className="h-4 w-4 ml-1"
          onClick={e => { e.stopPropagation(); onClose(win.id); }}
        >
          <X className="w-2.5 h-2.5" />
        </Button>
      </motion.button>
    );
  }

  const isMobile = window.innerWidth < 480;

  const style: React.CSSProperties = isMaximized
    ? { position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 999 }
    : isMobile
      ? { position: "fixed", inset: 8, width: "auto", height: "auto", zIndex: win.zIndex }
      : layoutMode === "floating"
        ? { position: "fixed", left: win.position.x, top: win.position.y, width: win.size.w, height: win.size.h, zIndex: win.zIndex }
        : { width: win.size.w, height: win.size.h, zIndex: win.zIndex };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={style}
      onMouseDown={() => onFocus(win.id)}
    >
      {/* Header — draggable */}
      <div
        className={`px-3 py-2.5 border-b border-border flex items-center justify-between bg-card flex-shrink-0 select-none ${
          layoutMode === "floating" && !isMaximized ? "cursor-move" : ""
        }`}
        onMouseDown={layoutMode === "floating" ? onDragStart : undefined}
      >
        <div className="flex items-center gap-2 min-w-0">
          {layoutMode === "floating" && <GripHorizontal className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />}
          <span className="text-base flex-shrink-0">{providerIcon}</span>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground truncate">{providerName}</h3>
            <p className="text-[9px] text-muted-foreground flex items-center gap-1">
              {isConnected
                ? <><Wifi className="w-2.5 h-2.5 text-green-500" /> Connected</>
                : <><WifiOff className="w-2.5 h-2.5 text-destructive" /> Disconnected</>
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {isTyping && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={stopGeneration}>
                  <StopCircle className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-[10px]">Stop</p></TooltipContent>
            </Tooltip>
          )}
          <AIChatHistory providerId={win.providerId} onResume={handleResumeConversation} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={handleSaveConversation}>
                <Save className="w-3 h-3 mr-1.5" /> Save conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPiiEnabled(!piiEnabled)}>
                <Shield className="w-3 h-3 mr-1.5" /> PII Scrubbing {piiEnabled ? "✓" : ""}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearChat}>
                <Trash2 className="w-3 h-3 mr-1.5" /> Clear chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMinimize(win.id)}>
                <Minus className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-[10px]">Minimize</p></TooltipContent>
          </Tooltip>
          {layoutMode === "floating" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleMaximize}>
                  {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-[10px]">{isMaximized ? "Restore" : "Maximize"}</p></TooltipContent>
            </Tooltip>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onClose(win.id)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <AIChatMessages
        messages={win.messages}
        isTyping={isTyping}
        providerIcon={providerIcon}
        providerId={win.providerId}
        conversationId={win.conversationId}
      />

      {/* Input */}
      <AIChatInput onSend={handleSend} disabled={!isConnected} isTyping={isTyping} />

      {/* Resize handles (floating mode only, not mobile) */}
      {layoutMode === "floating" && !isMaximized && !isMobile && (
        <>
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={e => onResizeStart(e, "br")} />
          <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize" onMouseDown={e => onResizeStart(e, "bl")} />
          <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize" onMouseDown={e => onResizeStart(e, "tr")} />
          <div className="absolute bottom-0 left-4 right-4 h-1 cursor-s-resize" onMouseDown={e => onResizeStart(e, "b")} />
          <div className="absolute top-0 left-4 right-4 h-1 cursor-n-resize" onMouseDown={e => onResizeStart(e, "t")} />
          <div className="absolute right-0 top-4 bottom-4 w-1 cursor-e-resize" onMouseDown={e => onResizeStart(e, "r")} />
          <div className="absolute left-0 top-4 bottom-4 w-1 cursor-w-resize" onMouseDown={e => onResizeStart(e, "l")} />
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 pointer-events-none">
            <svg viewBox="0 0 10 10" className="text-muted-foreground/30">
              <circle cx="8" cy="8" r="1" fill="currentColor" />
              <circle cx="4" cy="8" r="1" fill="currentColor" />
              <circle cx="8" cy="4" r="1" fill="currentColor" />
            </svg>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AIChatWindow;
