import { motion } from "framer-motion";
import { Shuffle, Lightbulb, ArrowRight, RefreshCw, Bookmark, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { mockPapers } from "@/data/mockData";

interface SerendipityPaper {
  title: string;
  authors: string[];
  journal: string;
  reason: string;
  tags: string[];
  citations: number;
}

const REASONS = [
  "Outside your usual field — cross-pollination potential",
  "Cited by researchers in your network",
  "Uses methods similar to your recent work",
  "Contrarian perspective on a topic you follow",
  "Breakthrough paper with unusual methodology",
  "From an emerging lab you haven't explored",
];

function getRandomPaper(): SerendipityPaper {
  const paper = mockPapers[Math.floor(Math.random() * mockPapers.length)];
  const reason = REASONS[Math.floor(Math.random() * REASONS.length)];
  return { ...paper, reason };
}

export function SerendipityEngine() {
  const [paper, setPaper] = useState<SerendipityPaper>(getRandomPaper);
  const [isSpinning, setIsSpinning] = useState(false);
  const [saved, setSaved] = useState(false);

  const surprise = useCallback(() => {
    setIsSpinning(true);
    setSaved(false);
    setTimeout(() => {
      setPaper(getRandomPaper());
      setIsSpinning(false);
    }, 400);
  }, []);

  const handleSave = () => {
    setSaved(p => !p);
    toast(saved ? "Removed from reading list" : "Added to reading list");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-xl border border-border p-4 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-warning-muted flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-warning" />
            </div>
            <h3 className="text-[13px] font-semibold text-foreground">Surprise Me</h3>
          </div>
          <button
            onClick={surprise}
            className="flex items-center gap-1 text-[10px] font-medium text-accent hover:text-foreground transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isSpinning ? "animate-spin" : ""}`} />
            Shuffle
          </button>
        </div>

        <motion.div
          key={paper.title}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <h4 className="text-[12px] font-medium text-foreground leading-snug mb-1 line-clamp-2 cursor-pointer hover:text-accent transition-colors">
            {paper.title}
          </h4>
          <p className="text-[10px] text-muted-foreground mb-2">
            {paper.authors.slice(0, 2).join(", ")}{paper.authors.length > 2 ? " et al." : ""} · {paper.journal}
          </p>
          
          <div className="flex items-center gap-1 mb-2 p-1.5 rounded-md bg-accent/5 border border-accent/10">
            <Shuffle className="w-3 h-3 text-accent shrink-0" />
            <p className="text-[9px] text-accent/80 italic">{paper.reason}</p>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {paper.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
            ))}
            <span className="text-[9px] text-muted-foreground ml-1">{paper.citations} citations</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-accent/10 text-accent text-[10px] font-medium hover:bg-accent/20 transition-colors">
              Read <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={handleSave}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                saved ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
