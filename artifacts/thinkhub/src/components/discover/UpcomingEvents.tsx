import { motion } from "framer-motion";
import { Calendar, MapPin, Users, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface UpcomingEvent {
  id: string;
  title: string;
  type: "conference" | "workshop" | "webinar" | "deadline";
  date: string;
  location: string;
  attendees?: number;
  relevanceScore: number;
}

const EVENTS: UpcomingEvent[] = [
  { id: "e1", title: "NeurIPS 2026", type: "conference", date: "Dec 8-14", location: "Vancouver, CA", attendees: 15000, relevanceScore: 95 },
  { id: "e2", title: "NSF CAREER Deadline", type: "deadline", date: "Jul 25", location: "Online", relevanceScore: 88 },
  { id: "e3", title: "Quantum Computing Workshop", type: "workshop", date: "Apr 3-4", location: "MIT, Boston", attendees: 200, relevanceScore: 72 },
  { id: "e4", title: "AI in Healthcare Webinar", type: "webinar", date: "Mar 20", location: "Virtual", attendees: 500, relevanceScore: 68 },
];

const typeStyles: Record<string, string> = {
  conference: "bg-scholarly/10 text-scholarly",
  workshop: "bg-info-muted text-info",
  webinar: "bg-success-muted text-success",
  deadline: "bg-destructive/10 text-destructive",
};

export function UpcomingEvents() {
  return (
    <motion.section
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-xl border border-border p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-accent" />
          <h3 className="text-[13px] font-semibold text-foreground">Upcoming Events</h3>
        </div>
        <Link to="/events" className="text-[10px] text-accent font-medium hover:underline">
          See all
        </Link>
      </div>

      <div className="space-y-2">
        {EVENTS.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.04 }}
            className="p-2 rounded-lg hover:bg-secondary/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${typeStyles[event.type]}`}>
                    {event.type}
                  </span>
                  {event.relevanceScore >= 85 && (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-accent/10 text-accent font-medium">
                      {event.relevanceScore}% match
                    </span>
                  )}
                </div>
                <h4 className="text-[11px] font-medium text-foreground leading-snug group-hover:text-accent transition-colors">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
                  <span>{event.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />{event.location}
                  </span>
                  {event.attendees && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" />{event.attendees.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
