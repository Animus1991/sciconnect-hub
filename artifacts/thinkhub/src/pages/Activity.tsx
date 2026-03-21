/**
 * Activity.tsx — Research Activity Feed
 * Alter ego of AI_ORGANIZER_VITE's ActivityPage.tsx
 * Shows contribution graph + filterable activity timeline
 */
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { BookOpen, Users, Award, MessageSquare, Share2, Heart, GitBranch, Star, Filter, Download, Clock, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
import { ContributionGraph } from "@/components/shared/ContributionGraph";
import { AcademicMilestones } from "@/components/milestones/AcademicMilestones";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

type ActivityType = "all" | "publication" | "citation" | "review" | "collaboration" | "discussion" | "follow";

interface ActivityEntry {
  id: number;
  type: Exclude<ActivityType, "all">;
  title: string;
  subtitle: string;
  time: string;
  date: string;
  icon: React.FC<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  badge?: string;
}

const allActivity: ActivityEntry[] = [
  {
    id: 1, type: "publication",
    title: 'Published "Attention Mechanisms in Transformer Architectures"',
    subtitle: "Nature Machine Intelligence · 142 citations",
    time: "2 days ago", date: "Mar 4, 2026",
    icon: BookOpen, iconColor: "text-gold", iconBg: "bg-gold-muted",
    badge: "Published",
  },
  {
    id: 2, type: "citation",
    title: "Your paper received 12 new citations this week",
    subtitle: '"CRISPR-Cas13d Enables Programmable RNA Editing" — Cell',
    time: "3 days ago", date: "Mar 3, 2026",
    icon: Star, iconColor: "text-amber-500", iconBg: "bg-amber-500/10",
  },
  {
    id: 3, type: "review",
    title: "Completed peer review for Physical Review X",
    subtitle: "Manuscript #2026-0201 · Reviewed in 8 days",
    time: "1 week ago", date: "Feb 27, 2026",
    icon: Award, iconColor: "text-accent", iconBg: "bg-accent/10",
    badge: "Review",
  },
  {
    id: 4, type: "collaboration",
    title: "Joined project: Quantum-Classical Hybrid Neural Networks",
    subtitle: "4 collaborators · MIT × Stanford",
    time: "2 weeks ago", date: "Feb 20, 2026",
    icon: Users, iconColor: "text-blue-400", iconBg: "bg-blue-400/10",
    badge: "Collaboration",
  },
  {
    id: 5, type: "discussion",
    title: 'Started discussion: "Best practices for reproducible ML experiments"',
    subtitle: "47 replies · 89 likes · Pinned by moderators",
    time: "3 weeks ago", date: "Feb 13, 2026",
    icon: MessageSquare, iconColor: "text-foreground", iconBg: "bg-secondary",
  },
  {
    id: 6, type: "publication",
    title: 'Shared dataset: "Global Ocean Microplastic Distribution 2020-2025"',
    subtitle: "Zenodo · 2.4M samples · Open Access",
    time: "1 month ago", date: "Feb 6, 2026",
    icon: Share2, iconColor: "text-emerald-brand", iconBg: "bg-emerald-muted",
    badge: "Dataset",
  },
  {
    id: 7, type: "citation",
    title: "h-index increased from 17 → 18",
    subtitle: "Based on updated citation data from Google Scholar & Scopus",
    time: "1 month ago", date: "Feb 2, 2026",
    icon: TrendingUp, iconColor: "text-gold", iconBg: "bg-gold-muted",
  },
  {
    id: 8, type: "follow",
    title: "Dr. Sophie Martin started following you",
    subtitle: "Climate Science · ETH Zürich · 234 followers",
    time: "5 weeks ago", date: "Jan 30, 2026",
    icon: Heart, iconColor: "text-red-400", iconBg: "bg-red-400/10",
  },
  {
    id: 9, type: "review",
    title: "Peer review invitation: Nature Methods manuscript #2026-0189",
    subtitle: "Deadline: 3 weeks · Area: Computational Biology",
    time: "5 weeks ago", date: "Jan 29, 2026",
    icon: GitBranch, iconColor: "text-accent", iconBg: "bg-accent/10",
    badge: "Pending",
  },
  {
    id: 10, type: "publication",
    title: 'Uploaded preprint: "Quantum Error Correction Beyond the Surface Code"',
    subtitle: "arXiv:2026.01234 · 50 downloads in first week",
    time: "6 weeks ago", date: "Jan 22, 2026",
    icon: BookOpen, iconColor: "text-gold", iconBg: "bg-gold-muted",
    badge: "Preprint",
  },
  {
    id: 11, type: "collaboration",
    title: "Accepted collaboration request from Prof. Omar Hassan",
    subtitle: "Quantum Physics · University of Toronto",
    time: "2 months ago", date: "Jan 10, 2026",
    icon: Users, iconColor: "text-blue-400", iconBg: "bg-blue-400/10",
  },
  {
    id: 12, type: "discussion",
    title: 'Replied to "Preprint vs journal submission: has the balance shifted?"',
    subtitle: "Your comment received 23 upvotes",
    time: "2 months ago", date: "Jan 5, 2026",
    icon: MessageSquare, iconColor: "text-foreground", iconBg: "bg-secondary",
  },
];

const FILTER_CONFIG: { type: ActivityType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: "all",           label: "All Activity",   icon: Filter },
  { type: "publication",   label: "Publications",   icon: BookOpen },
  { type: "citation",      label: "Citations",      icon: Star },
  { type: "review",        label: "Reviews",        icon: Award },
  { type: "collaboration", label: "Collaborations", icon: Users },
  { type: "discussion",    label: "Discussions",    icon: MessageSquare },
  { type: "follow",        label: "Following",      icon: Heart },
];

const BADGE_COLORS: Record<string, string> = {
  Published:     "bg-emerald-muted text-emerald-brand border-emerald-brand/20",
  Preprint:      "bg-gold-muted text-amber-600 border-amber-500/20",
  Dataset:       "bg-blue-500/10 text-blue-400 border-blue-400/20",
  Review:        "bg-accent/10 text-accent border-accent/20",
  Collaboration: "bg-blue-500/10 text-blue-400 border-blue-400/20",
  Pending:       "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

function groupByMonth(entries: ActivityEntry[]) {
  const groups = new Map<string, ActivityEntry[]>();
  entries.forEach(e => {
    const [, month, year] = e.date.match(/(\w+ \w+), (\d+)/) ?? [];
    const key = `${month} ${year}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  });
  return Array.from(groups.entries());
}

const Activity = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<ActivityType>("all");

  const filtered = useMemo(() => {
    if (activeFilter === "all") return allActivity;
    return allActivity.filter(a => a.type === activeFilter);
  }, [activeFilter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const stats = useMemo(() => ({
    total: allActivity.length,
    publications: allActivity.filter(a => a.type === "publication").length,
    citations: allActivity.filter(a => a.type === "citation").length,
    reviews: allActivity.filter(a => a.type === "review").length,
  }), []);

  return (
    <AppLayout>
      <div className="max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-0.5">Research Activity</h1>
              <p className="text-sm text-muted-foreground font-display">
                {user.name}'s complete research timeline — publications, citations, reviews, and collaborations
              </p>
            </div>
            <button className="h-10 px-4 rounded-xl bg-secondary text-foreground font-display font-medium text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors">
              <Download className="w-4 h-4" /> Export CV
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Activities", value: stats.total,        icon: Filter,   color: "text-foreground" },
            { label: "Publications",     value: stats.publications,  icon: BookOpen, color: "text-gold" },
            { label: "Citations Gained", value: "342",               icon: Star,     color: "text-amber-500" },
            { label: "Reviews Done",     value: stats.reviews,       icon: Award,    color: "text-accent" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contribution Graph */}
        <div className="mb-6">
          <ContributionGraph
            title="Research Activity Heatmap"
            subtitle="Your research contributions over the past year"
            colorScheme="gold"
            weeks={52}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          {/* Activity Feed */}
          <div>
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {FILTER_CONFIG.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                    activeFilter === type
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Timeline grouped by month */}
            {grouped.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Clock className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground font-display">No activities in this category</p>
              </div>
            ) : (
              <div className="space-y-8">
                {grouped.map(([month, entries]) => (
                  <div key={month}>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-display font-medium">{month}</h3>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground font-display">{entries.length} activities</span>
                    </div>

                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-5 bottom-2 w-px bg-border" />

                      <div className="space-y-0">
                        {entries.map((entry, i) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0 relative group"
                          >
                            {/* Icon circle on timeline */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 z-10 ${entry.iconBg} border border-border/50`}>
                              <entry.icon className={`w-4 h-4 ${entry.iconColor}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-display font-medium text-foreground leading-snug">{entry.title}</p>
                                  <p className="text-[12px] text-muted-foreground mt-0.5">{entry.subtitle}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {entry.badge && (
                                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-display font-medium ${BADGE_COLORS[entry.badge] ?? "bg-secondary text-foreground"}`}>
                                      {entry.badge}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-muted-foreground font-display whitespace-nowrap">{entry.time}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-display font-semibold text-sm text-foreground mb-4">Activity Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: "Publications",   count: stats.publications, color: "bg-amber-500", pct: 25 },
                  { label: "Citations",      count: stats.citations,    color: "bg-amber-400", pct: 17 },
                  { label: "Reviews",        count: stats.reviews,      color: "bg-accent",    pct: 17 },
                  { label: "Collaborations", count: 2,                  color: "bg-blue-400",  pct: 17 },
                  { label: "Discussions",    count: 2,                  color: "bg-secondary", pct: 17 },
                  { label: "Following",      count: 1,                  color: "bg-red-400",   pct: 8  },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-display text-foreground">{item.label}</span>
                      <span className="text-xs font-mono text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Academic Milestones - AI_ORGANIZER pattern */}
            <AcademicMilestones compact={true} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Activity;
