import { motion } from "framer-motion";
import {
  Check, Settings, Link2, RefreshCw, TestTube, Timer,
  Loader2, CheckCircle, XCircle, AlertCircle, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { REPO_META, type RepoItem } from "@/hooks/use-repositories";

interface RepoConnectionCardProps {
  repo: RepoItem;
  index: number;
  isSyncing: boolean;
  isTesting: boolean;
  testResult?: "success" | "error";
  onConnect: () => void;
  onManage: () => void;
  onSync: () => void;
  onTest: () => void;
  onSchedule: () => void;
}

const RepoConnectionCard = ({
  repo, index, isSyncing, isTesting, testResult,
  onConnect, onManage, onSync, onTest, onSchedule
}: RepoConnectionCardProps) => {
  const meta = REPO_META[repo.name];

  const statusDot = () => {
    if (!meta) return null;
    switch (meta.status) {
      case "synced": return <span className="w-1.5 h-1.5 rounded-full bg-emerald-brand" />;
      case "pending": return <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />;
      case "error": return <AlertCircle className="w-3 h-3 text-destructive" />;
      default: return <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />;
    }
  };

  const statusText = () => {
    if (!meta) return "";
    switch (meta.status) {
      case "synced": return `Synced ${meta.lastSync}`;
      case "pending": return "Sync pending";
      case "error": return "Sync error";
      default: return "Not connected";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.03 }}
      className={`bg-card rounded-xl border p-5 hover:shadow-scholarly transition-all duration-300 flex flex-col ${
        repo.connected ? "border-accent/20" : "border-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{repo.icon}</div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{repo.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {statusDot()}
              <span className="text-[10px] text-muted-foreground font-display">{statusText()}</span>
            </div>
          </div>
        </div>
        {repo.connected ? (
          <Badge className="text-[10px] bg-emerald-muted text-emerald-brand border-emerald-brand/20">
            <Check className="w-2.5 h-2.5 mr-1" /> Connected
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px]">Not connected</Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground font-display leading-relaxed mb-3 flex-1">{repo.description}</p>

      {/* Meta info */}
      {meta && (
        <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-secondary/50 mb-3 text-[10px] font-display flex-wrap">
          <span className="text-muted-foreground">Auth: <span className="text-foreground font-medium">{meta.authType}</span></span>
          {meta.apiVersion && (
            <span className="text-muted-foreground">API: <span className="text-foreground font-medium">{meta.apiVersion}</span></span>
          )}
          {repo.connected && meta.papers > 0 && (
            <span className="text-muted-foreground"><span className="text-foreground font-medium">{meta.papers}</span> papers</span>
          )}
          {meta.latencyMs !== undefined && (
            <span className="text-muted-foreground">
              <span className={`font-medium ${meta.latencyMs < 200 ? "text-emerald-brand" : meta.latencyMs < 500 ? "text-warning" : "text-destructive"}`}>
                {meta.latencyMs}ms
              </span>
            </span>
          )}
        </div>
      )}

      {/* Test result */}
      {testResult && (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-3 text-[10px] font-display ${
          testResult === "success" ? "bg-emerald-muted text-emerald-brand" : "bg-destructive/10 text-destructive"
        }`}>
          {testResult === "success" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {testResult === "success" ? "Connection test passed" : "Connection test failed"}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={repo.connected ? onManage : onConnect}
          className={`flex-1 h-9 rounded-lg font-display font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
            repo.connected
              ? "bg-secondary text-foreground hover:bg-secondary/80"
              : "gradient-gold text-accent-foreground shadow-gold hover:opacity-90"
          }`}
        >
          {repo.connected ? <><Settings className="w-3.5 h-3.5" /> Manage</> : <><Link2 className="w-3.5 h-3.5" /> Connect</>}
        </button>
        <button
          onClick={onTest}
          disabled={isTesting}
          className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          title="Test connection"
        >
          {isTesting ? <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" /> : <TestTube className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        {repo.connected && (
          <>
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              title="Sync now"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isSyncing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onSchedule}
              className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              title="Auto-sync schedule"
            >
              <Timer className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default RepoConnectionCard;
