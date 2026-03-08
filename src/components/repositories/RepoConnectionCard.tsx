import { motion } from "framer-motion";
import {
  Check, Settings, Link2, RefreshCw, TestTube, Timer,
  Loader2, CheckCircle, XCircle, AlertCircle, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { REPO_META, type RepoItem } from "@/hooks/use-repositories";

interface RepoConnectionCardProps {
  repo: RepoItem;
  index: number;
  isSyncing: boolean;
  syncProgress?: number;
  isTesting: boolean;
  testResult?: "success" | "error";
  onConnect: () => void;
  onManage: () => void;
  onSync: () => void;
  onTest: () => void;
  onSchedule: () => void;
}

const RepoConnectionCard = ({
  repo, index, isSyncing, syncProgress, isTesting, testResult,
  onConnect, onManage, onSync, onTest, onSchedule
}: RepoConnectionCardProps) => {
  const meta = REPO_META[repo.name];

  const statusIndicator = () => {
    if (!meta) return null;
    switch (meta.status) {
      case "synced": return <span className="w-2 h-2 rounded-full bg-success" />;
      case "pending": return <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />;
      case "error": return <AlertCircle className="w-3.5 h-3.5 text-destructive" />;
      default: return <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />;
    }
  };

  const statusLabel = () => {
    if (!meta) return "";
    switch (meta.status) {
      case "synced": return `Synced ${meta.lastSync}`;
      case "pending": return "Sync pending";
      case "error": return "Sync error";
      default: return "Not connected";
    }
  };

  const latencyColor = (ms: number) =>
    ms < 200 ? "text-success" : ms < 500 ? "text-warning" : "text-destructive";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.03 }}
      className={`card-interactive p-4 flex flex-col relative overflow-hidden ${
        repo.connected ? "border-accent/15" : ""
      }`}
    >
      {/* Sync progress bar */}
      {isSyncing && typeof syncProgress === "number" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-border">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(syncProgress, 100)}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center gap-3 mb-2.5">
        <span className="text-xl leading-none">{repo.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-sm text-foreground truncate">{repo.name}</h3>
            {repo.connected && (
              <Badge className="text-[9px] px-1.5 py-0 h-4 bg-success-muted text-success border-success/20">
                <Check className="w-2 h-2 mr-0.5" />Connected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {statusIndicator()}
            <span className="text-[10px] text-muted-foreground font-display">{statusLabel()}</span>
          </div>
        </div>
        {meta?.latencyMs !== undefined && (
          <span className={`text-[10px] font-mono font-medium ${latencyColor(meta.latencyMs)}`}>
            {meta.latencyMs}ms
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[11px] text-muted-foreground font-display leading-relaxed mb-3 flex-1 line-clamp-2">{repo.description}</p>

      {/* Meta chips */}
      {meta && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[9px] font-display px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
            {meta.authType}
          </span>
          {meta.apiVersion && (
            <span className="text-[9px] font-display px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
              API {meta.apiVersion}
            </span>
          )}
          {repo.connected && meta.papers > 0 && (
            <span className="text-[9px] font-display px-2 py-0.5 rounded-md bg-accent/10 text-accent font-medium">
              {meta.papers} papers
            </span>
          )}
        </div>
      )}

      {/* Test result - inline */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-3 text-[10px] font-display ${
            testResult === "success" ? "bg-success-muted text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {testResult === "success" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {testResult === "success" ? "Connection test passed" : "Connection test failed"}
        </motion.div>
      )}

      {/* Actions */}
      <TooltipProvider delayDuration={300}>
        <div className="flex gap-1.5">
          <button
            onClick={repo.connected ? onManage : onConnect}
            className={`flex-1 h-8 rounded-lg font-display font-medium text-[11px] flex items-center justify-center gap-1.5 transition-all ${
              repo.connected
                ? "bg-secondary text-foreground hover:bg-secondary/80"
                : "gradient-gold text-accent-foreground shadow-gold hover:opacity-90"
            }`}
          >
            {repo.connected ? <><Settings className="w-3 h-3" /> Manage</> : <><Link2 className="w-3 h-3" /> Connect</>}
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onTest}
                disabled={isTesting}
                className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                {isTesting ? <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" /> : <TestTube className="w-3 h-3 text-muted-foreground" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px]">Test connection</TooltipContent>
          </Tooltip>

          {repo.connected && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onSync}
                    disabled={isSyncing}
                    className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 text-muted-foreground ${isSyncing ? "animate-spin" : ""}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  {isSyncing ? `Syncing ${Math.round(syncProgress || 0)}%` : "Sync now"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onSchedule}
                    className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                  >
                    <Timer className="w-3 h-3 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">Auto-sync schedule</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>
    </motion.div>
  );
};

export default RepoConnectionCard;
