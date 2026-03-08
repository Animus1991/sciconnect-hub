import {
  Phone, Video, Search, MoreVertical, ArrowLeft, Shield, ShieldCheck, ShieldAlert,
  Pin, Bell, BellOff, Archive, Trash2, Info, Link2, Download, Lock, Unlock, Bot
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Conversation, BlockchainLevel } from "./types";
import { blockchainLevels } from "./types";
import { toast } from "sonner";

interface ChatHeaderProps {
  conversation: Conversation;
  isMobile: boolean;
  showInfo: boolean;
  onBack: () => void;
  onToggleInfo: () => void;
  onToggleSearch: () => void;
  onSetBlockchainLevel: (level: BlockchainLevel) => void;
  onToggleNDA: () => void;
  onExportLabRecord: () => void;
  onStartCall: (type: "voice" | "video") => void;
  onToggleAICopilot: () => void;
}

const ChatHeader = ({ conversation, isMobile, showInfo, onBack, onToggleInfo, onToggleSearch, onSetBlockchainLevel, onToggleNDA, onExportLabRecord, onStartCall, onToggleAICopilot }: ChatHeaderProps) => {
  const isOnline = conversation.type === "direct" && conversation.online;
  const statusText = conversation.type === "group"
    ? `${conversation.participants.length + 1} members`
    : isOnline ? "Online"
    : conversation.participants[0]?.lastSeen ? `Last seen ${conversation.participants[0].lastSeen}` : "Offline";

  const bcLevel = conversation.blockchainLevel;
  const isNDA = conversation.ndaStatus === "accepted";

  const BlockchainIcon = bcLevel === "mutual" ? ShieldAlert : bcLevel === "unilateral" ? ShieldCheck : Shield;
  const bcColor = bcLevel === "mutual" ? "text-success" : bcLevel === "unilateral" ? "text-gold" : "text-muted-foreground/40";

  return (
    <div className="h-14 px-3 sm:px-4 flex items-center justify-between border-b border-border bg-card flex-shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        {isMobile && (
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <button onClick={onToggleInfo} className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
          <div className="relative flex-shrink-0">
            <Avatar className="w-9 h-9 ring-1 ring-border">
              <AvatarFallback className={`font-display font-semibold text-xs ${
                conversation.type === "group" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
              }`}>
                {conversation.initials}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-card" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-display font-semibold text-foreground truncate">{conversation.name}</h2>
              {bcLevel !== "off" && (
                <Tooltip>
                  <TooltipTrigger>
                    <BlockchainIcon className={`w-3.5 h-3.5 flex-shrink-0 ${bcColor}`} />
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{blockchainLevels.find(b => b.level === bcLevel)?.label}</p></TooltipContent>
                </Tooltip>
              )}
              {isNDA && (
                <Tooltip>
                  <TooltipTrigger>
                    <Lock className="w-3 h-3 text-destructive flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">NDA Protected</p></TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] text-muted-foreground font-display flex items-center gap-1">
                {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />}
                {statusText}
              </p>
              {conversation.linkedProject && (
                <span className="text-[10px] text-accent/70 font-display flex items-center gap-0.5">
                  <Link2 className="w-2.5 h-2.5" />
                  {conversation.linkedProject}
                </span>
              )}
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        {/* Blockchain level indicator — clickable */}
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`h-8 w-8 ${bcLevel !== "off" ? "text-success" : ""}`}>
                  <BlockchainIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-display font-semibold text-foreground">IP Verification Level</p>
                  <p className="text-[10px] text-muted-foreground">Blockchain-backed proof of authorship</p>
                </div>
                {blockchainLevels.map(b => (
                  <DropdownMenuItem
                    key={b.level}
                    onClick={() => onSetBlockchainLevel(b.level)}
                    className={`text-xs gap-2 ${bcLevel === b.level ? "bg-secondary" : ""}`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      b.level === "off" ? "bg-muted-foreground/30" : b.level === "unilateral" ? "bg-gold" : "bg-success"
                    }`} />
                    <div>
                      <p className="font-medium">{b.label}</p>
                      <p className="text-[10px] text-muted-foreground">{b.description}</p>
                    </div>
                    {bcLevel === b.level && <span className="ml-auto text-[10px] text-accent">Active</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Blockchain verification</p></TooltipContent>
        </Tooltip>

        {!isMobile && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStartCall("voice")}>
                  <Phone className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Voice call</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStartCall("video")}>
                  <Video className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Video call</p></TooltipContent>
            </Tooltip>
          </>
        )}
        {!isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleAICopilot}>
                <Bot className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">AI Co-pilot</p></TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Search</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost" size="icon"
              className={`h-8 w-8 ${showInfo ? "bg-accent/10 text-accent" : ""}`}
              onClick={onToggleInfo}
            >
              <Info className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Details</p></TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {isMobile && (
              <>
                <DropdownMenuItem className="text-xs gap-2" onClick={() => onStartCall("voice")}>
                  <Phone className="w-3.5 h-3.5" /> Voice call
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs gap-2" onClick={() => onStartCall("video")}>
                  <Video className="w-3.5 h-3.5" /> Video call
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem className="text-xs gap-2">
              <Pin className="w-3.5 h-3.5" /> Pinned messages
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" onClick={onToggleNDA}>
              {isNDA ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {isNDA ? "Disable NDA Mode" : "Enable NDA Mode"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" onClick={onExportLabRecord}>
              <Download className="w-3.5 h-3.5" /> Export as Lab Record
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs gap-2">
              {conversation.muted ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              {conversation.muted ? "Unmute" : "Mute"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2">
              <Archive className="w-3.5 h-3.5" /> Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs gap-2 text-destructive">
              <Trash2 className="w-3.5 h-3.5" /> Delete conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;
