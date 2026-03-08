import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Monitor, MonitorOff,
  Users, X, Maximize2, Minimize2, MoreVertical, Hand, MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import type { Contact } from "./types";

export type CallType = "voice" | "video";
export type CallState = "ringing" | "active" | "ended";

interface CallParticipant {
  contact: Contact;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
}

interface CallOverlayProps {
  callType: CallType;
  participants: Contact[];
  onEndCall: () => void;
  callerName: string;
}

const CallOverlay = ({ callType, participants, onEndCall, callerName }: CallOverlayProps) => {
  const [callState, setCallState] = useState<CallState>("ringing");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === "video");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [handRaised, setHandRaised] = useState(false);

  const [callParticipants, setCallParticipants] = useState<CallParticipant[]>(() =>
    participants.map(c => ({
      contact: c,
      isMuted: false,
      isVideoOff: Math.random() > 0.5,
      isSpeaking: false,
      isScreenSharing: false,
    }))
  );

  // Auto-accept after 2s
  useEffect(() => {
    if (callState === "ringing") {
      const t = setTimeout(() => setCallState("active"), 2000);
      return () => clearTimeout(t);
    }
  }, [callState]);

  // Timer
  useEffect(() => {
    if (callState !== "active") return;
    const i = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(i);
  }, [callState]);

  // Simulate speaking
  useEffect(() => {
    if (callState !== "active") return;
    const i = setInterval(() => {
      setCallParticipants(prev => prev.map(p => ({
        ...p,
        isSpeaking: Math.random() > 0.7,
      })));
    }, 1500);
    return () => clearInterval(i);
  }, [callState]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const allParticipants: CallParticipant[] = [
    { contact: { id: "me", name: "You", initials: "YO", status: "online" }, isMuted, isVideoOff: !isVideoOn, isSpeaking: false, isScreenSharing },
    ...callParticipants,
  ];

  const gridCols = allParticipants.length <= 2 ? "grid-cols-1 sm:grid-cols-2" :
    allParticipants.length <= 4 ? "grid-cols-2" :
    allParticipants.length <= 6 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-4";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col ${isFullscreen ? "fixed" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${callState === "active" ? "bg-success animate-pulse" : callState === "ringing" ? "bg-gold animate-pulse" : "bg-destructive"}`} />
          <div>
            <h3 className="text-sm font-display font-semibold text-foreground">
              {callType === "video" ? "Video Call" : "Voice Call"} — {callerName}
            </h3>
            <p className="text-[11px] text-muted-foreground font-display tabular-nums">
              {callState === "ringing" ? "Connecting…" : callState === "active" ? formatTime(elapsed) : "Call ended"}
              {" · "}{allParticipants.length} participants
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isScreenSharing && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-display font-medium mr-2">
              <Monitor className="w-3 h-3" /> Sharing screen
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</p></TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Participant Grid */}
      <div className="flex-1 p-3 sm:p-4 overflow-hidden">
        {callState === "ringing" ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Avatar className="w-24 h-24 ring-4 ring-accent/20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-display font-bold">
                  {participants[0]?.initials ?? "?"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <p className="text-lg font-display font-semibold text-foreground">{callerName}</p>
            <p className="text-sm text-muted-foreground font-display animate-pulse">Calling…</p>
          </div>
        ) : (
          <div className={`grid ${gridCols} gap-2 sm:gap-3 h-full auto-rows-fr`}>
            {allParticipants.map((p) => (
              <div
                key={p.contact.id}
                className={`relative rounded-xl overflow-hidden flex items-center justify-center transition-all ${
                  p.isScreenSharing
                    ? "bg-secondary/10 border-2 border-accent/30 col-span-2 row-span-2"
                    : "bg-secondary/20 border border-border/50"
                } ${p.isSpeaking ? "ring-2 ring-success/50" : ""}`}
              >
                {/* Video placeholder or avatar */}
                {p.isVideoOff || callType === "voice" ? (
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className={`${allParticipants.length <= 2 ? "w-20 h-20" : "w-14 h-14"} ring-2 ${p.isSpeaking ? "ring-success" : "ring-border/50"}`}>
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-display font-bold">
                        {p.contact.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-display font-medium text-foreground/80">{p.contact.id === "me" ? "You" : p.contact.name}</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-secondary/10 flex items-center justify-center">
                    <Avatar className="w-16 h-16 ring-2 ring-border/30">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-display font-bold">
                        {p.contact.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                {/* Screen sharing indicator */}
                {p.isScreenSharing && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/80 text-destructive-foreground">
                    <Monitor className="w-3 h-3" />
                    <span className="text-[9px] font-display font-semibold">Screen</span>
                  </div>
                )}

                {/* Status indicators */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  {p.isMuted && (
                    <div className="w-6 h-6 rounded-full bg-destructive/80 flex items-center justify-center">
                      <MicOff className="w-3 h-3 text-destructive-foreground" />
                    </div>
                  )}
                  {p.isVideoOff && callType === "video" && (
                    <div className="w-6 h-6 rounded-full bg-secondary/80 flex items-center justify-center">
                      <VideoOff className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Name label */}
                <div className="absolute bottom-2 right-2">
                  <span className="text-[10px] font-display font-medium text-foreground/60 bg-background/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                    {p.contact.id === "me" ? "You" : p.contact.name.split(" ").pop()}
                  </span>
                </div>

                {/* Speaking indicator */}
                {p.isSpeaking && (
                  <div className="absolute top-2 right-2">
                    <div className="flex gap-0.5 items-end h-4">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1 bg-success rounded-full"
                          animate={{ height: [4, 12, 4] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-4 border-t border-border/50 flex-shrink-0">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{isMuted ? "Unmute" : "Mute"}</p></TooltipContent>
          </Tooltip>

          {callType === "video" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={!isVideoOn ? "destructive" : "outline"}
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">{isVideoOn ? "Camera off" : "Camera on"}</p></TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
              >
                {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{isScreenSharing ? "Stop sharing" : "Share screen"}</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={handRaised ? "default" : "outline"}
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={() => setHandRaised(!handRaised)}
              >
                <Hand className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{handRaised ? "Lower hand" : "Raise hand"}</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-full">
                <MessageSquare className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">In-call chat</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-full">
                <Users className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Participants</p></TooltipContent>
          </Tooltip>

          {/* End call */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full ml-2"
                onClick={() => {
                  setCallState("ended");
                  setTimeout(onEndCall, 1000);
                }}
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">End call</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
};

export default CallOverlay;
