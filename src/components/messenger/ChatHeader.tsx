import {
  Phone, Video, Search, MoreVertical, ArrowLeft, Shield, ShieldCheck,
  Pin, Bell, BellOff, Archive, Trash2, Info, Link2, Download
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { Conversation } from "./types";
import { toast } from "sonner";

interface ChatHeaderProps {
  conversation: Conversation;
  isMobile: boolean;
  showInfo: boolean;
  onBack: () => void;
  onToggleInfo: () => void;
  onToggleSearch: () => void;
}

const ChatHeader = ({ conversation, isMobile, showInfo, onBack, onToggleInfo, onToggleSearch }: ChatHeaderProps) => {
  const isOnline = conversation.type === "direct" && conversation.online;
  const statusText = conversation.type === "group"
    ? `${conversation.participants.length + 1} members`
    : isOnline
      ? "Online"
      : conversation.participants[0]?.lastSeen
        ? `Last seen ${conversation.participants[0].lastSeen}`
        : "Offline";

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
              {conversation.blockchainEnabled && (
                <Tooltip>
                  <TooltipTrigger>
                    <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Blockchain verified</p></TooltipContent>
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
        {!isMobile && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Voice call starting…")}>
                  <Phone className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Voice call</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Video call starting…")}>
                  <Video className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Video call</p></TooltipContent>
            </Tooltip>
          </>
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
              variant="ghost"
              size="icon"
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
                <DropdownMenuItem className="text-xs gap-2" onClick={() => toast.info("Voice call starting…")}>
                  <Phone className="w-3.5 h-3.5" /> Voice call
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs gap-2" onClick={() => toast.info("Video call starting…")}>
                  <Video className="w-3.5 h-3.5" /> Video call
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem className="text-xs gap-2">
              <Pin className="w-3.5 h-3.5" /> Pinned messages
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Blockchain verification
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2">
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
