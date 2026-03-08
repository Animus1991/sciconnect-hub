import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ThumbsUp, ThumbsDown, Bookmark, ExternalLink, ChevronRight, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Recommendation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  matchScore: number;
  reason: string;
  tags: string[];
  type: "paper" | "researcher" | "dataset" | "grant";
  isNew?: boolean;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-1",
    title: "Transformer Architectures for Scientific Discovery",
    authors: "Zhang et al.",
    journal: "Nature ML",
    matchScore: 96,
    reason: "Matches your interest in ML + Biology",
    tags: ["Deep Learning", "Science"],
    type: "paper",
    isNew: true,
  },
  {
    id: "rec-2",
    title: "Dr. Elena Rodriguez — Computational Genomics Lab",
    authors: "MIT",
    journal: "",
    matchScore: 91,
    reason: "5 mutual collaborators, similar methods",
    tags: ["Genomics", "ML"],
    type: "researcher",
  },
  {
    id: "rec-3",
    title: "Multi-Omics Integration Dataset (2024)",
    authors: "NIH Open Data",
    journal: "Zenodo",
    matchScore: 88,
    reason: "Relevant to your CRISPR project",
    tags: ["Omics", "Open Data"],
    type: "dataset",
  },
  {
    id: "rec-4",
    title: "NSF Grant: AI-Driven Drug Discovery",
    authors: "NSF",
    journal: "Deadline: Apr 15",
    matchScore: 85,
    reason: "Aligned with your funding profile",
    tags: ["Funding", "AI"],
    type: "grant",
  },
  {
    id: "rec-5",
    title: "Causal Inference in Observational Climate Studies",
    authors: "Hernandez & Liu",
    journal: "Science Advances",
    matchScore: 82,
    reason: "Cited by 3 people you follow",
    tags: ["Climate", "Statistics"],
    type: "paper",
  },
];

const typeIcons: Record<string, { emoji: string; color: string }> = {
  paper: { emoji: "📄", color: "bg-scholarly/10 text-scholarly" },
  researcher: { emoji: "👤", color: "bg-info-muted text-info" },
  dataset: { emoji: "📊", color: "bg-success-muted text-success" },
  grant: { emoji: "💰", color: "bg-warning-muted text-warning" },
};

export function PersonalizedRecommendations() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const visibleRecs = RECOMMENDATIONS.filter(r => !dismissed.has(r.id));

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    toast("Recommendation dismissed — we'll improve suggestions");
  };

  const handleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Removed from saved"); }
      else { next.add(id); toast.success("Saved for later"); }
      return next;
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card rounded-xl border border-border p-4 md:p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-accent" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Recommended for You</h3>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">AI</Badge>
        </div>
        <Link to="/discover" className="text-[10px] text-accent font-medium hover:underline flex items-center gap-0.5">
          Explore <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleRecs.slice(0, 4).map((rec, i) => {
            const style = typeIcons[rec.type];
            const isSaved = saved.has(rec.id);
            return (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className={`p-3 rounded-lg border transition-all ${rec.isNew ? "border-accent/20 bg-accent/5" : "border-transparent bg-secondary/30 hover:bg-secondary/50"}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className={`text-sm mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${style.color}`}>
                    {style.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[12px] font-medium text-foreground leading-snug line-clamp-2 cursor-pointer hover:text-accent transition-colors">
                        {rec.title}
                      </h4>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          rec.matchScore >= 90 ? "bg-success-muted text-success" : "bg-secondary text-muted-foreground"
                        }`}>
                          {rec.matchScore}%
                        </span>
                      </div>
                    </div>
                    {rec.authors && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {rec.authors}{rec.journal ? ` · ${rec.journal}` : ""}
                      </p>
                    )}
                    <p className="text-[9px] text-accent/80 mt-1 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {rec.reason}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {rec.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                      <div className="ml-auto flex items-center gap-0.5">
                        <button
                          onClick={() => handleSave(rec.id)}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isSaved ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                          title="Save"
                        >
                          <Bookmark className={`w-3 h-3 ${isSaved ? "fill-current" : ""}`} />
                        </button>
                        <button
                          onClick={() => handleDismiss(rec.id)}
                          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Not interested"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
