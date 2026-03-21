import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, ThumbsUp, Clock, Pin, Search, Flame, Plus, Filter,
  ArrowUpDown, Bookmark, BookmarkCheck, Eye, EyeOff, Share2, MoreVertical,
  ChevronDown, ChevronRight, Hash, TrendingUp, Users, Bell, BellOff,
  CheckCircle2, AlertCircle, Star, Flag, Copy, X, ArrowUp, Reply,
  Sparkles, MessageCircle, BarChart3, Calendar, Tag, PanelRightOpen, Wifi
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";

/* ─── Types ─── */
interface DiscussionThread {
  id: string;
  title: string;
  author: string;
  initials: string;
  replies: number;
  likes: number;
  views: number;
  time: string;
  tags: string[];
  pinned: boolean;
  following: boolean;
  solved: boolean;
  category: Category;
  preview: string;
  lastReply: { author: string; initials: string; time: string; text: string };
}

type Category = "general" | "methods" | "career" | "tools" | "ethics" | "data" | "publishing";
type Tab = "all" | "trending" | "following" | "unanswered" | "solved";
type SortKey = "recent" | "popular" | "mostReplied" | "oldest";

/* ─── Data ─── */
const categoryConfig: Record<Category, { label: string; icon: typeof Hash; color: string }> = {
  general:    { label: "General",    icon: MessageCircle, color: "bg-secondary text-secondary-foreground" },
  methods:    { label: "Methods",    icon: BarChart3,     color: "bg-info-muted text-info" },
  career:     { label: "Career",     icon: Star,          color: "bg-gold-muted text-gold" },
  tools:      { label: "Tools",      icon: Hash,          color: "bg-highlight-muted text-highlight" },
  ethics:     { label: "Ethics",     icon: AlertCircle,   color: "bg-warning-muted text-warning" },
  data:       { label: "Data",       icon: BarChart3,     color: "bg-emerald-muted text-emerald-brand" },
  publishing: { label: "Publishing", icon: Tag,           color: "bg-info-muted text-info" },
};

const discussions: DiscussionThread[] = [
  {
    id: "d1",
    title: "Best practices for reproducible ML experiments in 2026?",
    author: "Dr. Sarah Chen", initials: "SC", replies: 47, likes: 89, views: 1240,
    time: "2h ago", tags: ["ML", "Reproducibility"], pinned: true, following: true, solved: false,
    category: "methods",
    preview: "I've been struggling with getting consistent results across different hardware configurations. What tools and workflows are you using?",
    lastReply: { author: "Prof. Marcus Lee", initials: "ML", time: "15m ago", text: "We've adopted DVC + MLflow combo with containerized environments. The key is..." },
  },
  {
    id: "d2",
    title: "Preprint vs journal submission: has the balance shifted?",
    author: "Prof. James Liu", initials: "JL", replies: 123, likes: 234, views: 3420,
    time: "5h ago", tags: ["Publishing", "Open Access"], pinned: true, following: false, solved: false,
    category: "publishing",
    preview: "With overlay journals gaining traction and preprint servers becoming the default first step, is traditional peer review still the gold standard?",
    lastReply: { author: "Dr. Elena Volkov", initials: "EV", time: "1h ago", text: "In my field (climate science), preprints are now expected. But tenure committees still..." },
  },
  {
    id: "d3",
    title: "New CRISPR delivery methods for in vivo applications",
    author: "Dr. Priya Sharma", initials: "PS", replies: 31, likes: 56, views: 890,
    time: "8h ago", tags: ["CRISPR", "Gene Therapy"], pinned: false, following: true, solved: false,
    category: "methods",
    preview: "Has anyone tested lipid nanoparticle delivery for tissue-specific CRISPR editing? We're seeing promising results with...",
    lastReply: { author: "Dr. Lisa Park", initials: "LP", time: "3h ago", text: "We tested AAV vs LNP delivery in hepatocytes. LNP showed 40% higher efficiency..." },
  },
  {
    id: "d4",
    title: "Climate model ensemble disagreements at regional scales",
    author: "Dr. Elena Volkov", initials: "EV", replies: 19, likes: 34, views: 560,
    time: "1d ago", tags: ["Climate", "Modeling"], pinned: false, following: false, solved: false,
    category: "data",
    preview: "CMIP7 models show significant divergence at regional scales. How are you handling this uncertainty in your impact assessments?",
    lastReply: { author: "Prof. James Wu", initials: "JW", time: "8h ago", text: "We use a weighted ensemble approach based on historical performance at..." },
  },
  {
    id: "d5",
    title: "Ethical implications of synthetic biology in agriculture",
    author: "Prof. Omar Hassan", initials: "OH", replies: 67, likes: 112, views: 2100,
    time: "1d ago", tags: ["Bioethics", "SynBio"], pinned: false, following: false, solved: false,
    category: "ethics",
    preview: "As gene drives move closer to field trials, the ethical framework hasn't kept pace. What governance models do you think work?",
    lastReply: { author: "Dr. Amara Osei", initials: "AO", time: "6h ago", text: "The precautionary principle alone isn't sufficient. We need a tiered risk framework..." },
  },
  {
    id: "d6",
    title: "Tips for writing compelling grant proposals (NIH R01)",
    author: "Dr. Lisa Park", initials: "LP", replies: 89, likes: 178, views: 4200,
    time: "2d ago", tags: ["Grants", "Career"], pinned: false, following: true, solved: true,
    category: "career",
    preview: "After 5 successful R01 submissions, here are my top tips: 1) Start with the significance section...",
    lastReply: { author: "Dr. Sarah Chen", initials: "SC", time: "12h ago", text: "Adding to this great thread — budget justification is often overlooked but reviewers..." },
  },
  {
    id: "d7",
    title: "What's your preferred tool for systematic literature reviews?",
    author: "Dr. Yuki Tanaka", initials: "YT", replies: 0, likes: 12, views: 180,
    time: "3h ago", tags: ["Tools", "Methodology"], pinned: false, following: false, solved: false,
    category: "tools",
    preview: "I'm comparing Covidence, Rayyan, and ASReview for an upcoming meta-analysis. Any recommendations or experiences to share?",
    lastReply: { author: "", initials: "", time: "", text: "" },
  },
  {
    id: "d8",
    title: "How to handle contradictory results during peer review?",
    author: "Dr. James Okafor", initials: "JK", replies: 5, likes: 23, views: 340,
    time: "6h ago", tags: ["Publishing", "Methods"], pinned: false, following: false, solved: false,
    category: "publishing",
    preview: "Reviewer 2 is citing a paper with opposite findings. How transparent should the rebuttal be about methodological differences?",
    lastReply: { author: "Prof. Omar Hassan", initials: "OH", time: "4h ago", text: "Always address contradictory findings head-on. Acknowledge, then explain the methodological..." },
  },
];

const trendingTags = [
  { tag: "ML", count: 342 }, { tag: "Open Access", count: 218 },
  { tag: "CRISPR", count: 189 }, { tag: "Climate", count: 156 },
  { tag: "Grants", count: 134 }, { tag: "Reproducibility", count: 128 },
  { tag: "Gene Therapy", count: 97 }, { tag: "Bioethics", count: 85 },
];

const guidelines = [
  "Be respectful and constructive",
  "Cite sources when making claims",
  "Stay on topic",
  "No self-promotion without disclosure",
];

/* ─── Online Users (simulated) ─── */
const onlineUsers = [
  { name: "Dr. Sarah Chen", initials: "SC" },
  { name: "Prof. Marcus Lee", initials: "ML" },
  { name: "Dr. Elena Volkov", initials: "EV" },
  { name: "Dr. Yuki Tanaka", initials: "YT" },
  { name: "Prof. Omar Hassan", initials: "OH" },
];

/* ─── Typing Indicator ─── */
const TypingIndicator = ({ users }: { users: string[] }) => {
  if (users.length === 0) return null;
  const label = users.length === 1
    ? `${users[0]} is typing`
    : `${users[0]} and ${users.length - 1} other${users.length > 2 ? "s" : ""} are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-xl mx-2 mb-2"
    >
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-accent/60"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground font-display italic">{label}</span>
    </motion.div>
  );
};

/* ─── Sidebar Content (shared between desktop & mobile drawer) ─── */
const SidebarContent = ({
  stats, followingThreads, bookmarked, likedPosts, searchQuery, setSearchQuery
}: {
  stats: { total: number; active: number; solved: number; totalReplies: number };
  followingThreads: Set<string>;
  bookmarked: Set<string>;
  likedPosts: Set<string>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) => (
  <div className="space-y-4">
    {/* Online Now */}
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-display font-semibold text-xs text-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
        <Wifi className="w-3 h-3 text-emerald-brand" /> Online Now
      </h3>
      <div className="space-y-2">
        {onlineUsers.map(u => (
          <div key={u.name} className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-scholarly text-primary-foreground text-[8px] font-display font-semibold">{u.initials}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-brand rounded-full ring-1 ring-card" />
            </div>
            <span className="text-[11px] font-display text-foreground/80 truncate">{u.name}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground font-display mt-2">{onlineUsers.length} members active</p>
    </div>

    {/* Stats */}
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-display font-semibold text-xs text-foreground mb-3 uppercase tracking-wider">Community Stats</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Threads", value: stats.total, icon: MessageSquare },
          { label: "Active", value: stats.active, icon: TrendingUp },
          { label: "Solved", value: stats.solved, icon: CheckCircle2 },
          { label: "Replies", value: stats.totalReplies, icon: Reply },
        ].map(s => (
          <div key={s.label} className="text-center p-2 rounded-xl bg-secondary/30">
            <s.icon className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-[22px] font-display font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] font-display text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Trending Tags */}
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-display font-semibold text-xs text-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
        <TrendingUp className="w-3 h-3 text-accent" /> Trending Topics
      </h3>
      <div className="space-y-1.5">
        {trendingTags.map((t, idx) => (
          <button
            key={t.tag}
            onClick={() => setSearchQuery(t.tag)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs font-display hover:bg-secondary/50 transition-colors group"
          >
            <span className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground/50 w-4">#{idx + 1}</span>
              <span className="text-foreground/80 group-hover:text-foreground">{t.tag}</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">{t.count}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Your Activity */}
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-display font-semibold text-xs text-foreground mb-3 uppercase tracking-wider">Your Activity</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-display">
          <span className="text-muted-foreground">Following</span>
          <span className="font-mono font-semibold text-foreground">{followingThreads.size}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-display">
          <span className="text-muted-foreground">Bookmarked</span>
          <span className="font-mono font-semibold text-foreground">{bookmarked.size}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-display">
          <span className="text-muted-foreground">Upvoted</span>
          <span className="font-mono font-semibold text-foreground">{likedPosts.size}</span>
        </div>
      </div>
    </div>

    {/* Guidelines */}
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-display font-semibold text-xs text-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
        <AlertCircle className="w-3 h-3 text-warning" /> Guidelines
      </h3>
      <ul className="space-y-1.5">
        {guidelines.map((g, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] font-display text-muted-foreground">
            <span className="text-accent mt-0.5">•</span>
            {g}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

/* ─── Component ─── */
const Discussions = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set(["d6"]));
  const [followingThreads, setFollowingThreads] = useState<Set<string>>(new Set(["d1", "d3", "d6"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 250);

  // Simulated typing indicator
  useEffect(() => {
    const t1 = setTimeout(() => setTypingUsers(["Dr. Elena Volkov"]), 8000);
    const t2 = setTimeout(() => setTypingUsers([]), 12000);
    const t3 = setTimeout(() => setTypingUsers(["Prof. Marcus Lee"]), 20000);
    const t4 = setTimeout(() => setTypingUsers([]), 24000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else { next.add(id); toast.success("Upvoted!"); }
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info("Removed from bookmarks"); }
      else { next.add(id); toast.success("Bookmarked!"); }
      return next;
    });
  }, []);

  const toggleFollow = useCallback((id: string) => {
    setFollowingThreads(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info("Unfollowed thread"); }
      else { next.add(id); toast.success("Following thread — you'll get notified of new replies"); }
      return next;
    });
  }, []);

  const filteredDiscussions = useMemo(() => {
    let result = [...discussions];
    if (activeTab === "following") result = result.filter(d => followingThreads.has(d.id));
    if (activeTab === "unanswered") result = result.filter(d => d.replies === 0);
    if (activeTab === "solved") result = result.filter(d => d.solved);
    if (categoryFilter !== "all") result = result.filter(d => d.category === categoryFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q)) ||
        d.preview.toLowerCase().includes(q)
      );
    }
    if (activeTab === "trending" || sortBy === "popular") {
      result.sort((a, b) => (b.likes + b.replies * 2 + b.views * 0.1) - (a.likes + a.replies * 2 + a.views * 0.1));
    } else if (sortBy === "mostReplied") {
      result.sort((a, b) => b.replies - a.replies);
    }
    result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return result;
  }, [debouncedSearch, activeTab, sortBy, categoryFilter, followingThreads]);

  const stats = useMemo(() => ({
    total: discussions.length,
    active: discussions.filter(d => d.replies > 0).length,
    solved: discussions.filter(d => d.solved).length,
    totalReplies: discussions.reduce((s, d) => s + d.replies, 0),
  }), []);

  const tabs: { key: Tab; label: string; icon?: typeof Flame; count?: number }[] = [
    { key: "all", label: "All", count: discussions.length },
    { key: "trending", label: "Trending", icon: Flame },
    { key: "following", label: "Following", count: discussions.filter(d => followingThreads.has(d.id)).length },
    { key: "unanswered", label: "Unanswered", count: discussions.filter(d => d.replies === 0).length },
    { key: "solved", label: "Solved", icon: CheckCircle2 },
  ];

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "recent", label: "Most Recent" },
    { key: "popular", label: "Most Popular" },
    { key: "mostReplied", label: "Most Replied" },
    { key: "oldest", label: "Oldest First" },
  ];

  const sidebarProps = { stats, followingThreads, bookmarked, likedPosts, searchQuery, setSearchQuery };

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="flex gap-6">
          {/* ─── Main Content ─── */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-0.5">Discussions</h1>
                <p className="text-muted-foreground font-display text-sm">Scientific discourse, questions, and community insights.</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Online indicator (compact) */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/30 border border-border">
                  <span className="w-2 h-2 bg-emerald-brand rounded-full animate-pulse" />
                  <span className="text-[11px] font-display text-muted-foreground">{onlineUsers.length} online</span>
                  <div className="flex -space-x-1 ml-1">
                    {onlineUsers.slice(0, 3).map(u => (
                      <Avatar key={u.name} className="w-4 h-4 ring-1 ring-card">
                        <AvatarFallback className="bg-scholarly text-primary-foreground text-[6px] font-display font-semibold">{u.initials}</AvatarFallback>
                      </Avatar>
                    ))}
                    {onlineUsers.length > 3 && (
                      <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[6px] font-mono ring-1 ring-card">+{onlineUsers.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Mobile sidebar toggle */}
                {isMobile && (
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="lg:hidden h-9 w-9">
                        <PanelRightOpen className="w-4 h-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] p-4 overflow-y-auto">
                      <SidebarContent {...sidebarProps} />
                    </SheetContent>
                  </Sheet>
                )}

                <Button
                  onClick={() => setShowNewForm(!showNewForm)}
                  className="gradient-gold text-accent-foreground font-display font-semibold text-sm shadow-gold hover:opacity-90 gap-2"
                >
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Thread</span>
                </Button>
              </div>
            </motion.div>

            {/* New Discussion Form */}
            <AnimatePresence>
              {showNewForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-card rounded-xl border border-border p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-foreground">Start a new discussion</h3>
                      <button onClick={() => setShowNewForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Discussion title..."
                      className="w-full h-10 px-4 rounded-xl bg-secondary/50 border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {(Object.entries(categoryConfig) as [Category, typeof categoryConfig[Category]][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display transition-all border border-transparent hover:border-border ${cfg.color}`}
                        >
                          <cfg.icon className="w-3 h-3" /> {cfg.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Share your question, insight, or topic for discussion..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <input
                        type="text"
                        placeholder="Add tags (comma separated)..."
                        className="h-9 px-3 rounded-xl bg-secondary/50 border border-border text-xs font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-56"
                      />
                      <div className="flex gap-2 ml-auto">
                        <Button variant="outline" size="sm" onClick={() => setShowNewForm(false)}>Cancel</Button>
                        <Button size="sm" onClick={() => { setShowNewForm(false); toast.success("Discussion posted!"); }}>
                          Post Discussion
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search + Tabs + Sort */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search discussions, topics, or authors..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-card border border-border text-xs font-display text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{sortOptions.find(s => s.key === sortBy)?.label}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-12 z-20 bg-popover border border-border rounded-xl shadow-scholarly p-1 min-w-[160px]"
                      >
                        {sortOptions.map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => { setSortBy(opt.key); setShowSortMenu(false); }}
                            className={`w-full text-left px-3 py-2 rounded-md text-xs font-display transition-colors ${
                              sortBy === opt.key ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.key
                        ? "bg-secondary text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {tab.icon && <tab.icon className="w-3 h-3" />}
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.key ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Category chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-display font-medium whitespace-nowrap transition-all ${
                    categoryFilter === "all" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  All topics
                </button>
                {(Object.entries(categoryConfig) as [Category, typeof categoryConfig[Category]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-display font-medium whitespace-nowrap transition-all ${
                      categoryFilter === key ? `${cfg.color} ring-1 ring-border` : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <cfg.icon className="w-2.5 h-2.5" /> {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Typing indicator (global) */}
            <AnimatePresence>
              {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
            </AnimatePresence>

            {/* Thread List */}
            <div className="space-y-2">
              {filteredDiscussions.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No discussions found"
                  description={searchQuery ? "Try adjusting your search or filters" : "Be the first to start a discussion!"}
                />
              ) : filteredDiscussions.map((d, i) => {
                const isHot = d.likes > 100 || d.replies > 80;
                const isExpanded = expandedThread === d.id;
                const isLiked = likedPosts.has(d.id);
                const isBookmarked = bookmarked.has(d.id);
                const isFollowing = followingThreads.has(d.id);
                const catCfg = categoryConfig[d.category];

                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`bg-card rounded-xl border transition-all duration-200 group ${
                      isExpanded ? "border-accent/30 shadow-scholarly" : "border-border hover:border-accent/20 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedThread(isExpanded ? null : d.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Vote column */}
                        <div className="flex flex-col items-center gap-0.5 pt-0.5 min-w-[36px] sm:min-w-[40px]">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleLike(d.id); }}
                            className={`flex flex-col items-center gap-0.5 w-7 h-7 justify-center rounded-lg transition-all ${
                              isLiked ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-accent hover:bg-accent/5"
                            }`}
                          >
                            <ArrowUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                          </button>
                          <span className="text-[12px] font-mono font-medium">{d.likes + (isLiked ? 1 : 0)}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            {d.pinned && (
                              <Tooltip><TooltipTrigger><Pin className="w-3.5 h-3.5 text-gold flex-shrink-0" /></TooltipTrigger>
                                <TooltipContent><p className="text-xs">Pinned</p></TooltipContent></Tooltip>
                            )}
                            {d.solved && (
                              <Tooltip><TooltipTrigger><CheckCircle2 className="w-4 h-4 text-emerald-brand flex-shrink-0" /></TooltipTrigger>
                                <TooltipContent><p className="text-xs">Solved</p></TooltipContent></Tooltip>
                            )}
                            {isHot && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 font-display font-medium text-warning bg-warning-muted">
                                <Flame className="w-3 h-3" /> HOT
                              </span>
                            )}
                            <h3 className="font-display font-semibold text-[14px] text-foreground group-hover:text-accent transition-colors line-clamp-2 flex-1">
                              {d.title}
                            </h3>
                            <ChevronRight className={`w-4 h-4 text-muted-foreground/40 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                          </div>

                          {!isExpanded && (
                            <p className="text-[13px] text-muted-foreground line-clamp-1 mb-2.5 font-display">{d.preview}</p>
                          )}

                          <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-display flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className="bg-scholarly text-primary-foreground text-[9px] font-display font-semibold">{d.initials}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground/70 hidden sm:inline">{d.author}</span>
                              <span className="font-medium text-foreground/70 sm:hidden">{d.initials}</span>
                            </div>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {d.time}</span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${catCfg.color}`}>
                              <catCfg.icon className="w-3 h-3" /> <span className="hidden sm:inline">{catCfg.label}</span>
                            </span>
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {d.views}</span>
                            <span className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full text-foreground"><MessageSquare className="w-3 h-3" /> {d.replies}</span>
                            <div className="items-center gap-1.5 ml-auto hidden sm:flex min-w-0">
                              {d.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="font-display text-[11px] px-2 py-0.5 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors truncate">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 sm:px-4 pb-4 border-t border-border pt-3">
                            <p className="text-sm text-foreground/80 font-display mb-4 leading-relaxed">{d.preview}</p>

                            {d.lastReply.author && (
                              <div className="bg-secondary/30 rounded-xl p-3 mb-4 border border-border/50">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <Reply className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[11px] font-display text-muted-foreground">Latest reply</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                  <Avatar className="w-6 h-6 mt-0.5">
                                    <AvatarFallback className="bg-scholarly text-primary-foreground text-[8px] font-display font-semibold">{d.lastReply.initials}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-display font-medium text-foreground">{d.lastReply.author}</span>
                                      <span className="text-[10px] text-muted-foreground">{d.lastReply.time}</span>
                                    </div>
                                    <p className="text-xs text-foreground/70 font-display line-clamp-2">{d.lastReply.text}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs font-display gap-1.5 h-8"
                                onClick={(e) => { e.stopPropagation(); navigate(`/discussions/${d.id}`); }}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {d.replies > 0 ? `View all ${d.replies} replies` : "Be the first to reply"}
                              </Button>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleBookmark(d.id); }}
                                    className={`p-1.5 rounded-md transition-colors ${
                                      isBookmarked ? "text-gold bg-gold-muted" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                    }`}
                                  >
                                    {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">{isBookmarked ? "Remove bookmark" : "Bookmark"}</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleFollow(d.id); }}
                                    className={`p-1.5 rounded-md transition-colors ${
                                      isFollowing ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                    }`}
                                  >
                                    {isFollowing ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">{isFollowing ? "Unfollow thread" : "Follow thread"}</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`Discussion: ${d.title}`); toast.success("Link copied!"); }}
                                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">Share</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toast.info("Report submitted for review."); }}
                                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors ml-auto"
                                  >
                                    <Flag className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">Report</p></TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {filteredDiscussions.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="outline" size="sm" className="font-display text-xs text-muted-foreground">
                  Load more discussions
                </Button>
              </div>
            )}
          </div>

          {/* ─── Desktop Sidebar ─── */}
          <aside className="w-[280px] flex-shrink-0 hidden lg:block">
            <SidebarContent {...sidebarProps} />
          </aside>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default Discussions;
