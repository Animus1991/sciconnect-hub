import { motion } from "framer-motion";
import { Activity, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { REPO_META, type RepoItem } from "@/hooks/use-repositories";

interface RepoHealthMonitorProps {
  repos: RepoItem[];
}

const RepoHealthMonitor = ({ repos }: RepoHealthMonitorProps) => {
  const connectedRepos = repos.filter(r => r.connected);

  if (connectedRepos.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className="font-display font-semibold text-xs text-foreground">Health Monitor</h3>
        </div>
        <p className="text-[10px] text-muted-foreground font-display">Connect repositories to monitor health.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-card rounded-xl border border-border p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-3.5 h-3.5 text-accent" />
        <h3 className="font-display font-semibold text-xs text-foreground">Health Monitor</h3>
      </div>
      <div className="space-y-2">
        {connectedRepos.map(repo => {
          const meta = REPO_META[repo.name];
          if (!meta) return null;
          const latency = meta.latencyMs;
          const isHealthy = meta.status === "synced" && latency !== undefined && latency < 500;
          const isWarning = meta.status === "pending" || (latency !== undefined && latency >= 500);
          const isError = meta.status === "error";

          return (
            <div key={repo.name} className="flex items-center gap-2 py-1">
              <span className="text-xs">{repo.icon}</span>
              <span className="text-[10px] font-display text-foreground flex-1 truncate">{repo.name}</span>

              {latency !== undefined && (
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        latency < 200 ? "bg-success" : latency < 500 ? "bg-warning" : "bg-destructive"
                      }`}
                      style={{ width: `${Math.min(100, (latency / 1000) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground w-7 text-right">{latency}ms</span>
                </div>
              )}

              {isHealthy && <CheckCircle className="w-3 h-3 text-success shrink-0" />}
              {isWarning && <Clock className="w-3 h-3 text-warning shrink-0" />}
              {isError && <AlertCircle className="w-3 h-3 text-destructive shrink-0" />}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RepoHealthMonitor;
