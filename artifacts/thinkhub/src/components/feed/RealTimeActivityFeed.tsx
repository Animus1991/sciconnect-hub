import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, RefreshCw, Bell, BellOff, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface ActivityEvent {
  id: string;
  initials: string;
  name: string;
  action: string;
  target: string;
  time: string;
  emoji: string;
  type: "publication" | "citation" | "discussion" | "dataset" | "project" | "review";
  isNew?: boolean;
}

const ACTIVITY_POOL: ActivityEvent[] = [
  { id: "rt-1", initials: "MC", name: "M. Chen", action: "published", target: "Attention Mechanisms in Transformers", time: "just now", emoji: "📄", type: "publication" },
  { id: "rt-2", initials: "PS", name: "P. Singh", action: "started a discussion on", target: "CRISPR delivery methods", time: "2m", emoji: "💬", type: "discussion" },
  { id: "rt-3", initials: "EV", name: "E. Vasquez", action: "cited your paper", target: "Climate Model Validation", time: "5m", emoji: "🔗", type: "citation" },
  { id: "rt-4", initials: "LP", name: "L. Park", action: "joined project", target: "Quantum Error Correction", time: "8m", emoji: "🔬", type: "project" },
  { id: "rt-5", initials: "OH", name: "O. Hassan", action: "shared a dataset", target: "Bioethics Survey Results", time: "12m", emoji: "📊", type: "dataset" },
  { id: "rt-6", initials: "SM", name: "S. Martin", action: "submitted a review for", target: "Neural ODE Methods", time: "15m", emoji: "✅", type: "review" },
  { id: "rt-7", initials: "AK", name: "A. Kim", action: "published", target: "Graph Neural Networks for Drug Discovery", time: "18m", emoji: "📄", type: "publication" },
  { id: "rt-8", initials: "JW", name: "J. Wang", action: "cited your paper", target: "Reinforcement Learning Survey", time: "22m", emoji: "🔗", type: "citation" },
  { id: "rt-9", initials: "RB", name: "R. Brown", action: "started a discussion on", target: "Quantum supremacy claims", time: "30m", emoji: "💬", type: "discussion" },
  { id: "rt-10", initials: "TN", name: "T. Nguyen", action: "shared a dataset", target: "COVID-19 Variant Sequences", time: "35m", emoji: "📊", type: "dataset" },
];

const typeColors: Record<string, string> = {
  publication: "bg-scholarly/10 text-scholarly",
  citation: "bg-success-muted text-success",
  discussion: "bg-info-muted text-info",
  dataset: "bg-warning-muted text-warning",
  project: "bg-accent/10 text-accent",
  review: "bg-primary/10 text-primary",
};

export function RealTimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>(ACTIVITY_POOL.slice(0, 5));
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time polling
  useEffect(() => {
    if (!liveEnabled) return;
    const interval = setInterval(() => {
      const pool = ACTIVITY_POOL.filter(a => !activities.find(e => e.id === a.id));
      if (pool.length === 0) return;
      const next = { ...pool[Math.floor(Math.random() * pool.length)], isNew: true, time: "just now", id: `rt-live-${Date.now()}` };
      setActivities(prev => [next, ...prev].slice(0, 8));
      setNewCount(prev => prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, [liveEnabled, activities]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      const shuffled = [...ACTIVITY_POOL].sort(() => Math.random() - 0.5).slice(0, 5).map(a => ({ ...a, isNew: true }));
      setActivities(shuffled);
      setNewCount(0);
      setIsRefreshing(false);
      toast.success("Feed refreshed");
    }, 600);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-card rounded-xl border border-border p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {liveEnabled && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveEnabled ? "bg-success" : "bg-muted-foreground"}`} />
          </span>
          <h3 className="text-[13px] font-semibold text-foreground">Live Activity</h3>
          {newCount > 0 && (
            <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 bg-success text-success-foreground">
              +{newCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => { setLiveEnabled(p => !p); toast(liveEnabled ? "Live updates paused" : "Live updates resumed"); }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${liveEnabled ? "text-success hover:bg-success-muted" : "text-muted-foreground hover:bg-secondary"}`}
            title={liveEnabled ? "Pause live" : "Resume live"}
          >
            {liveEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {activities.map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, x: -12, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${a.isNew ? "bg-accent/5 border border-accent/10" : "hover:bg-secondary/40"}`}
            >
              <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                <AvatarFallback className="bg-scholarly text-primary-foreground text-[9px] font-bold">
                  {a.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-foreground leading-snug">
                  <span className="font-semibold">{a.name}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>
                </p>
                <p className="text-[11px] text-accent truncate">{a.emoji} {a.target}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground/60">{a.time} ago</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${typeColors[a.type] || ""}`}>
                    {a.type}
                  </span>
                </div>
              </div>
              {a.isNew && <Zap className="w-3.5 h-3.5 text-warning shrink-0 mt-1" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Link to="/activity" className="block mt-3 pt-2.5 border-t border-border text-[11px] text-accent font-medium text-center hover:underline">
        View all activity →
      </Link>
    </motion.section>
  );
}
