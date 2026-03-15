import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, AlertTriangle, AlertCircle, CheckCircle, FileText, X,
  Clock, RefreshCw, ShieldAlert, Filter, Trash2, CheckCheck, ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type NotifType = "sync_failure" | "rate_limit" | "new_papers" | "sync_success";

interface SyncNotification {
  id: string;
  type: NotifType;
  repo: string;
  repoIcon: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  details?: string;
  actionLabel?: string;
}

const mockNotifications: SyncNotification[] = [
  {
    id: "sn1", type: "sync_failure", repo: "arXiv", repoIcon: "📄",
    title: "Sync failed for arXiv",
    message: "Connection timeout after 30s. The arXiv API may be experiencing downtime.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12), read: false,
    details: "Error: ETIMEDOUT — The request to https://export.arxiv.org/api/query timed out. Last successful sync was 2 hours ago. 8 papers were synced in the previous run.",
    actionLabel: "Retry sync",
  },
  {
    id: "sn2", type: "rate_limit", repo: "Semantic Scholar", repoIcon: "🔬",
    title: "Rate limit reached — Semantic Scholar",
    message: "API rate limit exceeded (100 req/5min). Sync paused automatically, will resume in 4 minutes.",
    timestamp: new Date(Date.now() - 1000 * 60 * 25), read: false,
    details: "Rate limit: 100 requests per 5 minutes. You made 103 requests. Remaining cooldown: ~4 min. Consider increasing your sync interval to avoid this.",
  },
  {
    id: "sn3", type: "new_papers", repo: "ORCID", repoIcon: "🆔",
    title: "3 new publications synced from ORCID",
    message: "Found 3 new papers since your last sync. They have been added to your library.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false,
    details: '1. "Attention Is All You Need — Revisited" (Nature ML, 2026)\n2. "Federated Learning for Privacy-Preserving Genomics" (Cell Systems, 2026)\n3. "Quantum Error Correction with Topological Codes" (PRL, 2026)',
  },
  {
    id: "sn4", type: "sync_success", repo: "GitHub", repoIcon: "🐙",
    title: "GitHub sync completed",
    message: "Successfully synced 2 repositories with 14 new commits indexed.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), read: true,
  },
  {
    id: "sn5", type: "sync_failure", repo: "PubMed", repoIcon: "🏥",
    title: "PubMed API authentication error",
    message: "Invalid API key. Please update your PubMed credentials in connection settings.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), read: true,
    details: "HTTP 401 Unauthorized. Your API key may have been revoked or expired. Go to NCBI settings to regenerate your key.",
    actionLabel: "Update credentials",
  },
  {
    id: "sn6", type: "rate_limit", repo: "Scopus", repoIcon: "📚",
    title: "Scopus weekly quota reached",
    message: "You have reached your weekly API quota (5000 requests). Resets on Monday.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true,
    details: "Quota: 5000 requests/week. Used: 5000/5000. Reset: Monday 00:00 UTC. Consider upgrading your Scopus API plan for higher limits.",
  },
  {
    id: "sn7", type: "new_papers", repo: "arXiv", repoIcon: "📄",
    title: "5 new preprints matching your interests",
    message: "New arXiv preprints in cs.LG, cs.AI matching your saved queries.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), read: true,
    details: 'Matched queries: "transformer attention", "federated learning"\n5 papers matched across cs.LG (3), cs.AI (1), q-bio.GN (1)',
  },
];

const typeConfig: Record<NotifType, { icon: typeof AlertCircle; color: string; bg: string; label: string }> = {
  sync_failure: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Sync Failure" },
  rate_limit:   { icon: ShieldAlert, color: "text-gold", bg: "bg-gold-muted", label: "Rate Limit" },
  new_papers:   { icon: FileText, color: "text-emerald-brand", bg: "bg-emerald-muted", label: "New Papers" },
  sync_success: { icon: CheckCircle, color: "text-emerald-brand", bg: "bg-emerald-muted", label: "Sync Success" },
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface SyncNotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export default function SyncNotificationCenter({ open, onClose }: SyncNotificationCenterProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<NotifType | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearAll = () => setNotifications([]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Bell className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <DialogTitle className="font-display font-semibold text-foreground">
                  Sync Notifications
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-display">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="text-[11px] font-display text-accent hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll}
                  className="text-[11px] font-display text-muted-foreground hover:text-destructive flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-1 mt-3 bg-secondary rounded-lg p-1">
            {(["all", "sync_failure", "rate_limit", "new_papers"] as const).map(f => {
              const count = f === "all" ? notifications.length : notifications.filter(n => n.type === f).length;
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-display font-medium transition-all ${
                    filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {f === "all" ? "All" : f === "sync_failure" ? "Failures" : f === "rate_limit" ? "Rate Limits" : "New Papers"}
                  {count > 0 && <span className="ml-1 text-[9px] opacity-60">({count})</span>}
                </button>
              );
            })}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-12">
                <Bell className="w-8 h-8 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground font-display">No notifications</p>
              </motion.div>
            ) : (
              filtered.map((notif, i) => {
                const cfg = typeConfig[notif.type];
                const Icon = cfg.icon;
                const isExpanded = expandedId === notif.id;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-xl border p-4 transition-all cursor-pointer group ${
                      notif.read ? "bg-card border-border" : "bg-card border-accent/20 shadow-sm"
                    }`}
                    onClick={() => {
                      markRead(notif.id);
                      setExpandedId(isExpanded ? null : notif.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm">{notif.repoIcon}</span>
                          <span className="text-[10px] font-display text-muted-foreground">{notif.repo}</span>
                          <Badge variant="outline" className={`text-[9px] ${cfg.color} border-current/20 ${cfg.bg}`}>
                            {cfg.label}
                          </Badge>
                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                        </div>
                        <h4 className="text-sm font-display font-medium text-foreground leading-snug">{notif.title}</h4>
                        <p className="text-xs text-muted-foreground font-display mt-0.5 leading-relaxed">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground font-display">{timeAgo(notif.timestamp)}</span>
                          {notif.details && (
                            <button className="text-[10px] text-accent font-display flex items-center gap-0.5 ml-auto">
                              {isExpanded ? "Less" : "Details"}
                              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {isExpanded && notif.details && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <pre className="mt-3 p-3 rounded-lg bg-secondary text-[11px] font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                                {notif.details}
                              </pre>
                              {notif.actionLabel && (
                                <button className="mt-2 h-7 px-3 rounded-md gradient-gold text-accent-foreground text-[11px] font-display font-semibold shadow-gold hover:opacity-90 transition-opacity flex items-center gap-1.5">
                                  <RefreshCw className="w-3 h-3" /> {notif.actionLabel}
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <button onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md bg-secondary flex items-center justify-center hover:bg-destructive/10 shrink-0">
                        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
