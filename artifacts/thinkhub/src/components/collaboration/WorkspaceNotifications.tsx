import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Edit3, MessageSquare, FileText, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface WorkspaceEvent {
  id: string;
  type: "editing" | "message" | "comment" | "upload";
  user: string;
  target: string;
  workspace: string;
  timestamp: Date;
  read: boolean;
}

const eventIcons = {
  editing: <Edit3 className="w-3.5 h-3.5 text-accent" />,
  message: <MessageSquare className="w-3.5 h-3.5 text-primary" />,
  comment: <MessageSquare className="w-3.5 h-3.5 text-gold" />,
  upload: <FileText className="w-3.5 h-3.5 text-emerald" />,
};

const eventText = (e: WorkspaceEvent) => {
  switch (e.type) {
    case "editing": return `started editing "${e.target}"`;
    case "message": return `sent a message in #${e.target}`;
    case "comment": return `commented on "${e.target}"`;
    case "upload": return `uploaded "${e.target}"`;
  }
};

const timeAgo = (d: Date) => {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

// Simulated live events
const simulatedEvents: Omit<WorkspaceEvent, "id" | "timestamp" | "read">[] = [
  { type: "editing", user: "Dr. Sarah Chen", target: "Abstract", workspace: "Quantum ML Paper Draft" },
  { type: "message", user: "Prof. James Wilson", target: "quantum-ml-paper", workspace: "Quantum ML Paper Draft" },
  { type: "comment", user: "Maria Garcia", target: "Main Manuscript", workspace: "Quantum ML Paper Draft" },
  { type: "upload", user: "Dr. Emily Park", target: "pipeline-config-v2.yaml", workspace: "Neuroimaging Pipeline Review" },
  { type: "editing", user: "Prof. Klaus Richter", target: "Project Narrative", workspace: "Grant Proposal — EU Horizon 2027" },
  { type: "message", user: "Dr. Yuki Tanaka", target: "general", workspace: "Grant Proposal — EU Horizon 2027" },
];

interface WorkspaceNotificationsProps {
  onEventCount?: (count: number) => void;
}

const WorkspaceNotifications = ({ onEventCount }: WorkspaceNotificationsProps) => {
  const [events, setEvents] = useState<WorkspaceEvent[]>(() => {
    // Seed with a few recent events
    return simulatedEvents.slice(0, 3).map((e, i) => ({
      ...e,
      id: `evt_${i}`,
      timestamp: new Date(Date.now() - (i + 1) * 120000),
      read: false,
    }));
  });

  const unreadCount = events.filter(e => !e.read).length;

  useEffect(() => {
    onEventCount?.(unreadCount);
  }, [unreadCount, onEventCount]);

  // Simulate incoming events
  useEffect(() => {
    const interval = setInterval(() => {
      const template = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)];
      const newEvent: WorkspaceEvent = {
        ...template,
        id: `evt_${Date.now()}`,
        timestamp: new Date(),
        read: false,
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 20));
    }, 15000); // every 15s
    return () => clearInterval(interval);
  }, []);

  const markRead = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  };

  const markAllRead = () => {
    setEvents(prev => prev.map(e => ({ ...e, read: true })));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-serif text-sm font-semibold text-foreground">Activity Feed</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-[9px] font-display bg-accent/10 text-accent">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[10px] font-display text-accent hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {events.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                onClick={() => markRead(event.id)}
                className={`flex items-start gap-2.5 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  event.read
                    ? "bg-transparent hover:bg-secondary/30"
                    : "bg-accent/5 hover:bg-accent/10"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">{eventIcons[event.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-display text-foreground">
                    <span className="font-semibold">{event.user}</span>{" "}
                    <span className="text-muted-foreground">{eventText(event)}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-display mt-0.5">
                    {event.workspace} · {timeAgo(event.timestamp)}
                  </p>
                </div>
                {!event.read && (
                  <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

export default WorkspaceNotifications;
