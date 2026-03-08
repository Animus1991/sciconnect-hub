import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Plus, Calendar, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Filter, Search, ChevronDown, ExternalLink, Users, Target,
  BarChart3, ArrowUpRight, ArrowDownRight, Banknote, FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// ─── Mock Data ───
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
  projectId?: string;
  tags: string[];
  description: string;
  milestones: { title: string; due: string; status: "done" | "in_progress" | "upcoming" }[];
}

const mockGrants: Grant[] = [
  {
    id: "g-001", title: "Quantum Error Correction for Scalable Computing",
    funder: "NSF — National Science Foundation", status: "active",
    amount: 450000, currency: "USD", spent: 187500,
    startDate: "2025-09-01", endDate: "2028-08-31",
    pi: "Dr. Elena Vasquez", coPIs: ["Prof. James Chen", "Dr. Yuki Tanaka"],
    tags: ["quantum computing", "error correction", "surface codes"],
    description: "Development of novel topological approaches to quantum error correction using surface code braiding techniques.",
    milestones: [
      { title: "Literature review & baseline", due: "2025-12-31", status: "done" },
      { title: "Prototype simulation framework", due: "2026-06-30", status: "in_progress" },
      { title: "Experimental validation", due: "2027-06-30", status: "upcoming" },
      { title: "Final report & publication", due: "2028-06-30", status: "upcoming" },
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
    milestones: [
      { title: "Protocol design & IRB approval", due: "2025-12-31", status: "done" },
      { title: "Distributed training infrastructure", due: "2026-06-30", status: "in_progress" },
      { title: "Clinical validation study", due: "2027-12-31", status: "upcoming" },
      { title: "Open-source release", due: "2028-03-31", status: "upcoming" },
    ],
  },
  {
    id: "g-003", title: "Arctic Permafrost Carbon Feedback Modeling",
    funder: "ERC — European Research Council", status: "pending",
    amount: 1200000, currency: "EUR", spent: 0,
    startDate: "2026-10-01", endDate: "2031-09-30", deadline: "2026-04-15",
    pi: "Dr. Ingrid Nørgaard", coPIs: ["Dr. Sofia Martínez", "Prof. Amir Khalil"],
    tags: ["climate science", "permafrost", "carbon cycle", "modeling"],
    description: "Comprehensive modeling framework for Arctic permafrost carbon feedback loops under various warming scenarios.",
    milestones: [],
  },
  {
    id: "g-004", title: "CRISPR-Cas13 Therapeutic Development Grant",
    funder: "Wellcome Trust", status: "completed",
    amount: 350000, currency: "GBP", spent: 348200,
    startDate: "2023-01-01", endDate: "2025-12-31",
    pi: "Dr. Sofia Martínez", coPIs: [],
    tags: ["CRISPR", "gene therapy", "molecular biology"],
    description: "Development and preclinical validation of CRISPR-Cas13 based therapeutic approaches for viral infections.",
    milestones: [
      { title: "Target validation", due: "2023-06-30", status: "done" },
      { title: "In vitro efficacy", due: "2024-06-30", status: "done" },
      { title: "Animal model studies", due: "2025-06-30", status: "done" },
      { title: "Publication & data sharing", due: "2025-12-31", status: "done" },
    ],
  },
  {
    id: "g-005", title: "Neuromorphic Computing for Edge AI Applications",
    funder: "DARPA", status: "draft", deadline: "2026-05-30",
    amount: 950000, currency: "USD", spent: 0,
    startDate: "2027-01-01", endDate: "2029-12-31",
    pi: "Dr. Elena Vasquez", coPIs: ["Dr. Yuki Tanaka"],
    tags: ["neuromorphic", "edge computing", "AI"],
    description: "Design of brain-inspired computing architectures for ultra-low-power AI inference at the edge.",
    milestones: [],
  },
  {
    id: "g-006", title: "Multi-Omics Data Integration for Precision Medicine",
    funder: "Chan Zuckerberg Initiative", status: "rejected",
    amount: 500000, currency: "USD", spent: 0,
    startDate: "", endDate: "",
    pi: "Prof. Amir Khalil", coPIs: ["Prof. James Chen"],
    tags: ["multi-omics", "precision medicine", "bioinformatics"],
    description: "Novel statistical framework for integrating genomics, proteomics, and metabolomics data for personalized treatment.",
    milestones: [],
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

export default function Funding() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const filtered = useMemo(() => {
    return mockGrants.filter(g => {
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      if (search && !g.title.toLowerCase().includes(search.toLowerCase()) && !g.funder.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    const active = mockGrants.filter(g => g.status === "active");
    return {
      totalFunding: active.reduce((s, g) => s + g.amount, 0),
      totalSpent: active.reduce((s, g) => s + g.spent, 0),
      activeGrants: active.length,
      pendingGrants: mockGrants.filter(g => g.status === "pending" || g.status === "draft").length,
      upcomingDeadlines: mockGrants.filter(g => g.deadline && new Date(g.deadline) > new Date()).length,
    };
  }, []);

  const spentPercent = stats.totalFunding > 0 ? Math.round((stats.totalSpent / stats.totalFunding) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Funding & Grants</h1>
          <p className="text-sm text-muted-foreground font-display mt-1">
            Track grant applications, budgets, deadlines, and milestones
          </p>
        </div>
        <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Application
            </Button>
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
              <Button onClick={() => setShowNewForm(false)}>Create Draft</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Active Funding", value: formatCurrency(stats.totalFunding, "USD"), icon: DollarSign, trend: "+12%", up: true },
          { label: "Budget Utilized", value: `${spentPercent}%`, icon: BarChart3, sub: formatCurrency(stats.totalSpent, "USD") },
          { label: "Active Grants", value: stats.activeGrants, icon: CheckCircle2 },
          { label: "Upcoming Deadlines", value: stats.upcomingDeadlines, icon: Calendar, alert: stats.upcomingDeadlines > 0 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              {stat.trend && (
                <span className={`text-[10px] font-display font-medium flex items-center gap-0.5 ${stat.up ? "text-emerald-600" : "text-destructive"}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search grants..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-3.5 h-3.5 mr-2" />
            <SelectValue />
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

      {/* Grant List */}
      <div className="space-y-3">
        {filtered.map((grant, i) => {
          const meta = STATUS_META[grant.status];
          const budgetPercent = grant.amount > 0 ? Math.round((grant.spent / grant.amount) * 100) : 0;
          const isDeadlineSoon = grant.deadline && new Date(grant.deadline).getTime() - Date.now() < 30 * 86400000 && new Date(grant.deadline) > new Date();

          return (
            <motion.div
              key={grant.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedGrant(grant)}
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
                  <p className="text-xs text-muted-foreground font-display mt-1">{grant.description.slice(0, 120)}...</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground font-display">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{grant.pi}{grant.coPIs.length > 0 && ` + ${grant.coPIs.length}`}</span>
                    {grant.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Deadline: {grant.deadline}</span>}
                    {grant.startDate && <span>{grant.startDate} → {grant.endDate}</span>}
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
                  {grant.tags.map(t => (
                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-display">No grants found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Grant Detail Dialog */}
      <Dialog open={!!selectedGrant} onOpenChange={() => setSelectedGrant(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedGrant && (() => {
            const meta = STATUS_META[selectedGrant.status];
            const budgetPercent = selectedGrant.amount > 0 ? Math.round((selectedGrant.spent / selectedGrant.amount) * 100) : 0;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="font-serif text-lg">{selectedGrant.title}</DialogTitle>
                    <Badge variant="outline" className={`text-[10px] ${meta.color}`}>{meta.label}</Badge>
                  </div>
                  <DialogDescription>{selectedGrant.funder}</DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-2">
                  <p className="text-sm text-muted-foreground">{selectedGrant.description}</p>

                  {/* Budget */}
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="text-xs font-display font-semibold text-foreground mb-3">Budget Overview</h4>
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

                  {/* Team */}
                  <div>
                    <h4 className="text-xs font-display font-semibold text-foreground mb-2">Research Team</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default" className="text-xs">{selectedGrant.pi} (PI)</Badge>
                      {selectedGrant.coPIs.map(c => <Badge key={c} variant="outline" className="text-xs">{c} (Co-PI)</Badge>)}
                    </div>
                  </div>

                  {/* Milestones */}
                  {selectedGrant.milestones.length > 0 && (
                    <div>
                      <h4 className="text-xs font-display font-semibold text-foreground mb-2">Milestones</h4>
                      <div className="space-y-2">
                        {selectedGrant.milestones.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              m.status === "done" ? "bg-emerald-500" : m.status === "in_progress" ? "bg-amber-500 animate-pulse" : "bg-muted-foreground/30"
                            }`} />
                            <span className="text-xs font-display flex-1">{m.title}</span>
                            <span className="text-[10px] text-muted-foreground font-display">{m.due}</span>
                            <Badge variant="outline" className="text-[9px]">{m.status.replace("_", " ")}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
