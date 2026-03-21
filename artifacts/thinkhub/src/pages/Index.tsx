import AppLayout from "@/components/layout/AppLayout";
import ResearchCard from "@/components/feed/ResearchCard";
import TrendingTopics from "@/components/feed/TrendingTopics";
import QuickStats from "@/components/feed/QuickStats";
import { RealTimeActivityFeed } from "@/components/feed/RealTimeActivityFeed";
import { PersonalizedRecommendations } from "@/components/feed/PersonalizedRecommendations";
import { SavedSearchesWidget } from "@/components/feed/SavedSearchesWidget";
import { StatsOverview } from "@/components/home/StatsOverview";
import { QuickActions } from "@/components/home/QuickActions";
import { AdvancedWorkspace } from "@/components/workspace/AdvancedWorkspace";
import { AIResearchAssistant } from "@/components/ai/AIResearchAssistant";
import { AdvancedSearch } from "@/components/search/AdvancedSearch";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockPapers } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Users, ArrowUp, ArrowDown, Brain, Search as SearchIcon, Wrench, ChevronDown, Rocket, BookOpen, FileText, Menu, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { FeedPageSkeleton } from "@/components/Skeletons";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Constants
const FEED_TABS = [
  { label: "For You", badge: 3 },
  { label: "Following", badge: 0 },
  { label: "Latest", badge: 5 },
  { label: "Top Papers", badge: 0 },
  { label: "Preprints", badge: 2 },
] as const;

const ITEMS_PER_PAGE = 5;

const SUGGESTED_RESEARCHERS = [
  { id: "lisa-park", name: "Dr. Lisa Park", field: "Computational Biology", initials: "LP", whySuggested: "Similar research interests in ML/Biology", mutualConnections: 4 },
  { id: "omar-hassan", name: "Prof. Omar Hassan", field: "Quantum Physics", initials: "OH", whySuggested: "Co-authored with your collaborators", mutualConnections: 2 },
  { id: "sophie-martin", name: "Dr. Sophie Martin", field: "Climate Science", initials: "SM", whySuggested: "Cited your recent paper on climate models", mutualConnections: 7 },
];

const TOOL_PANELS = [
  { id: "workspace", label: "Workspace", icon: Wrench, desc: "Organize your research workflow", Component: AdvancedWorkspace },
  { id: "ai", label: "AI Assistant", icon: Brain, desc: "Get AI-powered research insights", Component: AIResearchAssistant },
  { id: "search", label: "Advanced Search", icon: SearchIcon, desc: "Search across papers, datasets & code", Component: AdvancedSearch },
] as const;

const ONBOARDING_STEPS = [
  { icon: BookOpen, label: "Import publications", desc: "From ORCID, Scholar, or BibTeX", link: "/publications", internal: true, key: "import" },
  { icon: Users, label: "Find collaborators", desc: "Connect with your field", link: "/community", internal: true, key: "collab" },
  { icon: Brain, label: "Try AI Assistant", desc: "Get research suggestions", link: "#ai", internal: false, key: "ai" },
];

const PEER_ACTIVITIES = [
  { id: "mc-1", initials: "MC", action: "published a new paper", target: "Attention Mechanisms in Transformers", time: "1h", emoji: "📄" },
  { id: "ps-1", initials: "PS", action: "started a discussion", target: "CRISPR delivery methods", time: "3h", emoji: "💬" },
  { id: "ev-1", initials: "EV", action: "cited your paper", target: "Climate Model Validation", time: "5h", emoji: "🔗" },
  { id: "lp-1", initials: "LP", action: "joined a project", target: "Quantum Error Correction", time: "8h", emoji: "🔬" },
  { id: "oh-1", initials: "OH", action: "shared a dataset", target: "Bioethics Survey Results", time: "1d", emoji: "📊" },
];

// Helpers
function getDynamicWelcomeMessage() {
  const h = new Date().getHours();
  const day = new Date().getDay();
  
  if (day === 0 || day === 6) return { subtitle: "12 new papers match your interests · Weekend reading recommendations ready", highlight: "Weekend Edition" };
  if (h < 10) return { subtitle: "8 new papers overnight · 2 collaboration requests · Start your day with insights", highlight: "Morning Briefing" };
  if (h < 14) return { subtitle: "12 new papers match your interests · 3 collaboration requests · 2 peer review invitations", highlight: "Midday Update" };
  if (h < 18) return { subtitle: "5 trending papers in your field · Research momentum is high today", highlight: "Afternoon Insights" };
  return { subtitle: "Today's highlights: 15 papers read by your network · 4 new citations", highlight: "Evening Summary" };
}

// Components
function OnboardingWidget({ onExpandAI }: { onExpandAI: () => void }) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("sciconnect-onboarding-dismissed") === "true");
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("sciconnect-onboarding-completed");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  if (dismissed) return null;

  const completedCount = completed.size;
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPct = (completedCount / totalSteps) * 100;

  const dismiss = () => {
    localStorage.setItem("sciconnect-onboarding-dismissed", "true");
    setDismissed(true);
  };

  const markComplete = (key: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(key);
      localStorage.setItem("sciconnect-onboarding-completed", JSON.stringify([...next]));
      if (next.size === totalSteps) {
        toast.success("🎉 Onboarding complete! You're all set.");
        setTimeout(dismiss, 1500);
      }
      return next;
    });
  };

  const handleAIClick = (e: React.MouseEvent) => {
    e.preventDefault();
    markComplete("ai");
    onExpandAI();
    setTimeout(() => {
      document.getElementById('tool-panel-ai')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-accent/20 p-4 md:p-5 relative overflow-hidden"
    >
      {/* Decorative circle */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-4 h-4 text-accent" />
          <h3 className="text-[15px] font-semibold text-foreground">Get Started</h3>
          <span className="text-[10px] text-muted-foreground ml-0.5">{completedCount}/{totalSteps}</span>
          <button onClick={dismiss} className="ml-auto text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            Dismiss
          </button>
        </div>
        
        {/* Progress */}
        <div className="h-1 bg-secondary rounded-full overflow-hidden mb-4">
          <motion.div 
            className="h-full gradient-gold rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {ONBOARDING_STEPS.map(step => {
            const isDone = completed.has(step.key);
            const StepContent = (
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isDone 
                  ? "bg-success-muted/40 border border-success/20" 
                  : "bg-secondary/40 hover:bg-secondary border border-transparent"
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                ) : (
                  <step.icon className="w-5 h-5 text-accent shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`text-[12px] font-medium leading-tight ${isDone ? "text-success line-through" : "text-foreground"}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-snug truncate">{step.desc}</p>
                </div>
              </div>
            );

            if (!step.internal) {
              return <button key={step.key} onClick={handleAIClick} className="text-left w-full">{StepContent}</button>;
            }
            return (
              <Link key={step.key} to={step.link} onClick={() => markComplete(step.key)} className="block">
                {StepContent}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function MobileSidebarDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="lg:hidden fixed bottom-20 right-4 z-40 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 overflow-y-auto">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="text-left text-sm font-semibold">Dashboard</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4">
          <QuickStats />
          <TrendingTopics />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Main Component
export default function Index() {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(0);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const feedTabsRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    if (location.hash === '#ai') {
      setExpandedPanel('ai');
      setTimeout(() => {
        document.getElementById('tool-panel-ai')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [location.hash]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeTab]);

  // Handlers
  const toggleFollow = useCallback((name: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); toast.info(`Unfollowed ${name}`); }
      else { next.add(name); toast.success(`Now following ${name}`); }
      return next;
    });
  }, []);

  const handleExpandAI = useCallback(() => setExpandedPanel('ai'), []);

  // Memos
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const welcomeMessage = useMemo(() => getDynamicWelcomeMessage(), []);

  const filteredPapers = useMemo(() => {
    const tab = FEED_TABS[activeTab].label;
    if (tab === "Top Papers") return [...mockPapers].sort((a, b) => b.citations - a.citations);
    if (tab === "Preprints") return mockPapers.filter(p => p.type === "preprint");
    if (tab === "Latest") return [...mockPapers].reverse();
    return mockPapers;
  }, [activeTab]);

  const visiblePapers = filteredPapers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPapers.length;

  if (isLoading) {
    return <AppLayout><FeedPageSkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Column */}
        <div className="space-y-4 min-w-0">
          {/* Welcome Banner */}
          <motion.section 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="gradient-banner rounded-xl p-5 md:p-6 relative overflow-hidden text-white"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,hsl(40_90%_50%),transparent_60%)]" />
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_80%,hsl(40_90%_50%),transparent_40%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-[10px] font-semibold tracking-widest uppercase text-gold">{welcomeMessage.highlight}</span>
              </div>
              <h1 className="text-[27px] font-semibold mb-1 leading-tight truncate">{greeting}, {user.name}</h1>
              <p className="text-[13px] opacity-80 leading-snug truncate">{welcomeMessage.subtitle}</p>
            </div>
          </motion.section>

          {/* Onboarding */}
          <OnboardingWidget onExpandAI={handleExpandAI} />

          {/* Stats + Actions */}
          <section className="space-y-4">
            <StatsOverview isCompact />
            <QuickActions isCompact />
          </section>

          {/* Tool Panels */}
          <section className="space-y-2">
            {TOOL_PANELS.map(panel => {
              const isOpen = expandedPanel === panel.id;
              return (
                <div key={panel.id} id={`tool-panel-${panel.id}`} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedPanel(isOpen ? null : panel.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                        <panel.icon className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <span className="text-[15px] font-semibold text-foreground">{panel.label}</span>
                        <p className="text-[13px] text-muted-foreground leading-tight mt-0.5">{panel.desc}</p>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 border-t border-border">
                          <panel.Component />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </section>

          {/* Personalized Recommendations */}
          <PersonalizedRecommendations />

          {/* Feed Tabs */}
          <nav 
            ref={feedTabsRef} 
            className="flex items-center gap-1 bg-card/95 backdrop-blur-sm rounded-xl p-1 border border-border sticky top-16 z-20 overflow-x-auto scrollbar-thin"
          >
            {FEED_TABS.map((tab, i) => (
              <button 
                key={tab.label} 
                onClick={() => setActiveTab(i)}
                className={`px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  i === activeTab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <Badge 
                    variant={i === activeTab ? "secondary" : "default"} 
                    className={`text-[9px] px-1.5 py-0 h-4 min-w-[16px] ${
                      i === activeTab ? "bg-primary-foreground/20 text-primary-foreground" : ""
                    }`}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          {/* Paper Cards */}
          <section className="space-y-3">
            {visiblePapers.length === 0 ? (
              <EmptyState 
                icon={FileText}
                title="No papers found"
                description="There are no papers in this category yet. Check back later or explore other tabs."
              />
            ) : (
              visiblePapers.map((paper, i) => (
                <ResearchCard key={`${activeTab}-${i}`} index={i} {...paper} />
              ))
            )}
          </section>

          {/* Load More */}
          {hasMore && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-3">
              <button 
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="px-6 py-2.5 rounded-xl bg-secondary border border-border text-[13px] font-semibold text-foreground hover:bg-secondary/80 hover:border-accent/20 transition-all inline-flex items-center gap-2 group"
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

        {/* Sidebar */}
        <aside className="hidden lg:block space-y-4">
          <QuickStats />
          <SavedSearchesWidget />
          <TrendingTopics />
          <RealTimeActivityFeed />

          {/* Suggested Collaborators */}
          <TooltipProvider>
            <motion.section 
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-semibold text-foreground">Suggested Collaborators</h3>
                <Link to="/community" className="text-[11px] text-accent font-medium hover:underline">View all</Link>
              </div>
              <div className="space-y-2.5">
                {SUGGESTED_RESEARCHERS.map((r) => {
                  const isFollowing = following.has(r.name);
                  return (
                    <div key={r.id} className="flex items-center gap-2.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link 
                            to={`/community?researcher=${r.id}`} 
                            className="w-8 h-8 rounded-full bg-scholarly flex items-center justify-center text-primary-foreground text-[10px] font-semibold hover:ring-2 hover:ring-accent transition-all shrink-0"
                          >
                            {r.initials}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[180px]">
                          <p className="text-[11px]">{r.whySuggested}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{r.mutualConnections} mutual</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-foreground truncate">{r.name}</p>
                        <p className="text-[12px] text-muted-foreground truncate">{r.field}</p>
                      </div>
                      <button 
                        onClick={() => toggleFollow(r.name)}
                        className={`text-[12px] font-medium h-8 px-3 rounded-lg transition-all flex items-center gap-1 ${
                          isFollowing ? "text-success bg-success-muted" : "text-accent hover:bg-accent/10"
                        }`}
                      >
                        {isFollowing ? <><Check className="w-2.5 h-2.5" /> Following</> : "Follow"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          </TooltipProvider>
        </aside>
      </div>

      {/* Mobile Drawer */}
      {isMobile && <MobileSidebarDrawer />}

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 w-10 h-10 rounded-full gradient-gold text-accent-foreground shadow-gold flex items-center justify-center z-50 hover:scale-105 transition-transform"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
