import { motion } from "framer-motion";
import { Activity, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";
import { REPO_META, type RepoItem } from "@/hooks/use-repositories";

interface RepoHealthMonitorProps {
  repos: RepoItem[];
}

const RepoHealthMonitor = ({ repos }: RepoHealthMonitorProps) => {
  const connectedRepos = repos.filter(r => r.connected);

  if (connectedRepos.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-sm text-foreground">Health Monitor</h3>
        </div>
        <p className="text-xs text-muted-foreground font-display">Connect repositories to see health status.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-card rounded-xl border border-border p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-accent" />
        <h3 className="font-display font-semibold text-sm text-foreground">Health Monitor</h3>
      </div>
      <div className="space-y-2.5">
        {connectedRepos.map(repo => {
          const meta = REPO_META[repo.name];
          if (!meta) return null;
          const latency = meta.latencyMs;
          const isHealthy = meta.status === "synced" && latency !== undefined && latency < 500;
          const isWarning = meta.status === "pending" || (latency !== undefined && latency >= 500);
          const isError = meta.status === "error";

          return (
            <div key={repo.name} className="flex items-center gap-3 py-1.5">
              <span className="text-sm">{repo.icon}</span>
              <span className="text-[11px] font-display text-foreground flex-1">{repo.name}</span>

              {/* Latency bar */}
              {latency !== undefined && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        latency < 200 ? "bg-emerald-brand" : latency < 500 ? "bg-warning" : "bg-destructive"
                      }`}
                      style={{ width: `${Math.min(100, (latency / 1000) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground w-8 text-right">{latency}ms</span>
                </div>
              )}

              {/* Status icon */}
              {isHealthy && <CheckCircle className="w-3.5 h-3.5 text-emerald-brand" />}
              {isWarning && <Clock className="w-3.5 h-3.5 text-warning" />}
              {isError && <AlertCircle className="w-3.5 h-3.5 text-destructive" />}
            </div>
          );
        })}
      </div>

      {/* Overall uptime */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-display">Overall Uptime</span>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-emerald-brand" />
          <span className="text-xs font-display font-semibold text-emerald-brand">99.2%</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RepoHealthMonitor;
