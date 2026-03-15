import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BookOpen, Users, MessageSquare, GitBranch, Award, CheckCheck,
  Trash2, Settings, Archive, ChevronDown, ExternalLink, Clock, Zap,
  BellOff, Filter, MoreVertical, Check, X, Star, FileText, AlertTriangle,
  Calendar, CheckCircle2, XCircle, Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// ─── Types ───────────────────────────────────────────────────────────────────
interface NotificationAction {
  id: string;
  label: string;
  variant: "primary" | "secondary" | "destructive";
  icon?: React.ReactNode;
}

interface NotificationItem {
  id: number;
  type: "citation" | "collaboration" | "review" | "social" | "milestone" | "system" | "deadline";
  title: string;
  description: string;
  time: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  priority: "urgent" | "high" | "normal" | "low";
  from?: { name: string; initials: string };
  actions?: NotificationAction[];
  relatedUrl?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = "sciconnect-notif-state";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  citation:      { icon: BookOpen,       color: "text-accent",       bgColor: "bg-accent/10",         label: "Citation" },
  collaboration: { icon: Users,          color: "text-info",         bgColor: "bg-info-muted",        label: "Collaboration" },
  review:        { icon: Award,          color: "text-warning",      bgColor: "bg-warning-muted",     label: "Review" },
  social:        { icon: MessageSquare,  color: "text-success",      bgColor: "bg-success-muted",     label: "Social" },
  milestone:     { icon: Star,           color: "text-accent",       bgColor: "bg-accent/10",         label: "Milestone" },
  system:        { icon: Info,           color: "text-muted-foreground", bgColor: "bg-secondary",     label: "System" },
  deadline:      { icon: AlertTriangle,  color: "text-destructive",  bgColor: "bg-destructive/10",    label: "Deadline" },
};

const PRIORITY_CONFIG: Record<string, { dot: string; border: string }> = {
  urgent: { dot: "bg-destructive", border: "border-l-destructive" },
  high:   { dot: "bg-warning",     border: "border-l-warning" },
  normal: { dot: "bg-accent",      border: "border-l-transparent" },
  low:    { dot: "bg-muted-foreground/40", border: "border-l-transparent" },
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1, type: "citation", priority: "high",
    title: 'Your paper "Attention Mechanisms in Transformer Architectures" was cited',
    description: "Cited by Dr. Emily Park in Nature Communications — This brings your total citations to 342",
    time: "2 hours ago", timestamp: new Date(Date.now() - 2 * 3600000),
    read: false, archived: false,
    from: { name: "Dr. Emily Park", initials: "EP" },
    actions: [
      { id: "view", label: "View Citation", variant: "primary", icon: <ExternalLink className="w-3 h-3" /> },
    ],
    relatedUrl: "/citations",
  },
  {
    id: 2, type: "collaboration", priority: "urgent",
    title: "Prof. Omar Hassan sent you a collaboration request",
    description: "Quantum-Classical Hybrid Neural Networks project — 3 other researchers already joined",
    time: "5 hours ago", timestamp: new Date(Date.now() - 5 * 3600000),
    read: false, archived: false,
    from: { name: "Prof. Omar Hassan", initials: "OH" },
    actions: [
      { id: "accept", label: "Accept", variant: "primary", icon: <CheckCircle2 className="w-3 h-3" /> },
      { id: "decline", label: "Decline", variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
      { id: "view", label: "View Project", variant: "secondary", icon: <ExternalLink className="w-3 h-3" /> },
    ],
    relatedUrl: "/projects",
  },
  {
    id: 3, type: "deadline", priority: "urgent",
    title: "Peer review deadline in 2 days",
    description: "Review manuscript #2026-0341 for Physical Review Letters — 15 pages, quantum physics",
    time: "1 day ago", timestamp: new Date(Date.now() - 24 * 3600000),
    read: false, archived: false,
    actions: [
      { id: "start", label: "Start Review", variant: "primary", icon: <FileText className="w-3 h-3" /> },
      { id: "extend", label: "Request Extension", variant: "secondary", icon: <Calendar className="w-3 h-3" /> },
    ],
    relatedUrl: "/peer-review",
  },
  {
    id: 4, type: "milestone", priority: "normal",
    title: "Your h-index increased to 19",
    description: "Based on latest citation data from Google Scholar — You're in the top 15% for your field",
    time: "1 day ago", timestamp: new Date(Date.now() - 26 * 3600000),
    read: false, archived: false,
    actions: [
      { id: "view", label: "View Impact", variant: "primary", icon: <ExternalLink className="w-3 h-3" /> },
    ],
    relatedUrl: "/analytics",
  },
  {
    id: 5, type: "social", priority: "normal",
    title: "Dr. Lisa Park replied to your comment",
    description: 'In thread: "Best practices for reproducible ML experiments" — 12 new replies',
    time: "1 day ago", timestamp: new Date(Date.now() - 28 * 3600000),
    read: true, archived: false,
    from: { name: "Dr. Lisa Park", initials: "LP" },
    relatedUrl: "/discussions",
  },
  {
    id: 6, type: "citation", priority: "normal",
    title: "Your arXiv preprint received 50 downloads",
    description: '"Quantum Error Correction Beyond the Surface Code" — Trending in quantum physics',
    time: "2 days ago", timestamp: new Date(Date.now() - 48 * 3600000),
    read: true, archived: false,
    relatedUrl: "/publications",
  },
  {
    id: 7, type: "social", priority: "low",
    title: "Dr. Sophie Martin followed you",
    description: "Climate Science researcher at ETH Zürich — 7 mutual connections",
    time: "4 days ago", timestamp: new Date(Date.now() - 96 * 3600000),
    read: true, archived: false,
    from: { name: "Dr. Sophie Martin", initials: "SM" },
    actions: [
      { id: "follow", label: "Follow Back", variant: "primary", icon: <Users className="w-3 h-3" /> },
    ],
  },
  {
    id: 8, type: "review", priority: "normal",
    title: "Your peer review for manuscript #2026-0298 was accepted",
    description: "Thank you for your contribution — Your reviewer score increased by 5 points",
    time: "5 days ago", timestamp: new Date(Date.now() - 120 * 3600000),
    read: true, archived: false,
    relatedUrl: "/peer-review",
  },
  {
    id: 9, type: "system", priority: "low",
    title: "New feature: Gantt chart for milestones",
    description: "Visualize your grant milestones with the new timeline view in Funding",
    time: "1 week ago", timestamp: new Date(Date.now() - 168 * 3600000),
    read: true, archived: false,
    relatedUrl: "/funding",
  },
  {
    id: 10, type: "collaboration", priority: "normal",
    title: "Dr. Alex Kim shared a dataset with you",
    description: '"Multi-Omics Integration v2.3" — 2.4 GB, 15 files',
    time: "1 week ago", timestamp: new Date(Date.now() - 170 * 3600000),
    read: true, archived: false,
    from: { name: "Dr. Alex Kim", initials: "AK" },
    actions: [
      { id: "download", label: "View Dataset", variant: "primary", icon: <ExternalLink className="w-3 h-3" /> },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadState(): { readIds: Set<number>; archivedIds: Set<number> } {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      readIds: new Set(stored.readIds || []),
      archivedIds: new Set(stored.archivedIds || []),
    };
  } catch { return { readIds: new Set(), archivedIds: new Set() }; }
}

function groupByTime(items: NotificationItem[]): { label: string; items: NotificationItem[] }[] {
  const now = Date.now();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);

  const groups: { label: string; items: NotificationItem[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This Week", items: [] },
    { label: "Earlier", items: [] },
  ];

  items.forEach(item => {
    const t = item.timestamp.getTime();
    if (t >= todayStart.getTime()) groups[0].items.push(item);
    else if (t >= yesterdayStart.getTime()) groups[1].items.push(item);
    else if (t >= weekStart.getTime()) groups[2].items.push(item);
    else groups[3].items.push(item);
  });

  return groups.filter(g => g.items.length > 0);
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function NotificationDigest({ notifications }: { notifications: NotificationItem[] }) {
  const unread = notifications.filter(n => !n.read && !n.archived);
  const urgent = unread.filter(n => n.priority === "urgent");
  const byType = unread.reduce((acc, n) => { acc[n.type] = (acc[n.type] || 0) + 1; return acc; }, {} as Record<string, number>);

  if (unread.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-4 mb-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-warning" />
        <h3 className="text-[13px] font-semibold text-foreground">Quick Summary</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {urgent.length > 0 && (
          <span className="text-[11px] px-2 py-1 rounded-lg bg-destructive/10 text-destructive font-medium">
            {urgent.length} urgent
          </span>
        )}
        {Object.entries(byType).map(([type, count]) => {
          const config = TYPE_CONFIG[type];
          return (
            <span key={type} className={`text-[11px] px-2 py-1 rounded-lg ${config.bgColor} ${config.color} font-medium`}>
              {count} {config.label.toLowerCase()}{count > 1 ? "s" : ""}
            </span>
          );
        })}
        <span className="text-[11px] px-2 py-1 rounded-lg bg-secondary text-muted-foreground">
          {unread.length} total unread
        </span>
      </div>
    </motion.div>
  );
}

function NotifCard({
  notif,
  selected,
  onToggleSelect,
  onToggleRead,
  onArchive,
  onDelete,
  onAction,
}: {
  notif: NotificationItem;
  selected: boolean;
  onToggleSelect: () => void;
  onToggleRead: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onAction: (actionId: string) => void;
}) {
  const typeConfig = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
  const priorityConfig = PRIORITY_CONFIG[notif.priority] || PRIORITY_CONFIG.normal;
  const Icon = typeConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 p-4 rounded-xl border-l-[3px] border transition-all group cursor-pointer ${
        notif.read
          ? "bg-card border-border " + PRIORITY_CONFIG.normal.border
          : `bg-accent/[0.03] border-accent/15 ${priorityConfig.border}`
      } hover:shadow-md`}
      onClick={onToggleRead}
    >
      {/* Checkbox */}
      <div className="pt-0.5 shrink-0" onClick={e => e.stopPropagation()}>
        <Checkbox checked={selected} onCheckedChange={onToggleSelect} className="w-4 h-4" />
      </div>

      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        notif.read ? "bg-secondary" : typeConfig.bgColor
      }`}>
        <Icon className={`w-4 h-4 ${notif.read ? "text-muted-foreground" : typeConfig.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={`text-[13px] leading-snug ${notif.read ? "text-foreground/75" : "text-foreground font-medium"}`}>
            {notif.title}
          </h4>
          <div className="flex items-center gap-1.5 shrink-0">
            {!notif.read && <div className={`w-2 h-2 rounded-full ${priorityConfig.dot} animate-pulse`} />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={e => e.stopPropagation()}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={e => { e.stopPropagation(); onToggleRead(); }}>
                  <Check className="w-3.5 h-3.5 mr-2" />
                  {notif.read ? "Mark unread" : "Mark read"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => { e.stopPropagation(); onArchive(); }}>
                  <Archive className="w-3.5 h-3.5 mr-2" /> Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={e => { e.stopPropagation(); onDelete(); }} className="text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* From */}
        {notif.from && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-5 h-5 rounded-full bg-scholarly flex items-center justify-center text-primary-foreground text-[8px] font-bold shrink-0">
              {notif.from.initials}
            </span>
            <span className="text-[10px] text-muted-foreground">{notif.from.name}</span>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">{notif.description}</p>

        {/* Actions */}
        {notif.actions && notif.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2" onClick={e => e.stopPropagation()}>
            {notif.actions.map(action => (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                  action.variant === "primary"
                    ? "bg-accent/10 text-accent hover:bg-accent/20"
                    : action.variant === "destructive"
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
          <Clock className="w-3 h-3" />
          <span>{notif.time}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          {notif.priority === "urgent" && (
            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-destructive/10 text-destructive">
              Urgent
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PreferencesPanel() {
  const [prefs, setPrefs] = useState({
    citations: true, collaborations: true, reviews: true,
    social: true, milestones: true, system: false,
    emailDigest: true, desktopPush: true,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
    toast("Preference updated");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Settings className="w-4 h-4 text-muted-foreground" /> Notification Preferences
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Categories</p>
          <div className="space-y-2.5">
            {([
              ["citations", "Citations & Metrics", "When your papers are cited or metrics change"],
              ["collaborations", "Collaborations", "Invitations, shared datasets, project updates"],
              ["reviews", "Peer Reviews", "Review invitations, deadlines, and decisions"],
              ["social", "Social", "Follows, replies, mentions, and discussions"],
              ["milestones", "Milestones", "Achievement badges, h-index changes, download milestones"],
              ["system", "System", "Maintenance, new features, platform updates"],
            ] as const).map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-[12px] font-medium text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
                <Switch checked={prefs[key]} onCheckedChange={() => toggle(key)} />
              </div>
            ))}
          </div>
        </div>
        <div className="pt-3 border-t border-border">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Delivery</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-[12px] font-medium text-foreground">Daily Email Digest</p>
                <p className="text-[10px] text-muted-foreground">Receive a summary at 8:00 AM</p>
              </div>
              <Switch checked={prefs.emailDigest} onCheckedChange={() => toggle("emailDigest")} />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-[12px] font-medium text-foreground">Desktop Push</p>
                <p className="text-[10px] text-muted-foreground">Instant alerts for urgent items</p>
              </div>
              <Switch checked={prefs.desktopPush} onCheckedChange={() => toggle("desktopPush")} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const Notifications = () => {
  const savedState = loadState();
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    INITIAL_NOTIFICATIONS.map(n => ({
      ...n,
      read: n.read || savedState.readIds.has(n.id),
      archived: savedState.archivedIds.has(n.id),
    }))
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("all");

  // Persist
  useEffect(() => {
    const readIds = notifications.filter(n => n.read).map(n => n.id);
    const archivedIds = notifications.filter(n => n.archived).map(n => n.id);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ readIds, archivedIds })); } catch {}
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read && !n.archived).length, [notifications]);
  const activeNotifications = useMemo(() => notifications.filter(n => !n.archived), [notifications]);
  const archivedNotifications = useMemo(() => notifications.filter(n => n.archived), [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return activeNotifications;
    if (activeTab === "unread") return activeNotifications.filter(n => !n.read);
    if (activeTab === "archived") return archivedNotifications;
    if (activeTab === "preferences") return [];
    return activeNotifications.filter(n => n.type === activeTab);
  }, [activeTab, activeNotifications, archivedNotifications]);

  // Sort: urgent first, then by timestamp
  const sortedNotifications = useMemo(() =>
    [...filteredNotifications].sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      if (!a.read && !b.read) {
        const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (pDiff !== 0) return pDiff;
      }
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    }),
    [filteredNotifications]
  );

  const timeGroups = useMemo(() => groupByTime(sortedNotifications), [sortedNotifications]);

  // Actions
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All marked as read");
  }, []);

  const toggleRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  }, []);

  const archiveNotif = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true, read: true } : n));
    toast("Archived");
  }, []);

  const deleteNotif = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast("Deleted");
  }, []);

  const handleAction = useCallback((notifId: number, actionId: string) => {
    const notif = notifications.find(n => n.id === notifId);
    if (!notif) return;
    // Mark as read on action
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    switch (actionId) {
      case "accept": toast.success(`Accepted: ${notif.title.split(" sent")[0]}'s request`); break;
      case "decline": toast("Request declined"); break;
      case "follow": toast.success("Following back!"); break;
      default: toast(`Action: ${actionId}`);
    }
  }, [notifications]);

  // Bulk actions
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const bulkMarkRead = useCallback(() => {
    setNotifications(prev => prev.map(n => selectedIds.has(n.id) ? { ...n, read: true } : n));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} marked as read`);
  }, [selectedIds]);

  const bulkArchive = useCallback(() => {
    setNotifications(prev => prev.map(n => selectedIds.has(n.id) ? { ...n, archived: true, read: true } : n));
    setSelectedIds(new Set());
    toast(`${selectedIds.size} archived`);
  }, [selectedIds]);

  const bulkDelete = useCallback(() => {
    setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    toast(`Deleted`);
  }, [selectedIds]);

  const selectAll = useCallback(() => {
    const visibleIds = sortedNotifications.map(n => n.id);
    setSelectedIds(prev => prev.size === visibleIds.length ? new Set() : new Set(visibleIds));
  }, [sortedNotifications]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} · {activeNotifications.length} total
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Digest */}
        <NotificationDigest notifications={notifications} />

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/5 border border-accent/15">
                <span className="text-[11px] font-medium text-foreground">{selectedIds.size} selected</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button onClick={bulkMarkRead} className="px-2 py-1 rounded-md bg-secondary text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <CheckCheck className="w-3 h-3 inline mr-1" />Read
                  </button>
                  <button onClick={bulkArchive} className="px-2 py-1 rounded-md bg-secondary text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Archive className="w-3 h-3 inline mr-1" />Archive
                  </button>
                  <button onClick={bulkDelete} className="px-2 py-1 rounded-md bg-destructive/10 text-[10px] font-medium text-destructive hover:bg-destructive/20 transition-colors">
                    <Trash2 className="w-3 h-3 inline mr-1" />Delete
                  </button>
                  <button onClick={() => setSelectedIds(new Set())} className="px-2 py-1 rounded-md text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/50 border border-border mb-4 flex-wrap h-auto gap-0.5 p-1">
            <TabsTrigger value="all" className="text-[12px] px-3 py-1.5">
              All
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-1.5 text-[9px] px-1.5 py-0 h-4 bg-accent text-accent-foreground">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-[12px] px-3 py-1.5">Unread</TabsTrigger>
            <TabsTrigger value="citation" className="text-[12px] px-3 py-1.5">Citations</TabsTrigger>
            <TabsTrigger value="collaboration" className="text-[12px] px-3 py-1.5">Collabs</TabsTrigger>
            <TabsTrigger value="review" className="text-[12px] px-3 py-1.5">Reviews</TabsTrigger>
            <TabsTrigger value="social" className="text-[12px] px-3 py-1.5">Social</TabsTrigger>
            <TabsTrigger value="archived" className="text-[12px] px-3 py-1.5">Archived</TabsTrigger>
            <TabsTrigger value="preferences" className="text-[12px] px-3 py-1.5">
              <Settings className="w-3 h-3 mr-1" /> Prefs
            </TabsTrigger>
          </TabsList>

          {/* Preferences Tab */}
          {activeTab === "preferences" ? (
            <TabsContent value="preferences">
              <PreferencesPanel />
            </TabsContent>
          ) : (
            <>
              {/* Select All */}
              {sortedNotifications.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={selectAll}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {selectedIds.size === sortedNotifications.length ? "Deselect all" : "Select all"}
                  </button>
                  <span className="text-[10px] text-muted-foreground/40">·</span>
                  <span className="text-[10px] text-muted-foreground">{sortedNotifications.length} notifications</span>
                </div>
              )}

              {/* Notification List - Time Grouped */}
              {sortedNotifications.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {activeTab === "unread" ? "All caught up!" : activeTab === "archived" ? "No archived notifications" : "No notifications"}
                  </h3>
                  <p className="text-[12px] text-muted-foreground">
                    {activeTab === "unread" ? "You've read all your notifications" : "Nothing here yet"}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {timeGroups.map(group => (
                    <div key={group.label}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</span>
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-muted-foreground">{group.items.length}</span>
                      </div>
                      <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                          {group.items.map(notif => (
                            <NotifCard
                              key={notif.id}
                              notif={notif}
                              selected={selectedIds.has(notif.id)}
                              onToggleSelect={() => toggleSelect(notif.id)}
                              onToggleRead={() => toggleRead(notif.id)}
                              onArchive={() => archiveNotif(notif.id)}
                              onDelete={() => deleteNotif(notif.id)}
                              onAction={(actionId) => handleAction(notif.id, actionId)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Notifications;
