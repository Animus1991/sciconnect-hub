import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, TrendingUp, Star, ArrowUpRight, RefreshCw, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Recommendation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  relevance: number;
  reason: string;
  citations: number;
  isNew: boolean;
  tags: string[];
}

const recommendations: Recommendation[] = [
  {
    id: "1", title: "Self-Supervised Learning for Scientific Text Mining",
    authors: "Zhang et al.", journal: "NeurIPS", year: 2025, relevance: 96,
    reason: "Matches your work on attention mechanisms and NLP for science",
    citations: 34, isNew: true, tags: ["NLP", "self-supervised"]
  },
  {
    id: "2", title: "Federated Learning in Biomedical Research: Privacy-Preserving Approaches",
    authors: "Patel, Kumar & Singh", journal: "Nature Methods", year: 2025, relevance: 91,
    reason: "Related to your CRISPR data analysis methodology",
    citations: 18, isNew: true, tags: ["federated learning", "biomedical"]
  },
  {
    id: "3", title: "Microplastic Detection via Satellite Imagery and Deep Learning",
    authors: "Oliveira & Tanaka", journal: "Environ. Sci. Tech.", year: 2024, relevance: 88,
    reason: "Directly extends your ocean microplastic distribution dataset",
    citations: 67, isNew: false, tags: ["remote sensing", "microplastics"]
  },
  {
    id: "4", title: "Graph Neural Networks for Citation Analysis",
    authors: "Li, Wang & Chen", journal: "AAAI", year: 2025, relevance: 85,
    reason: "Novel approach to citation graph modeling in your field",
    citations: 22, isNew: true, tags: ["GNN", "bibliometrics"]
  },
  {
    id: "5", title: "Cross-Modal Transformers for Multi-Omics Integration",
    authors: "Müller et al.", journal: "Cell Systems", year: 2024, relevance: 82,
    reason: "Complements your transformer architecture expertise",
    citations: 89, isNew: false, tags: ["transformers", "multi-omics"]
  },
];

const AIRecommendations: React.FC = () => {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info("Removed from reading list"); }
      else { next.add(id); toast.success("Added to reading list"); }
      return next;
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <h3 className="font-display font-semibold text-foreground">AI-Recommended Papers</h3>
          <Badge variant="outline" className="text-[10px]">Based on your profile</Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => toast.info("Refreshing recommendations...")}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {recommendations.map((paper, i) => (
          <motion.div
            key={paper.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group flex items-start gap-3 p-3 rounded-lg border border-border hover:border-gold/30 hover:bg-secondary/30 transition-all"
          >
            {/* Relevance score */}
            <div className="shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center bg-gold-muted">
              <span className="text-sm font-bold font-display text-gold">{paper.relevance}</span>
              <span className="text-[8px] text-gold-foreground font-display">%</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-display font-medium text-foreground leading-snug line-clamp-1 group-hover:text-gold transition-colors">
                  {paper.title}
                </p>
                {paper.isNew && <Badge className="bg-emerald-muted text-emerald text-[9px] shrink-0">New</Badge>}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{paper.authors} · {paper.journal} ({paper.year})</p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">💡 {paper.reason}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-muted-foreground font-display">
                  <span className="text-foreground font-medium">{paper.citations}</span> citations
                </span>
                <div className="flex gap-1">
                  {paper.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                onClick={() => toggleSave(paper.id)}>
                <Bookmark className={`w-3.5 h-3.5 ${saved.has(paper.id) ? 'fill-gold text-gold' : 'text-muted-foreground'}`} />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                onClick={() => toast.info(`Opening: ${paper.title}`)}>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;
