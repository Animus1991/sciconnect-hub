import { motion } from "framer-motion";
import { Clock, TestTube, RefreshCw, FileText, Bell, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { RECENT_ACTIVITY, type RepoItem } from "@/hooks/use-repositories";
import RepoHealthMonitor from "./RepoHealthMonitor";

interface RepoSidebarProps {
  repos: RepoItem[];
  repoStates: Record<string, boolean>;
  onSyncAll: () => void;
  onShowNotifications: () => void;
  onShowImportExport: () => void;
}

const RepoSidebar = ({ repos, repoStates, onSyncAll, onShowNotifications, onShowImportExport }: RepoSidebarProps) => {
  return (
    <div className="space-y-4">
      {/* Sync Activity */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-sm text-foreground">Sync Activity</h3>
        </div>
        <div className="space-y-3">
          {RECENT_ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-display text-foreground leading-snug">{item.action}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Health Monitor */}
      <RepoHealthMonitor repos={repos} />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border p-5"
      >
        <h3 className="font-display font-semibold text-sm text-foreground mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {[
            { label: "Test all connections", icon: TestTube, action: () => toast.info("Testing all connections...") },
            { label: "Sync all connected", icon: RefreshCw, action: onSyncAll },
            { label: "Import papers", icon: FileText, action: onShowImportExport },
            { label: "Sync alerts", icon: Bell, action: onShowNotifications },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-display text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Connection Overview */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl border border-border p-5"
      >
        <h3 className="font-display font-semibold text-sm text-foreground mb-3">Connection Overview</h3>
        <div className="space-y-2">
          {repos.map(repo => (
            <div key={repo.name} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{repo.icon}</span>
                <span className="text-[11px] font-display text-foreground">{repo.name}</span>
              </div>
              {repoStates[repo.name] ? (
                <Wifi className="w-3 h-3 text-emerald-brand" />
              ) : (
                <WifiOff className="w-3 h-3 text-muted-foreground/40" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RepoSidebar;
