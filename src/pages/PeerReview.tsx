import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Microscope, Clock, CheckCircle2, XCircle, AlertCircle, FileText, ChevronRight, Star, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState, useCallback } from "react";

const reviewRequests = [
  {
    id: "2026-0341",
    title: "Scalable Federated Learning for Multi-Institutional Medical Imaging",
    journal: "Physical Review Letters",
    field: "Machine Learning",
    deadline: "Mar 15, 2026",
    daysLeft: 10,
    status: "pending",
    priority: "high",
  },
  {
    id: "2026-0298",
    title: "Novel Catalytic Pathways for Sustainable Hydrogen Production",
    journal: "Nature Chemistry",
    field: "Chemistry",
    deadline: "Mar 20, 2026",
    daysLeft: 15,
    status: "in_progress",
    priority: "medium",
    progress: 60,
  },
  {
    id: "2026-0256",
    title: "Epigenetic Memory in Plant Stress Responses",
    journal: "Science",
    field: "Biology",
    deadline: "Feb 28, 2026",
    daysLeft: -5,
    status: "overdue",
    priority: "high",
  },
];

const completedReviews = [
  {
    id: "2026-0201",
    title: "Topological Quantum Error Correction with Surface Codes",
    journal: "Physical Review X",
    decision: "Accept with revisions",
    completedDate: "Feb 10, 2026",
    rating: 4,
  },
  {
    id: "2025-1189",
    title: "Deep Reinforcement Learning for Autonomous Laboratory Systems",
    journal: "Nature Methods",
    decision: "Accept",
    completedDate: "Jan 22, 2026",
    rating: 5,
  },
  {
    id: "2025-1102",
    title: "Climate Feedback Loops in Arctic Permafrost Ecosystems",
    journal: "Nature Climate Change",
    decision: "Reject",
    completedDate: "Dec 15, 2025",
    rating: 2,
  },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-warning", label: "Pending" },
  in_progress: { icon: FileText, color: "text-info", label: "In Progress" },
  overdue: { icon: AlertCircle, color: "text-destructive", label: "Overdue" },
};

const reviewStatusCycle: Record<string, string> = {
  pending: "in_progress",
  in_progress: "pending",
  overdue: "in_progress",
};

const PeerReview = () => {
  const [reviews, setReviews] = useState(reviewRequests);

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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Peer Review</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Manage your review assignments and track contributions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Review Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Active Reviews", value: "3", icon: FileText, accent: true },
            { label: "Completed (2025)", value: "14", icon: CheckCircle2 },
            { label: "Avg. Turnaround", value: "12d", icon: Clock },
            { label: "Review Score", value: "4.7", icon: Star },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-4 ${stat.accent ? "bg-accent/5 border-accent/20" : "bg-card border-border"}`}>
              <stat.icon className={`w-4 h-4 mb-2 ${stat.accent ? "text-accent" : "text-gold"}`} />
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <Tabs defaultValue="active">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="active" className="font-display text-sm">Active Reviews</TabsTrigger>
            <TabsTrigger value="completed" className="font-display text-sm">Completed</TabsTrigger>
            <TabsTrigger value="guidelines" className="font-display text-sm">Guidelines</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-success/30" />
                <p className="text-sm text-muted-foreground font-display">No active reviews — you're all caught up!</p>
              </div>
            ) : reviews.map((review, i) => {
              const config = statusConfig[review.status];
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-card rounded-xl border p-5 hover:border-accent/30 transition-colors cursor-pointer group ${
                    review.status === "overdue" ? "border-destructive/20" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <config.icon className={`w-4 h-4 ${config.color}`} />
                        <Badge variant="outline" className={`text-[10px] font-display ${config.color}`}>
                          {config.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-display">#{review.id}</span>
                        {review.priority === "high" && (
                          <Badge variant="destructive" className="text-[10px] font-display">High Priority</Badge>
                        )}
                      </div>
                      <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
                        {review.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display mt-2">
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
                      <button
                        onClick={() => cycleStatus(review.id)}
                        className="text-[10px] font-display font-semibold px-2.5 py-1 rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                      >
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

          <TabsContent value="completed" className="space-y-3">
            {completedReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 group hover:border-accent/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {review.decision === "Accept" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : review.decision === "Reject" ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                      )}
                      <Badge variant="outline" className="text-[10px] font-display">
                        {review.decision}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-display">#{review.id}</span>
                    </div>
                    <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
                      {review.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display mt-2">
                      <span>{review.journal}</span>
                      <span>·</span>
                      <span>Completed {review.completedDate}</span>
                      <span>·</span>
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

          <TabsContent value="guidelines" className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-serif text-lg font-bold text-foreground mb-4">Review Guidelines</h3>
            <div className="space-y-4 text-sm font-display text-foreground/80 leading-relaxed">
              <div>
                <h4 className="font-semibold text-foreground mb-1">1. Confidentiality</h4>
                <p>All manuscripts and review content must be treated as confidential. Do not share or discuss the manuscript with others without editor approval.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">2. Objectivity</h4>
                <p>Provide constructive, evidence-based feedback. Personal criticism of authors is inappropriate. Focus on the scientific merit of the work.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">3. Timeliness</h4>
                <p>Complete reviews within the agreed deadline. If you cannot meet the deadline, notify the editor as soon as possible.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">4. Conflicts of Interest</h4>
                <p>Disclose any potential conflicts of interest that may influence your review. Decline the review if a significant conflict exists.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">5. Structured Feedback</h4>
                <p>Organize your review into: Summary, Major Comments, Minor Comments, and Recommendation. This helps authors improve their work systematically.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PeerReview;
