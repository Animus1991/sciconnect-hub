import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight,
  Plus, ExternalLink, Bell, BookOpen, GraduationCap, FlaskConical,
  Target, Star, Link2, Filter, CheckCircle2, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/* ─── Types ─── */
type EventType = "deadline" | "conference" | "mentorship" | "event" | "review" | "funding";
interface CalEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  type: EventType;
  description: string;
  link?: string;
  rsvp?: boolean;
}

/* ─── Mock Events ─── */
const EVENTS: CalEvent[] = [
  { id: "e1", title: "NeurIPS 2026 Submission Deadline", date: "2026-03-28", time: "23:59 UTC", type: "deadline", description: "Main conference paper submission deadline. All papers must be submitted via the CMT portal.", link: "#", rsvp: false },
  { id: "e2", title: "Mentorship Session — Prof. Chen", date: "2026-03-25", time: "14:00 UTC", type: "mentorship", description: "Monthly mentorship check-in covering research progress, publication strategy, and career goals.", location: "Zoom", rsvp: true },
  { id: "e3", title: "Peer Review Due — Physical Review X", date: "2026-03-27", time: "23:59 UTC", type: "review", description: "Reviewer deadline for manuscript PRX-2026-0201: Quantum error correction in topological qubits.", link: "#", rsvp: false },
  { id: "e4", title: "ERC Starting Grant Letters of Intent", date: "2026-04-02", time: "17:00 Brussels", type: "funding", description: "European Research Council Starting Grant — letters of intent submission window closes.", link: "#", rsvp: false },
  { id: "e5", title: "Open Science Symposium 2026", date: "2026-04-10", time: "09:00 UTC", type: "conference", description: "Annual symposium on open science, reproducible research, and preprint culture. Virtual + hybrid.", location: "Virtual (+ Geneva)", rsvp: true },
  { id: "e6", title: "Quantum Computing Workshop", date: "2026-04-15", time: "10:00 UTC", type: "event", description: "Hands-on workshop on quantum circuit design and error mitigation. Limited to 30 participants.", location: "MIT Q-Lab, Cambridge", rsvp: false },
  { id: "e7", title: "ICLR 2026 — Paper Decisions Released", date: "2026-04-20", type: "deadline", description: "Author notification day for ICLR 2026. Camera-ready deadline follows 2 weeks after.", rsvp: false },
  { id: "e8", title: "Lab Group Meeting — Monthly", date: "2026-04-22", time: "11:00 UTC", type: "event", description: "Monthly full lab group meeting. Presentations from Dr. Tanaka and Dr. Vasquez.", location: "Room 3.14, Science Building", rsvp: true },
  { id: "e9", title: "NSF CAREER Award Deadline", date: "2026-05-01", time: "17:00 ET", type: "funding", description: "NSF Faculty Early Career Development Program deadline. Proposals must go through institutional sponsored research office.", rsvp: false },
  { id: "e10", title: "ICML 2026 Submission Deadline", date: "2026-05-15", time: "23:59 AoE", type: "deadline", description: "International Conference on Machine Learning main track submission deadline.", link: "#", rsvp: false },
];

/* ─── Config ─── */
const TYPE_CONFIG: Record<EventType, { icon: typeof CalendarIcon; label: string; color: string; bg: string }> = {
  deadline: { icon: AlertCircle, label: "Deadline", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800" },
  conference: { icon: BookOpen, label: "Conference", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
  mentorship: { icon: GraduationCap, label: "Mentorship", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800" },
  event: { icon: Users, label: "Event", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" },
  review: { icon: CheckCircle2, label: "Peer Review", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
  funding: { icon: Target, label: "Funding", color: "text-primary", bg: "bg-primary/5 border-primary/20" },
};

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Event Card ─── */
function EventCard({ event, onRSVP }: { event: CalEvent; onRSVP: (id: string) => void }) {
  const cfg = TYPE_CONFIG[event.type];
  const days = daysUntil(event.date);
  const urgent = days <= 3 && days >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-xl p-4 space-y-3 ${urgent ? "border-rose-300 dark:border-rose-700 ring-1 ring-rose-200 dark:ring-rose-900" : "border-border"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} border`}>
            <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground leading-snug">{event.title}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> {formatDate(event.date)}
                {event.time && ` · ${event.time}`}
              </span>
              {event.location && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {event.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <Badge variant="secondary" className={`text-[10px] px-2 ${cfg.color} bg-transparent border ${cfg.bg}`}>
            {cfg.label}
          </Badge>
          {days >= 0 && (
            <span className={`text-[10px] font-medium ${days <= 3 ? "text-rose-600" : days <= 7 ? "text-amber-600" : "text-muted-foreground"}`}>
              {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`}
            </span>
          )}
          {days < 0 && <span className="text-[10px] text-muted-foreground/60">Passed</span>}
        </div>
      </div>

      <p className="text-[12px] text-muted-foreground leading-relaxed">{event.description}</p>

      <div className="flex items-center gap-2 pt-1">
        {event.rsvp ? (
          <button onClick={() => onRSVP(event.id)} className="flex items-center gap-1.5 px-3 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
            <CheckCircle2 className="w-3 h-3" /> Attending
          </button>
        ) : (
          <button onClick={() => onRSVP(event.id)} className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Plus className="w-3 h-3" /> RSVP
          </button>
        )}
        {event.link && (
          <button onClick={() => toast.info("Opening event page…")} className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <ExternalLink className="w-3 h-3" /> Details
          </button>
        )}
        <button onClick={() => toast.info("Added to calendar reminders")} className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-auto">
          <Bell className="w-3 h-3" /> Remind me
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main ─── */
const Calendar = () => {
  const [filter, setFilter] = useState<EventType | "all">("all");
  const [events, setEvents] = useState(EVENTS);
  const [showPast, setShowPast] = useState(false);

  const handleRSVP = (id: string) => {
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, rsvp: !e.rsvp } : e));
    const ev = events.find((e) => e.id === id);
    if (ev) toast.success(ev.rsvp ? "RSVP cancelled" : "You're attending!");
  };

  const filtered = events
    .filter((e) => filter === "all" || e.type === filter)
    .filter((e) => showPast ? true : daysUntil(e.date) >= -30)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcoming = filtered.filter((e) => daysUntil(e.date) >= 0);
  const past = filtered.filter((e) => daysUntil(e.date) < 0);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Research Calendar</h1>
                <p className="text-[13px] text-muted-foreground">Deadlines, events, mentorship, and conferences</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toast.info("Calendar integrations: Google Calendar, iCal, Outlook — coming soon")} className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-border text-[12px] text-foreground hover:bg-secondary transition-colors">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground" /> Sync Calendar
              </button>
              <button onClick={() => toast.info("Add event coming soon")} className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Event
              </button>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { type: "deadline" as EventType, label: "Deadlines" },
            { type: "conference" as EventType, label: "Conferences" },
            { type: "mentorship" as EventType, label: "Sessions" },
            { type: "funding" as EventType, label: "Funding" },
          ].map(({ type, label }) => {
            const cfg = TYPE_CONFIG[type];
            const count = events.filter((e) => e.type === type && daysUntil(e.date) >= 0).length;
            return (
              <button
                key={type}
                onClick={() => setFilter(filter === type ? "all" : type)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${filter === type ? `${cfg.bg} border-current` : "bg-card border-border hover:bg-secondary/50"}`}
              >
                <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                <p className="text-[18px] font-semibold text-foreground">{count}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </button>
            );
          })}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            All
          </button>
          {(Object.keys(TYPE_CONFIG) as EventType[]).map((t) => {
            const cfg = TYPE_CONFIG[t];
            return (
              <button key={t} onClick={() => setFilter(filter === t ? "all" : t)} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 ${filter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                <cfg.icon className="w-3 h-3" /> {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Integration Banner */}
        <div className="bg-card border border-dashed border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-[12px] text-muted-foreground">Connect Google Calendar, Outlook, or iCal to sync your research deadlines automatically.</p>
          </div>
          <button onClick={() => toast.info("Calendar integration — coming soon. Export ICS file available.")} className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-border text-[11px] text-foreground hover:bg-secondary transition-colors flex-shrink-0">
            Connect <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Upcoming Events */}
        {upcoming.length > 0 && (
          <div className="space-y-3">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Upcoming ({upcoming.length})</p>
            {upcoming.map((e) => <EventCard key={e.id} event={e} onRSVP={handleRSVP} />)}
          </div>
        )}

        {upcoming.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <CalendarIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-[14px] font-medium text-foreground mb-1">No upcoming events</p>
            <p className="text-[13px] text-muted-foreground mb-4">Add events or sync your calendar to see upcoming deadlines.</p>
            <button onClick={() => toast.info("Add event coming soon")} className="px-4 h-9 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Add First Event
            </button>
          </div>
        )}

        {/* Past Events */}
        {past.length > 0 && (
          <div className="space-y-3">
            <button onClick={() => setShowPast(!showPast)} className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showPast ? "rotate-90" : ""}`} />
              Past events ({past.length})
            </button>
            {showPast && past.map((e) => <EventCard key={e.id} event={e} onRSVP={handleRSVP} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Calendar;
