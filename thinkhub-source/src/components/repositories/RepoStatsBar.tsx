import { motion } from "framer-motion";
import { Wifi, FileText, AlertTriangle, Clock, TrendingUp } from "lucide-react";

interface RepoStatsBarProps {
  connectedCount: number;
  totalPapers: number;
  totalRepos: number;
  errorCount: number;
  lastSync: string;
}

const RepoStatsBar = ({ connectedCount, totalPapers, totalRepos, errorCount, lastSync }: RepoStatsBarProps) => {
  const connectedPct = Math.round((connectedCount / totalRepos) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-xl border border-border p-4 mb-6"
    >
      <div className="flex items-center gap-6 flex-wrap">
        {/* Connected ring */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="hsl(var(--accent))" strokeWidth="3"
                strokeDasharray={`${connectedPct * 0.942} 100`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <Wifi className="w-3.5 h-3.5 text-accent absolute inset-0 m-auto" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-foreground">{connectedCount}<span className="text-muted-foreground font-normal">/{totalRepos}</span></p>
            <p className="text-[10px] text-muted-foreground font-display">Connected</p>
          </div>
        </div>

        <div className="w-px h-8 bg-border hidden sm:block" />

        {/* Papers */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold-muted flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-gold" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-foreground">{totalPapers}</p>
            <p className="text-[10px] text-muted-foreground font-display">Papers synced</p>
          </div>
        </div>

        <div className="w-px h-8 bg-border hidden sm:block" />

        {/* Issues */}
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${errorCount > 0 ? "bg-warning-muted" : "bg-secondary"}`}>
            <AlertTriangle className={`w-3.5 h-3.5 ${errorCount > 0 ? "text-warning" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className={`text-sm font-display font-bold ${errorCount > 0 ? "text-warning" : "text-muted-foreground"}`}>{errorCount}</p>
            <p className="text-[10px] text-muted-foreground font-display">Issues</p>
          </div>
        </div>

        <div className="w-px h-8 bg-border hidden sm:block" />

        {/* Last sync */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-foreground">{lastSync}</p>
            <p className="text-[10px] text-muted-foreground font-display">Last sync</p>
          </div>
        </div>

        {/* Health indicator - pushed right */}
        <div className="ml-auto hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-muted">
          <TrendingUp className="w-3.5 h-3.5 text-success" />
          <span className="text-xs font-display font-semibold text-success">99.2% uptime</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RepoStatsBar;
