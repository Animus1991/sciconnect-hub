import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Microscope, Clock, CheckCircle2, XCircle, AlertCircle, FileText,
  Star, Calendar, Users, Shield, ShieldCheck, Eye, EyeOff, Lock, Unlock,
  Award, Trophy, Target, Plus, ChevronDown, ChevronUp, Filter, SortAsc,
  BarChart3, TrendingUp, BookOpen, MessageSquare, Hash, ExternalLink,
  Copy, MoreVertical, Zap, ArrowUpRight, Timer, CircleDot
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useCallback, useMemo } from "react";
import { mockBlindReviews, mockBounties, type BlindReview } from "@/data/blockchainMockData";
import { useBlockchainNotifications } from "@/hooks/use-blockchain-notifications";
import ReviewSubmissionForm from "@/components/peer-review/ReviewSubmissionForm";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// ─── Data Types ───
interface ReviewRequest {
  id: string; title: string; journal: string; field: string; deadline: string;
  daysLeft: number; status: string; priority: "high" | "medium" | "low"; progress?: number;
  abstract?: string; authors?: string;
}

// ─── Mock Data ───
const reviewRequests: ReviewRequest[] = [
  {
    id: "2026-0341", title: "Scalable Federated Learning for Multi-Institutional Medical Imaging",
    journal: "Physical Review Letters", field: "Machine Learning", deadline: "Mar 15, 2026",
    daysLeft: 10, status: "pending", priority: "high",
    abstract: "We present a novel federated learning framework that enables privacy-preserving collaborative training across multiple medical institutions without sharing raw patient data.",
    authors: "Zhang, L., Kumar, A., Petrov, S."
  },
  {
    id: "2026-0298", title: "Novel Catalytic Pathways for Sustainable Hydrogen Production",
    journal: "Nature Chemistry", field: "Chemistry", deadline: "Mar 20, 2026",
    daysLeft: 15, status: "in_progress", priority: "medium", progress: 60,
    abstract: "This study identifies three previously unknown catalytic pathways for hydrogen production using earth-abundant materials, achieving efficiency gains of 40% over current methods.",
    authors: "Williams, R., Chen, H."
  },
  {
    id: "2026-0256", title: "Epigenetic Memory in Plant Stress Responses",
    journal: "Science", field: "Biology", deadline: "Feb 28, 2026",
    daysLeft: -5, status: "overdue", priority: "high",
    abstract: "We demonstrate that transgenerational epigenetic memory in Arabidopsis thaliana enables rapid adaptation to recurring drought stress through heritable chromatin modifications.",
    authors: "Nakamura, T., Okonkwo, C., Liu, M."
  },
];

const completedReviews = [
  { id: "2026-0201", title: "Topological Quantum Error Correction with Surface Codes", journal: "Physical Review X", decision: "Accept with revisions", completedDate: "Feb 10, 2026", rating: 4, turnaround: 14, field: "Physics" },
  { id: "2025-1189", title: "Deep Reinforcement Learning for Autonomous Laboratory Systems", journal: "Nature Methods", decision: "Accept", completedDate: "Jan 22, 2026", rating: 5, turnaround: 8, field: "Computer Science" },
  { id: "2025-1102", title: "Climate Feedback Loops in Arctic Permafrost Ecosystems", journal: "Nature Climate Change", decision: "Reject", completedDate: "Dec 15, 2025", rating: 2, turnaround: 21, field: "Environmental Science" },
];

// ─── Config Maps ───
const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string; bg: string }> = {
  pending: { icon: Clock, color: "text-warning", label: "Pending", bg: "bg-warning/10" },
  in_progress: { icon: FileText, color: "text-info", label: "In Progress", bg: "bg-info/10" },
  overdue: { icon: AlertCircle, color: "text-destructive", label: "Overdue", bg: "bg-destructive/10" },
};

const phaseConfig = {
  blind: { icon: EyeOff, color: "text-info", bg: "bg-info/10", label: "Blind Phase" },
  sealed: { icon: Lock, color: "text-warning", bg: "bg-warning/10", label: "Identity Sealed" },
  revealed: { icon: Eye, color: "text-success", bg: "bg-success/10", label: "Identity Revealed" },
};

const recConfig = {
  accept: { color: "text-success", label: "Accept" },
  minor_revisions: { color: "text-warning", label: "Minor Revisions" },
  major_revisions: { color: "text-orange-500", label: "Major Revisions" },
  reject: { color: "text-destructive", label: "Reject" },
};

const bountyStatusConfig = {
  open: { color: "text-info", bg: "bg-info/10", label: "Open" },
  in_progress: { color: "text-warning", bg: "bg-warning/10", label: "In Progress" },
  completed: { color: "text-success", bg: "bg-success/10", label: "Completed" },
  disputed: { color: "text-destructive", bg: "bg-destructive/10", label: "Disputed" },
};

type TabKey = "active" | "blind" | "bounties" | "completed";

const PeerReview = () => {
  const [reviews, setReviews] = useState(reviewRequests);
  const [blindReviews, setBlindReviews] = useState(mockBlindReviews);
  const { notifyIdentityRevealed } = useBlockchainNotifications();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"deadline" | "priority" | "title">("deadline");

  // ─── Actions ───
  const cycleStatus = useCallback((id: string) => {
    const cycle: Record<string, string> = { pending: "in_progress", in_progress: "pending", overdue: "in_progress" };
    setReviews(prev => prev.map(r =>
      r.id === id ? { ...r, status: cycle[r.status] || r.status } : r
    ));
  }, []);

  const updateProgress = useCallback((id: string, delta: number) => {
    setReviews(prev => prev.map(r => {
      if (r.id !== id || r.progress === undefined) return r;
      return { ...r, progress: Math.min(100, Math.max(0, (r.progress ?? 0) + delta)) };
    }));
  }, []);

  const revealIdentity = useCallback((id: string) => {
    setBlindReviews(prev => prev.map(r => {
      if (r.id !== id || r.phase !== "sealed") return r;
      notifyIdentityRevealed("You", r.manuscriptTitle);
      return { ...r, phase: "revealed" as const, revealDate: new Date().toISOString().split("T")[0], reviewerName: "You", reviewerInitials: "YU", creditClaimed: true };
    }));
  }, [notifyIdentityRevealed]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // ─── Computed ───
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === "deadline") return a.daysLeft - b.daysLeft;
      if (sortBy === "priority") {
        const p = { high: 0, medium: 1, low: 2 };
        return p[a.priority] - p[b.priority];
      }
      return a.title.localeCompare(b.title);
    });
  }, [reviews, sortBy]);

  const stats = useMemo(() => ({
    active: reviews.length,
    overdue: reviews.filter(r => r.status === "overdue").length,
    blind: blindReviews.length,
    completed: completedReviews.length,
    avgTurnaround: Math.round(completedReviews.reduce((a, r) => a + r.turnaround, 0) / completedReviews.length),
    openBounties: mockBounties.filter(b => b.status === "open").length,
    avgRating: (completedReviews.reduce((a, r) => a + r.rating, 0) / completedReviews.length).toFixed(1),
  }), [reviews, blindReviews]);

  const tabs: { key: TabKey; label: string; icon: typeof FileText; count: number }[] = [
    { key: "active", label: "Active", icon: FileText, count: reviews.length },
    { key: "blind", label: "Blind Reviews", icon: EyeOff, count: blindReviews.length },
    { key: "bounties", label: "Bounties", icon: Trophy, count: mockBounties.length },
    { key: "completed", label: "Completed", icon: CheckCircle2, count: completedReviews.length },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* ─── Header ─── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-[27px] font-bold text-foreground">Peer Review</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Manage reviews with cryptographic blind-then-reveal protocol
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-display gap-1.5 px-3 py-1.5">
                <Shield className="w-3.5 h-3.5 text-accent" />
                Blind Protocol Active
              </Badge>
              <Button size="sm" onClick={() => setShowSubmitForm(true)} className="font-display gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Submit Review
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ─── KPI Strip ─── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6"
        >
          {[
            { label: "Active", value: stats.active, icon: FileText, accent: true },
            { label: "Overdue", value: stats.overdue, icon: AlertCircle, warn: stats.overdue > 0 },
            { label: "Blind Reviews", value: stats.blind, icon: EyeOff },
            { label: "Completed", value: stats.completed, icon: CheckCircle2 },
            { label: "Avg. Turnaround", value: `${stats.avgTurnaround}d`, icon: Timer },
            { label: "Avg. Rating", value: stats.avgRating, icon: Star },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-3.5 transition-colors ${
              s.accent ? "bg-accent/5 border-accent/20" :
              s.warn ? "bg-destructive/5 border-destructive/20" :
              "bg-card border-border"
            }`}>
              <s.icon className={`w-4 h-4 mb-1.5 ${s.accent ? "text-accent" : s.warn ? "text-destructive" : "text-muted-foreground"}`} />
              <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ─── Two-Column Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* ─── Main Column ─── */}
          <div>
            {/* Tab Strip + Sort */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-secondary/50 rounded-lg border border-border p-1">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => { setActiveTab(t.key); setExpandedId(null); }}
                    className={`flex items-center gap-1.5 text-xs font-display px-3 py-1.5 rounded-md transition-all ${
                      activeTab === t.key
                        ? "bg-card text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === t.key ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"
                    }`}>{t.count}</span>
                  </button>
                ))}
              </div>

              {activeTab === "active" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs font-display text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-secondary">
                      <SortAsc className="w-3.5 h-3.5" />
                      Sort: {sortBy === "deadline" ? "Deadline" : sortBy === "priority" ? "Priority" : "Title"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="font-display">
                    <DropdownMenuItem onClick={() => setSortBy("deadline")}>By Deadline</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("priority")}>By Priority</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("title")}>By Title</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* ─── Active Reviews ─── */}
            {activeTab === "active" && (
              <div className="space-y-3">
                {sortedReviews.map((review, i) => {
                  const config = statusConfig[review.status];
                  const isExpanded = expandedId === review.id;
                  return (
                    <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`bg-card rounded-xl border p-5 transition-all group ${
                        review.status === "overdue" ? "border-destructive/20" : isExpanded ? "border-accent/30" : "border-border hover:border-accent/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className={`flex items-center gap-1 text-[10px] font-display px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                              <config.icon className="w-3 h-3" />
                              {config.label}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">#{review.id}</span>
                            {review.priority === "high" && (
                              <Badge variant="destructive" className="text-[10px] font-display px-1.5 py-0">High</Badge>
                            )}
                          </div>
                          <button onClick={() => toggleExpand(review.id)} className="text-left w-full">
                            <h3 className="font-serif text-base font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
                              {review.title}
                            </h3>
                          </button>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-display mt-2 flex-wrap">
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {review.journal}</span>
                            <span className="flex items-center gap-1"><Microscope className="w-3 h-3" /> {review.field}</span>
                            <span className={`flex items-center gap-1 ${review.daysLeft < 0 ? "text-destructive font-semibold" : review.daysLeft < 7 ? "text-warning" : ""}`}>
                              <Calendar className="w-3 h-3" />
                              {review.daysLeft < 0 ? `${Math.abs(review.daysLeft)}d overdue` : `${review.daysLeft}d left`}
                            </span>
                          </div>

                          {review.progress !== undefined && (
                            <div className="mt-3 flex items-center gap-3">
                              <Progress value={review.progress} className="h-1.5 flex-1" />
                              <span className="text-[11px] text-muted-foreground font-display font-medium">{review.progress}%</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => cycleStatus(review.id)}
                            className={`text-[11px] font-display font-semibold px-3 py-1.5 rounded-lg transition-all ${
                              review.status === "pending"
                                ? "bg-accent/10 text-accent hover:bg-accent/20"
                                : "bg-secondary text-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {review.status === "pending" ? "Start" : review.status === "in_progress" ? "Pause" : "Resume"}
                          </button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="font-display">
                              <DropdownMenuItem onClick={() => toast.success("Deadline extension requested")}>
                                <Timer className="w-3.5 h-3.5 mr-2" /> Request Extension
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Review declined")}>
                                <XCircle className="w-3.5 h-3.5 mr-2" /> Decline Review
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toast.info(`Copied #${review.id}`)}>
                                <Copy className="w-3.5 h-3.5 mr-2" /> Copy ID
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <button onClick={() => toggleExpand(review.id)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }} className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-border space-y-3">
                              {review.authors && (
                                <div>
                                  <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Authors</span>
                                  <p className="text-sm font-display text-foreground mt-0.5">{review.authors}</p>
                                </div>
                              )}
                              {review.abstract && (
                                <div>
                                  <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Abstract</span>
                                  <p className="text-xs font-display text-muted-foreground leading-relaxed mt-0.5">{review.abstract}</p>
                                </div>
                              )}
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Deadline</span>
                                <span className="text-xs font-display text-foreground">{review.deadline}</span>
                              </div>
                              {review.progress !== undefined && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => updateProgress(review.id, -10)} className="font-display text-xs h-7">−10%</Button>
                                  <Button size="sm" variant="outline" onClick={() => updateProgress(review.id, 10)} className="font-display text-xs h-7">+10%</Button>
                                  <Button size="sm" variant="outline" onClick={() => updateProgress(review.id, 100 - (review.progress ?? 0))} className="font-display text-xs h-7">Complete</Button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ─── Blind Reviews ─── */}
            {activeTab === "blind" && (
              <div className="space-y-3">
                <div className="bg-accent/5 rounded-xl border border-accent/20 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Shield className="w-4 h-4 text-accent" />
                    <h4 className="text-sm font-display font-semibold text-foreground">Blind-then-Reveal Protocol</h4>
                  </div>
                  <p className="text-xs text-muted-foreground font-display leading-relaxed">
                    Your identity is cryptographically sealed during review. After publication, reveal your identity to claim credit.
                  </p>
                </div>

                {blindReviews.map((review, i) => {
                  const phase = phaseConfig[review.phase];
                  const rec = recConfig[review.recommendation];
                  const isExpanded = expandedId === review.id;
                  return (
                    <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`bg-card rounded-xl border p-5 transition-all group ${isExpanded ? "border-accent/30" : "border-border hover:border-accent/20"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className={`flex items-center gap-1 text-[10px] font-display px-2 py-0.5 rounded-full ${phase.bg} ${phase.color}`}>
                              <phase.icon className="w-3 h-3" />
                              {phase.label}
                            </div>
                            <Badge variant="outline" className={`text-[10px] font-display ${rec.color}`}>{rec.label}</Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">#{review.manuscriptId}</span>
                          </div>

                          <button onClick={() => toggleExpand(review.id)} className="text-left w-full">
                            <h3 className="font-serif text-base font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
                              {review.manuscriptTitle}
                            </h3>
                          </button>

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-display mt-2 flex-wrap">
                            <span>{review.journal}</span>
                            <span>·</span>
                            <span>{review.field}</span>
                            <span>·</span>
                            <span>{review.submittedDate}</span>
                          </div>

                          {/* Quality */}
                          <div className="flex items-center gap-1 mt-2">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <Star key={s} className={`w-3 h-3 ${s < review.qualityScore ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />
                            ))}
                            <span className="text-[10px] text-muted-foreground font-display ml-1">{review.qualityScore}/5</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {review.phase === "sealed" && (
                            <button onClick={() => revealIdentity(review.id)}
                              className="text-[11px] font-display font-semibold px-3 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1">
                              <Unlock className="w-3 h-3" /> Reveal
                            </button>
                          )}
                          {review.phase === "revealed" && review.creditClaimed && (
                            <Badge className="text-[10px] bg-success/10 text-success border-success/20 gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Credited
                            </Badge>
                          )}
                          {review.phase === "blind" && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
                              <EyeOff className="w-3 h-3" /> Anonymous
                            </Badge>
                          )}
                          <button onClick={() => toggleExpand(review.id)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }} className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-border space-y-3">
                              <div>
                                <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Summary</span>
                                <p className="text-xs font-display text-muted-foreground leading-relaxed mt-0.5">{review.sections.summary}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Major Comments ({review.sections.majorComments.length})</span>
                                  <ul className="mt-1 space-y-1">
                                    {review.sections.majorComments.map((c, ci) => (
                                      <li key={ci} className="text-[11px] font-display text-foreground/80 leading-relaxed pl-2 border-l-2 border-warning/40">{c}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Minor Comments ({review.sections.minorComments.length})</span>
                                  <ul className="mt-1 space-y-1">
                                    {review.sections.minorComments.map((c, ci) => (
                                      <li key={ci} className="text-[11px] font-display text-foreground/80 leading-relaxed pl-2 border-l-2 border-muted-foreground/20">{c}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <Lock className="w-3 h-3 text-muted-foreground" />
                                <code className="text-[9px] font-mono text-muted-foreground/60">{review.sealedIdentityHash}</code>
                                <button onClick={() => { navigator.clipboard.writeText(review.sealedIdentityHash); toast.success("Hash copied"); }}
                                  className="p-1 rounded hover:bg-secondary transition-colors">
                                  <Copy className="w-3 h-3 text-muted-foreground" />
                                </button>
                              </div>
                              {review.revealDate && (
                                <p className="text-[11px] font-display text-success flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> Revealed on {review.revealDate}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ─── Bounties ─── */}
            {activeTab === "bounties" && (
              <div className="space-y-3">
                <div className="bg-accent/5 rounded-xl border border-accent/20 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Trophy className="w-4 h-4 text-accent" />
                    <h4 className="text-sm font-display font-semibold text-foreground">Reproducibility Bounties</h4>
                  </div>
                  <p className="text-xs text-muted-foreground font-display leading-relaxed">
                    Earn reputation tokens by independently replicating experiments.
                  </p>
                </div>

                {mockBounties.map((bounty, i) => {
                  const bStatus = bountyStatusConfig[bounty.status];
                  return (
                    <motion.div key={bounty.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="bg-card rounded-xl border border-border p-5 hover:border-accent/20 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className={`flex items-center gap-1 text-[10px] font-display px-2 py-0.5 rounded-full ${bStatus.bg} ${bStatus.color}`}>
                              {bStatus.label}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">{bounty.field}</span>
                          </div>

                          <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
                            {bounty.title}
                          </h3>
                          <p className="text-xs text-muted-foreground font-display leading-relaxed mb-2">{bounty.description}</p>

                          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display flex-wrap">
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center text-[8px] font-bold text-accent">
                                {bounty.author.initials}
                              </div>
                              {bounty.author.name}
                            </span>
                            <span>Attempts: <strong className="text-foreground">{bounty.attempts}</strong></span>
                            <span>Replications: <strong className="text-success">{bounty.successfulReplications}</strong></span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {bounty.deadline}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                          <div className="flex items-center gap-1 text-accent">
                            <Award className="w-4 h-4" />
                            <span className="text-lg font-display font-bold">{bounty.rewardTokens}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground font-display">tokens</span>
                          {bounty.status === "open" && (
                            <Button size="sm" variant="outline" className="text-[10px] font-display mt-1 h-7 px-3"
                              onClick={() => toast.success("Attempt registered!")}>
                              <Zap className="w-3 h-3 mr-1" /> Attempt
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ─── Completed ─── */}
            {activeTab === "completed" && (
              <div className="space-y-3">
                {completedReviews.map((review, i) => {
                  const isExpanded = expandedId === review.id;
                  return (
                    <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`bg-card rounded-xl border p-5 group transition-all ${isExpanded ? "border-accent/30" : "border-border hover:border-accent/20"}`}
                    >
                      <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => toggleExpand(review.id)}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {review.decision.includes("Accept") ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-destructive" />}
                            <Badge variant="outline" className="text-[10px] font-display">{review.decision}</Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">#{review.id}</span>
                          </div>
                          <h3 className="font-serif text-base font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">{review.title}</h3>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-display mt-2 flex-wrap">
                            <span>{review.journal}</span>
                            <span>·</span>
                            <span>{review.completedDate}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {review.turnaround}d turnaround</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, s) => (
                                <Star key={s} className={`w-3 h-3 ${s < review.rating ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />
                              ))}
                            </span>
                          </div>
                        </div>
                        <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }} className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-secondary/50 rounded-lg p-3">
                                  <p className="text-xs font-display text-muted-foreground">Field</p>
                                  <p className="text-sm font-display font-semibold text-foreground mt-0.5">{review.field}</p>
                                </div>
                                <div className="bg-secondary/50 rounded-lg p-3">
                                  <p className="text-xs font-display text-muted-foreground">Turnaround</p>
                                  <p className="text-sm font-display font-semibold text-foreground mt-0.5">{review.turnaround} days</p>
                                </div>
                                <div className="bg-secondary/50 rounded-lg p-3">
                                  <p className="text-xs font-display text-muted-foreground">Rating</p>
                                  <p className="text-sm font-display font-semibold text-foreground mt-0.5">{review.rating}/5</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-4">
            {/* Upcoming Deadlines */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" /> Upcoming Deadlines
              </h3>
              <div className="space-y-2.5">
                {[...reviews].sort((a, b) => a.daysLeft - b.daysLeft).map(r => (
                  <div key={r.id} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-display text-foreground truncate">{r.title.slice(0, 40)}…</p>
                      <p className="text-[10px] text-muted-foreground font-display">{r.deadline}</p>
                    </div>
                    <span className={`text-[10px] font-display font-semibold px-2 py-0.5 rounded-full ${
                      r.daysLeft < 0 ? "bg-destructive/10 text-destructive" :
                      r.daysLeft < 7 ? "bg-warning/10 text-warning" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {r.daysLeft < 0 ? `${Math.abs(r.daysLeft)}d late` : `${r.daysLeft}d`}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Review Quality */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-accent" /> Review Quality
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Thoroughness", value: 87 },
                  { label: "Timeliness", value: 72 },
                  { label: "Constructiveness", value: 94 },
                  { label: "Scientific Rigor", value: 91 },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-display text-muted-foreground">{m.label}</span>
                      <span className="text-[10px] font-display font-semibold text-foreground">{m.value}%</span>
                    </div>
                    <Progress value={m.value} className="h-1" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Phase Breakdown */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-accent" /> Blind Review Phases
              </h3>
              <div className="space-y-2">
                {(["blind", "sealed", "revealed"] as const).map(phase => {
                  const conf = phaseConfig[phase];
                  const count = blindReviews.filter(r => r.phase === phase).length;
                  return (
                    <div key={phase} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <conf.icon className={`w-3.5 h-3.5 ${conf.color}`} />
                        <span className="text-[11px] font-display text-foreground">{conf.label}</span>
                      </div>
                      <span className="text-xs font-display font-bold text-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Guidelines Quick Reference */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-accent" /> Guidelines
              </h3>
              <div className="space-y-2">
                {[
                  { title: "Confidentiality", desc: "Treat manuscripts as confidential" },
                  { title: "Objectivity", desc: "Evidence-based, constructive feedback" },
                  { title: "Timeliness", desc: "Complete reviews within deadlines" },
                  { title: "Structured Feedback", desc: "Summary → Major → Minor → Recommendation" },
                  { title: "Blind Protocol", desc: "Sealed identity until you choose to reveal" },
                ].map((g, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CircleDot className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-display font-semibold text-foreground">{g.title}</p>
                      <p className="text-[10px] font-display text-muted-foreground">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bounty Rewards Summary */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
              className="bg-accent/5 rounded-xl border border-accent/20 p-4"
            >
              <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-accent" /> Reputation
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-lg font-display font-bold text-accent">{mockBounties.reduce((a, b) => a + b.rewardTokens, 0)}</p>
                  <p className="text-[10px] text-muted-foreground font-display">Total Tokens</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-display font-bold text-foreground">{mockBounties.reduce((a, b) => a + b.successfulReplications, 0)}</p>
                  <p className="text-[10px] text-muted-foreground font-display">Replications</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <ReviewSubmissionForm
          open={showSubmitForm}
          onClose={() => setShowSubmitForm(false)}
          onSubmit={(data) => {
            const newReview = {
              id: `br-${Date.now()}`,
              manuscriptId: `MS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
              manuscriptTitle: data.manuscriptTitle,
              journal: data.journal,
              field: data.field,
              phase: "blind" as const,
              sealedIdentityHash: `sealed_${Math.random().toString(36).slice(2, 14)}`,
              submittedDate: new Date().toISOString().split("T")[0],
              qualityScore: data.qualityScore,
              recommendation: data.recommendation,
              sections: {
                summary: data.summary,
                majorComments: data.majorComments.filter(c => c.trim()),
                minorComments: data.minorComments.filter(c => c.trim()),
              },
              creditClaimed: false,
              hashProof: `proof_sha256_${Math.random().toString(36).slice(2, 14)}`,
            };
            setBlindReviews(prev => [newReview, ...prev]);
            toast.success("Blind review submitted successfully");
          }}
        />
      </div>
    </AppLayout>
  );
};

export default PeerReview;
