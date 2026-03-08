import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Calendar, MapPin, Globe, Users, Video, ExternalLink, Plus, Clock, Tag, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const events = [
  {
    title: "NeurIPS 2026",
    type: "conference",
    date: "Dec 6-12, 2026",
    location: "Vancouver, Canada",
    mode: "hybrid",
    deadline: "May 15, 2026",
    daysToDeadline: 70,
    tags: ["AI", "Machine Learning"],
    attending: true,
    attendees: 12400,
  },
  {
    title: "CRISPR & Gene Editing Summit",
    type: "conference",
    date: "Sep 18-20, 2026",
    location: "Boston, MA",
    mode: "in-person",
    deadline: "Jun 1, 2026",
    daysToDeadline: 87,
    tags: ["Biology", "Gene Editing"],
    attending: false,
    attendees: 2800,
  },
  {
    title: "Open Science Global Workshop",
    type: "workshop",
    date: "Apr 22-23, 2026",
    location: "Online",
    mode: "virtual",
    deadline: "Mar 25, 2026",
    daysToDeadline: 19,
    tags: ["Open Science", "Reproducibility"],
    attending: true,
    attendees: 5600,
  },
  {
    title: "Quantum Computing Seminar Series",
    type: "seminar",
    date: "Every Thursday",
    location: "MIT + Zoom",
    mode: "hybrid",
    deadline: null,
    daysToDeadline: null,
    tags: ["Quantum", "Physics"],
    attending: true,
    attendees: 340,
  },
  {
    title: "Climate Modeling Hackathon",
    type: "hackathon",
    date: "Jul 10-12, 2026",
    location: "ETH Zürich",
    mode: "in-person",
    deadline: "Jun 15, 2026",
    daysToDeadline: 101,
    tags: ["Climate", "Coding"],
    attending: false,
    attendees: 200,
  },
  {
    title: "Academic Writing Masterclass",
    type: "workshop",
    date: "Mar 28, 2026",
    location: "Online",
    mode: "virtual",
    deadline: "Mar 20, 2026",
    daysToDeadline: 14,
    tags: ["Writing", "Career"],
    attending: false,
    attendees: 890,
  },
];

const modeStyles: Record<string, string> = {
  "in-person": "bg-success/10 text-success border-success/20",
  virtual: "bg-info/10 text-info border-info/20",
  hybrid: "bg-highlight/10 text-highlight border-highlight/20",
};

const typeIcons: Record<string, string> = {
  conference: "🎓",
  workshop: "🔧",
  seminar: "📢",
  hackathon: "💻",
};

const typeFilters = ["All", "conference", "workshop", "seminar", "hackathon"] as const;
type TypeFilter = typeof typeFilters[number];

const Events = () => {
  const [eventList, setEventList] = useState(events);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");

  const toggleAttending = (title: string) => {
    setEventList(prev => prev.map(e => {
      if (e.title !== title) return e;
      const next = !e.attending;
      if (next) toast.success(`Registered for ${title}`);
      else toast.info(`Unregistered from ${title}`);
      return { ...e, attending: next };
    }));
  };

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filtered = useMemo(() => {
    let result = eventList;
    if (typeFilter !== "All") result = result.filter(e => e.type === typeFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [eventList, debouncedSearch, typeFilter]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Events & Conferences</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Discover conferences, workshops, and seminars. Track submission deadlines.
              </p>
            </div>
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
        </motion.div>

        {/* Upcoming Deadlines Banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gradient-scholarly rounded-xl p-5 mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,hsl(40_90%_50%),transparent_60%)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gold" />
              <span className="text-xs font-display font-semibold tracking-wider uppercase text-gold">Upcoming Deadlines</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {events
                .filter((e) => e.daysToDeadline !== null && e.daysToDeadline <= 30)
                .map((e) => (
                  <div key={e.title} className="flex items-center gap-2">
                    <span className="text-sm font-display text-primary-foreground font-medium">{e.title}</span>
                    <Badge variant="outline" className="text-[10px] font-display border-gold/30 text-gold">
                      {e.daysToDeadline}d left
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Type filter pills */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {typeFilters.map(type => {
            const count = type === "All" ? events.length : events.filter(e => e.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all capitalize ${
                  typeFilter === type
                    ? "bg-accent/10 border-accent text-accent"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-accent/30"
                }`}
              >
                {type !== "All" && <span>{typeIcons[type]}</span>}
                {type === "All" ? "All Events" : type}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                  typeFilter === type ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                }`}>{count}</span>
              </button>
            );
          })}
        </div>

        <Tabs defaultValue="all">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="all" className="font-display text-sm">All Events</TabsTrigger>
            <TabsTrigger value="attending" className="font-display text-sm">Attending</TabsTrigger>
            <TabsTrigger value="deadlines" className="font-display text-sm">Deadlines</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground font-display">No events match your search</p>
              </div>
            ) : filtered.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">{typeIcons[event.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                        {event.title}
                      </h3>
                      <Badge variant="outline" className={`text-[10px] font-display ${modeStyles[event.mode]}`}>
                        {event.mode === "virtual" && <Video className="w-3 h-3 mr-1" />}
                        {event.mode}
                      </Badge>
                      {event.attending && (
                         <Badge variant="outline" className="text-[10px] font-display text-success border-success/20 bg-success/10">
                          Attending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-display mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.attendees.toLocaleString()}</span>
                      {event.deadline && (
                        <span className={`flex items-center gap-1 ${event.daysToDeadline! < 21 ? "text-amber-400" : ""}`}>
                          <Clock className="w-3 h-3" /> Deadline: {event.deadline}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] font-display">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAttending(event.title)}
                    className={`text-xs font-display font-semibold flex-shrink-0 px-3 py-1.5 rounded-lg transition-all ${
                      event.attending
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "text-accent hover:bg-accent/10"
                    }`}
                  >
                    {event.attending ? "✓ Attending" : "Register"}
                  </button>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="attending" className="space-y-3">
            {eventList
              .filter((e) => e.attending)
              .map((event, i) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeIcons[event.type]}</span>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground">{event.title}</h3>
                      <p className="text-[11px] text-muted-foreground font-display">{event.date} · {event.location}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-3">
            {events
              .filter((e) => e.deadline)
              .sort((a, b) => (a.daysToDeadline || 999) - (b.daysToDeadline || 999))
              .map((event, i) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-lg ${
                    event.daysToDeadline! < 21 ? "bg-amber-500/10 text-amber-400" : "bg-secondary text-foreground"
                  }`}>
                    {event.daysToDeadline}d
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-foreground text-sm">{event.title}</h3>
                    <p className="text-[11px] text-muted-foreground font-display">Deadline: {event.deadline}</p>
                  </div>
                  <button className="h-8 px-3 rounded-lg bg-accent text-accent-foreground text-xs font-display font-semibold">
                    Submit
                  </button>
                </motion.div>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Events;
