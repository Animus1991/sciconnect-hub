import { motion } from "framer-motion";
import { Shield, FileText, Database, Clock, AlertTriangle, Wifi } from "lucide-react";

interface RepoStatsBarProps {
  connectedCount: number;
  totalPapers: number;
  totalRepos: number;
  errorCount: number;
  lastSync: string;
}

const RepoStatsBar = ({ connectedCount, totalPapers, totalRepos, errorCount, lastSync }: RepoStatsBarProps) => {
  const stats = [
    { label: "Connected", value: `${connectedCount}/${totalRepos}`, icon: Wifi, color: "text-emerald-brand", bg: "bg-emerald-muted" },
    { label: "Papers Synced", value: String(totalPapers), icon: FileText, color: "text-gold", bg: "bg-gold-muted" },
    { label: "Issues", value: String(errorCount), icon: AlertTriangle, color: errorCount > 0 ? "text-warning" : "text-muted-foreground", bg: errorCount > 0 ? "bg-warning-muted" : "bg-secondary" },
    { label: "Last Sync", value: lastSync, icon: Clock, color: "text-muted-foreground", bg: "bg-secondary" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
        >
          <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div>
            <p className={`text-lg font-display font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RepoStatsBar;
