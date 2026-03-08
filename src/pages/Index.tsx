import AppLayout from "@/components/layout/AppLayout";
import ResearchCard from "@/components/feed/ResearchCard";
import TrendingTopics from "@/components/feed/TrendingTopics";
import QuickStats from "@/components/feed/QuickStats";
import { StatsOverview } from "@/components/home/StatsOverview";
import { QuickActions } from "@/components/home/QuickActions";
import { AdvancedWorkspace } from "@/components/workspace/AdvancedWorkspace";
import { AIResearchAssistant } from "@/components/ai/AIResearchAssistant";
import { AdvancedSearch } from "@/components/search/AdvancedSearch";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockPapers } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Users, ArrowUp, ArrowDown, Brain, Search as SearchIcon, Wrench, ChevronDown, ChevronUp, Rocket, BookOpen, FileText, Menu, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { FeedPageSkeleton } from "@/components/Skeletons";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Tab config with notification counts
const feedTabsConfig = [
  { label: "For You", badge: 3 },
  { label: "Following", badge: 0 },
  { label: "Latest", badge: 5 },
  { label: "Top Papers", badge: 0 },
  { label: "Preprints", badge: 2 },
] as const;

const ITEMS_PER_PAGE = 5;

const suggestedResearchers = [
  { id: "lisa-park", name: "Dr. Lisa Park", field: "Computational Biology", initials: "LP", whySuggested: "Similar research interests in ML/Biology", mutualConnections: 4 },
  { id: "omar-hassan", name: "Prof. Omar Hassan", field: "Quantum Physics", initials: "OH", whySuggested: "Co-authored with your collaborators", mutualConnections: 2 },
  { id: "sophie-martin", name: "Dr. Sophie Martin", field: "Climate Science", initials: "SM", whySuggested: "Cited your recent paper on climate models", mutualConnections: 7 },
];

const toolPanels = [
  { id: "workspace", label: "Workspace", icon: Wrench, description: "Organize your research workflow", component: AdvancedWorkspace },
  { id: "ai", label: "AI Assistant", icon: Brain, description: "Get AI-powered research insights", component: AIResearchAssistant },
  { id: "search", label: "Advanced Search", icon: SearchIcon, description: "Search across papers, datasets & code", component: AdvancedSearch },
] as const;

// Dynamic welcome messages
function getDynamicWelcomeMessage() {
  const h = new Date().getHours();
  const day = new Date().getDay();
  
  if (day === 0 || day === 6) {
    return { subtitle: "12 new papers match your interests · Weekend reading recommendations ready", highlight: "Weekend Edition" };
  }
  if (h < 10) return { subtitle: "8 new papers overnight · 2 collaboration requests · Start your day with insights", highlight: "Morning Briefing" };
  if (h < 14) return { subtitle: "12 new papers match your interests · 3 collaboration requests · 2 peer review invitations", highlight: "Midday Update" };
  if (h < 18) return { subtitle: "5 trending papers in your field · Research momentum is high today", highlight: "Afternoon Insights" };
  return { subtitle: "Today's highlights: 15 papers read by your network · 4 new citations", highlight: "Evening Summary" };
}

// Onboarding with progress tracking
const onboardingSteps = [
  { icon: BookOpen, label: "Import publications", desc: "From ORCID, Scholar, or BibTeX", link: "/publications", isInternal: true, key: "import" },
  { icon: Users, label: "Find collaborators", desc: "Connect with your field", link: "/community", isInternal: true, key: "collab" },
  { icon: Brain, label: "Try AI Assistant", desc: "Get research suggestions", link: "#ai", isInternal: false, key: "ai" },
];

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
  const totalSteps = onboardingSteps.length;
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

  const handleStepClick = (step: typeof onboardingSteps[0]) => {
    markComplete(step.key);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-accent/20 p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-5 h-5 text-accent" />
          <h3 className="font-display font-semibold text-foreground text-sm">Get Started</h3>
          <span className="text-[10px] text-muted-foreground font-display ml-1">{completedCount}/{totalSteps} complete</span>
          <button onClick={dismiss} className="ml-auto text-xs text-muted-foreground hover:text-foreground font-display transition-colors">Dismiss</button>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-secondary rounded-full overflow-hidden mb-3">
          <motion.div 
            className="h-full gradient-gold rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {onboardingSteps.map(step => {
            const isDone = completed.has(step.key);
            const content = (
              <div className={`flex items-start gap-3 p-3 rounded-lg transition-all group ${
                isDone ? "bg-success-muted/50 border border-success/20" : "bg-secondary/50 hover:bg-secondary"
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                ) : (
                  <step.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={`text-xs font-display font-medium transition-colors ${
                    isDone ? "text-success line-through" : "text-foreground group-hover:text-accent"
                  }`}>{step.label}</p>
                  <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            );

            if (!step.isInternal) {
              return <button key={step.key} onClick={handleAIClick} className="text-left w-full">{content}</button>;
            }
            return (
              <Link key={step.key} to={step.link} onClick={() => handleStepClick(step)} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Mobile Sidebar Drawer
function MobileSidebarDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] p-0 overflow-y-auto">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left font-display">Research Dashboard</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4">
          <QuickStats />
          <TrendingTopics />
        </div>
      </SheetContent>
    </Sheet>
  );
}

const Index = () => {
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

  // Handle #ai hash
  useEffect(() => {
    if (location.hash === '#ai') {
      setExpandedPanel('ai');
      setTimeout(() => {
        document.getElementById('tool-panel-ai')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [location.hash]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
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

  const toggleFollow = useCallback((name: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); toast.info(`Unfollowed ${name}`); }
      else { next.add(name); toast.success(`Now following ${name}`); }
      return next;
    });
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const welcomeMessage = useMemo(() => getDynamicWelcomeMessage(), []);

  const filteredPapers = useMemo(() => {
    const tab = feedTabsConfig[activeTab].label;
    if (tab === "Top Papers") return [...mockPapers].sort((a, b) => b.citations - a.citations);
    if (tab === "Preprints") return mockPapers.filter(p => p.type === "preprint");
    if (tab === "Latest") return [...mockPapers].reverse();
    return mockPapers;
  }, [activeTab]);

  const visiblePapers = filteredPapers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPapers.length;

  const handleExpandAI = useCallback(() => {
    setExpandedPanel('ai');
  }, []);

  if (isLoading) {
    return <AppLayout><FeedPageSkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Feed Column */}
        <div className="space-y-5 min-w-0">
          {/* Welcome Banner — animated gradient */}
          <motion.div 
            initial={{ opacity: 0, y: -12 }} 
            animate={{ opacity: 1, y: 0 }}
            className="gradient-banner rounded-xl p-6 text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,hsl(40_90%_50%),transparent_60%)]" />
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_80%,hsl(40_90%_50%),transparent_40%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <span className="text-xs font-display font-semibold tracking-wider uppercase text-gold">{welcomeMessage.highlight}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold mb-1">{greeting}, {user.name}</h2>
              <p className="text-sm opacity-80 font-display">{welcomeMessage.subtitle}</p>
            </div>
          </motion.div>

          {/* Onboarding — with progress */}
          <OnboardingWidget onExpandAI={handleExpandAI} />

          <StatsOverview isCompact={true} />
          <QuickActions isCompact={true} />

          {/* Tool Panels */}
          <div className="space-y-2">
            {toolPanels.map(panel => {
              const isOpen = expandedPanel === panel.id;
              return (
                <div key={panel.id} id={`tool-panel-${panel.id}`} className="card-interactive overflow-hidden !rounded-xl">
                  <button
                    onClick={() => setExpandedPanel(isOpen ? null : panel.id)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-display font-medium text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                        <panel.icon className="w-4 h-4 text-accent" />
                      </div>
                      <div className="text-left">
                        <span className="block">{panel.label}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">{panel.description}</span>
                      </div>
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 border-t border-border">
                          <panel.component />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Feed Tabs — sticky with badges */}
          <div ref={feedTabsRef} className="flex items-center gap-1 bg-card/95 backdrop-blur-sm rounded-lg p-1 border border-border sticky top-16 z-20 overflow-x-auto scrollbar-thin">
            {feedTabsConfig.map((tab, i) => (
              <button key={tab.label} onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-md text-sm font-display font-medium transition-all flex items-center gap-1.5 whitespace-nowrap relative ${
                  i === activeTab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <Badge 
                    variant={i === activeTab ? "secondary" : "default"} 
                    className={`text-[10px] px-1.5 py-0 h-4 min-w-[18px] ${
                      i === activeTab ? "bg-primary-foreground/20 text-primary-foreground" : ""
                    }`}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Paper Cards */}
          <div className="space-y-4">
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
          </div>

          {/* Load More */}
          {hasMore && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
              <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="px-8 py-3 rounded-xl bg-secondary border border-border text-sm font-display font-semibold text-foreground hover:bg-secondary/80 hover:border-accent/20 transition-all flex items-center gap-2 mx-auto group">
                Load more papers
                <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </button>
              <p className="text-[10px] text-muted-foreground mt-2 font-display">
                Showing {visibleCount} of {filteredPapers.length} papers
              </p>
            </motion.div>
          )}
          {!hasMore && filteredPapers.length > ITEMS_PER_PAGE && (
            <p className="text-center text-xs text-muted-foreground font-display py-2">
              Showing all {filteredPapers.length} papers
            </p>
          )}
        </div>

        {/* Sidebar — Desktop */}
        <aside className="space-y-5 hidden lg:block">
          <QuickStats />
          <TrendingTopics />

          {/* Suggested Collaborators */}
          <TooltipProvider>
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-sm text-foreground">Suggested Collaborators</h3>
                <Link to="/community" className="text-[10px] text-accent font-display font-medium hover:underline">View all</Link>
              </div>
              <div className="space-y-3">
                {suggestedResearchers.map((researcher) => {
                  const isFollowing = following.has(researcher.name);
                  return (
                    <div key={researcher.name} className="group">
                      <div className="flex items-center gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={`/community?researcher=${researcher.id}`} className="w-9 h-9 rounded-full bg-scholarly flex items-center justify-center text-primary-foreground text-xs font-display font-semibold hover:ring-2 hover:ring-accent transition-all shrink-0">
                              {researcher.initials}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[200px]">
                            <p className="text-xs font-display">{researcher.whySuggested}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{researcher.mutualConnections} mutual connections</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-display font-medium text-foreground truncate">{researcher.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{researcher.field}</p>
                        </div>
                        <button onClick={() => toggleFollow(researcher.name)}
                          className={`text-xs font-display font-semibold transition-all flex items-center gap-1 px-2.5 py-1 rounded-full ${
                            isFollowing 
                              ? "text-success bg-success-muted" 
                              : "text-accent hover:bg-accent/10"
                          }`}
                        >
                          {isFollowing ? <><Check className="w-3 h-3" /> Following</> : "Follow"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </TooltipProvider>

          {/* Peer Activity */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              Peer Activity
            </h3>
            <div className="space-y-3">
              {[
                { id: "mc-1", initials: "MC", action: "published a new paper", target: "Attention Mechanisms in Transformers", time: "1h", icon: "📄" },
                { id: "ps-1", initials: "PS", action: "started a discussion", target: "CRISPR delivery methods", time: "3h", icon: "💬" },
                { id: "ev-1", initials: "EV", action: "cited your paper", target: "Climate Model Validation", time: "5h", icon: "🔗" },
                { id: "lp-1", initials: "LP", action: "joined a project", target: "Quantum Error Correction", time: "8h", icon: "🔬" },
                { id: "oh-1", initials: "OH", action: "shared a dataset", target: "Bioethics Survey Results", time: "1d", icon: "📊" },
              ].map((activity, i) => (
                <motion.div 
                  key={activity.id} 
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-start gap-3 group"
                >
                  <Link to={`/community?researcher=${activity.id}`} className="w-7 h-7 rounded-full bg-scholarly flex items-center justify-center text-primary-foreground text-[9px] font-display font-bold flex-shrink-0 mt-0.5 hover:ring-2 hover:ring-accent transition-all cursor-pointer">
                    {activity.initials}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-display text-foreground leading-snug">
                      <span className="font-medium">{activity.initials}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    <p className="text-[10px] text-accent truncate group-hover:text-foreground transition-colors">{activity.icon} {activity.target}</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">{activity.time} ago</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link to="/activity" className="block mt-3 pt-3 border-t border-border text-[11px] text-accent font-display font-medium text-center hover:underline">
              View all activity →
            </Link>
          </motion.div>
        </aside>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobile && <MobileSidebarDrawer />}

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 w-10 h-10 rounded-full gradient-gold text-accent-foreground shadow-gold flex items-center justify-center z-50 hover:opacity-90 transition-opacity"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Index;
