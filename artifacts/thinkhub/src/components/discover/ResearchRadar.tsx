import { motion } from "framer-motion";
import { Radar, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface RadarField {
  name: string;
  score: number;
  maxScore: number;
  trend: "up" | "down" | "stable";
}

const RADAR_FIELDS: RadarField[] = [
  { name: "Machine Learning", score: 88, maxScore: 100, trend: "up" },
  { name: "Genomics", score: 65, maxScore: 100, trend: "up" },
  { name: "Quantum Physics", score: 42, maxScore: 100, trend: "stable" },
  { name: "Climate Science", score: 55, maxScore: 100, trend: "down" },
  { name: "Neuroscience", score: 38, maxScore: 100, trend: "up" },
  { name: "Drug Discovery", score: 71, maxScore: 100, trend: "up" },
];

const trendIcons = {
  up: "↑",
  down: "↓",
  stable: "→",
};

const trendColors = {
  up: "text-success",
  down: "text-destructive",
  stable: "text-muted-foreground",
};

export function ResearchRadar() {
  const { user } = useAuth();
  const topField = RADAR_FIELDS.reduce((a, b) => a.score > b.score ? a : b);

  return (
    <motion.section
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card rounded-xl border border-border p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Radar className="w-3.5 h-3.5 text-accent" />
        <h3 className="text-[13px] font-semibold text-foreground">Your Research Radar</h3>
      </div>

      {/* Radar Visual - Simplified bar chart */}
      <div className="space-y-2.5 mb-3">
        {RADAR_FIELDS.map((field, i) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.04 }}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-muted-foreground truncate flex-1">{field.name}</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-medium ${trendColors[field.trend]}`}>
                  {trendIcons[field.trend]}
                </span>
                <span className="text-[10px] font-bold text-foreground w-6 text-right">{field.score}</span>
              </div>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(field.score / field.maxScore) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.06, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  field.score >= 75 ? "bg-accent" : field.score >= 50 ? "bg-foreground/40" : "bg-muted-foreground/30"
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-[10px]">
          <Zap className="w-3 h-3 text-warning" />
          <span className="text-muted-foreground">
            Strongest: <span className="text-foreground font-medium">{topField.name}</span> ({topField.score}%)
          </span>
        </div>
      </div>
    </motion.section>
  );
}
