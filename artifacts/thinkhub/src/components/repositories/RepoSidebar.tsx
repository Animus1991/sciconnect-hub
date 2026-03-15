import { motion } from "framer-motion";
import { Clock, TestTube, RefreshCw, FileText, Bell } from "lucide-react";
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
        className="bg-card rounded-xl border border-border p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className="font-display font-semibold text-xs text-foreground">Recent Activity</h3>
        </div>
        <div className="space-y-2.5">
          {RECENT_ACTIVITY.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-sm leading-none mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-display text-foreground leading-snug">{item.action}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{item.time}</p>
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
        className="bg-card rounded-xl border border-border p-4"
      >
        <h3 className="font-display font-semibold text-xs text-foreground mb-2.5">Quick Actions</h3>
        <div className="space-y-1">
          {[
            { label: "Test all connections", icon: TestTube, action: () => toast.info("Testing all connections...") },
            { label: "Sync all connected", icon: RefreshCw, action: onSyncAll },
            { label: "Import / Export", icon: FileText, action: onShowImportExport },
            { label: "Sync alerts", icon: Bell, action: onShowNotifications },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <item.icon className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-display text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RepoSidebar;
