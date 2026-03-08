import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Plus, Calendar, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Filter, Search, Users, Target, BarChart3, ArrowUpRight,
  ArrowDownRight, FileText, Link2, FolderKanban, PieChart, Unlink
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ─── Types ───
interface BudgetAllocation {
  projectId: string;
  projectTitle: string;
  allocated: number;
  spent: number;
}

interface GrantMilestone {
  id: string;
  title: string;
  due: string;
  status: "done" | "in_progress" | "upcoming";
  projectId?: string;
}

interface Grant {
  id: string;
  title: string;
  funder: string;
  status: "active" | "pending" | "completed" | "rejected" | "draft";
  amount: number;
  currency: string;
  spent: number;
  startDate: string;
  endDate: string;
  deadline?: string;
  pi: string;
  coPIs: string[];
  tags: string[];
  description: string;
  milestones: GrantMilestone[];
  linkedProjects: string[];
  budgetAllocations: BudgetAllocation[];
}

// ─── Mock Projects (for linking) ───
const availableProjects = [
  { id: "proj-001", title: "Surface Code Braiding Simulator" },
  { id: "proj-002", title: "Noise Model Calibration Tool" },
  { id: "proj-003", title: "FL Training Pipeline" },
  { id: "proj-004", title: "Privacy Audit Module" },
  { id: "proj-005", title: "Cas13 Off-Target Profiling" },
  { id: "proj-006", title: "Arctic Carbon Data Collector" },
  { id: "proj-007", title: "Neuromorphic Chip Prototype" },
];

// ─── Mock Grants ───
const mockGrants: Grant[] = [
  {
    id: "g-001", title: "Quantum Error Correction for Scalable Computing",
    funder: "NSF — National Science Foundation", status: "active",
    amount: 450000, currency: "USD", spent: 187500,
    startDate: "2025-09-01", endDate: "2028-08-31",
    pi: "Dr. Elena Vasquez", coPIs: ["Prof. James Chen", "Dr. Yuki Tanaka"],
    tags: ["quantum computing", "error correction", "surface codes"],
    description: "Development of novel topological approaches to quantum error correction using surface code braiding techniques.",
    linkedProjects: ["proj-001", "proj-002"],
    budgetAllocations: [
      { projectId: "proj-001", projectTitle: "Surface Code Braiding Simulator", allocated: 280000, spent: 142000 },
      { projectId: "proj-002", projectTitle: "Noise Model Calibration Tool", allocated: 170000, spent: 45500 },
    ],
    milestones: [
      { id: "m-001", title: "Literature review & baseline", due: "2025-12-31", status: "done", projectId: "proj-001" },
      { id: "m-002", title: "Prototype simulation framework", due: "2026-06-30", status: "in_progress", projectId: "proj-001" },
      { id: "m-003", title: "Noise model integration", due: "2026-12-31", status: "upcoming", projectId: "proj-002" },
      { id: "m-004", title: "Experimental validation", due: "2027-06-30", status: "upcoming" },
      { id: "m-005", title: "Final report & publication", due: "2028-06-30", status: "upcoming" },
    ],
  },
  {
    id: "g-002", title: "Federated Learning for Privacy-Preserving Medical Imaging",
    funder: "NIH — National Institutes of Health", status: "active",
    amount: 780000, currency: "USD", spent: 312000,
    startDate: "2025-06-01", endDate: "2028-05-31",
    pi: "Prof. James Chen", coPIs: ["Dr. Elena Vasquez"],
    tags: ["federated learning", "medical imaging", "privacy"],
    description: "Multi-institutional federated learning framework for training diagnostic models without sharing patient data.",
    linkedProjects: ["proj-003", "proj-004"],
    budgetAllocations: [
      { projectId: "proj-003", projectTitle: "FL Training Pipeline", allocated: 500000, spent: 230000 },
      { projectId: "proj-004", projectTitle: "Privacy Audit Module", allocated: 280000, spent: 82000 },
    ],
    milestones: [
      { id: "m-006", title: "Protocol design & IRB approval", due: "2025-12-31", status: "done", projectId: "proj-003" },
      { id: "m-007", title: "Distributed training infrastructure", due: "2026-06-30", status: "in_progress", projectId: "proj-003" },
      { id: "m-008", title: "Differential privacy integration", due: "2026-12-31", status: "upcoming", projectId: "proj-004" },
      { id: "m-009", title: "Clinical validation study", due: "2027-12-31", status: "upcoming" },
      { id: "m-010", title: "Open-source release", due: "2028-03-31", status: "upcoming" },
    ],
  },
  {
    id: "g-003", title: "Arctic Permafrost Carbon Feedback Modeling",
    funder: "ERC — European Research Council", status: "pending",
    amount: 1200000, currency: "EUR", spent: 0,
    startDate: "2026-10-01", endDate: "2031-09-30", deadline: "2026-04-15",
    pi: "Dr. Ingrid Nørgaard", coPIs: ["Dr. Sofia Martínez", "Prof. Amir Khalil"],
    tags: ["climate science", "permafrost", "carbon cycle"],
    description: "Comprehensive modeling framework for Arctic permafrost carbon feedback loops under various warming scenarios.",
    linkedProjects: [], budgetAllocations: [], milestones: [],
  },
  {
    id: "g-004", title: "CRISPR-Cas13 Therapeutic Development Grant",
    funder: "Wellcome Trust", status: "completed",
    amount: 350000, currency: "GBP", spent: 348200,
    startDate: "2023-01-01", endDate: "2025-12-31",
    pi: "Dr. Sofia Martínez", coPIs: [],
    tags: ["CRISPR", "gene therapy"],
    description: "Development and preclinical validation of CRISPR-Cas13 based therapeutic approaches.",
    linkedProjects: ["proj-005"],
    budgetAllocations: [
      { projectId: "proj-005", projectTitle: "Cas13 Off-Target Profiling", allocated: 350000, spent: 348200 },
    ],
    milestones: [
      { id: "m-011", title: "Target validation", due: "2023-06-30", status: "done", projectId: "proj-005" },
      { id: "m-012", title: "In vitro efficacy", due: "2024-06-30", status: "done", projectId: "proj-005" },
      { id: "m-013", title: "Animal model studies", due: "2025-06-30", status: "done" },
      { id: "m-014", title: "Publication & data sharing", due: "2025-12-31", status: "done" },
    ],
  },
  {
    id: "g-005", title: "Neuromorphic Computing for Edge AI Applications",
    funder: "DARPA", status: "draft", deadline: "2026-05-30",
    amount: 950000, currency: "USD", spent: 0,
    startDate: "2027-01-01", endDate: "2029-12-31",
    pi: "Dr. Elena Vasquez", coPIs: ["Dr. Yuki Tanaka"],
    tags: ["neuromorphic", "edge computing", "AI"],
    description: "Brain-inspired computing architectures for ultra-low-power AI inference at the edge.",
    linkedProjects: [], budgetAllocations: [], milestones: [],
  },
];

const STATUS_META: Record<Grant["status"], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { label: "Active", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  completed: { label: "Completed", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border", icon: FileText },
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

// ─── Sub-components ───

function StatsCards({ grants }: { grants: Grant[] }) {
  const stats = useMemo(() => {
    const active = grants.filter(g => g.status === "active");
    const allAllocations = grants.flatMap(g => g.budgetAllocations);
    return {
      totalFunding: active.reduce((s, g) => s + g.amount, 0),
      totalSpent: active.reduce((s, g) => s + g.spent, 0),
      activeGrants: active.length,
      linkedProjects: new Set(grants.flatMap(g => g.linkedProjects)).size,
      totalAllocated: allAllocations.reduce((s, a) => s + a.allocated, 0),
      upcomingDeadlines: grants.filter(g => g.deadline && new Date(g.deadline) > new Date()).length,
    };
  }, [grants]);

  const spentPercent = stats.totalFunding > 0 ? Math.round((stats.totalSpent / stats.totalFunding) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {[
        { label: "Total Active Funding", value: formatCurrency(stats.totalFunding, "USD"), icon: DollarSign, trend: "+12%", up: true },
        { label: "Budget Utilized", value: `${spentPercent}%`, icon: BarChart3, sub: formatCurrency(stats.totalSpent, "USD") },
        { label: "Active Grants", value: stats.activeGrants, icon: CheckCircle2 },
        { label: "Linked Projects", value: stats.linkedProjects, icon: FolderKanban },
        { label: "Upcoming Deadlines", value: stats.upcomingDeadlines, icon: Calendar, alert: stats.upcomingDeadlines > 0 },
      ].map((stat, i) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <stat.icon className="w-4 h-4 text-muted-foreground" />
            {stat.trend && (
              <span className={`text-[10px] font-display font-medium flex items-center gap-0.5 ${stat.up ? "text-emerald-600" : "text-destructive"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{stat.trend}
              </span>
            )}
            {stat.alert && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </div>
          <p className="text-xl font-serif font-bold text-foreground">{stat.value}</p>
          <p className="text-[11px] text-muted-foreground font-display mt-0.5">{stat.label}</p>
          {stat.sub && <p className="text-[10px] text-muted-foreground font-display">{stat.sub} spent</p>}
        </motion.div>
      ))}
    </div>
  );
}

function BudgetAllocationChart({ allocations, currency, total }: { allocations: BudgetAllocation[]; currency: string; total: number }) {
  if (allocations.length === 0) return null;
  const allocated = allocations.reduce((s, a) => s + a.allocated, 0);
  const unallocated = total - allocated;

  return (
    <div className="bg-secondary/50 rounded-lg p-4">
      <h4 className="text-xs font-display font-semibold text-foreground mb-3 flex items-center gap-2">
        <PieChart className="w-3.5 h-3.5" /> Budget Allocation by Project
      </h4>
      <div className="space-y-3">
        {allocations.map(a => {
          const pct = total > 0 ? Math.round((a.allocated / total) * 100) : 0;
          const spentPct = a.allocated > 0 ? Math.round((a.spent / a.allocated) * 100) : 0;
          return (
            <div key={a.projectId}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-display">
                  <FolderKanban className="w-3 h-3 text-primary" />
                  <span className="text-foreground font-medium">{a.projectTitle}</span>
                  <span className="text-muted-foreground">({pct}%)</span>
                </span>
                <span className="text-muted-foreground font-display">
                  {formatCurrency(a.spent, currency)} / {formatCurrency(a.allocated, currency)}
                </span>
              </div>
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-primary/30 rounded-full" style={{ width: `${pct}%` }} />
                <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all" style={{ width: `${(pct * spentPct) / 100}%` }} />
              </div>
            </div>
          );
        })}
        {unallocated > 0 && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-display pt-1 border-t border-border">
            <span>Unallocated</span>
            <span>{formatCurrency(unallocated, currency)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MilestoneTimeline({ milestones }: { milestones: GrantMilestone[] }) {
  if (milestones.length === 0) return null;

  const projectMap: Record<string, string> = {};
  availableProjects.forEach(p => { projectMap[p.id] = p.title; });

  return (
    <div>
      <h4 className="text-xs font-display font-semibold text-foreground mb-3 flex items-center gap-2">
        <Target className="w-3.5 h-3.5" /> Shared Milestones
      </h4>
      <div className="space-y-2">
        {milestones.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border/50">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              m.status === "done" ? "bg-emerald-500" : m.status === "in_progress" ? "bg-amber-500 animate-pulse" : "bg-muted-foreground/30"
            }`} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-display text-foreground">{m.title}</span>
              {m.projectId && (
                <span className="ml-2 text-[10px] text-primary font-display">
                  → {projectMap[m.projectId] || m.projectId}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-display flex-shrink-0">{m.due}</span>
            <Badge variant="outline" className="text-[9px]">{m.status.replace("_", " ")}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function GrantCard({ grant, onClick }: { grant: Grant; onClick: () => void }) {
  const meta = STATUS_META[grant.status];
  const budgetPercent = grant.amount > 0 ? Math.round((grant.spent / grant.amount) * 100) : 0;
  const isDeadlineSoon = grant.deadline && new Date(grant.deadline).getTime() - Date.now() < 30 * 86400000 && new Date(grant.deadline) > new Date();
  const milestoneDone = grant.milestones.filter(m => m.status === "done").length;
  const milestoneTotal = grant.milestones.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-serif font-semibold text-foreground text-sm">{grant.title}</h3>
            <Badge variant="outline" className={`text-[10px] ${meta.color}`}>
              <meta.icon className="w-3 h-3 mr-1" />{meta.label}
            </Badge>
            {isDeadlineSoon && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" />Deadline Soon
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-display">{grant.funder}</p>
          <p className="text-xs text-muted-foreground font-display mt-1 line-clamp-2">{grant.description}</p>
          <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground font-display flex-wrap">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{grant.pi}{grant.coPIs.length > 0 && ` + ${grant.coPIs.length}`}</span>
            {grant.linkedProjects.length > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <Link2 className="w-3 h-3" />{grant.linkedProjects.length} project{grant.linkedProjects.length > 1 ? "s" : ""}
              </span>
            )}
            {milestoneTotal > 0 && (
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />{milestoneDone}/{milestoneTotal} milestones
              </span>
            )}
            {grant.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{grant.deadline}</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-serif font-bold text-foreground">{formatCurrency(grant.amount, grant.currency)}</p>
          {grant.status === "active" && (
            <div className="mt-2 w-32">
              <div className="flex justify-between text-[10px] text-muted-foreground font-display mb-1">
                <span>Budget Used</span>
                <span>{budgetPercent}%</span>
              </div>
              <Progress value={budgetPercent} className="h-1.5" />
            </div>
          )}
        </div>
      </div>
      {grant.tags.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {grant.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
        </div>
      )}
    </motion.div>
  );
}

function LinkProjectDialog({ grant, onLink }: { grant: Grant; onLink: (projectId: string, title: string, amount: number) => void }) {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [amount, setAmount] = useState("");

  const unlinkable = availableProjects.filter(p => !grant.linkedProjects.includes(p.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Link2 className="w-3 h-3" /> Link Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Link Project to Grant</DialogTitle>
          <DialogDescription>Allocate budget from this grant to a project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger><SelectValue placeholder="Select a project..." /></SelectTrigger>
              <SelectContent>
                {unlinkable.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Budget Allocation ({grant.currency})</Label>
            <Input type="number" placeholder="e.g., 100000" value={amount} onChange={e => setAmount(e.target.value)} />
            <p className="text-[10px] text-muted-foreground font-display">
              Available: {formatCurrency(
                grant.amount - grant.budgetAllocations.reduce((s, a) => s + a.allocated, 0),
                grant.currency
              )}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!selectedProject} onClick={() => {
            const proj = availableProjects.find(p => p.id === selectedProject);
            if (proj) {
              onLink(proj.id, proj.title, Number(amount) || 0);
              setOpen(false);
              setSelectedProject("");
              setAmount("");
            }
          }}>Allocate & Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───
export default function Funding() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    let result = [...mockGrants];
    if (statusFilter !== "all") result = result.filter(g => g.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(g => g.title.toLowerCase().includes(q) || g.funder.toLowerCase().includes(q));
    }
    if (tab === "linked") result = result.filter(g => g.linkedProjects.length > 0);
    if (tab === "deadlines") result = result.filter(g => g.deadline && new Date(g.deadline) > new Date());
    return result;
  }, [search, statusFilter, tab]);

  const handleLinkProject = (grantId: string, projectId: string, projectTitle: string, allocated: number) => {
    const grant = mockGrants.find(g => g.id === grantId);
    if (!grant) return;
    grant.linkedProjects.push(projectId);
    grant.budgetAllocations.push({ projectId, projectTitle, allocated, spent: 0 });
    toast.success("Project linked", { description: `${projectTitle} linked with ${formatCurrency(allocated, grant.currency)} allocation` });
    setSelectedGrant({ ...grant });
  };

  const handleUnlinkProject = (grantId: string, projectId: string) => {
    const grant = mockGrants.find(g => g.id === grantId);
    if (!grant) return;
    grant.linkedProjects = grant.linkedProjects.filter(p => p !== projectId);
    grant.budgetAllocations = grant.budgetAllocations.filter(a => a.projectId !== projectId);
    grant.milestones = grant.milestones.map(m => m.projectId === projectId ? { ...m, projectId: undefined } : m);
    toast.success("Project unlinked");
    setSelectedGrant({ ...grant });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Funding & Grants</h1>
          <p className="text-sm text-muted-foreground font-display mt-1">
            Track grants, budgets, project allocations, and shared milestones
          </p>
        </div>
        <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Application</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">New Grant Application</DialogTitle>
              <DialogDescription>Track a new funding opportunity or grant application.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Grant Title</Label>
                <Input placeholder="e.g., Novel Approaches to..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Funding Agency</Label>
                  <Input placeholder="e.g., NSF, NIH, ERC" />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input placeholder="e.g., 500000" type="number" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Submission Deadline</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief description of the grant..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
              <Button onClick={() => { setShowNewForm(false); toast.success("Draft created"); }}>Create Draft</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <StatsCards grants={mockGrants} />

      {/* Tabs + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All Grants</TabsTrigger>
            <TabsTrigger value="linked">With Projects</TabsTrigger>
            <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search grants..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter className="w-3.5 h-3.5 mr-2" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grant List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((grant, i) => (
            <GrantCard key={grant.id} grant={grant} onClick={() => setSelectedGrant(grant)} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-display">No grants found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Grant Detail Dialog */}
      <Dialog open={!!selectedGrant} onOpenChange={() => setSelectedGrant(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedGrant && (() => {
            const meta = STATUS_META[selectedGrant.status];
            const budgetPercent = selectedGrant.amount > 0 ? Math.round((selectedGrant.spent / selectedGrant.amount) * 100) : 0;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="font-serif text-lg">{selectedGrant.title}</DialogTitle>
                    <Badge variant="outline" className={`text-[10px] ${meta.color}`}>{meta.label}</Badge>
                  </div>
                  <DialogDescription>{selectedGrant.funder}</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="overview" className="mt-2">
                  <TabsList className="w-full">
                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                    <TabsTrigger value="budget" className="flex-1">Budget & Projects</TabsTrigger>
                    <TabsTrigger value="milestones" className="flex-1">Milestones</TabsTrigger>
                    <TabsTrigger value="team" className="flex-1">Team</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">{selectedGrant.description}</p>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-display">Total</p>
                          <p className="text-sm font-serif font-bold">{formatCurrency(selectedGrant.amount, selectedGrant.currency)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-display">Spent</p>
                          <p className="text-sm font-serif font-bold">{formatCurrency(selectedGrant.spent, selectedGrant.currency)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-display">Remaining</p>
                          <p className="text-sm font-serif font-bold">{formatCurrency(selectedGrant.amount - selectedGrant.spent, selectedGrant.currency)}</p>
                        </div>
                      </div>
                      <Progress value={budgetPercent} className="h-2" />
                    </div>
                    {selectedGrant.startDate && (
                      <div className="flex gap-4 text-xs text-muted-foreground font-display">
                        <span>Start: {selectedGrant.startDate}</span>
                        <span>End: {selectedGrant.endDate}</span>
                        {selectedGrant.deadline && <span className="text-amber-600">Deadline: {selectedGrant.deadline}</span>}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="budget" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-display font-semibold text-foreground">Project Allocations</h4>
                      <LinkProjectDialog
                        grant={selectedGrant}
                        onLink={(pid, title, amt) => handleLinkProject(selectedGrant.id, pid, title, amt)}
                      />
                    </div>
                    <BudgetAllocationChart
                      allocations={selectedGrant.budgetAllocations}
                      currency={selectedGrant.currency}
                      total={selectedGrant.amount}
                    />
                    {selectedGrant.budgetAllocations.length > 0 && (
                      <div className="space-y-2">
                        {selectedGrant.budgetAllocations.map(a => (
                          <div key={a.projectId} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                            <div className="flex items-center gap-2">
                              <FolderKanban className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs font-display font-medium text-foreground">{a.projectTitle}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatCurrency(a.spent, selectedGrant.currency)} / {formatCurrency(a.allocated, selectedGrant.currency)} spent
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost" size="sm"
                              className="text-destructive hover:text-destructive h-7 w-7 p-0"
                              onClick={() => handleUnlinkProject(selectedGrant.id, a.projectId)}
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedGrant.budgetAllocations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Link2 className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-display">No projects linked yet. Link a project to allocate budget.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="milestones" className="mt-4">
                    <MilestoneTimeline milestones={selectedGrant.milestones} />
                    {selectedGrant.milestones.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-display">No milestones defined yet.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="team" className="mt-4 space-y-3">
                    <div>
                      <h4 className="text-xs font-display font-semibold text-foreground mb-2">Principal Investigator</h4>
                      <Badge variant="default" className="text-xs">{selectedGrant.pi}</Badge>
                    </div>
                    {selectedGrant.coPIs.length > 0 && (
                      <div>
                        <h4 className="text-xs font-display font-semibold text-foreground mb-2">Co-PIs</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedGrant.coPIs.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
