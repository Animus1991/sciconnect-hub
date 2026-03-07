import AppLayout from "@/components/layout/AppLayout";
import ResearchCard from "@/components/feed/ResearchCard";
import TrendingTopics from "@/components/feed/TrendingTopics";
import QuickStats from "@/components/feed/QuickStats";
import { StatsOverview } from "@/components/home/StatsOverview";
import { QuickActions } from "@/components/home/QuickActions";
import { AdvancedWorkspace } from "@/components/workspace/AdvancedWorkspace";
import { AIResearchAssistant } from "@/components/ai/AIResearchAssistant";
import { AdvancedSearch } from "@/components/search/AdvancedSearch";
import { mockPapers } from "@/data/mockData";
import { motion } from "framer-motion";
import { Sparkles, Check, FilePlus, Award, FolderOpen, MessageSquare as Discuss, CalendarDays, GraduationCap, Zap, TrendingUp, Users, Database } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const feedTabs = ["For You", "Following", "Latest", "Top Papers", "Preprints"] as const;

const suggestedResearchers = [
  { name: "Dr. Lisa Park", field: "Computational Biology", initials: "LP" },
  { name: "Prof. Omar Hassan", field: "Quantum Physics", initials: "OH" },
  { name: "Dr. Sophie Martin", field: "Climate Science", initials: "SM" },
];

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const toggleFollow = (name: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        toast.info(`Unfollowed ${name}`);
      } else {
        next.add(name);
        toast.success(`Now following ${name}`);
      }
      return next;
    });
  };

  // Determine time-based greeting
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const quickActions = [
    { icon: FilePlus,    label: "Submit Paper",    sub: "Publications",  path: "/publications",  color: "text-gold",         bg: "bg-gold-muted" },
    { icon: Award,       label: "Peer Review",     sub: "2 pending",     path: "/peer-review",   color: "text-accent",       bg: "bg-accent/10" },
    { icon: FolderOpen,  label: "New Project",     sub: "Projects",      path: "/projects",     color: "text-blue-400",    bg: "bg-blue-400/10" },
    { icon: Discuss,     label: "Start Discussion",sub: "Community",     path: "/discussions",  color: "text-foreground",  bg: "bg-secondary" },
    { icon: CalendarDays,label: "Browse Events",   sub: "4 upcoming",    path: "/events",       color: "text-emerald-brand",bg: "bg-emerald-muted" },
    { icon: GraduationCap,label: "Find Mentor",   sub: "Mentorship",    path: "/mentorship",   color: "text-purple-400",  bg: "bg-purple-400/10" },
  ];

  // Filter papers based on active tab
  const filteredPapers = useMemo(() => {
    const tab = feedTabs[activeTab];
    if (tab === "Top Papers") return [...mockPapers].sort((a, b) => b.citations - a.citations);
    if (tab === "Preprints") return mockPapers.filter(p => p.type === "preprint");
    if (tab === "Latest") return [...mockPapers].reverse();
    return mockPapers;
  }, [activeTab]);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Feed */}
        <div className="space-y-5">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-scholarly rounded-xl p-6 text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,hsl(40_90%_50%),transparent_60%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <span className="text-xs font-display font-semibold tracking-wider uppercase text-gold">
                  AI-Powered Recommendations
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold mb-1">{greeting}, {user.name}</h2>
              <p className="text-sm opacity-80 font-display">
                12 new papers match your interests · 3 collaboration requests · 2 peer review invitations
              </p>
            </div>
          </motion.div>

          {/* Enhanced Stats Overview - AI_ORGANIZER pattern */}
          <StatsOverview />

          {/* Enhanced Quick Actions - AI_ORGANIZER pattern */}
          <QuickActions />

          {/* Feed Tabs */}
          <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
            {feedTabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-md text-sm font-display font-medium transition-all ${
                  i === activeTab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {filteredPapers.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground font-display">No papers found in this category</p>
              </div>
            ) : (
              filteredPapers.map((paper, i) => (
                <ResearchCard key={`${activeTab}-${i}`} index={i} {...paper} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 hidden lg:block">
          <QuickStats />
          <TrendingTopics />

          {/* Suggested Researchers */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Suggested Collaborators</h3>
            <div className="space-y-3">
              {suggestedResearchers.map((researcher) => {
                const isFollowing = following.has(researcher.name);
                return (
                  <div key={researcher.name} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-scholarly flex items-center justify-center text-primary-foreground text-xs font-display font-semibold">
                      {researcher.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-medium text-foreground truncate">{researcher.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{researcher.field}</p>
                    </div>
                    <button
                      onClick={() => toggleFollow(researcher.name)}
                      className={`text-xs font-display font-semibold transition-colors flex items-center gap-1 ${
                        isFollowing ? "text-emerald-brand" : "text-accent hover:underline"
                      }`}
                    >
                      {isFollowing ? <><Check className="w-3 h-3" /> Following</> : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Peer Activity Widget */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-gold" /> Peer Activity
            </h3>
            <div className="space-y-3">
              {[
                { initials: "MC", action: "published a new paper", target: "Attention Mechanisms in Transformers", time: "1h", icon: "📄" },
                { initials: "PS", action: "started a discussion", target: "CRISPR delivery methods", time: "3h", icon: "💬" },
                { initials: "EV", action: "cited your paper", target: "Climate Model Validation", time: "5h", icon: "🔗" },
                { initials: "LP", action: "joined a project", target: "Quantum Error Correction", time: "8h", icon: "🔬" },
                { initials: "OH", action: "shared a dataset", target: "Bioethics Survey Results", time: "1d", icon: "📊" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-scholarly flex items-center justify-center text-primary-foreground text-[9px] font-display font-bold flex-shrink-0 mt-0.5">
                    {activity.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-display text-foreground leading-snug">
                      <span className="font-medium">{activity.initials}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    <p className="text-[10px] text-accent truncate">{activity.icon} {activity.target}</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">{activity.time} ago</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="/activity" className="block mt-3 pt-3 border-t border-border text-[11px] text-accent font-display font-medium text-center hover:underline">
              View all activity →
            </a>
          </motion.div>
        </aside>
      </div>
      
      {/* Advanced Workspace Section */}
      <div className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <AdvancedWorkspace />
        </motion.div>
      </div>
      
      {/* AI Research Assistant Section */}
      <div className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <AIResearchAssistant />
        </motion.div>
      </div>
      
      {/* Advanced Search Section */}
      <div className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <AdvancedSearch />
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Index;
