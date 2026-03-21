import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FlaskConical, Users, GitBranch, Calendar, Search,
  DollarSign, ArrowUpDown, Clock, Target, LayoutGrid, List,
  Archive, Copy, Share2, Trash2, ExternalLink, Star, StarOff,
  ChevronDown, AlertCircle, CheckCircle2, Pause, Rocket
} from "lucide-react";
import { BlockchainVerificationBadge } from "@/components/blockchain/BlockchainVerificationBadge";
import { mockHash, deriveAnchorStatus } from "@/lib/blockchain-utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────
type ProjectStatus = "active" | "planning" | "completed" | "on-hold";
type ProjectPriority = "high" | "medium" | "low";
type SortKey = "deadline" | "progress" | "title" | "updated";

interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  collaborators: number;
  lead: string;
  repos: number;
  deadline: string;
  updated: string;
  tags: string[];
  funding: string | null;
  starred: boolean;
  milestones: { total: number; completed: number };
}

// ─── Data ───────────────────────────────────────────────────────────────────
const initialProjects: Project[] = [
  {
    id: "p1", title: "Quantum-Classical Hybrid Neural Networks",
    description: "Developing hybrid quantum-classical architectures for drug discovery applications using variational quantum circuits and graph neural networks.",
    status: "active", priority: "high", progress: 65, collaborators: 4, lead: "Dr. Sarah Chen",
    repos: 3, deadline: "Jun 2026", updated: "2h ago", tags: ["Quantum ML", "Drug Discovery"],
    funding: "NIH R01", starred: true, milestones: { total: 8, completed: 5 },
  },
  {
    id: "p2", title: "Open Neuroscience Data Platform",
    description: "Building an open-source platform for sharing and analyzing large-scale neuroimaging datasets with standardized BIDS pipelines.",
    status: "active", priority: "high", progress: 40, collaborators: 8, lead: "Prof. James Liu",
    repos: 5, deadline: "Dec 2026", updated: "5h ago", tags: ["Neuroscience", "Open Source", "Data"],
    funding: "NSF", starred: true, milestones: { total: 12, completed: 5 },
  },
  {
    id: "p3", title: "Climate Model Ensemble Framework",
    description: "Creating a unified framework for running and comparing ensemble climate model predictions with uncertainty quantification.",
    status: "planning", priority: "medium", progress: 15, collaborators: 2, lead: "Dr. Elena Volkov",
    repos: 1, deadline: "Sep 2026", updated: "1d ago", tags: ["Climate", "Modeling"],
    funding: null, starred: false, milestones: { total: 6, completed: 1 },
  },
  {
    id: "p4", title: "Reproducible ML Benchmarks",
    description: "Standardizing machine learning benchmarks with containerized environments and automated reproducibility checks.",
    status: "completed", priority: "low", progress: 100, collaborators: 6, lead: "Dr. Kim Yoon-Ji",
    repos: 4, deadline: "Jan 2026", updated: "2w ago", tags: ["ML", "Reproducibility"],
    funding: "EU Horizon", starred: false, milestones: { total: 10, completed: 10 },
  },
  {
    id: "p5", title: "Federated Learning for Privacy-Preserving Genomics",
    description: "Implementing federated learning protocols to enable collaborative genomic analysis across institutions without sharing raw patient data.",
    status: "active", priority: "high", progress: 52, collaborators: 5, lead: "Dr. Priya Sharma",
    repos: 2, deadline: "Aug 2026", updated: "3h ago", tags: ["Federated Learning", "Genomics", "Privacy"],
    funding: "DARPA", starred: true, milestones: { total: 9, completed: 4 },
  },
  {
    id: "p6", title: "LLM-Assisted Scientific Literature Review",
    description: "Developing an AI-powered pipeline for semi-automated systematic literature reviews with citation graph analysis.",
    status: "active", priority: "medium", progress: 30, collaborators: 3, lead: "Dr. Alex Novak",
    repos: 2, deadline: "Oct 2026", updated: "1d ago", tags: ["NLP", "AI", "Literature"],
    funding: null, starred: false, milestones: { total: 7, completed: 2 },
  },
  {
    id: "p7", title: "Topological Quantum Error Correction Codes",
    description: "Researching novel topological approaches to quantum error correction that leverage hyperbolic geometry for scalable fault tolerance.",
    status: "on-hold", priority: "low", progress: 28, collaborators: 3, lead: "Prof. Michael Torres",
    repos: 1, deadline: "Mar 2027", updated: "1w ago", tags: ["Quantum Computing", "Error Correction"],
    funding: "DOE", starred: false, milestones: { total: 5, completed: 1 },
  },
  {
    id: "p8", title: "CRISPR Delivery Optimization Platform",
    description: "Optimizing lipid nanoparticle formulations for efficient in vivo delivery of CRISPR-Cas9 components to specific tissue types.",
    status: "planning", priority: "medium", progress: 8, collaborators: 4, lead: "Dr. Maria Garcia",
    repos: 1, deadline: "Nov 2026", updated: "3d ago", tags: ["CRISPR", "Gene Therapy", "Nanotechnology"],
    funding: "NIH R21", starred: false, milestones: { total: 8, completed: 0 },
  },
];

// ─── Styles ─────────────────────────────────────────────────────────────────
const statusConfig: Record<ProjectStatus, { label: string; icon: typeof Rocket; color: string; bg: string }> = {
  active:    { label: "Active",    icon: Rocket,        color: "text-success",     bg: "bg-success-muted" },
  planning:  { label: "Planning",  icon: Target,        color: "text-warning",     bg: "bg-warning-muted" },
  completed: { label: "Completed", icon: CheckCircle2,  color: "text-info",        bg: "bg-info-muted" },
  "on-hold": { label: "On Hold",   icon: Pause,         color: "text-muted-foreground", bg: "bg-secondary" },
};

const priorityConfig: Record<ProjectPriority, { label: string; color: string; dot: string }> = {
  high:   { label: "High",   color: "text-destructive", dot: "bg-destructive" },
  medium: { label: "Medium", color: "text-warning",     dot: "bg-warning" },
  low:    { label: "Low",    color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
};

// ─── Component ──────────────────────────────────────────────────────────────
const Projects = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const debouncedSearch = useDebounce(searchQuery, 250);

  const toggleStar = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p));
  };

  const archiveProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success("Project archived");
  };

  const duplicateProject = (id: string) => {
    const src = projects.find(p => p.id === id);
    if (!src) return;
    const dup: Project = { ...src, id: `p${Date.now()}`, title: `${src.title} (Copy)`, starred: false, progress: 0, status: "planning" };
    setProjects(prev => [dup, ...prev]);
    toast.success("Project duplicated");
  };

  // Counts
  const counts = useMemo(() => ({
    all: projects.length,
    active: projects.filter(p => p.status === "active").length,
    planning: projects.filter(p => p.status === "planning").length,
    completed: projects.filter(p => p.status === "completed").length,
    "on-hold": projects.filter(p => p.status === "on-hold").length,
  }), [projects]);

  // Filter + search + sort
  const filtered = useMemo(() => {
    let result = projects;
    if (statusFilter !== "all") result = result.filter(p => p.status === statusFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.lead.toLowerCase().includes(q)
      );
    }
    // Sort: starred first, then by sortKey
    return [...result].sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      switch (sortKey) {
        case "title": return a.title.localeCompare(b.title);
        case "progress": return b.progress - a.progress;
        case "deadline": return a.deadline.localeCompare(b.deadline);
        case "updated": default: return 0; // mock: keep insertion order
      }
    });
  }, [projects, statusFilter, debouncedSearch, sortKey]);

  const totalFunded = useMemo(() => projects.filter(p => p.funding).length, [projects]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="text-[27px] font-semibold text-foreground mb-0.5 tracking-[-0.02em]">Research Projects</h1>
              <p className="text-[13px] text-muted-foreground font-display">
                {projects.length} projects · {totalFunded} funded · {counts.active} active
              </p>
            </div>
            <button
              onClick={() => toast.info("Project creation wizard coming soon")}
              className="flex items-center gap-1.5 h-10 px-5 rounded-xl gradient-gold text-accent-foreground text-[13px] font-medium shadow-gold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-3 mb-5"
        >
          <div className="flex items-center gap-5 flex-wrap p-5">
            {(["active", "planning", "completed", "on-hold"] as ProjectStatus[]).map(s => {
              const cfg = statusConfig[s];
              const Icon = cfg.icon;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all text-[13px] font-display font-medium ${
                    statusFilter === s ? `${cfg.bg} ${cfg.color}` : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                  <span className={`text-[10px] font-bold ${statusFilter === s ? cfg.color : "text-muted-foreground/60"}`}>
                    {counts[s]}
                  </span>
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-display hidden sm:inline">
                {filtered.length} shown
              </span>
              {statusFilter !== "all" && (
                <button
                  onClick={() => setStatusFilter("all")}
                  className="text-[10px] text-accent font-display hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search + Sort + View Toggle */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search projects, tags, or PI..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border text-[13px] font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 px-4 rounded-xl bg-card border border-border text-[13px] font-display font-medium text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                Sort
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {([
                { key: "updated", label: "Recently updated" },
                { key: "deadline", label: "Deadline" },
                { key: "progress", label: "Progress" },
                { key: "title", label: "Title A-Z" },
              ] as { key: SortKey; label: string }[]).map(s => (
                <DropdownMenuItem
                  key={s.key}
                  onClick={() => setSortKey(s.key)}
                  className={`text-xs font-display ${sortKey === s.key ? "text-accent font-medium" : ""}`}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View toggle */}
          <div className="flex gap-0.5 bg-card rounded-xl p-1 border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Cards */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-card rounded-xl border border-border"
            >
              <FlaskConical className="w-8 h-8 mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground font-display">No projects match your search</p>
            </motion.div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  onToggleStar={() => toggleStar(project.id)}
                  onArchive={() => archiveProject(project.id)}
                  onDuplicate={() => duplicateProject(project.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((project, i) => (
                <ProjectListRow
                  key={project.id}
                  project={project}
                  index={i}
                  onToggleStar={() => toggleStar(project.id)}
                  onArchive={() => archiveProject(project.id)}
                  onDuplicate={() => duplicateProject(project.id)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

// ─── Project Card (Grid) ─────────────────────────────────────────────────────
interface ProjectCardProps {
  project: Project;
  index: number;
  onToggleStar: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
}

function ProjectCard({ project, index, onToggleStar, onArchive, onDuplicate }: ProjectCardProps) {
  const sCfg = statusConfig[project.status];
  const pCfg = priorityConfig[project.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04 }}
      className="card-interactive p-4 group cursor-pointer"
    >
      {/* Top row: badges + actions */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className={`text-[9px] font-display capitalize px-1.5 py-0 h-4 ${sCfg.color} ${sCfg.bg} border-current/20`}>
            {sCfg.label}
          </Badge>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px]">{pCfg.label} priority</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <BlockchainVerificationBadge
            status={deriveAnchorStatus({ status: project.status })}
            hash={mockHash(project.id)}
            compact
          />
          {project.funding && (
            <Badge variant="outline" className="text-[9px] font-display text-gold border-gold/20 bg-gold-muted px-1.5 py-0 h-4 flex items-center gap-0.5">
              <DollarSign className="w-2 h-2" />{project.funding}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={e => { e.stopPropagation(); onToggleStar(); }}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
          >
            {project.starred ? (
              <Star className="w-3 h-3 text-gold fill-gold" />
            ) : (
              <StarOff className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={e => e.stopPropagation()}
                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={onDuplicate} className="text-xs font-display gap-2">
                <Copy className="w-3 h-3" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-display gap-2">
                <Share2 className="w-3 h-3" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-display gap-2">
                <ExternalLink className="w-3 h-3" /> Open
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onArchive} className="text-xs font-display gap-2 text-destructive">
                <Archive className="w-3 h-3" /> Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title + lead */}
      <h3 className="text-[15px] font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors line-clamp-2">
        {project.title}
      </h3>
      <p className="text-[10px] text-muted-foreground font-display mb-2">
        PI: {project.lead} · Updated {project.updated}
      </p>

      {/* Description */}
      <p className="text-[10px] text-muted-foreground/80 font-display leading-relaxed mb-3 line-clamp-2">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {project.tags.map(tag => (
          <span key={tag} className="text-[8px] font-display px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <Progress value={project.progress} className="h-1 flex-1" />
        <span className="text-[10px] text-muted-foreground font-display font-medium w-7 text-right">{project.progress}%</span>
      </div>

      {/* Milestones bar */}
      <div className="flex items-center gap-1 mb-3">
        <Target className="w-2.5 h-2.5 text-muted-foreground/50" />
        <span className="text-[9px] text-muted-foreground font-display">
          {project.milestones.completed}/{project.milestones.total} milestones
        </span>
        <div className="flex gap-0.5 ml-auto">
          {Array.from({ length: project.milestones.total }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < project.milestones.completed ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer meta */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-display pt-2.5 border-t border-border">
        <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> {project.collaborators}</span>
        <span className="flex items-center gap-1"><GitBranch className="w-2.5 h-2.5" /> {project.repos}</span>
        <span className="flex items-center gap-1 ml-auto"><Calendar className="w-2.5 h-2.5" /> {project.deadline}</span>
      </div>
    </motion.div>
  );
}

// ─── Project List Row ────────────────────────────────────────────────────────
function ProjectListRow({ project, index, onToggleStar, onArchive, onDuplicate }: ProjectCardProps) {
  const sCfg = statusConfig[project.status];
  const pCfg = priorityConfig[project.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.03 }}
      className="card-interactive p-3 group cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {/* Star */}
        <button
          onClick={e => { e.stopPropagation(); onToggleStar(); }}
          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
        >
          {project.starred ? (
            <Star className="w-3 h-3 text-gold fill-gold" />
          ) : (
            <StarOff className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
          )}
        </button>

        {/* Priority dot */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pCfg.dot}`} />

        {/* Status badge */}
        <Badge variant="outline" className={`text-[8px] font-display capitalize px-1.5 py-0 h-4 shrink-0 ${sCfg.color} ${sCfg.bg} border-current/20`}>
          {sCfg.label}
        </Badge>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-display font-semibold text-foreground truncate group-hover:text-accent transition-colors">
            {project.title}
          </h3>
        </div>

        {/* Lead */}
        <span className="text-[9px] text-muted-foreground font-display hidden lg:inline shrink-0">
          {project.lead}
        </span>

        {/* Progress */}
        <div className="flex items-center gap-1.5 shrink-0 w-24 hidden sm:flex">
          <Progress value={project.progress} className="h-1 flex-1" />
          <span className="text-[9px] text-muted-foreground font-display w-6 text-right">{project.progress}%</span>
        </div>

        {/* Collaborators */}
        <span className="text-[9px] text-muted-foreground font-display flex items-center gap-0.5 shrink-0 hidden md:flex">
          <Users className="w-2.5 h-2.5" /> {project.collaborators}
        </span>

        {/* Deadline */}
        <span className="text-[9px] text-muted-foreground font-display flex items-center gap-0.5 shrink-0">
          <Calendar className="w-2.5 h-2.5" /> {project.deadline}
        </span>

        {/* Funding */}
        {project.funding && (
          <Badge variant="outline" className="text-[8px] font-display text-gold border-gold/20 bg-gold-muted px-1 py-0 h-3.5 shrink-0 hidden md:flex items-center gap-0.5">
            <DollarSign className="w-2 h-2" />{project.funding}
          </Badge>
        )}

        {/* Context menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={e => e.stopPropagation()}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100 shrink-0"
            >
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={onDuplicate} className="text-xs font-display gap-2">
              <Copy className="w-3 h-3" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-display gap-2">
              <Share2 className="w-3 h-3" /> Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive} className="text-xs font-display gap-2 text-destructive">
              <Archive className="w-3 h-3" /> Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

export default Projects;
