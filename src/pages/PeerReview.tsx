import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Microscope, Clock, CheckCircle2, XCircle, AlertCircle, FileText, ChevronRight, Star, Calendar, Users, Shield, ShieldCheck, Eye, EyeOff, Lock, Unlock, Award, Trophy, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState, useCallback } from "react";
import { mockBlindReviews, mockBounties, type BlindReview } from "@/data/blockchainMockData";

interface ReviewRequest {
  id: string; title: string; journal: string; field: string; deadline: string;
  daysLeft: number; status: string; priority: "high" | "medium" | "low"; progress?: number;
}


const reviewRequests = [
  {
    id: "2026-0341", title: "Scalable Federated Learning for Multi-Institutional Medical Imaging",
    journal: "Physical Review Letters", field: "Machine Learning", deadline: "Mar 15, 2026",
    daysLeft: 10, status: "pending", priority: "high" as const,
  },
  {
    id: "2026-0298", title: "Novel Catalytic Pathways for Sustainable Hydrogen Production",
    journal: "Nature Chemistry", field: "Chemistry", deadline: "Mar 20, 2026",
    daysLeft: 15, status: "in_progress", priority: "medium" as const, progress: 60,
  },
  {
    id: "2026-0256", title: "Epigenetic Memory in Plant Stress Responses",
    journal: "Science", field: "Biology", deadline: "Feb 28, 2026",
    daysLeft: -5, status: "overdue", priority: "high" as const,
  },
];

const completedReviews = [
  { id: "2026-0201", title: "Topological Quantum Error Correction with Surface Codes", journal: "Physical Review X", decision: "Accept with revisions", completedDate: "Feb 10, 2026", rating: 4 },
  { id: "2025-1189", title: "Deep Reinforcement Learning for Autonomous Laboratory Systems", journal: "Nature Methods", decision: "Accept", completedDate: "Jan 22, 2026", rating: 5 },
  { id: "2025-1102", title: "Climate Feedback Loops in Arctic Permafrost Ecosystems", journal: "Nature Climate Change", decision: "Reject", completedDate: "Dec 15, 2025", rating: 2 },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-warning", label: "Pending" },
  in_progress: { icon: FileText, color: "text-info", label: "In Progress" },
  overdue: { icon: AlertCircle, color: "text-destructive", label: "Overdue" },
};

const reviewStatusCycle: Record<string, string> = { pending: "in_progress", in_progress: "pending", overdue: "in_progress" };

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

const PeerReview = () => {
  const [reviews, setReviews] = useState(reviewRequests);
  const [blindReviews, setBlindReviews] = useState(mockBlindReviews);

  const cycleStatus = useCallback((id: string) => {
    setReviews(prev => prev.map(r =>
      r.id === id ? { ...r, status: reviewStatusCycle[r.status] || r.status } : r
    ));
  }, []);

  const updateProgress = useCallback((id: string, delta: number) => {
    setReviews(prev => prev.map(r => {
      if (r.id !== id || r.progress === undefined) return r;
      const next = Math.min(100, Math.max(0, (r.progress ?? 0) + delta));
      return { ...r, progress: next };
    }));
  }, []);

  const revealIdentity = useCallback((id: string) => {
    setBlindReviews(prev => prev.map(r =>
      r.id === id && r.phase === "sealed" ? { ...r, phase: "revealed" as const, revealDate: new Date().toISOString().split("T")[0], reviewerName: "You", reviewerInitials: "YU", creditClaimed: true } : r
    ));
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Peer Review</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Manage reviews with cryptographic blind-then-reveal protocol
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-display gap-1.5 px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-accent" />
              Blind-then-Reveal Protocol
            </Badge>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Active Reviews", value: "3", icon: FileText, accent: true },
            { label: "Blind Reviews", value: mockBlindReviews.length.toString(), icon: EyeOff },
            { label: "Avg. Turnaround", value: "12d", icon: Clock },
            { label: "Open Bounties", value: mockBounties.filter(b => b.status === "open").length.toString(), icon: Trophy },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl border p-4 ${stat.accent ? "bg-accent/5 border-accent/20" : "bg-card border-border"}`}>
              <stat.icon className={`w-4 h-4 mb-2 ${stat.accent ? "text-accent" : "text-gold"}`} />
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <Tabs defaultValue="active">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap">
            <TabsTrigger value="active" className="font-display text-sm">Active</TabsTrigger>
            <TabsTrigger value="blind" className="font-display text-sm">Blind Reviews</TabsTrigger>
            <TabsTrigger value="bounties" className="font-display text-sm">Bounties</TabsTrigger>
            <TabsTrigger value="completed" className="font-display text-sm">Completed</TabsTrigger>
            <TabsTrigger value="guidelines" className="font-display text-sm">Guidelines</TabsTrigger>
          </TabsList>

          {/* Active Reviews */}
          <TabsContent value="active" className="space-y-3">
            {reviews.map((review, i) => {
              const config = statusConfig[review.status];
              return (
                <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-card rounded-xl border p-5 hover:border-accent/30 transition-colors group ${review.status === "overdue" ? "border-destructive/20" : "border-border"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <config.icon className={`w-4 h-4 ${config.color}`} />
                        <Badge variant="outline" className={`text-[10px] font-display ${config.color}`}>{config.label}</Badge>
                        <span className="text-[10px] text-muted-foreground font-display">#{review.id}</span>
                        {review.priority === "high" && <Badge variant="destructive" className="text-[10px] font-display">High Priority</Badge>}
                      </div>
                      <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">{review.title}</h3>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display mt-2 flex-wrap">
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {review.journal}</span>
                        <span className="flex items-center gap-1"><Microscope className="w-3 h-3" /> {review.field}</span>
                        <span className={`flex items-center gap-1 ${review.daysLeft < 0 ? "text-destructive" : review.daysLeft < 7 ? "text-warning" : ""}`}>
                          <Calendar className="w-3 h-3" />
                          {review.daysLeft < 0 ? `${Math.abs(review.daysLeft)} days overdue` : `${review.daysLeft} days left`}
                        </span>
                      </div>
                      {review.progress !== undefined && (
                        <div className="mt-3 flex items-center gap-3">
                          <Progress value={review.progress} className="h-1.5 flex-1" />
                          <span className="text-[11px] text-muted-foreground font-display">{review.progress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button onClick={() => cycleStatus(review.id)}
                        className="text-[10px] font-display font-semibold px-2.5 py-1 rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                        {review.status === "pending" ? "Start Review" : review.status === "in_progress" ? "Pause" : "Resume"}
                      </button>
                      {review.progress !== undefined && (
                        <div className="flex gap-1">
                          <button onClick={() => updateProgress(review.id, -10)} className="w-6 h-6 rounded bg-secondary text-xs text-muted-foreground hover:text-foreground flex items-center justify-center">−</button>
                          <button onClick={() => updateProgress(review.id, 10)} className="w-6 h-6 rounded bg-secondary text-xs text-muted-foreground hover:text-foreground flex items-center justify-center">+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Blind Reviews */}
          <TabsContent value="blind" className="space-y-3">
            <div className="bg-accent/5 rounded-xl border border-accent/20 p-4 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-display font-semibold text-foreground">Blind-then-Reveal Protocol</h4>
              </div>
              <p className="text-xs text-muted-foreground font-display leading-relaxed">
                Your identity is cryptographically sealed during review. After publication, you may choose to reveal your identity 
                and claim credit for your review — solving the "invisible labor" problem of peer review.
              </p>
            </div>

            {blindReviews.map((review, i) => {
              const phase = phaseConfig[review.phase];
              const rec = recConfig[review.recommendation];
              return (
                <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className={`flex items-center gap-1 text-[10px] font-display px-2 py-0.5 rounded-full ${phase.bg} ${phase.color}`}>
                          <phase.icon className="w-3 h-3" />
                          {phase.label}
                        </div>
                        <Badge variant="outline" className={`text-[10px] font-display ${rec.color}`}>{rec.label}</Badge>
                        <span className="text-[10px] text-muted-foreground font-display">#{review.manuscriptId}</span>
                      </div>

                      <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
                        {review.manuscriptTitle}
                      </h3>

                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display mt-2 flex-wrap">
                        <span>{review.journal}</span>
                        <span>•</span>
                        <span>{review.field}</span>
                        <span>•</span>
                        <span>Submitted: {review.submittedDate}</span>
                        {review.revealDate && <><span>•</span><span className="text-success">Revealed: {review.revealDate}</span></>}
                      </div>

                      {/* Quality stars */}
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-[10px] text-muted-foreground font-display mr-1">Quality:</span>
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className={`w-3 h-3 ${s < review.qualityScore ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>

                      {/* Review summary */}
                      <div className="mt-3 bg-secondary/50 rounded-lg p-3">
                        <p className="text-[11px] font-display text-muted-foreground leading-relaxed">{review.sections.summary}</p>
                        <div className="mt-2 flex gap-4 text-[10px] font-display text-muted-foreground">
                          <span>Major: <strong className="text-foreground">{review.sections.majorComments.length}</strong></span>
                          <span>Minor: <strong className="text-foreground">{review.sections.minorComments.length}</strong></span>
                        </div>
                      </div>

                      {/* Hash proof */}
                      <div className="mt-2 flex items-center gap-2">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                        <code className="text-[9px] font-mono text-muted-foreground/60">
                          Sealed ID: {review.sealedIdentityHash}
                        </code>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {review.phase === "sealed" && (
                        <button onClick={() => revealIdentity(review.id)}
                          className="text-[10px] font-display font-semibold px-3 py-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1">
                          <Unlock className="w-3 h-3" /> Reveal Identity
                        </button>
                      )}
                      {review.phase === "revealed" && review.creditClaimed && (
                        <Badge className="text-[10px] bg-success/10 text-success border-success/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Credit Claimed
                        </Badge>
                      )}
                      {review.phase === "blind" && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          <EyeOff className="w-3 h-3 mr-1" /> Anonymous
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Reproducibility Bounties */}
          <TabsContent value="bounties" className="space-y-3">
            <div className="bg-accent/5 rounded-xl border border-accent/20 p-4 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-display font-semibold text-foreground">Reproducibility Bounties</h4>
              </div>
              <p className="text-xs text-muted-foreground font-display leading-relaxed">
                Earn reputation tokens by independently replicating experiments. Successful replications strengthen scientific 
                confidence; failed replications are equally valuable for identifying issues.
              </p>
            </div>

            {mockBounties.map((bounty, i) => {
              const bStatus = bountyStatusConfig[bounty.status];
              return (
                <motion.div key={bounty.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors group"
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
                        <span>Successful: <strong className="text-success">{bounty.successfulReplications}</strong></span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {bounty.deadline}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1 text-accent">
                        <Award className="w-4 h-4" />
                        <span className="text-lg font-display font-bold">{bounty.rewardTokens}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground font-display">rep tokens</span>
                      {bounty.status === "open" && (
                        <button className="mt-2 text-[10px] font-display font-semibold px-3 py-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
                          Attempt
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Completed */}
          <TabsContent value="completed" className="space-y-3">
            {completedReviews.map((review, i) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 group hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {review.decision === "Accept" ? <CheckCircle2 className="w-4 h-4 text-success" /> : review.decision === "Reject" ? <XCircle className="w-4 h-4 text-destructive" /> : <AlertCircle className="w-4 h-4 text-warning" />}
                      <Badge variant="outline" className="text-[10px] font-display">{review.decision}</Badge>
                      <span className="text-[10px] text-muted-foreground font-display">#{review.id}</span>
                    </div>
                    <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">{review.title}</h3>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display mt-2">
                      <span>{review.journal}</span><span>·</span><span>Completed {review.completedDate}</span><span>·</span>
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className={`w-3 h-3 ${s < review.rating ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />
                        ))}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              </motion.div>
            ))}
          </TabsContent>

          {/* Guidelines */}
          <TabsContent value="guidelines" className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-serif text-lg font-bold text-foreground mb-4">Review Guidelines</h3>
            <div className="space-y-4 text-sm font-display text-foreground/80 leading-relaxed">
              {[
                { title: "1. Confidentiality", desc: "All manuscripts and review content must be treated as confidential. Do not share or discuss the manuscript with others without editor approval." },
                { title: "2. Objectivity", desc: "Provide constructive, evidence-based feedback. Personal criticism of authors is inappropriate. Focus on the scientific merit of the work." },
                { title: "3. Timeliness", desc: "Complete reviews within the agreed deadline. If you cannot meet the deadline, notify the editor as soon as possible." },
                { title: "4. Conflicts of Interest", desc: "Disclose any potential conflicts of interest that may influence your review. Decline the review if a significant conflict exists." },
                { title: "5. Structured Feedback", desc: "Organize your review into: Summary, Major Comments, Minor Comments, and Recommendation. This helps authors improve their work systematically." },
                { title: "6. Blind-then-Reveal Protocol", desc: "Your identity is cryptographically sealed during the review process. After the editorial decision is published, you may reveal your identity to claim credit. This ensures unbiased reviews while allowing recognition." },
              ].map(g => (
                <div key={g.title}>
                  <h4 className="font-semibold text-foreground mb-1">{g.title}</h4>
                  <p>{g.desc}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PeerReview;
