import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Circle, Clock, Plus, Search, Tag, MessageSquare, User, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const issues = [
  {
    id: "ISS-42", title: "Inconsistent preprocessing pipeline for fMRI data",
    description: "The normalization step produces different results depending on input resolution. Need to standardize the pipeline.",
    status: "open" as const, priority: "high" as const, type: "bug" as const,
    author: "Dr. Elena Vasquez", initials: "EV", project: "Open Neuroscience",
    labels: ["Pipeline", "Data Quality"], comments: 5, created: "2 days ago",
  },
  {
    id: "ISS-41", title: "Add uncertainty quantification to climate ensemble outputs",
    description: "Currently outputs point estimates only. Need confidence intervals and uncertainty bands for all ensemble predictions.",
    status: "open" as const, priority: "medium" as const, type: "enhancement" as const,
    author: "Dr. James Okafor", initials: "JO", project: "Climate Modeling",
    labels: ["Statistics", "Enhancement"], comments: 3, created: "4 days ago",
  },
  {
    id: "ISS-40", title: "Literature review section needs expansion",
    description: "Reviewer feedback indicates the related work section is too narrow. Need to cover federated learning approaches.",
    status: "in_progress" as const, priority: "high" as const, type: "task" as const,
    author: "Prof. Marcus Chen", initials: "MC", project: "Hybrid Neural Networks",
    labels: ["Writing", "Review"], comments: 8, created: "1 week ago",
  },
  {
    id: "ISS-39", title: "Reproduce Table 3 results from baseline paper",
    description: "Need to verify the baseline results reported in the comparison paper before submitting our manuscript.",
    status: "in_progress" as const, priority: "medium" as const, type: "task" as const,
    author: "Dr. Yuki Tanaka", initials: "YT", project: "Hybrid Neural Networks",
    labels: ["Reproducibility", "Experiments"], comments: 2, created: "1 week ago",
  },
  {
    id: "ISS-38", title: "Ethics approval documentation complete",
    description: "All IRB documents submitted and approved for the multi-site clinical study.",
    status: "closed" as const, priority: "high" as const, type: "task" as const,
    author: "Prof. Omar Hassan", initials: "OH", project: "Open Neuroscience",
    labels: ["Ethics", "Admin"], comments: 4, created: "2 weeks ago",
  },
  {
    id: "ISS-37", title: "Memory leak in quantum circuit simulator",
    description: "The simulator crashes after processing >1000 circuits due to unreleased tensor memory.",
    status: "closed" as const, priority: "critical" as const, type: "bug" as const,
    author: "Dr. Lisa Park", initials: "LP", project: "Quantum Computing",
    labels: ["Bug", "Performance"], comments: 11, created: "3 weeks ago",
  },
];

const statusConfig = {
  open:        { icon: Circle,       label: "Open",        cls: "text-success bg-success/10 border-success/30" },
  in_progress: { icon: Clock,        label: "In Progress", cls: "text-info bg-info/10 border-info/30" },
  closed:      { icon: CheckCircle2, label: "Closed",      cls: "text-muted-foreground bg-secondary border-border" },
} as const;

const priorityColors = {
  low: "text-muted-foreground", medium: "text-info", high: "text-warning", critical: "text-destructive",
} as const;

const typeColors = {
  bug: "text-destructive bg-destructive/10 border-destructive/30",
  enhancement: "text-highlight bg-highlight/10 border-highlight/30",
  task: "text-info bg-info/10 border-info/30",
} as const;

const Issues = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filtered = useMemo(() => {
    let result = issues;
    if (statusFilter) result = result.filter(i => i.status === statusFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.labels.some(l => l.toLowerCase().includes(q)) ||
        i.project.toLowerCase().includes(q)
      );
    }
    return result;
  }, [debouncedSearch, statusFilter]);

  const openCount = issues.filter(i => i.status === "open").length;
  const inProgressCount = issues.filter(i => i.status === "in_progress").length;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Issues</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Track research issues, bugs, and tasks across projects
              </p>
            </div>
            <button onClick={() => toast.info("Issue editor coming soon!")}
              className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> New Issue
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Open", value: openCount, color: "text-emerald-brand" },
            { label: "In Progress", value: inProgressCount, color: "text-info" },
            { label: "Closed", value: issues.filter(i => i.status === "closed").length, color: "text-muted-foreground" },
            { label: "Critical", value: issues.filter(i => i.priority === "critical").length, color: "text-destructive" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4">
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs font-display font-medium text-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search + Status pills */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setStatusFilter(null)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${!statusFilter ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
            All ({issues.length})
          </button>
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = issues.filter(i => i.status === key).length;
            return (
              <button key={key} onClick={() => setStatusFilter(statusFilter === key ? null : key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${
                  statusFilter === key ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}>
                <cfg.icon className="w-3 h-3" /> {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Issues list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-display">No issues found</p>
            </div>
          ) : filtered.map((issue, i) => {
            const sCfg = statusConfig[issue.status];
            const StatusIcon = sCfg.icon;
            return (
              <motion.div key={issue.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`bg-card rounded-xl border p-4 hover:shadow-scholarly transition-all cursor-pointer group ${
                  issue.status === "closed" ? "border-border opacity-70" : "border-border hover:border-accent/30"
                }`}>
                <div className="flex items-start gap-3">
                  <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${issue.status === "open" ? "text-success" : issue.status === "in_progress" ? "text-info" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-foreground">{issue.id}</span>
                      <Badge variant="outline" className={`text-[9px] font-display capitalize ${typeColors[issue.type]}`}>{issue.type}</Badge>
                      <span className={`text-[10px] font-display font-bold capitalize ${priorityColors[issue.priority]}`}>{issue.priority}</span>
                    </div>
                    <h3 className={`font-display font-semibold text-sm leading-snug mb-1 group-hover:text-accent transition-colors ${issue.status === "closed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {issue.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-display">
                      <span className="flex items-center gap-1">
                        <Avatar className="w-4 h-4"><AvatarFallback className="bg-scholarly text-primary-foreground text-[7px] font-bold">{issue.initials}</AvatarFallback></Avatar>
                        {issue.author}
                      </span>
                      <span>{issue.project}</span>
                      <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {issue.comments}</span>
                      <span>{issue.created}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {issue.labels.map(l => <Badge key={l} variant="secondary" className="text-[9px] font-display">{l}</Badge>)}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Issues;
