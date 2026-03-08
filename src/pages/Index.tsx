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
import { Sparkles, Check, Users, ArrowUp, ArrowDown, Brain, Search as SearchIcon, Wrench, ChevronDown, ChevronUp, Rocket, BookOpen, FileText, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FeedPageSkeleton } from "@/components/Skeletons";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

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
  { id: "lisa-park", name: "Dr. Lisa Park", field: "Computational Biology", initials: "LP", whySuggested: "Similar research interests" },
  { id: "omar-hassan", name: "Prof. Omar Hassan", field: "Quantum Physics", initials: "OH", whySuggested: "Co-authored with your collaborators" },
  { id: "sophie-martin", name: "Dr. Sophie Martin", field: "Climate Science", initials: "SM", whySuggested: "Cited your recent paper" },
];

const toolPanels = [
  { id: "workspace", label: "Workspace", icon: Wrench, component: AdvancedWorkspace },
  { id: "ai", label: "AI Assistant", icon: Brain, component: AIResearchAssistant },
  { id: "search", label: "Advanced Search", icon: SearchIcon, component: AdvancedSearch },
] as const;

// Dynamic welcome messages based on time and user context
function getDynamicWelcomeMessage() {
  const h = new Date().getHours();
  const day = new Date().getDay();
  
  // Weekend messages
  if (day === 0 || day === 6) {
    return {
      subtitle: "12 new papers match your interests · Weekend reading recommendations ready",
      highlight: "Weekend Edition"
    };
  }
  
  // Time-based messages
  if (h < 10) {
    return {
      subtitle: "8 new papers overnight · 2 collaboration requests · Start your day with insights",
      highlight: "Morning Briefing"
    };
  }
  if (h < 14) {
    return {
      subtitle: "12 new papers match your interests · 3 collaboration requests · 2 peer review invitations",
      highlight: "Midday Update"
    };
  }
  if (h < 18) {
    return {
      subtitle: "5 trending papers in your field · Research momentum is high today",
      highlight: "Afternoon Insights"
    };
  }
  return {
    subtitle: "Today's highlights: 15 papers read by your network · 4 new citations",
    highlight: "Evening Summary"
  };
}

interface OnboardingWidgetProps {
  onExpandAI: () => void;
}

function OnboardingWidget({ onExpandAI }: OnboardingWidgetProps) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("sciconnect-onboarding-dismissed") === "true");

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem("sciconnect-onboarding-dismissed", "true");
    setDismissed(true);
  };

  const handleAIClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onExpandAI();
    // Scroll to the AI panel
    setTimeout(() => {
      document.getElementById('tool-panel-ai')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-accent/20 p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-5 h-5 text-accent" />
          <h3 className="font-display font-semibold text-foreground text-sm">Get Started</h3>
          <button onClick={dismiss} className="ml-auto text-xs text-muted-foreground hover:text-foreground font-display">Dismiss</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: BookOpen, label: "Import publications", desc: "From ORCID, Scholar, or BibTeX", link: "/publications", isInternal: true },
            { icon: Users, label: "Find collaborators", desc: "Connect with your field", link: "/community", isInternal: true },
            { icon: Brain, label: "Try AI Assistant", desc: "Get research suggestions", link: "#ai", isInternal: false },
          ].map(step => (
            step.isInternal ? (
              <Link key={step.label} to={step.link}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                <step.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-display font-medium text-foreground group-hover:text-accent transition-colors">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                </div>
              </Link>
            ) : (
              <button key={step.label} onClick={handleAIClick}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group text-left w-full">
                <step.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-display font-medium text-foreground group-hover:text-accent transition-colors">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                </div>
              </button>
            )
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Mobile Sidebar Drawer Component
function MobileSidebarDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity">
          <Menu className="w-5 h-5" />
        </button>
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

  // Handle #ai hash in URL
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

  // Reset pagination on tab change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeTab]);

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

  const handleExpandAI = () => {
    setExpandedPanel('ai');
  };

  if (isLoading) {
    return <AppLayout><FeedPageSkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Feed */}
        <div className="space-y-5">
          {/* Welcome Banner - Dynamic */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="gradient-scholarly rounded-xl p-6 text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,hsl(40_90%_50%),transparent_60%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <span className="text-xs font-display font-semibold tracking-wider uppercase text-gold">{welcomeMessage.highlight}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold mb-1">{greeting}, {user.name}</h2>
              <p className="text-sm opacity-80 font-display">
                {welcomeMessage.subtitle}
              </p>
            </div>
          </motion.div>

          {/* Onboarding Widget */}
          <OnboardingWidget onExpandAI={handleExpandAI} />

          <StatsOverview isCompact={true} />
          <QuickActions isCompact={true} />

          {/* Collapsible Tool Panels */}
          <div className="space-y-2">
            {toolPanels.map(panel => {
              const isOpen = expandedPanel === panel.id;
              return (
                <div key={panel.id} id={`tool-panel-${panel.id}`} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedPanel(isOpen ? null : panel.id)}
                    className="w-full flex items-center justify-between px-5 py-3 text-sm font-display font-medium text-foreground hover:bg-secondary/50 transition-colors">
                    <span className="flex items-center gap-2">
                      <panel.icon className="w-4 h-4 text-accent" />
                      {panel.label}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden">
                        <div className="px-2 pb-2">
                          <panel.component />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Feed Tabs - sticky with notification badges */}
          <div ref={feedTabsRef} className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border sticky top-16 z-20 overflow-x-auto scrollbar-thin">
            {feedTabsConfig.map((tab, i) => (
              <button key={tab.label} onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-md text-sm font-display font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  i === activeTab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
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

          {/* Cards with pagination */}
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

          {/* Load More / Pagination */}
          {hasMore && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
              <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="px-6 py-2.5 rounded-lg bg-secondary border border-border text-sm font-display font-medium text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2 mx-auto">
                Load more papers
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
          {!hasMore && filteredPapers.length > ITEMS_PER_PAGE && (
            <p className="text-center text-xs text-muted-foreground font-display py-2">
              Showing all {filteredPapers.length} papers
            </p>
          )}
        </div>

        {/* Sidebar - Desktop */}
        <aside className="space-y-5 hidden lg:block">
          <QuickStats />
          <TrendingTopics />

          {/* Suggested Researchers with "Why suggested" tooltip */}
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
                      <Link to={`/community?researcher=${researcher.id}`} className="w-9 h-9 rounded-full bg-scholarly flex items-center justify-center text-primary-foreground text-xs font-display font-semibold hover:ring-2 hover:ring-accent transition-all">
                        {researcher.initials}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display font-medium text-foreground truncate">{researcher.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{researcher.field}</p>
                      </div>
                      <button onClick={() => toggleFollow(researcher.name)}
                        className={`text-xs font-display font-semibold transition-colors flex items-center gap-1 ${
                          isFollowing ? "text-success" : "text-accent hover:underline"
                        }`}>
                        {isFollowing ? <><Check className="w-3 h-3" /> Following</> : "Follow"}
                      </button>
                    </div>
                    {/* Why suggested - visible on hover */}
                    <p className="text-[10px] text-muted-foreground/70 mt-1 pl-12 opacity-0 group-hover:opacity-100 transition-opacity">
                      💡 {researcher.whySuggested}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Peer Activity Widget - with clickable profiles */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Peer Activity
            </h3>
            <div className="space-y-3">
              {[
                { id: "mc-1", initials: "MC", action: "published a new paper", target: "Attention Mechanisms in Transformers", time: "1h", icon: "📄" },
                { id: "ps-1", initials: "PS", action: "started a discussion", target: "CRISPR delivery methods", time: "3h", icon: "💬" },
                { id: "ev-1", initials: "EV", action: "cited your paper", target: "Climate Model Validation", time: "5h", icon: "🔗" },
                { id: "lp-1", initials: "LP", action: "joined a project", target: "Quantum Error Correction", time: "8h", icon: "🔬" },
                { id: "oh-1", initials: "OH", action: "shared a dataset", target: "Bioethics Survey Results", time: "1d", icon: "📊" },
              ].map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Link to={`/community?researcher=${activity.id}`} className="w-7 h-7 rounded-full bg-scholarly flex items-center justify-center text-primary-foreground text-[9px] font-display font-bold flex-shrink-0 mt-0.5 hover:ring-2 hover:ring-accent transition-all cursor-pointer">
                    {activity.initials}
                  </Link>
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
            <Link to="/activity" className="block mt-3 pt-3 border-t border-border text-[11px] text-accent font-display font-medium text-center hover:underline">
              View all activity →
            </Link>
          </motion.div>
        </aside>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobile && <MobileSidebarDrawer />}

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 w-10 h-10 rounded-full gradient-gold text-accent-foreground shadow-gold flex items-center justify-center z-50 hover:opacity-90 transition-opacity lg:right-6">
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Index;
