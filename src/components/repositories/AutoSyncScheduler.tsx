import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, RefreshCw, Calendar, ChevronDown, Check, Play, Pause,
  History, AlertCircle, CheckCircle, Settings, Timer
} from "lucide-react";
import { toast } from "sonner";

interface SyncSchedule {
  enabled: boolean;
  interval: string;
  lastRun?: string;
  nextRun?: string;
}

interface SyncHistoryItem {
  time: string;
  status: "success" | "error" | "partial";
  itemsSynced: number;
  duration: string;
  details?: string;
}

interface AutoSyncSchedulerProps {
  repoName: string;
  repoIcon: string;
  connected: boolean;
  onClose: () => void;
}

const INTERVALS = [
  { value: "15m", label: "Every 15 minutes", cron: "*/15 * * * *" },
  { value: "30m", label: "Every 30 minutes", cron: "*/30 * * * *" },
  { value: "1h", label: "Every hour", cron: "0 * * * *" },
  { value: "6h", label: "Every 6 hours", cron: "0 */6 * * *" },
  { value: "12h", label: "Every 12 hours", cron: "0 */12 * * *" },
  { value: "daily", label: "Daily", cron: "0 0 * * *" },
  { value: "weekly", label: "Weekly", cron: "0 0 * * 0" },
  { value: "monthly", label: "Monthly", cron: "0 0 1 * *" },
];

const MOCK_HISTORY: SyncHistoryItem[] = [
  { time: "2 hours ago", status: "success", itemsSynced: 3, duration: "12s", details: "3 new publications indexed" },
  { time: "8 hours ago", status: "success", itemsSynced: 0, duration: "4s", details: "No new items found" },
  { time: "14 hours ago", status: "partial", itemsSynced: 2, duration: "18s", details: "2 synced, 1 failed (rate limit)" },
  { time: "1 day ago", status: "success", itemsSynced: 5, duration: "22s", details: "5 citations updated" },
  { time: "2 days ago", status: "error", itemsSynced: 0, duration: "3s", details: "API key expired" },
  { time: "3 days ago", status: "success", itemsSynced: 1, duration: "8s", details: "1 new preprint indexed" },
];

const AutoSyncScheduler = ({ repoName, repoIcon, connected, onClose }: AutoSyncSchedulerProps) => {
  const [schedule, setSchedule] = useState<SyncSchedule>({
    enabled: connected,
    interval: "6h",
    lastRun: "2 hours ago",
    nextRun: "In 4 hours",
  });
  const [showCron, setShowCron] = useState(false);
  const [customCron, setCustomCron] = useState("");
  const [tab, setTab] = useState<"schedule" | "history">("schedule");

  const selectedInterval = INTERVALS.find(i => i.value === schedule.interval);

  const handleSave = () => {
    toast.success(`Auto-sync ${schedule.enabled ? "enabled" : "disabled"} for ${repoName}`);
    onClose();
  };

  const handleToggle = () => {
    setSchedule(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{repoIcon}</span>
            <div>
              <h2 className="font-display font-bold text-foreground">Auto-Sync Settings</h2>
              <p className="text-[10px] text-muted-foreground font-display">{repoName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <span className="text-muted-foreground text-lg">×</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["schedule", "history"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-display font-medium transition-all capitalize flex items-center justify-center gap-1.5 ${
                tab === t ? "text-foreground border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t === "schedule" ? <Settings className="w-3.5 h-3.5" /> : <History className="w-3.5 h-3.5" />}
              {t === "schedule" ? "Schedule" : "Sync History"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {tab === "schedule" ? (
              <motion.div key="schedule" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {/* Enable toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 mb-4">
                  <div className="flex items-center gap-2.5">
                    {schedule.enabled ? <Play className="w-4 h-4 text-emerald-brand" /> : <Pause className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <p className="text-xs font-display font-medium text-foreground">Auto-Sync</p>
                      <p className="text-[10px] text-muted-foreground">{schedule.enabled ? "Running" : "Paused"}</p>
                    </div>
                  </div>
                  <button onClick={handleToggle}
                    className={`w-11 h-6 rounded-full transition-colors relative ${schedule.enabled ? "bg-accent" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform ${
                      schedule.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>

                {/* Interval selector */}
                <div className="mb-4">
                  <label className="text-xs font-display font-medium text-foreground mb-2 block">Sync Interval</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {INTERVALS.map(interval => (
                      <button key={interval.value} onClick={() => setSchedule(prev => ({ ...prev, interval: interval.value }))}
                        className={`p-2.5 rounded-lg text-left transition-all ${
                          schedule.interval === interval.value
                            ? "bg-accent/10 border border-accent/30 text-foreground"
                            : "bg-secondary/30 border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}>
                        <p className="text-xs font-display font-medium">{interval.label}</p>
                        <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{interval.cron}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom cron */}
                <div className="mb-4">
                  <button onClick={() => setShowCron(!showCron)}
                    className="flex items-center gap-1.5 text-xs text-accent font-display font-medium mb-2">
                    <Timer className="w-3 h-3" />
                    Custom cron expression
                    <ChevronDown className={`w-3 h-3 transition-transform ${showCron ? "rotate-180" : ""}`} />
                  </button>
                  {showCron && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <input
                        value={customCron}
                        onChange={e => setCustomCron(e.target.value)}
                        placeholder="e.g., 0 */4 * * 1-5"
                        className="w-full h-9 px-3 rounded-lg bg-secondary/30 border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <p className="text-[9px] text-muted-foreground mt-1 font-display">
                        Format: minute hour day month weekday
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Status info */}
                {schedule.enabled && (
                  <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground font-display">Current interval</span>
                      <span className="text-[10px] font-display font-medium text-foreground">{selectedInterval?.label || schedule.interval}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground font-display">Last sync</span>
                      <span className="text-[10px] font-display font-medium text-foreground">{schedule.lastRun || "Never"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground font-display">Next sync</span>
                      <span className="text-[10px] font-display font-medium text-accent">{schedule.nextRun || "—"}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div className="space-y-2.5">
                  {MOCK_HISTORY.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                      <div className="mt-0.5">
                        {item.status === "success" && <CheckCircle className="w-4 h-4 text-emerald-brand" />}
                        {item.status === "error" && <AlertCircle className="w-4 h-4 text-destructive" />}
                        {item.status === "partial" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-display font-medium text-foreground">
                            {item.status === "success" ? "Sync completed" : item.status === "error" ? "Sync failed" : "Partial sync"}
                          </p>
                          <span className="text-[9px] text-muted-foreground font-display">{item.duration}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-display">{item.details}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-muted-foreground font-display">{item.time}</span>
                          {item.itemsSynced > 0 && (
                            <span className="text-[9px] font-display text-accent">{item.itemsSynced} items</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-border">
          <button onClick={onClose}
            className="h-9 px-4 rounded-lg bg-secondary text-foreground font-display font-medium text-xs hover:bg-secondary/80 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="h-9 px-5 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-xs shadow-gold hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Save Schedule
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AutoSyncScheduler;
