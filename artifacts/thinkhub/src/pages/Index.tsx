import AppLayout from "@/components/layout/AppLayout";
import ResearchCard from "@/components/feed/ResearchCard";
import TrendingTopics from "@/components/feed/TrendingTopics";
import QuickStats from "@/components/feed/QuickStats";
import { RealTimeActivityFeed } from "@/components/feed/RealTimeActivityFeed";
import { PersonalizedRecommendations } from "@/components/feed/PersonalizedRecommendations";
import { mockPapers } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp, ArrowDown, FileText, Users, BookOpen,
  FlaskConical, MessageSquare, Briefcase, CheckCircle2,
  Rocket, Brain, Clock, Sparkles, ChevronRight,
  TrendingUp, Bell,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { FeedPageSkeleton } from "@/components/Skeletons";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const FEED_TABS = [
  { label: "For You", badge: 3 },
  { label: "Following", badge: 0 },
  { label: "Latest", badge: 5 },
  { label: "Top Papers", badge: 0 },
  { label: "Preprints", badge: 2 },
] as const;

const ITEMS_PER_PAGE = 5;

const ONBOARDING_STEPS = [
  { icon: BookOpen, label: "Import publications", desc: "From ORCID, Scholar, or BibTeX", link: "/publications", key: "import" },
  { icon: Users, label: "Find collaborators", desc: "Connect with your field", link: "/community", key: "collab" },
  { icon: Brain, label: "Try AI Assistant", desc: "Get research suggestions", link: "#ai", key: "ai" },
];

const ACTIVE_PROJECTS = [
  {
    id: "proj-1",
    title: "Attention Mechanisms Survey",
    type: "Publication",
    status: "In Progress",
    updated: "2h ago",
    progress: 72,
    path: "/publications",
  },
  {
    id: "proj-2",
    title: "Neural Circuit Simulation v3",
    type: "Project",
    status: "Active",
    updated: "1d ago",
    progress: 45,
    path: "/projects",
  },
  {
    id: "proj-3",
    title: "Climate Model Validation",
    type: "Collaboration",
    status: "Review",
    updated: "3d ago",
    progress: 88,
    path: "/projects",
  },
];

function getContextInfo() {
  const h = new Date().getHours();
  const day = new Date().getDay();
  if (day === 0 || day === 6) return { label: "Weekend", summary: "12 new papers · Weekend reading ready" };
  if (h < 10) return { label: "Morning", summary: "8 overnight papers · 2 collaboration requests" };
  if (h < 14) return { label: "Midday", summary: "12 matched papers · 3 requests · 2 peer reviews" };
  if (h < 18) return { label: "Afternoon", summary: "5 trending papers · High research momentum" };
  return { label: "Evening", summary: "15 papers read in your network · 4 new citations" };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ─── Onboarding Strip ───────────────────────────────────────────────────────
function OnboardingStrip() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("sciconnect-onboarding-dismissed") === "true"
  );
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("sciconnect-onboarding-completed");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  if (dismissed) return null;

  const total = ONBOARDING_STEPS.length;
  const done = completed.size;

  const dismiss = () => {
    localStorage.setItem("sciconnect-onboarding-dismissed", "true");
    setDismissed(true);
  };

  const mark = (key: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(key);
      localStorage.setItem("sciconnect-onboarding-completed", JSON.stringify([...next]));
      if (next.size === total) { toast.success("Onboarding complete!"); setTimeout(dismiss, 1200); }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-border rounded-xl p-4 relative"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Rocket className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground">Get started with Think!Hub</p>
          <p className="text-[11px] text-muted-foreground">{done} of {total} steps complete</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(done / total) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <button onClick={dismiss} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-1">
            Dismiss
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {ONBOARDING_STEPS.map((step) => {
          const isDone = completed.has(step.key);
          const inner = (
            <div
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${
                isDone ? "bg-primary/6 border border-primary/15" : "bg-secondary/50 hover:bg-secondary border border-transparent"
              }`}
            >
              {isDone
                ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                : <step.icon className="w-4 h-4 text-muted-foreground shrink-0" />}
              <div className="min-w-0">
                <p className={`text-[12px] font-medium leading-tight ${isDone ? "text-primary line-through" : "text-foreground"}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{step.desc}</p>
              </div>
            </div>
          );
          if (step.link === "#ai") return (
            <button key={step.key} onClick={() => mark(step.key)} className="text-left w-full">{inner}</button>
          );
          return (
            <Link key={step.key} to={step.link} onClick={() => mark(step.key)} className="block">{inner}</Link>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Active Research Card ────────────────────────────────────────────────────
function ActiveResearchStrip() {
  const typeIconMap: Record<string, typeof FileText> = {
    Publication: BookOpen,
    Project: FlaskConical,
    Collaboration: Users,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-foreground">Active Research</h2>
        <Link to="/projects" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {ACTIVE_PROJECTS.map((proj) => {
          const Icon = typeIconMap[proj.type] ?? FileText;
          return (
            <Link
              key={proj.id}
              to={proj.path}
              className="group bg-card border border-border rounded-xl p-3.5 hover:border-primary/30 hover:shadow-sm transition-all duration-150 block"
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                      {proj.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{proj.type}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0 ${
                  proj.status === "Review" ? "bg-warning-muted text-warning-foreground" :
                  proj.status === "Active" ? "bg-success-muted text-success" :
                  "bg-primary/10 text-primary"
                }`}>
                  {proj.status}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${proj.progress}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{proj.progress}% complete</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {proj.updated}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Quick Action Bar ────────────────────────────────────────────────────────
const ACTION_BAR = [
  { icon: BookOpen, label: "Submit Paper", path: "/publications" },
  { icon: Users, label: "Find Collaborators", path: "/community" },
  { icon: FlaskConical, label: "New Project", path: "/projects" },
  { icon: MessageSquare, label: "Discussions", path: "/discussions" },
  { icon: Briefcase, label: "Opportunities", path: "/opportunities" },
  { icon: TrendingUp, label: "Insights", path: "/analytics" },
] as const;

function QuickActionBar() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {ACTION_BAR.map((a) => (
        <Link
          key={a.path}
          to={a.path}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-secondary/60 hover:bg-secondary text-[12px] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50 transition-all duration-100"
        >
          <a.icon className="w-3 h-3 shrink-0" />
          {a.label}
        </Link>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Index() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeTab]);

  const greeting = useMemo(getGreeting, []);
  const ctx = useMemo(getContextInfo, []);

  const filteredPapers = useMemo(() => {
    const tab = FEED_TABS[activeTab].label;
    if (tab === "Top Papers") return [...mockPapers].sort((a, b) => b.citations - a.citations);
    if (tab === "Preprints") return mockPapers.filter((p) => p.type === "preprint");
    if (tab === "Latest") return [...mockPapers].reverse();
    return mockPapers;
  }, [activeTab]);

  const visiblePapers = filteredPapers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPapers.length;

  if (isLoading) return <AppLayout><FeedPageSkeleton /></AppLayout>;

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-6 items-start">

        {/* ── Main column ── */}
        <div className="space-y-5 min-w-0">

          {/* Command header */}
          <motion.section
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-4 pt-1"
          >
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60">
                  <Sparkles className="w-3 h-3" /> {ctx.label}
                </span>
              </div>
              <h1 className="text-[22px] font-semibold text-foreground leading-tight tracking-tight">
                {greeting}, {user.name.split(" ")[1] || user.name}
              </h1>
              <p className="text-[12.5px] text-muted-foreground mt-0.5 leading-snug">{ctx.summary}</p>
            </div>

            {/* Status pills */}
            <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0 pt-1">
              <Link to="/notifications" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/8 border border-primary/15 text-[11px] font-medium text-primary hover:bg-primary/12 transition-colors">
                <Bell className="w-3 h-3" /> 3 pending actions
              </Link>
              <span className="text-[10px] text-muted-foreground/50">Last sync: just now</span>
            </div>
          </motion.section>

          {/* Onboarding strip */}
          <AnimatePresence>
            <OnboardingStrip />
          </AnimatePresence>

          {/* User stats — inline, compact */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          >
            {[
              { label: "Publications", value: user.stats.publications, trend: "+2 this month", path: "/publications" },
              { label: "Citations", value: user.stats.citations > 999 ? `${(user.stats.citations / 1000).toFixed(1)}k` : user.stats.citations, trend: "+342 this year", path: "/analytics" },
              { label: "h-index", value: user.stats.hIndex, trend: "+1 this year", path: "/impact" },
              { label: "Followers", value: user.stats.followers > 999 ? `${(user.stats.followers / 1000).toFixed(1)}k` : user.stats.followers, trend: "+34 this week", path: "/profile" },
            ].map((s) => (
              <Link
                key={s.label}
                to={s.path}
                className="group bg-card border border-border rounded-xl px-4 py-3 hover:border-primary/25 hover:shadow-sm transition-all duration-150"
              >
                <p className="text-[22px] font-bold text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{s.label}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{s.trend}</p>
              </Link>
            ))}
          </motion.div>

          {/* Quick action bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
            <QuickActionBar />
          </motion.div>

          {/* Active research */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ActiveResearchStrip />
          </motion.div>

          {/* Personalized recommendations */}
          <PersonalizedRecommendations />

          {/* Feed tabs */}
          <nav className="flex items-center gap-1 bg-card/95 backdrop-blur-sm rounded-xl p-1 border border-border/60 sticky top-14 z-20 overflow-x-auto scrollbar-thin">
            {FEED_TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  i === activeTab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    i === activeTab
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/15 text-primary"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Paper cards */}
          <section className="space-y-3">
            {visiblePapers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-[14px] font-medium text-muted-foreground">No papers in this category</p>
                <p className="text-[12px] text-muted-foreground/60 mt-1">Check back later or explore other tabs</p>
              </div>
            ) : (
              visiblePapers.map((paper, i) => (
                <ResearchCard key={`${activeTab}-${i}`} index={i} {...paper} />
              ))
            )}
          </section>

          {/* Load more */}
          {hasMore && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
              <button
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                className="px-5 py-2 rounded-lg bg-secondary border border-border text-[12.5px] font-medium text-foreground hover:bg-secondary/80 transition-all inline-flex items-center gap-2 group"
              >
                Load more
                <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </button>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {visibleCount} of {filteredPapers.length}
              </p>
            </motion.div>
          )}
        </div>

        {/* ── Right rail ── */}
        <aside className="hidden lg:flex flex-col gap-4">
          <QuickStats />
          <TrendingTopics />
          <RealTimeActivityFeed />
        </aside>
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-50 hover:scale-105 transition-transform"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
