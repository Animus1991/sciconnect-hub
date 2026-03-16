import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, CheckCircle2, Circle, Clock, Plus, Calendar, Users, ChevronDown,
  Flag, AlertTriangle, MoreVertical, Trash2, Share2, Copy, Edit3,
  ArrowUpDown, SortAsc, SortDesc, BarChart3, Zap, TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState, useMemo, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type MilestoneStatus = "planned" | "in_progress" | "at_risk" | "completed";
type Priority = "critical" | "high" | "medium" | "low";
type SortKey = "deadline" | "progress" | "priority" | "title";

interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  project: string;
  projectColor: string;
  dueDate: string;
  daysLeft: number;
  status: MilestoneStatus;
  progress: number;
  subtasks: SubTask[];
  assignees: string[];
  priority: Priority;
  category: "research" | "publication" | "funding" | "collaboration" | "infrastructure";
  createdDate: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const milestones: Milestone[] = [
  {
    id: "m1",
    title: "Submit NIH R01 Grant Proposal",
    description: "Complete and submit the machine learning for drug discovery grant proposal including budget, specific aims, and preliminary data.",
    project: "Quantum-Classical Hybrid Neural Networks",
    projectColor: "hsl(var(--info))",
    dueDate: "Jun 30, 2026",
    daysLeft: 116,
    status: "in_progress",
    progress: 65,
    subtasks: [
      { id: "s1", title: "Draft specific aims", done: true },
      { id: "s2", title: "Compile preliminary data", done: true },
      { id: "s3", title: "Write research strategy", done: true },
      { id: "s4", title: "Prepare budget justification", done: true },
      { id: "s5", title: "Obtain letters of support", done: true },
      { id: "s6", title: "Internal review cycle", done: false },
      { id: "s7", title: "Final formatting & submission", done: false },
      { id: "s8", title: "Verify eRA Commons upload", done: false },
    ],
    assignees: ["SC", "MC"],
    priority: "high",
    category: "funding",
    createdDate: "Jan 15, 2026",
  },
  {
    id: "m2",
    title: "Complete Manuscript Draft",
    description: "Finish first draft of the transformer attention mechanisms paper including all figures and supplementary materials.",
    project: "Open Neuroscience Data Platform",
    projectColor: "hsl(var(--success))",
    dueDate: "Apr 15, 2026",
    daysLeft: 40,
    status: "in_progress",
    progress: 80,
    subtasks: [
      { id: "s9", title: "Write introduction & related work", done: true },
      { id: "s10", title: "Methods section", done: true },
      { id: "s11", title: "Results & analysis", done: true },
      { id: "s12", title: "Generate all figures", done: true },
      { id: "s13", title: "Discussion & conclusion", done: true },
      { id: "s14", title: "Supplementary materials", done: false },
    ],
    assignees: ["MC", "PS"],
    priority: "high",
    category: "publication",
    createdDate: "Dec 1, 2025",
  },
  {
    id: "m3",
    title: "Dataset Collection Phase 1",
    description: "Collect and curate initial neuroimaging dataset from 3 partner institutions with standardized preprocessing.",
    project: "Open Neuroscience Data Platform",
    projectColor: "hsl(var(--success))",
    dueDate: "Mar 31, 2026",
    daysLeft: 25,
    status: "at_risk",
    progress: 45,
    subtasks: [
      { id: "s15", title: "Establish data sharing agreements", done: true },
      { id: "s16", title: "Set up secure transfer pipeline", done: true },
      { id: "s17", title: "Receive Institution A data", done: true },
      { id: "s18", title: "Receive Institution B data", done: true },
      { id: "s19", title: "Receive Institution C data", done: false },
      { id: "s20", title: "Quality control & validation", done: false },
      { id: "s21", title: "Standardized preprocessing", done: false },
      { id: "s22", title: "BIDS format conversion", done: false },
      { id: "s23", title: "Metadata harmonization", done: false },
      { id: "s24", title: "Create data dictionary", done: false },
    ],
    assignees: ["EV", "YT", "JO"],
    priority: "critical",
    category: "research",
    createdDate: "Nov 10, 2025",
  },
  {
    id: "m4",
    title: "IRB Approval Obtained",
    description: "Institutional review board approval for the multi-site clinical study protocol.",
    project: "Quantum-Classical Hybrid Neural Networks",
    projectColor: "hsl(var(--info))",
    dueDate: "Feb 28, 2026",
    daysLeft: -8,
    status: "completed",
    progress: 100,
    subtasks: [
      { id: "s25", title: "Draft protocol document", done: true },
      { id: "s26", title: "Prepare consent forms", done: true },
      { id: "s27", title: "Submit to IRB", done: true },
      { id: "s28", title: "Address reviewer comments", done: true },
    ],
    assignees: ["OH"],
    priority: "medium",
    category: "collaboration",
    createdDate: "Oct 5, 2025",
  },
  {
    id: "m5",
    title: "Prototype v2.0 Release",
    description: "Release second version of the climate model ensemble framework with uncertainty quantification module.",
    project: "Climate Model Ensemble Framework",
    projectColor: "hsl(var(--highlight))",
    dueDate: "Sep 1, 2026",
    daysLeft: 179,
    status: "planned",
    progress: 10,
    subtasks: [
      { id: "s29", title: "Architecture design doc", done: true },
      { id: "s30", title: "Implement UQ module", done: false },
      { id: "s31", title: "Integration tests", done: false },
      { id: "s32", title: "Benchmarking suite", done: false },
      { id: "s33", title: "Documentation", done: false },
      { id: "s34", title: "Release candidate", done: false },
      { id: "s35", title: "Community feedback", done: false },
      { id: "s36", title: "v2.0 stable release", done: false },
      { id: "s37", title: "PyPI publication", done: false },
      { id: "s38", title: "Migration guide", done: false },
      { id: "s39", title: "Announcement blog post", done: false },
      { id: "s40", title: "Update CI/CD pipeline", done: false },
    ],
    assignees: ["EV"],
    priority: "medium",
    category: "infrastructure",
    createdDate: "Feb 1, 2026",
  },
  {
    id: "m6",
    title: "ICML 2026 Paper Submission",
    description: "Submit the federated learning privacy paper to ICML 2026 proceedings.",
    project: "Quantum-Classical Hybrid Neural Networks",
    projectColor: "hsl(var(--info))",
    dueDate: "May 20, 2026",
    daysLeft: 75,
    status: "in_progress",
    progress: 35,
    subtasks: [
      { id: "s41", title: "Finalize experiments", done: true },
      { id: "s42", title: "Write methodology", done: true },
      { id: "s43", title: "Ablation studies", done: false },
      { id: "s44", title: "Camera-ready formatting", done: false },
      { id: "s45", title: "Supplementary appendix", done: false },
    ],
    assignees: ["SC", "MC", "PS"],
    priority: "high",
    category: "publication",
    createdDate: "Jan 20, 2026",
  },
];

// ── Config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<MilestoneStatus, { label: string; icon: typeof Circle; dotClass: string; badgeClass: string }> = {
  planned:     { label: "Planned",     icon: Circle,       dotClass: "bg-muted-foreground/40", badgeClass: "bg-secondary text-muted-foreground border-border" },
  in_progress: { label: "In Progress", icon: Clock,        dotClass: "bg-info",               badgeClass: "bg-info/10 text-info border-info/20" },
  at_risk:     { label: "At Risk",     icon: AlertTriangle, dotClass: "bg-warning",           badgeClass: "bg-warning/10 text-warning border-warning/20" },
  completed:   { label: "Completed",   icon: CheckCircle2, dotClass: "bg-success",            badgeClass: "bg-success/10 text-success border-success/20" },
};

const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const priorityConfig: Record<Priority, { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "text-destructive" },
  high:     { label: "High",     cls: "text-warning" },
  medium:   { label: "Medium",   cls: "text-info" },
  low:      { label: "Low",      cls: "text-muted-foreground" },
};

const categoryLabels: Record<string, string> = {
  research: "Research", publication: "Publication", funding: "Funding",
  collaboration: "Collaboration", infrastructure: "Infrastructure",
};

// ── Component ─────────────────────────────────────────────────────────────────

const Milestones = () => {
  const [data, setData] = useState(milestones);
  const [statusFilter, setStatusFilter] = useState<MilestoneStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => setExpandedId(p => p === id ? null : id), []);

  const toggleSubtask = useCallback((milestoneId: string, subtaskId: string) => {
    setData(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      const updated = m.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s);
      const doneCount = updated.filter(s => s.done).length;
      const progress = Math.round((doneCount / updated.length) * 100);
      return { ...m, subtasks: updated, progress };
    }));
  }, []);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(true); }
  }, [sortKey]);

  // ── Derived ──

  const stats = useMemo(() => ({
    total: data.length,
    planned: data.filter(m => m.status === "planned").length,
    inProgress: data.filter(m => m.status === "in_progress").length,
    atRisk: data.filter(m => m.status === "at_risk").length,
    completed: data.filter(m => m.status === "completed").length,
    overallProgress: Math.round(data.reduce((s, m) => s + m.progress, 0) / data.length),
  }), [data]);

  const filtered = useMemo(() => {
    let result = statusFilter === "all" ? [...data] : data.filter(m => m.status === statusFilter);
    const dir = sortAsc ? 1 : -1;
    result.sort((a, b) => {
      switch (sortKey) {
        case "deadline": return dir * (a.daysLeft - b.daysLeft);
        case "progress": return dir * (a.progress - b.progress);
        case "priority": return dir * (priorityOrder[a.priority] - priorityOrder[b.priority]);
        case "title": return dir * a.title.localeCompare(b.title);
        default: return 0;
      }
    });
    return result;
  }, [data, statusFilter, sortKey, sortAsc]);

  // Upcoming deadlines for sidebar (next 60 days, not completed)
  const upcoming = useMemo(() =>
    data.filter(m => m.status !== "completed" && m.daysLeft > 0 && m.daysLeft <= 60)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4),
  [data]);

  // Project breakdown for sidebar
  const projectBreakdown = useMemo(() => {
    const map = new Map<string, { color: string; total: number; completed: number }>();
    data.forEach(m => {
      const entry = map.get(m.project) || { color: m.projectColor, total: 0, completed: 0 };
      entry.total++;
      if (m.status === "completed") entry.completed++;
      map.set(m.project, entry);
    });
    return Array.from(map.entries()).map(([name, d]) => ({ name, ...d }));
  }, [data]);

  return (
    <AppLayout>
      <TooltipProvider delayDuration={300}>
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-[27px] font-bold text-foreground">Milestones</h1>
                <p className="text-sm text-muted-foreground font-display mt-0.5">
                  {stats.total} milestones · {stats.overallProgress}% overall · {stats.atRisk > 0 ? `${stats.atRisk} at risk` : "all on track"}
                </p>
              </div>
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent text-accent-foreground text-sm font-display font-semibold hover:bg-accent/90 transition-colors">
                <Plus className="w-4 h-4" /> New Milestone
              </button>
            </div>
          </motion.div>

          {/* Filter Strip */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-border mb-5 overflow-x-auto"
          >
            {([
              { key: "all" as const, label: "All", count: stats.total, dot: "bg-foreground" },
              { key: "in_progress" as const, label: "In Progress", count: stats.inProgress, dot: statusConfig.in_progress.dotClass },
              { key: "at_risk" as const, label: "At Risk", count: stats.atRisk, dot: statusConfig.at_risk.dotClass },
              { key: "planned" as const, label: "Planned", count: stats.planned, dot: statusConfig.planned.dotClass },
              { key: "completed" as const, label: "Completed", count: stats.completed, dot: statusConfig.completed.dotClass },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-display font-medium transition-colors whitespace-nowrap ${
                  statusFilter === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${f.dot}`} />
                {f.label}
                <span className="text-[10px] text-muted-foreground">{f.count}</span>
              </button>
            ))}

            <div className="flex-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowUpDown className="w-3 h-3" /> Sort
                  {sortAsc ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {([["deadline", "Deadline"], ["progress", "Progress"], ["priority", "Priority"], ["title", "Title"]] as [SortKey, string][]).map(([k, l]) => (
                  <DropdownMenuItem key={k} onClick={() => handleSort(k)} className="text-xs font-display">
                    {l} {sortKey === k && (sortAsc ? "↑" : "↓")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
            {/* ═══ MAIN: Timeline ═══ */}
            <div className="min-w-0">
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground font-display">No milestones match this filter</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-[17px] top-4 bottom-4 w-px bg-border hidden md:block" />

                  <div className="space-y-2">
                    {filtered.map((m, i) => {
                      const sc = statusConfig[m.status];
                      const pc = priorityConfig[m.priority];
                      const StatusIcon = sc.icon;
                      const isExpanded = expandedId === m.id;
                      const doneTasks = m.subtasks.filter(s => s.done).length;

                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="relative md:pl-10"
                        >
                          {/* Timeline dot */}
                          <div className="absolute left-2.5 top-5 hidden md:block z-10">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={`block w-[11px] h-[11px] rounded-full ${sc.dotClass} ring-4 ring-background`} />
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs">{sc.label}</TooltipContent>
                            </Tooltip>
                          </div>

                          <div className={`bg-card rounded-xl border hover:border-accent/20 transition-colors group ${
                            m.status === "at_risk" ? "border-warning/20" : m.status === "completed" ? "border-success/15" : "border-border"
                          }`}>
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  {/* Top row: badges */}
                                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <Badge variant="outline" className={`text-[10px] font-display px-1.5 py-0 h-5 ${sc.badgeClass}`}>
                                      <StatusIcon className="w-2.5 h-2.5 mr-0.5" />{sc.label}
                                    </Badge>
                                    <span className={`text-[10px] font-display font-bold ${pc.cls}`}>● {pc.label}</span>
                                    <span className="text-[10px] font-display text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">
                                      {categoryLabels[m.category]}
                                    </span>
                                  </div>

                                  {/* Title */}
                                  <button onClick={() => toggleExpand(m.id)} className="text-left w-full">
                                    <h3 className="font-serif text-[15px] font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
                                      {m.title}
                                    </h3>
                                  </button>

                                  <p className="text-xs text-muted-foreground font-display mt-0.5 line-clamp-1">{m.description}</p>

                                  {/* Progress */}
                                  <div className="flex items-center gap-3 mt-2.5">
                                    <Progress value={m.progress} className="h-1.5 flex-1" />
                                    <span className="text-[11px] font-display font-semibold text-foreground w-8 text-right">{m.progress}%</span>
                                  </div>

                                  {/* Meta row */}
                                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground font-display flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {m.status === "completed" ? (
                                        <span className="text-success">Completed</span>
                                      ) : m.daysLeft <= 14 ? (
                                        <span className={m.daysLeft <= 7 ? "text-destructive font-semibold" : "text-warning"}>
                                          {m.daysLeft}d left
                                        </span>
                                      ) : (
                                        <span>{m.dueDate}</span>
                                      )}
                                    </span>

                                    <span className="text-border">·</span>

                                    <span className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> {doneTasks}/{m.subtasks.length} tasks
                                    </span>

                                    <span className="text-border">·</span>

                                    <span className="flex items-center gap-0.5" style={{ color: m.projectColor }}>
                                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: m.projectColor }} />
                                      <span className="text-muted-foreground">{m.project}</span>
                                    </span>

                                    {/* Assignees */}
                                    <div className="flex -space-x-1.5 ml-auto">
                                      {m.assignees.map(a => (
                                        <Tooltip key={a}>
                                          <TooltipTrigger asChild>
                                            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[7px] font-bold text-foreground border-2 border-card">
                                              {a}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent className="text-xs">{a}</TooltipContent>
                                        </Tooltip>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={() => toggleExpand(m.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                  </button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all">
                                        <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem className="text-xs font-display gap-2"><Edit3 className="w-3 h-3" /> Edit</DropdownMenuItem>
                                      <DropdownMenuItem className="text-xs font-display gap-2"><Copy className="w-3 h-3" /> Duplicate</DropdownMenuItem>
                                      <DropdownMenuItem className="text-xs font-display gap-2"><Share2 className="w-3 h-3" /> Share</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-xs font-display gap-2 text-destructive"><Trash2 className="w-3 h-3" /> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>

                            {/* Expandable subtasks */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 border-t border-border">
                                    <p className="text-[11px] font-display text-muted-foreground uppercase tracking-wider mt-3 mb-2">
                                      Subtasks ({doneTasks}/{m.subtasks.length})
                                    </p>
                                    <div className="space-y-1">
                                      {m.subtasks.map(st => (
                                        <button
                                          key={st.id}
                                          onClick={() => toggleSubtask(m.id, st.id)}
                                          className="flex items-center gap-2 w-full text-left py-1 px-2 rounded-md hover:bg-secondary/50 transition-colors"
                                        >
                                          {st.done ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                                          ) : (
                                            <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                                          )}
                                          <span className={`text-xs font-display ${st.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                            {st.title}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-display mt-3">
                                      Created {m.createdDate}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ═══ SIDEBAR ═══ */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* Overall Progress */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-accent" /> Overall Progress
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={stats.overallProgress} className="h-2 flex-1" />
                  <span className="text-sm font-display font-bold text-foreground">{stats.overallProgress}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { label: "Active", value: stats.inProgress, cls: "text-info" },
                    { label: "At Risk", value: stats.atRisk, cls: stats.atRisk > 0 ? "text-warning" : "text-muted-foreground" },
                    { label: "Planned", value: stats.planned, cls: "text-muted-foreground" },
                    { label: "Done", value: stats.completed, cls: "text-success" },
                  ].map(s => (
                    <div key={s.label} className="text-center py-2 bg-secondary/30 rounded-lg">
                      <p className={`text-lg font-display font-bold ${s.cls}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground font-display">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-warning" /> Upcoming Deadlines
                </h3>
                <div className="space-y-3">
                  {upcoming.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground font-display">No deadlines in the next 60 days</p>
                  ) : upcoming.map(m => (
                    <div key={m.id} className="group cursor-pointer">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-display font-medium text-foreground leading-snug line-clamp-1 group-hover:text-accent transition-colors">
                          {m.title}
                        </p>
                        <span className={`text-[10px] font-display font-semibold shrink-0 ml-2 ${
                          m.daysLeft <= 7 ? "text-destructive" : m.daysLeft <= 30 ? "text-warning" : "text-muted-foreground"
                        }`}>
                          {m.daysLeft}d
                        </span>
                      </div>
                      <Progress value={m.progress} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* By Project */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-accent" /> By Project
                </h3>
                <div className="space-y-3">
                  {projectBreakdown.map(p => (
                    <div key={p.name}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-xs font-display text-foreground line-clamp-1 flex-1">{p.name}</span>
                        <span className="text-[10px] font-display text-muted-foreground">{p.completed}/{p.total}</span>
                      </div>
                      <Progress value={(p.completed / p.total) * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Velocity */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-success" /> Velocity
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "This month", value: "2 completed" },
                    { label: "Avg. duration", value: "47 days" },
                    { label: "On-time rate", value: "83%" },
                    { label: "Total subtasks done", value: String(data.reduce((s, m) => s + m.subtasks.filter(st => st.done).length, 0)) },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-display">{s.label}</span>
                      <span className="text-xs font-display font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default Milestones;
